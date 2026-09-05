import express from 'express';
import { createCustomer, getCustomers } from '../controllers/customer.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);
router.post('/', createCustomer);
router.get('/', getCustomers);

export default router;