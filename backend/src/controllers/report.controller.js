const reportService = require('../services/report.service');
const { sendSuccess } = require('../utils/response.util');

class ReportController {
  async getRevenueProfit(req, res, next) {
    try {
      const data = await reportService.getRevenueProfit(req.query);
      return sendSuccess(res, data, 'Báo cáo doanh thu và lợi nhuận');
    } catch (error) {
      next(error);
    }
  }

  async getTopSelling(req, res, next) {
    try {
      const data = await reportService.getTopSelling(req.query);
      return sendSuccess(res, data, 'Danh sách sản phẩm bán chạy');
    } catch (error) {
      next(error);
    }
  }

  async getSlowSelling(req, res, next) {
    try {
      const data = await reportService.getSlowSelling(req.query);
      return sendSuccess(res, data, 'Danh sách sản phẩm bán chậm');
    } catch (error) {
      next(error);
    }
  }

  async getInventoryValuation(req, res, next) {
    try {
      const data = await reportService.getInventoryValuation();
      return sendSuccess(res, data, 'Định giá tồn kho cửa hàng');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
