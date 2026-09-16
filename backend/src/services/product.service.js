const productRepository = require('../repositories/product.repository');
const { withTransaction } = require('../config/database');
const { AppError } = require('../utils/response.util');
const ERROR_CODES = require('../constants/error-codes');

class ProductService {
  async getProducts(params) {
    return await productRepository.findAll(params);
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError(ERROR_CODES.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  async scanBarcode(barcode) {
    const item = await productRepository.findByBarcode(barcode);
    if (!item) {
      throw new AppError(ERROR_CODES.PRODUCT_NOT_FOUND, `Không tìm thấy sản phẩm với mã vạch [${barcode}]`);
    }
    return item;
  }

  async createProduct(productData, unitConversions) {
    return await withTransaction(async (connection) => {
      const productId = await productRepository.createProductWithUnits(connection, productData, unitConversions);
      return await productRepository.findById(productId);
    });
  }

  async uploadProductImage(productId, file, userId) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new AppError(ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    const fileUrl = `/uploads/${file.filename}`;
    const result = await productRepository.addProductImage({
      productId,
      originalName: file.originalname,
      storedName: file.filename,
      filePath: file.path,
      fileUrl,
      mimeType: file.mimetype,
      fileSize: file.size,
      createdBy: userId,
    });

    return result;
  }
}

module.exports = new ProductService();
