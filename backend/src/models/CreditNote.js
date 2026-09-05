import mongoose from 'mongoose';

const creditNoteSchema = new mongoose.Schema(
  {
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    amount: { type: Number, required: true }, // positive = credit owed to customer
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

const CreditNote = mongoose.model('CreditNote', creditNoteSchema);
export default CreditNote;