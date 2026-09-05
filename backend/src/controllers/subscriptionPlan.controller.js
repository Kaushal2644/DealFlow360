import SubscriptionPlan from '../models/SubscriptionPlan.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, failure } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditLogger.js';

export const createSubscriptionPlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.create(req.body);
  await logAudit({
    entityType: 'SubscriptionPlan',
    entityId: plan._id,
    user: req.user,
    action: 'created',
    after: plan.toObject(),
  });
  return success(res, plan, 'Subscription plan created', 201);
});

export const getSubscriptionPlans = asyncHandler(async (req, res) => {
  const plans = await SubscriptionPlan.find({ isActive: true }).populate('product', 'name category');
  return success(res, plans, 'Subscription plans fetched');
});

export const updateSubscriptionPlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!plan) return failure(res, 'Plan not found', 404);
  return success(res, plan, 'Subscription plan updated');
});