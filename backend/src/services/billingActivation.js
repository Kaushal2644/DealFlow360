import Invoice from '../models/Invoice.js';
import Subscription from '../models/Subscription.js';
import BillingSchedule from '../models/BillingSchedule.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber.js';

const CYCLE_DAYS = { monthly: 30, quarterly: 90, yearly: 365 };

export const activateBillingForQuotation = async (quotation) => {
  const oneTimeLines = quotation.lines.filter((l) => l.category !== 'subscription');
  const recurringLines = quotation.lines.filter((l) => l.category === 'subscription');

  let invoice = null;
  if (oneTimeLines.length > 0) {
    const amount = oneTimeLines.reduce((sum, l) => sum + l.lineTotal, 0);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // net-7 default

    invoice = await Invoice.create({
      invoiceNumber: generateInvoiceNumber(quotation._id),
      quotation: quotation._id,
      customer: quotation.customer,
      type: 'one_time',
      lines: oneTimeLines.map((l) => ({
        description: l.productName,
        qty: l.qty,
        unitPrice: l.unitPrice,
        amount: l.lineTotal,
      })),
      amount,
      dueDate,
      stage: 'order_confirmed',
    });
  }

  const subscriptions = [];
  for (const line of recurringLines) {
    const plan = await SubscriptionPlan.findOne({ product: line.product });
    if (!plan) continue; // no plan configured for this product, skip

    const cycleStartDate = new Date();
    const cycleDays = CYCLE_DAYS[plan.cycle] || 30;
    const nextBillDate = new Date(cycleStartDate);
    nextBillDate.setDate(nextBillDate.getDate() + cycleDays);

    const unitPrice = line.unitPrice * (1 - line.discountPercent / 100);

    const subscription = await Subscription.create({
      quotation: quotation._id,
      customer: quotation.customer,
      plan: plan._id,
      product: line.product,
      productName: line.productName,
      cycle: plan.cycle,
      qty: line.qty,
      unitPrice,
      status: 'active',
      cycleStartDate,
      nextBillDate,
    });

    await BillingSchedule.create({
      subscription: subscription._id,
      cycleStartDate,
      cycleEndDate: nextBillDate,
      amount: subscription.qty * subscription.unitPrice,
      status: 'pending',
    });

    subscriptions.push(subscription);
  }

  return { invoice, subscriptions };
};