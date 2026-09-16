const orderService = require('../services/order.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');

class OrderController {
  async getOrders(req, res, next) {
    try {
      const { rows, total } = await orderService.getOrders(req.query);
      return sendPaginated(res, rows, { page: req.query.page, limit: req.query.limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const order = await orderService.cancelOrder(req.params.id, req.user.id, req.body.reason);
      return sendSuccess(res, order, 'Hủy hóa đơn và hoàn tồn kho thành công');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
