import express from 'express';
import {
  triggerScan,
  getFlags,
  escalateFlag,
  nudgeRep,
  resolveFlag,
} from '../controllers/dealHealth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();
router.use(protect);
router.use(restrictTo(ROLES.SALES_MANAGER, ROLES.FINANCE, ROLES.ADMIN));

router.post('/scan', triggerScan);
router.get('/', getFlags);
router.post('/:id/escalate', escalateFlag);
router.post('/:id/nudge', nudgeRep);
router.post('/:id/resolve', resolveFlag);

export default router;