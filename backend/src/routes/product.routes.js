const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');
const { createProductSchema } = require('../validators/product.validator');

// Catalog Meta Endpoints
router.get('/categories', authenticate, productController.getCategories);
router.get('/brands', authenticate, productController.getBrands);
router.get('/units', authenticate, productController.getUnits);
router.get('/barcodes/scan/:code', authenticate, productController.scanBarcode);

// Product Endpoints
router.get('/', authenticate, authorizePermission('PRODUCT_VIEW'), productController.getProducts);
router.get('/:id', authenticate, authorizePermission('PRODUCT_VIEW'), productController.getProductById);

router.post(
  '/',
  authenticate,
  authorizePermission('PRODUCT_MANAGE'),
  validate(createProductSchema),
  productController.createProduct
);

router.post(
  '/:id/images',
  authenticate,
  authorizePermission('PRODUCT_MANAGE'),
  upload.single('image'),
  productController.uploadProductImage
);

module.exports = router;
