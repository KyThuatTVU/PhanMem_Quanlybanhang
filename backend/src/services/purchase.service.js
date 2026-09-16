const purchaseRepository = require('../repositories/purchase.repository');
const { withTransaction } = require('../config/database');
const { AppError } = require('../utils/response.util');
const ERROR_CODES = require('../constants/error-codes');

class PurchaseService {
  async getPurchases(params) {
    return await purchaseRepository.findAll(params);
  }

  async getPurchaseById(id) {
    const order = await purchaseRepository.findById(id);
    if (!order) throw new AppError(ERROR_CODES.NOT_FOUND, 'Phiếu nhập không tồn tại');
    return order;
  }

  async createPurchase(userId, data) {
    if (!data.items || data.items.length === 0) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, 'Phiếu nhập phải có ít nhất 1 mặt hàng');
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const code = data.code || `PN-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

    return await withTransaction(async (connection) => {
      const id = await purchaseRepository.createPurchaseTransaction(connection, {
        ...data,
        code,
        userId,
      });
      return await purchaseRepository.findById(id);
    });
  }

  async createPurchaseReturn(userId, data) {
    if (!data.items || data.items.length === 0) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, 'Phiếu trả hàng phải có ít nhất 1 mặt hàng');
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const code = data.code || `TH-NCC-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

    return await withTransaction(async (connection) => {
      const returnId = await purchaseRepository.createPurchaseReturnTransaction(connection, {
        ...data,
        code,
        userId,
      });
      return { returnId, code };
    });
  }
}

module.exports = new PurchaseService();
