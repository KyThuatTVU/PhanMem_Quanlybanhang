const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/rbac.middleware');

router.get('/revenue-profit', authenticate, authorizeRoles('ADMIN', 'MANAGER'), reportController.getRevenueProfit);
router.get('/top-selling', authenticate, authorizeRoles('ADMIN', 'MANAGER'), reportController.getTopSelling);
router.get('/slow-selling', authenticate, authorizeRoles('ADMIN', 'MANAGER'), reportController.getSlowSelling);
router.get('/inventory-valuation', authenticate, authorizeRoles('ADMIN', 'MANAGER'), reportController.getInventoryValuation);

module.exports = router;
