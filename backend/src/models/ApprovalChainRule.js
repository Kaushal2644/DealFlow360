import mongoose from 'mongoose';
import { RISK_BANDS } from '../config/constants.js';

const approvalChainRuleSchema = new mongoose.Schema(
  {
    // e.g. "within tier/category limit", "over limit blended risk medium", "over limit blended risk high"
    label: { type: String, required: true },
    minOverPercent: { type: Number, required: true }, // inclusive lower bound of overage that triggers this rule
    maxOverPercent: { type: Number, default: null }, // null = no upper bound
    requiredBand: {
      type: String,
      enum: Object.values(RISK_BANDS),
      required: true,
    },
  },
  { timestamps: true }
);

const ApprovalChainRule = mongoose.model('ApprovalChainRule', approvalChainRuleSchema);
export default ApprovalChainRule;