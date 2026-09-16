const promotionService = require('../services/promotion.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');

class PromotionController {
  async getPromotions(req, res, next) {
    try {
      const { rows, total } = await promotionService.getPromotions(req.query);
      return sendPaginated(res, rows, { page: req.query.page, limit: req.query.limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getPromotionById(req, res, next) {
    try {
      const promo = await promotionService.getPromotionById(req.params.id);
      return sendSuccess(res, promo);
    } catch (error) {
      next(error);
    }
  }

  async getActivePromotions(req, res, next) {
    try {
      const activePromos = await promotionService.getActivePromotions();
      return sendSuccess(res, activePromos);
    } catch (error) {
      next(error);
    }
  }

  async createPromotion(req, res, next) {
    try {
      const promo = await promotionService.createPromotion(req.body);
      return sendSuccess(res, promo, 'Tạo chương trình khuyến mãi thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  async updatePromotion(req, res, next) {
    try {
      const promo = await promotionService.updatePromotion(req.params.id, req.body);
      return sendSuccess(res, promo, 'Cập nhật khuyến mãi thành công');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PromotionController();
