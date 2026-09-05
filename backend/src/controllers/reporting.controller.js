import Quotation from '../models/Quotation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';

// Builds a MongoDB filter object from query params
const buildFilter = (query) => {
  const filter = {};

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  if (query.repId) filter.rep = query.repId;
  if (query.status) filter.status = query.status;

  return filter;
};

export const getReportSummary = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query);

  const quotationsCreated = await Quotation.countDocuments(filter);

  // Average time from creation to first approval action (for quotes that reached approved/confirmed)
  const approvedDeals = await Quotation.find({
    ...filter,
    status: { $in: ['approved', 'confirmed'] },
  });

  let avgApprovalHours = 0;
  if (approvedDeals.length > 0) {
    const totalHours = approvedDeals.reduce((sum, q) => {
      const hours = (new Date(q.updatedAt) - new Date(q.createdAt)) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    avgApprovalHours = Number((totalHours / approvedDeals.length).toFixed(1));
  }

  // Top discounted product (by category, across all matching quotations)
  const allQuotations = await Quotation.find(filter);
  const productDiscountTotals = {};
  allQuotations.forEach((q) => {
    q.lines.forEach((l) => {
      if (!productDiscountTotals[l.productName]) {
        productDiscountTotals[l.productName] = { totalDiscount: 0, count: 0 };
      }
      productDiscountTotals[l.productName].totalDiscount += l.discountPercent;
      productDiscountTotals[l.productName].count += 1;
    });
  });

  let topDiscountedProduct = null;
  let highestAvg = -1;
  for (const [name, data] of Object.entries(productDiscountTotals)) {
    const avg = data.totalDiscount / data.count;
    if (avg > highestAvg) {
      highestAvg = avg;
      topDiscountedProduct = name;
    }
  }

  return success(res, {
    quotationsCreated,
    avgApprovalHours,
    topDiscountedProduct,
  }, 'Report summary fetched');
});

export const getReportList = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query);

  const quotations = await Quotation.find(filter)
    .populate('customer', 'name tier')
    .populate('rep', 'name team')
    .select('customer rep status orderTotal riskBand createdAt updatedAt')
    .sort({ createdAt: -1 });

  return success(res, quotations, 'Report list fetched');
});