const promotionRepository = require('../repositories/promotion.repository');
const { AppError } = require('../utils/response.util');
const ERROR_CODES = require('../constants/error-codes');

class PromotionService {
  async getPromotions(params) {
    return await promotionRepository.findAll(params);
  }

  async getPromotionById(id) {
    const promo = await promotionRepository.findById(id);
    if (!promo) throw new AppError(ERROR_CODES.NOT_FOUND, 'Chương trình khuyến mãi không tồn tại');
    return promo;
  }

  async getActivePromotions() {
    return await promotionRepository.findActivePromotions();
  }

  async createPromotion(data) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const code = data.code || `KM-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;
    return await promotionRepository.create({ ...data, code });
  }

  async updatePromotion(id, data) {
    await this.getPromotionById(id);
    return await promotionRepository.update(id, data);
  }
}

module.exports = new PromotionService();
