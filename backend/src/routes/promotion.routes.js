const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/rbac.middleware');

router.get('/', authenticate, promotionController.getPromotions);
router.get('/active', authenticate, promotionController.getActivePromotions);
router.get('/:id', authenticate, promotionController.getPromotionById);
router.post('/', authenticate, authorizeRoles('ADMIN', 'MANAGER'), promotionController.createPromotion);
router.put('/:id', authenticate, authorizeRoles('ADMIN', 'MANAGER'), promotionController.updatePromotion);

module.exports = router;
