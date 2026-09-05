import Invoice from '../models/Invoice.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, failure } from '../utils/apiResponse.js';
import { INVOICE_STATUS } from '../config/constants.js';

export const getInvoices = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  // Auto-flag anything past due date as overdue before returning the list
  await Invoice.updateMany(
    { status: INVOICE_STATUS.UNPAID, dueDate: { $lt: new Date() } },
    { status: INVOICE_STATUS.OVERDUE }
  );

  const invoices = await Invoice.find(filter).populate('customer', 'name').sort({ createdAt: -1 });
  return success(res, invoices, 'Invoices fetched');
});

export const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate('customer', 'name');
  if (!invoice) return failure(res, 'Invoice not found', 404);
  return success(res, invoice, 'Invoice fetched');
});

// Move the operational timeline forward (Order Confirmed -> Shipped -> Invoiced -> Paid)
export const updateInvoiceStage = asyncHandler(async (req, res) => {
  const { stage } = req.body;
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, { stage }, { new: true });
  if (!invoice) return failure(res, 'Invoice not found', 404);
  return success(res, invoice, 'Invoice stage updated');
});