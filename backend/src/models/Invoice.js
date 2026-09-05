import mongoose from 'mongoose';
import { INVOICE_STATUS } from '../config/constants.js';

const invoiceLineSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    qty: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    type: { type: String, enum: ['one_time', 'recurring'], required: true },
    lines: [invoiceLineSchema],
    amount: { type: Number, required: true },
    status: { type: String, enum: Object.values(INVOICE_STATUS), default: INVOICE_STATUS.UNPAID },
    dueDate: { type: Date, required: true },
    stage: {
      type: String,
      enum: ['order_confirmed', 'shipped', 'invoiced', 'paid'],
      default: 'order_confirmed',
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;