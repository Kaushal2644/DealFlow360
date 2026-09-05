import mongoose from 'mongoose';
import { PRODUCT_CATEGORIES } from '../config/constants.js';

const variantSchema = new mongoose.Schema(
  {
    attribute: { type: String, required: true }, // e.g. "Color", "RAM"
    values: [
      {
        value: { type: String, required: true }, // e.g. "Blue", "8GB"
        extraPrice: { type: Number, default: 0 },
      },
    ],
  },
  { _id: false }
);

const priceListEntrySchema = new mongoose.Schema(
  {
    tier: { type: String, required: true }, // bronze/silver/gold
    currency: { type: String, default: 'USD' },
    priceRule: { type: String, default: 'base' }, // e.g. "base", "minus_10_percent"
    fixedPrice: { type: Number, default: null },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: Object.values(PRODUCT_CATEGORIES),
      required: true,
    },
    price: { type: Number, required: true },
    cost: { type: Number, default: 0 }, // used to compute margin
    unit: { type: String, default: 'each' },
    taxPercent: { type: Number, default: 0 },
    description: { type: String, default: '' },
    isSubscription: { type: Boolean, default: false },
    subscriptionCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly', null], default: null },
    quantityOnHand: { type: Number, default: 0 }, // global fallback; real stock tracked per warehouse
    variants: [variantSchema],
    priceList: [priceListEntrySchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.methods.marginPercent = function () {
  if (!this.price) return 0;
  return ((this.price - this.cost) / this.price) * 100;
};

const Product = mongoose.model('Product', productSchema);
export default Product;