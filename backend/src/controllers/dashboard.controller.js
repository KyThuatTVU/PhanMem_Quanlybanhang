const dashboardRepository = require('../repositories/dashboard.repository');
const { sendSuccess } = require('../utils/response.util');

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardRepository.getSummary();
      return sendSuccess(res, summary, 'Lấy số liệu Dashboard thành công');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
