import Quotation from '../models/Quotation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, failure } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditLogger.js';
import { QUOTATION_STATUS } from '../config/constants.js';

// List quotations currently waiting on approval
export const getPendingApprovals = asyncHandler(async (req, res) => {
  const quotations = await Quotation.find({ status: QUOTATION_STATUS.PENDING_APPROVAL })
    .populate('customer', 'name tier')
    .populate('rep', 'name')
    .sort({ updatedAt: -1 });

  return success(res, quotations, 'Pending approvals fetched');
});

// Get one quotation's full approval detail (steps, audit-relevant info)
export const getApprovalDetail = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id)
    .populate('customer', 'name tier')
    .populate('rep', 'name')
    .populate('approvalSteps.actedBy', 'name role');

  if (!quotation) return failure(res, 'Quotation not found', 404);
  return success(res, quotation, 'Approval detail fetched');
});

// Core action: approve / reject / return for revision
export const actOnApproval = asyncHandler(async (req, res) => {
  const { action, reason } = req.body; // action: 'approved' | 'rejected' | 'returned_for_revision'
  const quotation = await Quotation.findById(req.params.id);

  if (!quotation) return failure(res, 'Quotation not found', 404);
  if (quotation.status !== QUOTATION_STATUS.PENDING_APPROVAL) {
    return failure(res, 'This quotation is not awaiting approval', 400);
  }

  const stepIndex = quotation.currentApprovalStepIndex;
  const currentStep = quotation.approvalSteps[stepIndex];

  if (!currentStep) {
    return failure(res, 'No pending approval step found', 400);
  }

  // Confirm the logged-in user's role matches what this step requires
  // (sales_manager step must be acted on by a sales_manager, etc.)
  if (req.user.role !== currentStep.role && req.user.role !== 'admin') {
    return failure(res, `This step requires role: ${currentStep.role}`, 403);
  }

  currentStep.status = action;
  currentStep.actedBy = req.user._id;
  currentStep.reason = reason || '';
  currentStep.actedAt = new Date();

  if (action === 'rejected') {
    quotation.status = QUOTATION_STATUS.REJECTED;
  } else if (action === 'returned_for_revision') {
    quotation.status = QUOTATION_STATUS.DRAFT; // sent back to rep to edit
    quotation.currentApprovalStepIndex = 0;
    quotation.approvalSteps = []; // clear the chain; will rebuild on next submit
  } else if (action === 'approved') {
    const isLastStep = stepIndex === quotation.approvalSteps.length - 1;
    if (isLastStep) {
      quotation.status = QUOTATION_STATUS.APPROVED;
    } else {
      quotation.currentApprovalStepIndex = stepIndex + 1; // move to next approver (e.g. Finance)
      // status stays 'pending_approval'
    }
  }

  quotation.lastActivityAt = new Date();
  await quotation.save();

  await logAudit({
    entityType: 'Quotation',
    entityId: quotation._id,
    user: req.user,
    action: `approval_${action}`,
    after: { stepIndex, role: currentStep.role, reason },
    reason,
  });

  return success(res, quotation, `Step ${action}`);
});

export const adminApproveAnyQuotation = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) return failure(res, 'Quotation not found', 404);

  if ([QUOTATION_STATUS.CONFIRMED, QUOTATION_STATUS.REJECTED].includes(quotation.status)) {
    return failure(res, `Cannot override a quotation that is already ${quotation.status}`, 400);
  }

  // Mark every existing approval step (if any) as approved by the admin
  quotation.approvalSteps.forEach((step) => {
    step.status = 'approved';
    step.actedBy = req.user._id;
    step.reason = reason || 'Admin override approval';
    step.actedAt = new Date();
  });

  // If the quote never had an approval chain (e.g. still draft/negotiation),
  // add one record so the override still shows up in the audit trail
  if (quotation.approvalSteps.length === 0) {
    quotation.approvalSteps.push({
      role: 'admin',
      status: 'approved',
      actedBy: req.user._id,
      reason: reason || 'Admin override approval',
      actedAt: new Date(),
    });
  }

  quotation.currentApprovalStepIndex = Math.max(0, quotation.approvalSteps.length - 1);
  quotation.status = QUOTATION_STATUS.APPROVED;
  quotation.lastActivityAt = new Date();

  await quotation.save();

  await logAudit({
    entityType: 'Quotation',
    entityId: quotation._id,
    user: req.user,
    action: 'admin_override_approved',
    after: { status: quotation.status, previousRiskBand: quotation.riskBand },
    reason: reason || 'Admin override approval',
  });

  return success(res, quotation, 'Quotation approved by admin override');
});