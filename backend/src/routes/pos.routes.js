const express = require('express');
const router = express.Router();
const posController = require('../controllers/pos.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { openShiftSchema, closeShiftSchema, checkoutSchema } = require('../validators/pos.validator');

router.get('/shift/current', authenticate, posController.getOpenShift);
router.post('/shift/open', authenticate, validate(openShiftSchema), posController.openShift);
router.post('/shift/close', authenticate, validate(closeShiftSchema), posController.closeShift);

router.post('/checkout', authenticate, authorizePermission('POS_SELL'), validate(checkoutSchema), posController.checkout);

module.exports = router;
