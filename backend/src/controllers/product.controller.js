import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, failure } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditLogger.js';

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  await logAudit({
    entityType: 'Product',
    entityId: product._id,
    user: req.user,
    action: 'created',
    after: product.toObject(),
  });
  return success(res, product, 'Product created', 201);
});

export const getProducts = asyncHandler(async (req, res) => {
  const { category, isActive } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const products = await Product.find(filter).sort({ createdAt: -1 });
  return success(res, products, 'Products fetched');
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return failure(res, 'Product not found', 404);
  return success(res, product, 'Product fetched');
});

// export const getOneProduct = asyncHandler(async (req, res) => {
//   const { price, taxPercent, quantityOnHand, category, isActive, createdAt } = req.query;
//   const filter = {};
//   console.log(price);
//   if (isActive !== undefined) filter.isActive = isActive === 'true';

//   if(price !== null && price == 999) {console.log("hello")};
  
//   //if(taxPercent !== null) filter.taxPercent = taxPercent == 0;

//   if (createdAt === 'true') {
//     const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

//     filter.createdAt = {
//       $gte: oneMinuteAgo,
//       $lte: new Date()
//     };
//   }
  
//   const products = await Product.find(filter)
//   return success(res, products, 'Products fetched');
  
// });

export const updateProduct = asyncHandler(async (req, res) => {
  const before = await Product.findById(req.params.id);
  if (!before) return failure(res, 'Product not found', 404);

const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await logAudit({
    entityType: 'Product',
    entityId: product._id,
    user: req.user,
    action: 'updated',
    before: before.toObject(),
    after: product.toObject(),
  });

 return success(res, product, 'Product updated');
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!product) return failure(res, 'Product not found', 404);

  await logAudit({
    entityType: 'Product',
    entityId: product._id,
    user: req.user,
    action: 'deactivated',
  });

  return success(res, product, 'Product deactivated');
});