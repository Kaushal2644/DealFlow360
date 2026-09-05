import mongoose from 'mongoose';
import { FULFILLMENT_STATUS } from '../config/constants.js';

const splitLineSchema = new mongoose.Schema(
  {
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    warehouseName: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    qtyFulfilled: { type: Number, required: true },
    qtyBackordered: { type: Number, default: 0 },
  },
  { _id: false }
);

const fulfillmentOrderSchema = new mongoose.Schema(
  {
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    splits: [splitLineSchema],
    estimatedShipments: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(FULFILLMENT_STATUS),
      default: FULFILLMENT_STATUS.SUGGESTED,
    },
    hasBackorder: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const FulfillmentOrder = mongoose.model('FulfillmentOrder', fulfillmentOrderSchema);
export default FulfillmentOrder;