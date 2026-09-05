import Subscription from '../models/Subscription.js';
import BillingSchedule from '../models/BillingSchedule.js';
import CreditNote from '../models/CreditNote.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, failure } from '../utils/apiResponse.js';
import { calculateProration, calculateCancellationRefund } from '../services/billingProrationEngine.js';
import { logAudit } from '../services/auditLogger.js';

export const getSubscriptions = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const subs = await Subscription.find(filter).populate('customer', 'name').sort({ updatedAt: -1 });
  return success(res, subs, 'Subscriptions fetched');
});

export const getSubscriptionById = asyncHandler(async (req, res) => {
  const sub = await Subscription.findById(req.params.id).populate('customer', 'name');
  if (!sub) return failure(res, 'Subscription not found', 404);

  const schedule = await BillingSchedule.find({ subscription: sub._id }).sort({ cycleStartDate: 1 });
  return success(res, { subscription: sub, billingSchedule: schedule }, 'Subscription detail fetched');
});

// Change quantity mid-cycle -> triggers proration
export const modifySubscriptionQty = asyncHandler(async (req, res) => {
  const { newQty } = req.body;
  const sub = await Subscription.findById(req.params.id);
  if (!sub) return failure(res, 'Subscription not found', 404);
  if (sub.status !== 'active') return failure(res, 'Only active subscriptions can be modified', 400);

  const oldAmount = sub.qty * sub.unitPrice;
  const newAmount = newQty * sub.unitPrice;

  const { adjustment, daysRemaining } = calculateProration({
    cycle: sub.cycle,
    cycleStartDate: sub.cycleStartDate,
    oldAmount,
    newAmount,
  });

  sub.qty = newQty;
  await sub.save();

  if (adjustment > 0) {
    // Extra charge for the rest of this cycle -> log as an adjustment on the schedule
    await BillingSchedule.create({
      subscription: sub._id,
      cycleStartDate: new Date(),
      cycleEndDate: sub.nextBillDate,
      amount: adjustment,
      prorationNote: `Prorated charge for qty change (${daysRemaining} days remaining)`,
      status: 'pending',
    });
  } else if (adjustment < 0) {
    // Customer gets money back for the unused portion
    await CreditNote.create({
      subscription: sub._id,
      customer: sub.customer,
      amount: Math.abs(adjustment),
      reason: `Prorated credit for qty decrease (${daysRemaining} days remaining)`,
    });
  }

  await logAudit({
    entityType: 'Subscription',
    entityId: sub._id,
    user: req.user,
    action: 'qty_modified',
    after: { newQty, adjustment },
  });

  return success(res, { subscription: sub, prorationAdjustment: adjustment }, 'Subscription quantity updated');
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findById(req.params.id);
  if (!sub) return failure(res, 'Subscription not found', 404);

  const plan = await SubscriptionPlan.findById(sub.plan);

  const refund = calculateCancellationRefund({
    cycle: sub.cycle,
    cycleStartDate: sub.cycleStartDate,
    amount: sub.qty * sub.unitPrice,
    cancellationRule: plan?.cancellationRule || 'immediate_partial_refund',
  });

  sub.status = 'cancelled';
  await sub.save();

  if (refund > 0) {
    await CreditNote.create({
      subscription: sub._id,
      customer: sub.customer,
      amount: refund,
      reason: 'Prorated refund on cancellation',
    });
  }

  await logAudit({
    entityType: 'Subscription',
    entityId: sub._id,
    user: req.user,
    action: 'cancelled',
    after: { refund },
  });

  return success(res, { subscription: sub, refund }, 'Subscription cancelled');
});