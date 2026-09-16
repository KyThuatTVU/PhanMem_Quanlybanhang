const purchaseService = require('../services/purchase.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');

class PurchaseController {
  async getPurchases(req, res, next) {
    try {
      const { rows, total } = await purchaseService.getPurchases(req.query);
      return sendPaginated(res, rows, { page: req.query.page, limit: req.query.limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseById(req, res, next) {
    try {
      const order = await purchaseService.getPurchaseById(req.params.id);
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  async createPurchase(req, res, next) {
    try {
      const order = await purchaseService.createPurchase(req.user.id, req.body);
      return sendSuccess(res, order, 'Lập phiếu nhập hàng thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  async createPurchaseReturn(req, res, next) {
    try {
      const result = await purchaseService.createPurchaseReturn(req.user.id, req.body);
      return sendSuccess(res, result, 'Xuất trả hàng cho nhà cung cấp thành công', 201);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PurchaseController();
