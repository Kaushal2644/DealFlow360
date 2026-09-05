import express from 'express';
import {
  createQuotation,
  getQuotations,
  getQuotationById,
  addLine,
  submitForApproval,
} from '../controllers/quotation.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createQuotation);
router.get('/', getQuotations);
router.get('/:id', getQuotationById);
router.post('/:id/lines', addLine);
router.post('/:id/submit', submitForApproval);

export default router;