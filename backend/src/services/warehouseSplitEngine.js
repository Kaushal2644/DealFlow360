import StockLevel from '../models/StockLevel.js';
import Warehouse from '../models/Warehouse.js';

/**
 * Given a list of { productId, qty } needed, returns suggested warehouse splits.
 * Does NOT reserve stock or save anything — pure calculation.
 */
export const calculateWarehouseSplit = async (neededLines) => {
  const splits = [];
  const touchedWarehouseIds = new Set();
  let hasBackorder = false;

  for (const line of neededLines) {
    let remainingQty = line.qty;

    // Find stock for this product across all warehouses, cheapest (lowest shippingWeight) first
    const stockEntries = await StockLevel.find({ product: line.productId })
      .populate('warehouse')
      .lean();

    const sortedStock = stockEntries
      .filter((s) => s.warehouse && s.warehouse.isActive)
      .sort((a, b) => a.warehouse.shippingWeight - b.warehouse.shippingWeight);

    for (const stock of sortedStock) {
      if (remainingQty <= 0) break;

      const available = stock.qtyOnHand - stock.qtyReserved;
      if (available <= 0) continue;

      const qtyFromThisWarehouse = Math.min(available, remainingQty);

      splits.push({
        warehouse: stock.warehouse._id,
        warehouseName: stock.warehouse.name,
        product: line.productId,
        productName: line.productName,
        qtyFulfilled: qtyFromThisWarehouse,
        qtyBackordered: 0,
      });

      touchedWarehouseIds.add(stock.warehouse._id.toString());
      remainingQty -= qtyFromThisWarehouse;
    }

    // Whatever's left after checking every warehouse is a backorder
    if (remainingQty > 0) {
      hasBackorder = true;
      splits.push({
        warehouse: null,
        warehouseName: 'Backorder',
        product: line.productId,
        productName: line.productName,
        qtyFulfilled: 0,
        qtyBackordered: remainingQty,
      });
    }
  }

  return {
    splits,
    estimatedShipments: touchedWarehouseIds.size,
    hasBackorder,
  };
};