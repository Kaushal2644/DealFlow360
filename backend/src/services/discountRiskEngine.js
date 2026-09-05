import DiscountTier from '../models/DiscountTier.js';
import CategoryDiscountCeiling from '../models/CategoryDiscountCeiling.js';
import ApprovalChainRule from '../models/ApprovalChainRule.js';
import { RISK_BANDS } from '../config/constants.js';

export const evaluateQuotationRisk = async (quotation, customer) => {
  const tierConfig = await DiscountTier.findOne({ tier: customer.tier });
  const tierLimit = tierConfig ? tierConfig.maxDiscountPercent : 0;

  const categoryConfigs = await CategoryDiscountCeiling.find();
  const categoryLimitMap = {};
  categoryConfigs.forEach((c) => {
    categoryLimitMap[c.category] = c.maxDiscountPercent;
  });

  let orderTotal = 0;
  let weightedOverageSum = 0; // sum of (overBy * lineValue)

  quotation.lines.forEach((line) => {
    const categoryLimit = categoryLimitMap[line.category] ?? tierLimit;

    // The stricter (smaller) of tier limit and category limit wins
    const effectiveLimit = Math.min(tierLimit, categoryLimit);

    const overBy = Math.max(0, line.discountPercent - effectiveLimit);

    const lineValue = line.qty * line.unitPrice; // pre-discount value, used as weight
    const lineTotal = lineValue * (1 - line.discountPercent / 100);
    const marginPercent =
      line.unitPrice > 0
        ? ((line.unitPrice * (1 - line.discountPercent / 100) - line.unitCost) / line.unitPrice) * 100
        : 0;

    line.tierDiscountLimit = tierLimit;
    line.categoryDiscountLimit = categoryLimit;
    line.effectiveLimit = effectiveLimit;
    line.overBy = overBy;
    line.lineTotal = lineTotal;
    line.marginPercent = marginPercent;

    orderTotal += lineTotal;
    weightedOverageSum += overBy * lineValue;
  });

  // Blended risk score: weighted average overage across the whole order,
  // expressed as "average discount points over limit, weighted by line size"
  const totalLineValue = quotation.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  const blendedRiskScore = totalLineValue > 0 ? weightedOverageSum / totalLineValue : 0;

  // Look up which approval band this score falls into
  const rules = await ApprovalChainRule.find().sort({ minOverPercent: 1 });
  let riskBand = RISK_BANDS.NONE;

  for (const rule of rules) {
    const withinLower = blendedRiskScore >= rule.minOverPercent;
    const withinUpper = rule.maxOverPercent === null || blendedRiskScore <= rule.maxOverPercent;
    if (withinLower && withinUpper) {
      riskBand = rule.requiredBand;
    }
  }

  return {
    blendedRiskScore: Number(blendedRiskScore.toFixed(2)),
    riskBand,
    orderTotal: Number(orderTotal.toFixed(2)),
  };
};