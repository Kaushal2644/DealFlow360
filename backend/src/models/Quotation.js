import mongoose from 'mongoose';
import quotationLineSchema from './QuotationLine.js';
import { QUOTATION_STATUS, RISK_BANDS } from '../config/constants.js';

const approvalStepSubSchema = new mongoose.Schema(
  {
    role: { type: String, required: true }, // 'sales_manager' | 'finance'
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'returned_for_revision'], default: 'pending' },
    actedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reason: { type: String, default: '' },
    actedAt: { type: Date, default: null },
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    rep: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(QUOTATION_STATUS),
      default: QUOTATION_STATUS.DRAFT,
    },
    lines: [quotationLineSchema],

    // risk engine output
    blendedRiskScore: { type: Number, default: 0 },
    riskBand: { type: String, enum: Object.values(RISK_BANDS), default: RISK_BANDS.NONE },

    // approval chain
    approvalSteps: [approvalStepSubSchema],
    currentApprovalStepIndex: { type: Number, default: 0 },

    orderTotal: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now }, // used later by stalled-deal scanner
  },
  { timestamps: true }
);

const Quotation = mongoose.model('Quotation', quotationSchema);
export default Quotation;