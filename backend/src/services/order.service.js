const orderRepository = require('../repositories/order.repository');
const { withTransaction } = require('../config/database');
const { AppError } = require('../utils/response.util');
const ERROR_CODES = require('../constants/error-codes');

class OrderService {
  async getOrders(params) {
    return await orderRepository.findAll(params);
  }

  async getOrderById(id) {
    const order = await orderRepository.findById(id);
    if (!order) throw new AppError(ERROR_CODES.NOT_FOUND, 'Hóa đơn không tồn tại');
    return order;
  }

  async cancelOrder(orderId, userId, reason) {
    await withTransaction(async (connection) => {
      await orderRepository.cancelOrderTransaction(connection, orderId, userId, reason);
    });
    return await orderRepository.findById(orderId);
  }
}

module.exports = new OrderService();
