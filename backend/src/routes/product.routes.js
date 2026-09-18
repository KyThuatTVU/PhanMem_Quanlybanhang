const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');
const validateImageSignature = require('../middlewares/image-signature.middleware');
const { createProductSchema } = require('../validators/product.validator');

// Catalog Meta Endpoints
router.get('/categories', authenticate, productController.getCategories);
router.post('/categories', authenticate, productController.createCategory);
router.put('/categories/:id', authenticate, productController.updateCategory);
router.delete('/categories/:id', authenticate, productController.deleteCategory);

router.get('/brands', authenticate, productController.getBrands);
router.post('/brands', authenticate, productController.createBrand);
router.delete('/brands/:id', authenticate, productController.deleteBrand);

router.get('/units', authenticate, productController.getUnits);
router.post('/units', authenticate, productController.createUnit);
router.delete('/units/:id', authenticate, productController.deleteUnit);

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
  validateImageSignature,
  productController.uploadProductImage
);

module.exports = router;
