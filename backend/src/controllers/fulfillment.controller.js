import Quotation from '../models/Quotation.js';
import FulfillmentOrder from '../models/FulfillmentOrder.js';
import StockLevel from '../models/StockLevel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, failure } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditLogger.js';
import { calculateWarehouseSplit } from '../services/warehouseSplitEngine.js';
import { QUOTATION_STATUS, FULFILLMENT_STATUS } from '../config/constants.js';

// Generate (or regenerate) the suggested split for an approved quotation
export const generateFulfillmentSuggestion = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.quotationId);
  if (!quotation) return failure(res, 'Quotation not found', 404);
  if (quotation.status !== QUOTATION_STATUS.APPROVED && quotation.status !== QUOTATION_STATUS.CONFIRMED) {
    return failure(res, 'Quotation must be approved before fulfillment can be planned', 400);
  }

  const neededLines = quotation.lines.map((l) => ({
    productId: l.product,
    productName: l.productName,
    qty: l.qty,
  }));

  const { splits, estimatedShipments, hasBackorder } = await calculateWarehouseSplit(neededLines);

  const fulfillmentOrder = await FulfillmentOrder.findOneAndUpdate(
    { quotation: quotation._id },
    {
      quotation: quotation._id,
      customer: quotation.customer,
      splits,
      estimatedShipments,
      hasBackorder,
      status: FULFILLMENT_STATUS.SUGGESTED,
    },
    { new: true, upsert: true }
  );

  return success(res, fulfillmentOrder, 'Fulfillment split suggested');
});

export const getFulfillmentOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const orders = await FulfillmentOrder.find(filter)
    .populate('customer', 'name')
    .sort({ updatedAt: -1 });

  return success(res, orders, 'Fulfillment orders fetched');
});

export const getFulfillmentById = asyncHandler(async (req, res) => {
  const order = await FulfillmentOrder.findById(req.params.id).populate('customer', 'name');
  if (!order) return failure(res, 'Fulfillment order not found', 404);
  return success(res, order, 'Fulfillment order fetched');
});

// Rep/Finance clicks "Accept Suggested Split" — this actually reserves the stock
export const acceptSplit = asyncHandler(async (req, res) => {
  const order = await FulfillmentOrder.findById(req.params.id);
  if (!order) return failure(res, 'Fulfillment order not found', 404);

  for (const split of order.splits) {
    if (!split.warehouse) continue; // skip backorder rows, nothing to reserve
    await StockLevel.findOneAndUpdate(
      { warehouse: split.warehouse, product: split.product },
      { $inc: { qtyReserved: split.qtyFulfilled } }
    );
  }

  order.status = FULFILLMENT_STATUS.ACCEPTED;
  await order.save();

  await logAudit({
    entityType: 'FulfillmentOrder',
    entityId: order._id,
    user: req.user,
    action: 'split_accepted',
  });

  return success(res, order, 'Split accepted, stock reserved');
});

// Manual override — rep/finance manually edits the splits array themselves
export const manualOverrideSplit = asyncHandler(async (req, res) => {
  const { splits } = req.body;
  const order = await FulfillmentOrder.findById(req.params.id);
  if (!order) return failure(res, 'Fulfillment order not found', 404);

  const before = order.splits;
  order.splits = splits;
  order.status = FULFILLMENT_STATUS.MANUAL_OVERRIDE;
  order.hasBackorder = splits.some((s) => s.qtyBackordered > 0);
  await order.save();

  await logAudit({
    entityType: 'FulfillmentOrder',
    entityId: order._id,
    user: req.user,
    action: 'manual_override',
    before,
    after: splits,
  });

  return success(res, order, 'Split manually overridden');
});

// When new stock arrives, suggest consolidating any remaining backorder
export const consolidateBackorder = asyncHandler(async (req, res) => {
  const order = await FulfillmentOrder.findById(req.params.id);
  if (!order) return failure(res, 'Fulfillment order not found', 404);
  if (!order.hasBackorder) return failure(res, 'No backorder to consolidate', 400);

  const backorderedLines = order.splits
    .filter((s) => s.qtyBackordered > 0)
    .map((s) => ({ productId: s.product, productName: s.productName, qty: s.qtyBackordered }));

  const { splits: newSplits, estimatedShipments, hasBackorder } = await calculateWarehouseSplit(backorderedLines);

  // Merge: keep original fulfilled splits, replace backorder rows with newly found stock
  const fulfilledOnly = order.splits.filter((s) => s.qtyBackordered === 0);
  order.splits = [...fulfilledOnly, ...newSplits];
  order.estimatedShipments = estimatedShipments;
  order.hasBackorder = hasBackorder;
  order.status = FULFILLMENT_STATUS.CONSOLIDATED;
  await order.save();

  return success(res, order, 'Backorder consolidation suggested');
});