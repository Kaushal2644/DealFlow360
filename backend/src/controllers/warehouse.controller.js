import Warehouse from '../models/Warehouse.js';
import StockLevel from '../models/StockLevel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, failure } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditLogger.js';

export const createWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.create(req.body);
  await logAudit({
    entityType: 'Warehouse',
    entityId: warehouse._id,
    user: req.user,
    action: 'created',
    after: warehouse.toObject(),
  });
  return success(res, warehouse, 'Warehouse created', 201);
});

export const getWarehouses = asyncHandler(async (req, res) => {
  const warehouses = await Warehouse.find({ isActive: true });
  return success(res, warehouses, 'Warehouses fetched');
});

export const updateWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!warehouse) return failure(res, 'Warehouse not found', 404);
  return success(res, warehouse, 'Warehouse updated');
});

// ---- Stock Levels ----
export const upsertStockLevel = asyncHandler(async (req, res) => {
  const { warehouse, product, qtyOnHand, qtyReserved } = req.body;

  const stock = await StockLevel.findOneAndUpdate(
    { warehouse, product },
    { qtyOnHand, qtyReserved: qtyReserved ?? 0 },
    { new: true, upsert: true, runValidators: true }
  );

  await logAudit({
    entityType: 'StockLevel',
    entityId: stock._id,
    user: req.user,
    action: 'upserted',
    after: stock.toObject(),
  });

  return success(res, stock, 'Stock level saved');
});

export const getStockLevels = asyncHandler(async (req, res) => {
  const { product, warehouse } = req.query;
  const filter = {};
  if (product) filter.product = product;
  if (warehouse) filter.warehouse = warehouse;

  const stock = await StockLevel.find(filter)
    .populate('warehouse', 'name shippingWeight')
    .populate('product', 'name category');

  return success(res, stock, 'Stock levels fetched');
});