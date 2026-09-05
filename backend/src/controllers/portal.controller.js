import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import Quotation from '../models/Quotation.js';
import NegotiationMessage from '../models/NegotiationMessage.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, failure } from '../utils/apiResponse.js';
import { evaluateQuotationRisk } from '../services/discountRiskEngine.js';
import { buildApprovalChain } from '../services/approvalRouter.js';
import { logAudit } from '../services/auditLogger.js';
import { env } from '../config/env.js';
import { QUOTATION_STATUS, RISK_BANDS } from '../config/constants.js';

const generatePortalToken = (customerId) =>
  jwt.sign({ id: customerId, type: 'customer_portal' }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

// Portal login (separate from internal /api/auth/login)
export const portalLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const customer = await Customer.findOne({ email });
  if (!customer || !customer.portalPasswordHash || !(await customer.comparePassword(password))) {
    return failure(res, 'Invalid email or password', 401);
  }

  const token = generatePortalToken(customer._id);
  return success(res, {
    token,
    customer: { id: customer._id, name: customer.name, tier: customer.tier },
  }, 'Portal login successful');
});

// Admin/rep sets up portal access for a customer (issues them a password)
export const setPortalPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const customer = await Customer.findById(req.params.customerId);
  if (!customer) return failure(res, 'Customer not found', 404);

  customer.portalPasswordHash = await Customer.hashPassword(password);
  await customer.save();

  return success(res, null, 'Portal password set');
});

// Customer views only their own quotations
export const getMyQuotations = asyncHandler(async (req, res) => {
  const quotations = await Quotation.find({ customer: req.customer._id }).sort({ updatedAt: -1 });
  return success(res, quotations, 'Your quotations fetched');
});

export const getMyQuotationById = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findOne({ _id: req.params.id, customer: req.customer._id });
  if (!quotation) return failure(res, 'Quotation not found', 404);

  const messages = await NegotiationMessage.find({ quotation: quotation._id }).sort({ createdAt: 1 });
  return success(res, { quotation, messages }, 'Quotation fetched');
});

// Customer submits a comment / line question / counter-discount request (does NOT change the quote yet)
export const submitNegotiationRequest = asyncHandler(async (req, res) => {
  const { lineId, comment, counterDiscountPercent } = req.body;

  const quotation = await Quotation.findOne({ _id: req.params.id, customer: req.customer._id });
  if (!quotation) return failure(res, 'Quotation not found', 404);

  const message = await NegotiationMessage.create({
    quotation: quotation._id,
    author: 'customer',
    lineId: lineId || null,
    comment: comment || '',
    counterDiscountPercent: counterDiscountPercent ?? null,
  });

  if (quotation.status !== QUOTATION_STATUS.NEGOTIATION) {
    quotation.status = QUOTATION_STATUS.NEGOTIATION;
    quotation.lastActivityAt = new Date();
    await quotation.save();
  }

  return success(res, message, 'Request submitted, awaiting rep response', 201);
});

// Customer clicks "Confirm Quotation" -> apply any pending counter-discount, re-check risk
export const confirmQuotationByCustomer = asyncHandler(async (req, res) => {
  const { lineId, finalDiscountPercent } = req.body; // optional: apply a final agreed discount to one line

  const quotation = await Quotation.findOne({ _id: req.params.id, customer: req.customer._id });
  if (!quotation) return failure(res, 'Quotation not found', 404);

  // If the customer is confirming with a specific negotiated discount on a line, apply it now
  if (lineId && finalDiscountPercent !== undefined) {
    const line = quotation.lines.id(lineId);
    if (!line) return failure(res, 'Line not found on this quotation', 404);
    line.discountPercent = finalDiscountPercent;
  }

  // Re-run the SAME risk engine used at initial submission
  const Customer = req.customer.constructor;
  const customer = await Customer.findById(quotation.customer);
  const { blendedRiskScore, riskBand, orderTotal } = await evaluateQuotationRisk(quotation, customer);

  quotation.blendedRiskScore = blendedRiskScore;
  quotation.riskBand = riskBand;
  quotation.orderTotal = orderTotal;

  if (riskBand !== RISK_BANDS.NONE) {
    // Terms exceed threshold -> automatically re-enter the approval flow
    const { approvalSteps, status } = buildApprovalChain(riskBand);
    quotation.approvalSteps = approvalSteps;
    quotation.currentApprovalStepIndex = 0;
    quotation.status = status; // pending_approval
  } else {
    // Within limits -> goes straight to fulfillment-ready state
    quotation.status = QUOTATION_STATUS.APPROVED;
  }

  quotation.lastActivityAt = new Date();
  await quotation.save();

  await logAudit({
    entityType: 'Quotation',
    entityId: quotation._id,
    user: req.customer._id,
    action: 'customer_confirmed',
    after: { riskBand, blendedRiskScore, status: quotation.status },
    reason: 'Confirmed via customer portal',
  });

  const reRoutedToApproval = riskBand !== RISK_BANDS.NONE;

  return success(
    res,
    { quotation, reRoutedToApproval },
    reRoutedToApproval
      ? 'Terms exceeded threshold — automatically sent back for approval'
      : 'Quotation confirmed, moving to fulfillment'
  );
});

// Customer self-signup (public) — creates their own portal account
export const portalSignup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return failure(res, 'Name, email and password are required', 400);
  }

  const existing = await Customer.findOne({ email });
  if (existing) {
    return failure(res, 'A customer with this email already exists', 409);
  }

  const portalPasswordHash = await Customer.hashPassword(password);
  const customer = await Customer.create({
    name,
    email,
    portalPasswordHash,
    tier: 'bronze', // new self-signup customers start at Bronze by default
  });

  const token = generatePortalToken(customer._id);

  return success(
    res,
    { token, customer: { id: customer._id, name: customer.name, tier: customer.tier } },
    'Customer account created',
    201
  );
});