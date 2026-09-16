const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/rbac.middleware');

router.get('/', authenticate, supplierController.getSuppliers);
router.get('/:id', authenticate, supplierController.getSupplierById);
router.post('/', authenticate, authorizeRoles('ADMIN', 'MANAGER'), supplierController.createSupplier);
router.put('/:id', authenticate, authorizeRoles('ADMIN', 'MANAGER'), supplierController.updateSupplier);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), supplierController.deleteSupplier);
router.get('/:id/purchases', authenticate, supplierController.getPurchaseHistory);

module.exports = router;
