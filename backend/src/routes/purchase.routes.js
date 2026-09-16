const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/rbac.middleware');

router.get('/', authenticate, purchaseController.getPurchases);
router.get('/:id', authenticate, purchaseController.getPurchaseById);
router.post('/', authenticate, authorizeRoles('ADMIN', 'MANAGER', 'WAREHOUSE'), purchaseController.createPurchase);
router.post('/returns', authenticate, authorizeRoles('ADMIN', 'MANAGER', 'WAREHOUSE'), purchaseController.createPurchaseReturn);

module.exports = router;
