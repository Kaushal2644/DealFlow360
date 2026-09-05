import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, failure } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditLogger.js';
import { INVOICE_STATUS } from '../config/constants.js';

export const recordPayment = asyncHandler(async (req, res) => {
  const { amount, method } = req.body;

  const invoice = await Invoice.findById(req.params.invoiceId);
  if (!invoice) return failure(res, 'Invoice not found', 404);
  if (invoice.status === INVOICE_STATUS.PAID) {
    return failure(res, 'This invoice is already fully paid', 400);
  }

  const payment = await Payment.create({
    invoice: invoice._id,
    amount,
    method,
    recordedBy: req.user._id,
  });

  // Sum every payment made against this invoice so far
  const allPayments = await Payment.find({ invoice: invoice._id });
  const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

  if (totalPaid >= invoice.amount) {
    invoice.status = INVOICE_STATUS.PAID;
    invoice.stage = 'paid';
  }
  // if totalPaid < invoice.amount, it stays unpaid (partial payment recorded, but not fully settled)

  await invoice.save();

  await logAudit({
    entityType: 'Invoice',
    entityId: invoice._id,
    user: req.user,
    action: 'payment_recorded',
    after: { amount, totalPaid, status: invoice.status },
  });

  return success(res, { payment, invoice, totalPaid }, 'Payment recorded');
});

export const getPaymentsForInvoice = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ invoice: req.params.invoiceId }).populate('recordedBy', 'name');
  return success(res, payments, 'Payments fetched');
});