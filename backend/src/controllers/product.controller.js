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

  async createCategory(req, res, next) {
    try {
      const { code, name, description, parentId } = req.body;
      const categoryCode = code || `CAT_${Date.now().toString().slice(-4)}`;
      const result = await categoryRepository.create({ code: categoryCode, name, description, parentId });
      return sendSuccess(res, result, 'Thêm ngành hàng mới thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const result = await categoryRepository.update(req.params.id, req.body);
      return sendSuccess(res, result, 'Cập nhật ngành hàng thành công');
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      await categoryRepository.delete(req.params.id);
      return sendSuccess(res, null, 'Xóa ngành hàng thành công');
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

  async createBrand(req, res, next) {
    try {
      const { code, name } = req.body;
      const brandCode = code || `BR_${Date.now().toString().slice(-4)}`;
      const result = await brandRepository.create({ code: brandCode, name });
      return sendSuccess(res, result, 'Thêm thương hiệu mới thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  async deleteBrand(req, res, next) {
    try {
      await brandRepository.delete(req.params.id);
      return sendSuccess(res, null, 'Xóa thương hiệu thành công');
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

  async createUnit(req, res, next) {
    try {
      const { name } = req.body;
      const result = await unitRepository.create({ name });
      return sendSuccess(res, result, 'Thêm đơn vị tính mới thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  async deleteUnit(req, res, next) {
    try {
      await unitRepository.delete(req.params.id);
      return sendSuccess(res, null, 'Xóa đơn vị tính thành công');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
