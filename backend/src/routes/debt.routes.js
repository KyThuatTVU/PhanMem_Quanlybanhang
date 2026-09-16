const express = require('express');
const router = express.Router();
const debtController = require('../controllers/debt.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/rbac.middleware');

// Công nợ khách hàng
router.get('/customers', authenticate, debtController.getCustomerDebts);
router.get('/customers/:id', authenticate, debtController.getCustomerDebtLedger);
router.post('/customers/:id/payments', authenticate, authorizeRoles('ADMIN', 'MANAGER', 'CASHIER'), debtController.payCustomerDebt);

// Công nợ nhà cung cấp
router.get('/suppliers', authenticate, debtController.getSupplierDebts);
router.get('/suppliers/:id', authenticate, debtController.getSupplierDebtLedger);
router.post('/suppliers/:id/payments', authenticate, authorizeRoles('ADMIN', 'MANAGER'), debtController.paySupplierDebt);

module.exports = router;
