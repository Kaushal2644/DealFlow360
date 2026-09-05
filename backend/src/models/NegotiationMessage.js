
import mongoose from 'mongoose';

const negotiationMessageSchema = new mongoose.Schema(
  {
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
    author: { type: String, enum: ['customer', 'rep'], required: true },
    lineId: { type: mongoose.Schema.Types.ObjectId, default: null }, // optional: comment tied to a specific line
    comment: { type: String, default: '' },
    counterDiscountPercent: { type: Number, default: null },
    status: { type: String, enum: ['open', 'addressed'], default: 'open' },
  },
  { timestamps: true }
);

const NegotiationMessage = mongoose.model('NegotiationMessage', negotiationMessageSchema);
export default NegotiationMessage;