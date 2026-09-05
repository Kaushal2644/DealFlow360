
import Quotation from '../models/Quotation.js';
import DealHealthFlag from '../models/DealHealthFlag.js';
import FulfillmentOrder from '../models/FulfillmentOrder.js';
import { QUOTATION_STATUS } from '../config/constants.js';

const STALLED_THRESHOLD_DAYS = 7;
const ANOMALY_THRESHOLD_POINTS = 10; // discount points above rep's own average
const DELIVERY_PROMISE_DAYS = 10;

// 1) Stalled deals
export const scanStalledDeals = async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - STALLED_THRESHOLD_DAYS);

  const stalledQuotations = await Quotation.find({
    status: { $nin: [QUOTATION_STATUS.CONFIRMED, QUOTATION_STATUS.REJECTED] },
    lastActivityAt: { $lt: cutoff },
  });

  for (const q of stalledQuotations) {
    const daysStalled = Math.floor((new Date() - q.lastActivityAt) / (1000 * 60 * 60 * 24));

    const existingOpenFlag = await DealHealthFlag.findOne({
      quotation: q._id,
      type: 'stalled',
      status: 'open',
    });
    if (existingOpenFlag) {
      existingOpenFlag.daysInvolved = daysStalled;
      existingOpenFlag.detail = `Inactive for ${daysStalled} days`;
      await existingOpenFlag.save();
    } else {
      await DealHealthFlag.create({
        quotation: q._id,
        type: 'stalled',
        detail:`Inactive for ${daysStalled} days`,
        severity:' daysStalled' > 14 ? 'high' : 'medium',
        daysInvolved: daysStalled,
      });
    }
  }
};

// 2) Discount anomalies
export const scanDiscountAnomalies = async () => {
  // Deals still active (not yet confirmed/rejected), grouped by rep
  const activeQuotations = await Quotation.find({
    status: { $nin: [QUOTATION_STATUS.DRAFT, QUOTATION_STATUS.CONFIRMED, QUOTATION_STATUS.REJECTED] },
  });

  for (const q of activeQuotations) {
    if (!q.lines.length) continue;

    const currentAvgDiscount =
      q.lines.reduce((sum, l) => sum + l.discountPercent, 0) / q.lines.length;

    // Rep's historical average, from their own past CONFIRMED deals only
    const pastDeals = await Quotation.find({
      rep: q.rep,
      status: QUOTATION_STATUS.CONFIRMED,
      _id: { $ne: q._id },
    });

    if (pastDeals.length === 0) continue; // not enough history to judge yet

    let totalDiscountPoints = 0;
    let totalLineCount = 0;
    pastDeals.forEach((deal) => {
      deal.lines.forEach((l) => {
        totalDiscountPoints += l.discountPercent;
        totalLineCount += 1;
      });
    });
    const repHistoricalAvg = totalLineCount > 0 ? totalDiscountPoints / totalLineCount : 0;

    const overBy = currentAvgDiscount - repHistoricalAvg;

    if (overBy > ANOMALY_THRESHOLD_POINTS) {
      const existingOpenFlag = await DealHealthFlag.findOne({
        quotation: q._id,
        type: 'discount_anomaly',
        status: 'open',
      });

      const detail = `Rep's discount here (${currentAvgDiscount.toFixed(1)}%) is ${overBy.toFixed(
        1
      )} points above their historical average (${repHistoricalAvg.toFixed(1)}%)`;

      if (existingOpenFlag) {
        existingOpenFlag.detail = detail;
        existingOpenFlag.daysInvolved = Number(overBy.toFixed(1));
        await existingOpenFlag.save();
      } else {
        await DealHealthFlag.create({
          quotation: q._id,
          type: 'discount_anomaly',
          detail,
          severity: overBy > 20 ? 'high' : 'medium',
          daysInvolved: Number(overBy.toFixed(1)),
        });
      }
    }
  }
};

// 3) Delivery slippage
export const scanDeliverySlippage = async () => {
  const fulfillmentOrders = await FulfillmentOrder.find({
    status: { $in: ['suggested', 'accepted', 'manual_override'] },
  });

  for (const order of fulfillmentOrders) {
    const promisedDate = new Date(order.createdAt);
    promisedDate.setDate(promisedDate.getDate() + DELIVERY_PROMISE_DAYS);

    if (new Date() > promisedDate) {
      const daysLate = Math.floor((new Date() - promisedDate) / (1000 * 60 * 60 * 24));

      const existingOpenFlag = await DealHealthFlag.findOne({
        quotation: order.quotation,
        type: 'delivery_slippage',
        status: 'open',
      });

      const detail = `Delivery is ${daysLate} day(s) past the promised date`;

      if (existingOpenFlag) {
        existingOpenFlag.detail = detail;
        existingOpenFlag.daysInvolved = daysLate;
        await existingOpenFlag.save();
      } else {
        await DealHealthFlag.create({
          quotation: order.quotation,
          type: 'delivery_slippage',
          detail,
          severity: daysLate > 5 ? 'high' : 'medium',
          daysInvolved: daysLate,
        });
      }
    }
  }
};

export const runFullDealHealthScan = async () => {
  await scanStalledDeals();
  await scanDiscountAnomalies();
  await scanDeliverySlippage();
};