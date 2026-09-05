import express from 'express';
import {
  upsertDiscountTier,
  getDiscountTiers,
  upsertCategoryCeiling,
  getCategoryCeilings,
  createApprovalChainRule,
  getApprovalChainRules,
  updateApprovalChainRule,
  deleteApprovalChainRule,
} from '../controllers/discountConfig.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

// Discount tiers
router.get('/tiers', getDiscountTiers);
router.post('/tiers', restrictTo(ROLES.ADMIN, ROLES.SALES_MANAGER), upsertDiscountTier);

// Category ceilings
router.get('/category-ceilings', getCategoryCeilings);
router.post('/category-ceilings', restrictTo(ROLES.ADMIN, ROLES.SALES_MANAGER), upsertCategoryCeiling);

// Approval chain rules
router.get('/approval-rules', getApprovalChainRules);
router.post('/approval-rules', restrictTo(ROLES.ADMIN, ROLES.SALES_MANAGER), createApprovalChainRule);
router.put('/approval-rules/:id', restrictTo(ROLES.ADMIN, ROLES.SALES_MANAGER), updateApprovalChainRule);
router.delete('/approval-rules/:id', restrictTo(ROLES.ADMIN, ROLES.SALES_MANAGER), deleteApprovalChainRule);

export default router;