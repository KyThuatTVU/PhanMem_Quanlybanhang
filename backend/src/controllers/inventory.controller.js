const inventoryRepository = require('../repositories/inventory.repository');
const { sendSuccess, sendPaginated } = require('../utils/response.util');

class InventoryController {
  async getStocks(req, res, next) {
    try {
      const { rows, total } = await inventoryRepository.getStocks(req.query);
      return sendPaginated(res, rows, { page: req.query.page, limit: req.query.limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getMovements(req, res, next) {
    try {
      const { rows, total } = await inventoryRepository.getMovements(req.query);
      return sendPaginated(res, rows, { page: req.query.page, limit: req.query.limit, total });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();
