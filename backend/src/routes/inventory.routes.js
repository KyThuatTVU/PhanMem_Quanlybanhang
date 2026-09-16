const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/rbac.middleware');

router.get('/stocks', authenticate, authorizePermission('INVENTORY_VIEW'), inventoryController.getStocks);
router.get('/movements', authenticate, authorizePermission('INVENTORY_VIEW'), inventoryController.getMovements);

module.exports = router;
