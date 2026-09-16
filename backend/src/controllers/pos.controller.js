const posService = require('../services/pos.service');
const { sendSuccess } = require('../utils/response.util');

class PosController {
  async getOpenShift(req, res, next) {
    try {
      const shift = await posService.getOpenShift(req.user.id);
      return sendSuccess(res, shift);
    } catch (error) {
      next(error);
    }
  }

  async openShift(req, res, next) {
    try {
      const { startingCash } = req.body;
      const result = await posService.openShift(req.user.id, startingCash);
      return sendSuccess(res, result, 'Mở ca làm việc thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  async closeShift(req, res, next) {
    try {
      const result = await posService.closeShift(req.user.id, req.body);
      return sendSuccess(res, result, 'Đóng ca bán hàng thành công');
    } catch (error) {
      next(error);
    }
  }

  async checkout(req, res, next) {
    try {
      const result = await posService.processCheckout(req.user.id, req.body);
      return sendSuccess(res, result, 'Thanh toán đơn hàng thành công', 201);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PosController();
