import Quotation from '../models/Quotation.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, failure } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditLogger.js';
import { evaluateQuotationRisk } from '../services/discountRiskEngine.js';
import { buildApprovalChain } from '../services/approvalRouter.js';
import { QUOTATION_STATUS } from '../config/constants.js';

// Create a blank draft quotation for a customer
export const createQuotation = asyncHandler(async (req, res) => {
  const { customerId } = req.body;
  const customer = await Customer.findById(customerId);
  if (!customer) return failure(res, 'Customer not found', 404);

  const quotation = await Quotation.create({
    customer: customer._id,
    rep: req.user._id,
    lines: [],
    status: QUOTATION_STATUS.DRAFT,
  });

  return success(res, quotation, 'Draft quotation created', 201);
});

export const getQuotations = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const quotations = await Quotation.find(filter)
    .populate('customer', 'name tier')
    .populate('rep', 'name')
    .sort({ updatedAt: -1 });

  return success(res, quotations, 'Quotations fetched');
});

export const getQuotationById = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id)
    .populate('customer', 'name tier')
    .populate('rep', 'name');
  if (!quotation) return failure(res, 'Quotation not found', 404);
  return success(res, quotation, 'Quotation fetched');
});

// Add a product line to the quotation
export const addLine = asyncHandler(async (req, res) => {
  const { productId, qty, discountPercent } = req.body;

  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) return failure(res, 'Quotation not found', 404);
  if (quotation.status !== QUOTATION_STATUS.DRAFT) {
    return failure(res, 'Only draft quotations can be edited', 400);
  }

  const product = await Product.findById(productId);
  if (!product) return failure(res, 'Product not found', 404);

  quotation.lines.push({
    product: product._id,
    productName: product.name,
    category: product.category,
    qty,
    unitPrice: product.price,
    unitCost: product.cost,
    discountPercent: discountPercent || 0,
  });

  const customer = await Customer.findById(quotation.customer);
  const { blendedRiskScore, riskBand, orderTotal } = await evaluateQuotationRisk(quotation, customer);
  quotation.blendedRiskScore = blendedRiskScore;
  quotation.riskBand = riskBand;
  quotation.orderTotal = orderTotal;
  quotation.lastActivityAt = new Date();

  await quotation.save();

  return success(res, quotation, 'Line added');
});

// Submit for approval (or auto-approve if no risk)
export const submitForApproval = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) return failure(res, 'Quotation not found', 404);
  if (!quotation.lines.length) return failure(res, 'Cannot submit an empty quotation', 400);

  const customer = await Customer.findById(quotation.customer);
  const { blendedRiskScore, riskBand, orderTotal } = await evaluateQuotationRisk(quotation, customer);

  const { approvalSteps, status } = buildApprovalChain(riskBand);

  quotation.blendedRiskScore = blendedRiskScore;
  quotation.riskBand = riskBand;
  quotation.orderTotal = orderTotal;
  quotation.approvalSteps = approvalSteps;
  quotation.currentApprovalStepIndex = 0;
  quotation.status = status;
  quotation.lastActivityAt = new Date();

  await quotation.save();

  await logAudit({
    entityType: 'Quotation',
    entityId: quotation._id,
    user: req.user,
    action: 'submitted_for_approval',
    after: { riskBand, blendedRiskScore, status },
  });

  return success(res, quotation, `Quotation is now: ${status}`);
});