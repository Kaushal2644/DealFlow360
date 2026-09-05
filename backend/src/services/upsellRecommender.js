import UpsellRule from '../models/UpsellRule.js';
import Product from '../models/Product.js';

/**
 * Given the product IDs currently in a quotation, returns ranked upsell suggestions.
 * Each suggestion includes the margin delta if it were added to the order.
 */
export const getUpsellSuggestions = async (baseProductIds) => {
  const rules = await UpsellRule.find({ baseProduct: { $in: baseProductIds } })
    .populate('suggestedProduct');

  const suggestionsMap = new Map(); // dedupe by suggestedProduct, keep the highest score

  for (const rule of rules) {
    const product = rule.suggestedProduct;
    if (!product || !product.isActive) continue;
    if (baseProductIds.includes(product._id.toString())) continue; // don't suggest something already in cart

    const margin = product.price > 0 ? ((product.price - product.cost) / product.price) * 100 : 0;
    if (margin < rule.minMarginThreshold) continue; // filter out unhealthy-margin suggestions

    // Promoted items get a ranking boost
    const rankScore = rule.coPurchaseScore + (rule.promoted ? 20 : 0);

    const existing = suggestionsMap.get(product._id.toString());
    if (!existing || rankScore > existing.rankScore) {
      suggestionsMap.set(product._id.toString(), {
        product: {
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
        },
        marginPercent: Number(margin.toFixed(1)),
        promoted: rule.promoted,
        rankScore,
      });
    }
  }

  return Array.from(suggestionsMap.values()).sort((a, b) => b.rankScore - a.rankScore);
};

/** Computes how the order's overall margin changes if a suggested product is added */
export const calculateMarginDelta = (currentOrderTotal, currentOrderCost, addedProduct, qty = 1) => {
  const addedRevenue = addedProduct.price * qty;
  const addedCost = addedProduct.cost * qty;

  const newTotal = currentOrderTotal + addedRevenue;
  const newCost = currentOrderCost + addedCost;

  const oldMargin = currentOrderTotal > 0 ? ((currentOrderTotal - currentOrderCost) / currentOrderTotal) * 100 : 0;
  const newMargin = newTotal > 0 ? ((newTotal - newCost) / newTotal) * 100 : 0;

  return Number((newMargin - oldMargin).toFixed(2));
};