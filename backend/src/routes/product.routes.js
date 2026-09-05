import express from 'express';
import {createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import {protect} from '../middleware/auth.middleware.js';
import {restrictTo} from '../middleware/role.middleware.js';
import {ROLES} from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", restrictTo(ROLES.ADMIN), createProduct);
router.put("/:id", restrictTo(ROLES.ADMIN), updateProduct);
router.delete("/:id", restrictTo(ROLES.ADMIN), deleteProduct);

export default router;