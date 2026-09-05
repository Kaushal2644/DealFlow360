import UpsellRule from '../models/UpsellRule.js';
import Quotation from '../models/Quotation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, failure } from '../utils/apiResponse.js';
import { getUpsellSuggestions, calculateMarginDelta } from '../services/upsellRecommender.js';

// Admin: define a pairing rule
export const createUpsellRule = asyncHandler(async (req, res) => {
  const rule = await UpsellRule.create(req.body);
  return success(res, rule, 'Upsell rule created', 201);
});

export const getUpsellRules = asyncHandler(async (req, res) => {
  const rules = await UpsellRule.find()
    .populate('baseProduct', 'name')
    .populate('suggestedProduct', 'name');
  return success(res, rules, 'Upsell rules fetched');
});

// Rep-facing: get live suggestions for a quotation's current cart
export const getSuggestionsForQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.quotationId);
  if (!quotation) return failure(res, 'Quotation not found', 404);

  const baseProductIds = quotation.lines.map((l) => l.product.toString());
  const suggestions = await getUpsellSuggestions(baseProductIds);

  const currentOrderTotal = quotation.lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const currentOrderCost = quotation.lines.reduce((sum, l) => sum + l.unitCost * l.qty, 0);

  const withMarginDelta = suggestions.map((s) => ({
    ...s,
    marginDeltaIfAdded: calculateMarginDelta(currentOrderTotal, currentOrderCost, s.product),
  }));

  return success(res, withMarginDelta, 'Upsell suggestions fetched');
});