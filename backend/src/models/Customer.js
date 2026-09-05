import mongoose from 'mongoose';
import { CUSTOMER_TIERS } from '../config/constants.js';

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tier: {
      type: String,
      enum: Object.values(CUSTOMER_TIERS),
      default: CUSTOMER_TIERS.BRONZE,
    },
    portalPasswordHash: { type: String, default: null }, // separate from internal User auth
    historicalAvgDiscountPercent: { type: Number, default: 0 }, // used later by anomaly scanner
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;