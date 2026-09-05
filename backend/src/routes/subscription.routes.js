import express from 'express';
import {
  getSubscriptions,
  getSubscriptionById,
  modifySubscriptionQty,
  cancelSubscription,
} from '../controllers/subscription.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getSubscriptions);
router.get('/:id', getSubscriptionById);
router.put('/:id/qty', modifySubscriptionQty);
router.post('/:id/cancel', cancelSubscription);

export default router;