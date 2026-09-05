import mongoose from 'mongoose';

const quotationLineSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true }, // snapshot, in case product changes later
    category: { type: String, required: true },     // snapshot of product.category
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },     // snapshot of product.price at time of adding
    unitCost: { type: Number, default: 0 },           // snapshot of product.cost
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },

    // computed fields (filled in by the risk engine, not by the user)
    categoryDiscountLimit: { type: Number, default: 0 },
    tierDiscountLimit: { type: Number, default: 0 },
    effectiveLimit: { type: Number, default: 0 },     // the stricter of the two above
    overBy: { type: Number, default: 0 },             // how many points over the limit (0 if within)
    lineTotal: { type: Number, default: 0 },           // qty * unitPrice * (1 - discount%)
    marginPercent: { type: Number, default: 0 },
  },
  { _id: true, timestamps: false }
);

export default quotationLineSchema;