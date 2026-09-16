const returnRepository = require('../repositories/return.repository');
const posRepository = require('../repositories/pos.repository');
const { withTransaction } = require('../config/database');
const { AppError } = require('../utils/response.util');
const ERROR_CODES = require('../constants/error-codes');

class ReturnService {
  async getReturns(params) {
    return await returnRepository.findAll(params);
  }

  async getReturnById(id) {
    const returnOrder = await returnRepository.findById(id);
    if (!returnOrder) throw new AppError(ERROR_CODES.NOT_FOUND, 'Phiếu trả hàng không tồn tại');
    return returnOrder;
  }

  async getOrderPurchasedItems(orderId) {
    return await returnRepository.getOrderPurchasedItems(orderId);
  }

  async processReturn(userId, data) {
    if (!data.items || data.items.length === 0) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, 'Phiếu trả hàng phải có ít nhất 1 sản phẩm');
    }

    const currentShift = await posRepository.findOpenShiftByUserId(userId);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const code = `TH-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

    return await withTransaction(async (connection) => {
      const returnId = await returnRepository.processReturnTransaction(connection, {
        ...data,
        code,
        userId,
        shiftId: currentShift ? currentShift.id : null,
      });
      return await returnRepository.findById(returnId);
    });
  }
}

module.exports = new ReturnService();
