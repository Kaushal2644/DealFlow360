import mongoose from 'mongoose';
import { PRODUCT_CATEGORIES } from '../config/constants.js';

const categoryDiscountCeilingSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            enum: Object.values(PRODUCT_CATEGORIES),
            rquired: true,
            unique: true,
        },
        maxDiscountPercent: { type: Number, required: true },
    },
    { timestamps: true }
);

const CategoryDiscountCeiling = mongoose.model(
    'CategoryDiscountCeiling',
    categoryDiscountCeilingSchema
);
export default CategoryDiscountCeiling;