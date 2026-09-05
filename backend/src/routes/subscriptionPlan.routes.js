import express from 'express';
import {
  createSubscriptionPlan,
  getSubscriptionPlans,
  updateSubscriptionPlan,
} from '../controllers/subscriptionPlan.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.get('/', getSubscriptionPlans);
router.post('/', restrictTo(ROLES.ADMIN), createSubscriptionPlan);
router.put('/:id', restrictTo(ROLES.ADMIN), updateSubscriptionPlan);

export default router;