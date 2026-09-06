import express from 'express';
import {
  createWarehouse,
  getWarehouses,
  updateWarehouse,
  upsertStockLevel,
  getStockLevels,
} from '../controllers/warehouse.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { ROLES } from '../config/constants.js';
import { getInventoryOverview } from '../controllers/warehouse.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', getWarehouses);
router.post('/', restrictTo(ROLES.ADMIN), createWarehouse);
router.put('/:id', restrictTo(ROLES.ADMIN), updateWarehouse);

router.get('/stock/levels', getStockLevels);
router.post('/stock/levels', restrictTo(ROLES.ADMIN, ROLES.FINANCE), upsertStockLevel);
router.get('/inventory/overview', restrictTo(ROLES.ADMIN), getInventoryOverview);

export default router;