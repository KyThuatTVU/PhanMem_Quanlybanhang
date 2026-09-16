const express = require('express');
const router = express.Router();
const posController = require('../controllers/pos.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/rbac.middleware');

router.get('/shift/current', authenticate, posController.getOpenShift);
router.post('/shift/open', authenticate, posController.openShift);
router.post('/shift/close', authenticate, posController.closeShift);

router.post('/checkout', authenticate, authorizePermission('POS_SELL'), posController.checkout);

module.exports = router;
