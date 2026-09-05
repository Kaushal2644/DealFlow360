import express from 'express';
import {
  portalLogin,
  portalSignup,
  setPortalPassword,
  getMyQuotations,
  getMyQuotationById,
  submitNegotiationRequest,
  confirmQuotationByCustomer,
} from '../controllers/portal.controller.js';
import { protectPortal } from '../middleware/portalAuth.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public: customer login to the portal
router.post('/login', portalLogin);
router.post('/signup', portalSignup);

// Internal-only: rep/admin issues portal access to a customer
router.post('/setup-access/:customerId', protect, restrictTo(ROLES.ADMIN, ROLES.REP), setPortalPassword);

// Customer-only routes (require portal token)
router.get('/my-quotations', protectPortal, getMyQuotations);
router.get('/my-quotations/:id', protectPortal, getMyQuotationById);
router.post('/my-quotations/:id/request', protectPortal, submitNegotiationRequest);
router.post('/my-quotations/:id/confirm', protectPortal, confirmQuotationByCustomer);

export default router;