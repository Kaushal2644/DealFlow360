import mongoose from 'mongoose';

const upsellRuleSchema = new mongoose.Schema(
  {
    baseProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    suggestedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    coPurchaseScore: { type: Number, default: 50, min: 0, max: 100 }, // higher = bought together more often
    promoted: { type: Boolean, default: false },
    minMarginThreshold: { type: Number, default: 0 }, // only suggest if suggestedProduct's margin% is above this
  },
  { timestamps: true }
);

upsellRuleSchema.index({ baseProduct: 1, suggestedProduct: 1 }, { unique: true });

const UpsellRule = mongoose.model('UpsellRule', upsellRuleSchema);
export default UpsellRule;