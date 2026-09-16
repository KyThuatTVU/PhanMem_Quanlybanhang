const inventoryCheckRepository = require('../repositories/inventory-check.repository');
const { withTransaction } = require('../config/database');
const { AppError } = require('../utils/response.util');
const ERROR_CODES = require('../constants/error-codes');

class InventoryCheckService {
  async getChecks(params) {
    return await inventoryCheckRepository.findAll(params);
  }

  async getCheckById(id) {
    const check = await inventoryCheckRepository.findById(id);
    if (!check) throw new AppError(ERROR_CODES.NOT_FOUND, 'Phiếu kiểm kê không tồn tại');
    return check;
  }

  async createCheck(userId, note, items) {
    if (!items || items.length === 0) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, 'Phiếu kiểm kê phải có ít nhất 1 sản phẩm');
    }
    return await inventoryCheckRepository.createCheck(userId, note, items);
  }

  async balanceStock(checkId, userId) {
    await withTransaction(async (connection) => {
      await inventoryCheckRepository.balanceStockTransaction(connection, checkId, userId);
    });
    return await inventoryCheckRepository.findById(checkId);
  }
}

module.exports = new InventoryCheckService();
