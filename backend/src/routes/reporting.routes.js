import express from 'express';
import { getReportSummary, getReportList } from '../controllers/reporting.controller.js';
import { exportReportCSV, exportReportPDF } from '../controllers/export.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();
router.use(protect);
router.use(restrictTo(ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.FINANCE));

router.get('/summary', getReportSummary);
router.get('/list', getReportList);
router.get('/export/csv', exportReportCSV);
router.get('/export/pdf', exportReportPDF);

export default router;