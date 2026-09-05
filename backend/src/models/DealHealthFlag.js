import mongoose from 'mongoose';

const dealHealthFlagSchema = new mongoose.Schema(
  {
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
    type: { type: String, enum: ['stalled', 'discount_anomaly', 'delivery_slippage'], required: true },
    detail: { type: String, required: true }, // human-readable explanation
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['open', 'escalated', 'nudged', 'resolved'], default: 'open' },
    daysInvolved: { type: Number, default: 0 }, // e.g. days stalled, or days overdue
  },
  { timestamps: true }
);

// Prevent duplicate open flags of the same type on the same quotation
dealHealthFlagSchema.index({ quotation: 1, type: 1, status: 1 });

const DealHealthFlag = mongoose.model('DealHealthFlag', dealHealthFlagSchema);
export default DealHealthFlag;