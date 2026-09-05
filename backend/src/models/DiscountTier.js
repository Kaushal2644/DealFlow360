import mongoose from 'mongoose';
import { CUSTOMER_TIERS } from '../config/constants.js';

const discountTierSchema = new mongoose.Schema(
    {
        tier: {
            type: String,
            enum: Object.values(CUSTOMER_TIERS),
            required: true,
            unique: true,
        },
        maxDiscountPercent: { type: Number, required: true},
    },
    { timestamps: true }
);

const DiscountTier = mongoose.model('DiscountTier', discountTierSchema);
export default DiscountTier;