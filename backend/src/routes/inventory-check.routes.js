const express = require('express');
const router = express.Router();
const inventoryCheckController = require('../controllers/inventory-check.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/rbac.middleware');

router.get('/', authenticate, inventoryCheckController.getChecks);
router.get('/:id', authenticate, inventoryCheckController.getCheckById);
router.post('/', authenticate, authorizeRoles('ADMIN', 'MANAGER', 'WAREHOUSE'), inventoryCheckController.createCheck);
router.post('/:id/balance', authenticate, authorizeRoles('ADMIN', 'MANAGER'), inventoryCheckController.balanceStock);

module.exports = router;
