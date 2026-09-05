import Invoice from '../models/Invoice.js';
import Subscription from '../models/Subscription.js';
import Quotation from '../models/Quotation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, failure } from '../utils/apiResponse.js';
import { activateBillingForQuotation } from '../services/billingActivation.js';
import { QUOTATION_STATUS } from '../config/constants.js';

// Confirm a quotation -> activates billing (splits into invoice + subscriptions)
export const confirmQuotationBilling = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.quotationId);
  if (!quotation) return failure(res, 'Quotation not found', 404);

  if (![QUOTATION_STATUS.APPROVED, QUOTATION_STATUS.CONFIRMED].includes(quotation.status)) {
    return failure(res, 'Quotation must be approved before billing can be activated', 400);
  }

  const { invoice, subscriptions } = await activateBillingForQuotation(quotation);

  quotation.status = QUOTATION_STATUS.CONFIRMED;
  await quotation.save();

  return success(res, { invoice, subscriptions }, 'Billing activated for quotation');
});

// Screen 10: Billing Detail - shows one-time + recurring lines for one quotation
export const getBillingDetail = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ quotation: req.params.quotationId, type: 'one_time' });
  const subscriptions = await Subscription.find({ quotation: req.params.quotationId });

  return success(res, { oneTimeInvoice: invoice, recurringSubscriptions: subscriptions }, 'Billing detail fetched');
});