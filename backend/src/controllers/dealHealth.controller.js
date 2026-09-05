import DealHealthFlag from '../models/DealHealthFlag.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, failure } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditLogger.js';
import { runFullDealHealthScan } from '../services/dealHealthScanner.js';

// Trigger an on-demand scan (also runs automatically via cron, Phase 8b)
export const triggerScan = asyncHandler(async (req, res) => {
  await runFullDealHealthScan();
  return success(res, null, 'Deal health scan completed');
});

export const getFlags = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  const filter = {};
  if (type) filter.type = type;
  filter.status = status || 'open'; // default: only show open flags

  const flags = await DealHealthFlag.find(filter)
    .populate({
      path: 'quotation',
      populate: [
        { path: 'customer', select: 'name tier' },
        { path: 'rep', select: 'name' },
      ],
    })
    .sort({ createdAt: -1 });

  return success(res, flags, 'Deal health flags fetched');
});

export const escalateFlag = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const flag = await DealHealthFlag.findByIdAndUpdate(
    req.params.id,
    { status: 'escalated' },
    { new: true }
  );
  if (!flag) return failure(res, 'Flag not found', 404);

  await logAudit({
    entityType: 'DealHealthFlag',
    entityId: flag._id,
    user: req.user,
    action: 'escalated',
    reason,
  });

  return success(res, flag, 'Flag escalated');
});

export const nudgeRep = asyncHandler(async (req, res) => {
  const flag = await DealHealthFlag.findByIdAndUpdate(
    req.params.id,
    { status: 'nudged' },
    { new: true }
  );
  if (!flag) return failure(res, 'Flag not found', 404);

  await logAudit({
    entityType: 'DealHealthFlag',
    entityId: flag._id,
    user: req.user,
    action: 'nudged_rep',
  });

  // In a full build, this would trigger an email/notification to the rep here.
  return success(res, flag, 'Rep nudged');
});

export const resolveFlag = asyncHandler(async (req, res) => {
  const flag = await DealHealthFlag.findByIdAndUpdate(
    req.params.id,
    { status: 'resolved' },
    { new: true }
  );
  if (!flag) return failure(res, 'Flag not found', 404);
  return success(res, flag, 'Flag resolved');
});