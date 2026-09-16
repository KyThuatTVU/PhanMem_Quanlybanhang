const reportRepository = require('../repositories/report.repository');

class ReportService {
  async getRevenueProfit(params) {
    return await reportRepository.getRevenueProfitReport(params);
  }

  async getTopSelling(params) {
    return await reportRepository.getTopSellingProducts(params);
  }

  async getSlowSelling(params) {
    return await reportRepository.getSlowSellingProducts(params);
  }

  async getInventoryValuation() {
    return await reportRepository.getInventoryValuation();
  }
}

module.exports = new ReportService();
