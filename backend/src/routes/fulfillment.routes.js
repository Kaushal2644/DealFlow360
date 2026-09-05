import express from 'express';
import {
  generateFulfillmentSuggestion,
  getFulfillmentOrders,
  getFulfillmentById,
  acceptSplit,
  manualOverrideSplit,
  consolidateBackorder,
} from '../controllers/fulfillment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/generate/:quotationId', generateFulfillmentSuggestion);
router.get('/', getFulfillmentOrders);
router.get('/:id', getFulfillmentById);
router.post('/:id/accept', acceptSplit);
router.post('/:id/override', manualOverrideSplit);
router.post('/:id/consolidate', consolidateBackorder);

export default router;