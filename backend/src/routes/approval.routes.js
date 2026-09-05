import express from 'express';
import {
  getPendingApprovals,
  getApprovalDetail,
  actOnApproval,
} from '../controllers/approval.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo(ROLES.SALES_MANAGER, ROLES.FINANCE, ROLES.ADMIN));

router.get('/', getPendingApprovals);
router.get('/:id', getApprovalDetail);
router.post('/:id/act', actOnApproval);

export default router;