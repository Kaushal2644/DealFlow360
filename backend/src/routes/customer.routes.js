import express from 'express';
import { createCustomer, getCustomers, deleteCustomer } from '../controllers/customer.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);
router.post('/', createCustomer);
router.get('/', getCustomers);
router.delete('/:id', deleteCustomer);

export default router;