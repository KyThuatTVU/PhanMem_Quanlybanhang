const express = require('express');
const router = express.Router();
const returnController = require('../controllers/return.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/rbac.middleware');

router.get('/', authenticate, returnController.getReturns);
router.get('/:id', authenticate, returnController.getReturnById);
router.get('/order/:orderId/items', authenticate, returnController.getOrderPurchasedItems);
router.post('/', authenticate, authorizeRoles('ADMIN', 'MANAGER', 'CASHIER'), returnController.processReturn);

module.exports = router;
