import express from 'express';
import {
  createUpsellRule,
  getUpsellRules,
  getSuggestionsForQuotation,
} from '../controllers/upsell.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();
router.use(protect);

router.get('/rules', getUpsellRules);
router.post('/rules', restrictTo(ROLES.ADMIN), createUpsellRule);
router.get('/suggestions/:quotationId', getSuggestionsForQuotation);

export default router;