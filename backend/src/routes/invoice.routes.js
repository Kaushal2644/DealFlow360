import express from 'express';
import { getInvoices, getInvoiceById, updateInvoiceStage } from '../controllers/invoice.controller.js';
import { recordPayment, getPaymentsForInvoice } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id/stage', updateInvoiceStage);

router.post('/:invoiceId/payments', recordPayment);
router.get('/:invoiceId/payments', getPaymentsForInvoice);

export default router;