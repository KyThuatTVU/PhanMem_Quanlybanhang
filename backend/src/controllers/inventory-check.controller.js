const inventoryCheckService = require('../services/inventory-check.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');

class InventoryCheckController {
  async getChecks(req, res, next) {
    try {
      const { rows, total } = await inventoryCheckService.getChecks(req.query);
      return sendPaginated(res, rows, { page: req.query.page, limit: req.query.limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getCheckById(req, res, next) {
    try {
      const check = await inventoryCheckService.getCheckById(req.params.id);
      return sendSuccess(res, check);
    } catch (error) {
      next(error);
    }
  }

  async createCheck(req, res, next) {
    try {
      const check = await inventoryCheckService.createCheck(req.user.id, req.body.note, req.body.items);
      return sendSuccess(res, check, 'Tạo phiếu kiểm kê thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  async balanceStock(req, res, next) {
    try {
      const result = await inventoryCheckService.balanceStock(req.params.id, req.user.id);
      return sendSuccess(res, result, 'Cân bằng tồn kho thực tế thành công');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryCheckController();
