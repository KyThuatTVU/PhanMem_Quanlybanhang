const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const inventoryRoutes = require('./inventory.routes');
const inventoryCheckRoutes = require('./inventory-check.routes');
const posRoutes = require('./pos.routes');
const orderRoutes = require('./order.routes');
const returnRoutes = require('./return.routes');
const supplierRoutes = require('./supplier.routes');
const purchaseRoutes = require('./purchase.routes');
const customerRoutes = require('./customer.routes');
const debtRoutes = require('./debt.routes');
const promotionRoutes = require('./promotion.routes');
const employeeRoutes = require('./employee.routes');
const reportRoutes = require('./report.routes');
const dashboardRoutes = require('./dashboard.routes');
const settingRoutes = require('./setting.routes');

// Đăng ký toàn bộ 16 phân hệ API v1
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/inventory/checks', inventoryCheckRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/pos', posRoutes);
router.use('/orders', orderRoutes);
router.use('/returns', returnRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/customers', customerRoutes);
router.use('/debts', debtRoutes);
router.use('/promotions', promotionRoutes);
router.use('/employees', employeeRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingRoutes);

// Endpoint Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Grocery Store Management Full API Suite is running healthily!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

module.exports = router;
