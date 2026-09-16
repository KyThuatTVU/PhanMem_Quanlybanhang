const returnService = require('../services/return.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');

class ReturnController {
  async getReturns(req, res, next) {
    try {
      const { rows, total } = await returnService.getReturns(req.query);
      return sendPaginated(res, rows, { page: req.query.page, limit: req.query.limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getReturnById(req, res, next) {
    try {
      const returnOrder = await returnService.getReturnById(req.params.id);
      return sendSuccess(res, returnOrder);
    } catch (error) {
      next(error);
    }
  }

  async getOrderPurchasedItems(req, res, next) {
    try {
      const items = await returnService.getOrderPurchasedItems(req.params.orderId);
      return sendSuccess(res, items);
    } catch (error) {
      next(error);
    }
  }

  async processReturn(req, res, next) {
    try {
      const result = await returnService.processReturn(req.user.id, req.body);
      return sendSuccess(res, result, 'Tiếp nhận trả hàng và hoàn tồn kho thành công', 201);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReturnController();
