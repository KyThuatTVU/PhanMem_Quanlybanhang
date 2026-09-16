const productService = require('../services/product.service');
const categoryRepository = require('../repositories/category.repository');
const brandRepository = require('../repositories/brand.repository');
const unitRepository = require('../repositories/unit.repository');
const { sendSuccess, sendPaginated } = require('../utils/response.util');

class ProductController {
  async getProducts(req, res, next) {
    try {
      const { rows, total } = await productService.getProducts(req.query);
      return sendPaginated(res, rows, { page: req.query.page, limit: req.query.limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      return sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  async scanBarcode(req, res, next) {
    try {
      const item = await productService.scanBarcode(req.params.code);
      return sendSuccess(res, item, 'Quét mã vạch thành công');
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      const { units, ...productData } = req.body;
      const product = await productService.createProduct(productData, units);
      return sendSuccess(res, product, 'Tạo sản phẩm mới thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  async uploadProductImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn file hình ảnh' });
      }
      const result = await productService.uploadProductImage(req.params.id, req.file, req.user.id);
      return sendSuccess(res, result, 'Tải ảnh sản phẩm lên thành công');
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req, res, next) {
    try {
      const rows = await categoryRepository.findAll();
      return sendSuccess(res, rows);
    } catch (error) {
      next(error);
    }
  }

  async getBrands(req, res, next) {
    try {
      const rows = await brandRepository.findAll();
      return sendSuccess(res, rows);
    } catch (error) {
      next(error);
    }
  }

  async getUnits(req, res, next) {
    try {
      const rows = await unitRepository.findAll();
      return sendSuccess(res, rows);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
