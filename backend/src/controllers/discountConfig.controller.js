import DiscountTier from '../models/DiscountTier.js';
import CategoryDiscountCeiling from '../models/CategoryDiscountCeiling.js';
import ApprovalChainRule from '../models/ApprovalChainRule.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, failure } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditLogger.js';

// ---- Discount Tiers ----
export const upsertDiscountTier = asyncHandler(async (req, res) => {
  const { tier, maxDiscountPercent } = req.body;
  const existing = await DiscountTier.findOneAndUpdate(
    { tier },
    { maxDiscountPercent },
    { new: true, upsert: true, runValidators: true }
  );

  await logAudit({
    entityType: 'DiscountTier',
    entityId: existing._id,
    user: req.user,
    action: 'upserted',
    after: existing.toObject(),
  });

  return success(res, existing, 'Discount tier saved');
});

export const getDiscountTiers = asyncHandler(async (req, res) => {
  const tiers = await DiscountTier.find().sort({ maxDiscountPercent: 1 });
  return success(res, tiers, 'Discount tiers fetched');
});

// ---- Category Ceilings ----
export const upsertCategoryCeiling = asyncHandler(async (req, res) => {
  const { category, maxDiscountPercent } = req.body;
  const existing = await CategoryDiscountCeiling.findOneAndUpdate(
    { category },
    { maxDiscountPercent },
    { new: true, upsert: true, runValidators: true }
  );

  await logAudit({
    entityType: 'CategoryDiscountCeiling',
    entityId: existing._id,
    user: req.user,
    action: 'upserted',
    after: existing.toObject(),
  });

  return success(res, existing, 'Category discount ceiling saved');
});

export const getCategoryCeilings = asyncHandler(async (req, res) => {
  const ceilings = await CategoryDiscountCeiling.find();
  return success(res, ceilings, 'Category ceilings fetched');
});

// ---- Approval Chain Rules ----
export const createApprovalChainRule = asyncHandler(async (req, res) => {
  const rule = await ApprovalChainRule.create(req.body);

  await logAudit({
    entityType: 'ApprovalChainRule',
    entityId: rule._id,
    user: req.user,
    action: 'created',
    after: rule.toObject(),
  });

  return success(res, rule, 'Approval chain rule created', 201);
});

export const getApprovalChainRules = asyncHandler(async (req, res) => {
  const rules = await ApprovalChainRule.find().sort({ minOverPercent: 1 });
  return success(res, rules, 'Approval chain rules fetched');
});

export const updateApprovalChainRule = asyncHandler(async (req, res) => {
  const before = await ApprovalChainRule.findById(req.params.id);
  if (!before) return failure(res, 'Rule not found', 404);

  const rule = await ApprovalChainRule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await logAudit({
    entityType: 'ApprovalChainRule',
    entityId: rule._id,
    user: req.user,
    action: 'updated',
    before: before.toObject(),
    after: rule.toObject(),
  });

  return success(res, rule, 'Approval chain rule updated');
});

export const deleteApprovalChainRule = asyncHandler(async (req, res) => {
  const rule = await ApprovalChainRule.findByIdAndDelete(req.params.id);
  if (!rule) return failure(res, 'Rule not found', 404);

  await logAudit({
    entityType: 'ApprovalChainRule',
    entityId: rule._id,
    user: req.user,
    action: 'deleted',
    before: rule.toObject(),
  });

  return success(res, null, 'Approval chain rule deleted');
});