const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const inventoryRoutes = require('./inventory.routes');
const posRoutes = require('./pos.routes');
const customerRoutes = require('./customer.routes');
const dashboardRoutes = require('./dashboard.routes');

// Đăng ký toàn bộ các phân hệ API v1
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/pos', posRoutes);
router.use('/customers', customerRoutes);
router.use('/dashboard', dashboardRoutes);

// Endpoint Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Grocery Store Management API System is running healthily!',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
