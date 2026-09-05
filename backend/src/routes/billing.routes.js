import express from 'express';
import { confirmQuotationBilling, getBillingDetail } from '../controllers/billing.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.post('/confirm/:quotationId', confirmQuotationBilling);
router.get('/:quotationId', getBillingDetail);

export default router;