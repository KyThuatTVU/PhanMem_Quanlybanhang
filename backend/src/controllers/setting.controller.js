const settingRepository = require('../repositories/setting.repository');
const deviceRepository = require('../repositories/device.repository');
const auditLogRepository = require('../repositories/audit-log.repository');
const { sendSuccess, sendPaginated } = require('../utils/response.util');

class SettingController {
  // Settings
  async getSettings(req, res, next) {
    try {
      const settings = await settingRepository.getAll();
      return sendSuccess(res, settings);
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const entries = Object.entries(req.body);
      for (const [key, value] of entries) {
        await settingRepository.updateSetting(key, String(value));
      }
      return sendSuccess(res, null, 'Cập nhật cấu hình thành công');
    } catch (error) {
      next(error);
    }
  }

  // Devices
  async getDevices(req, res, next) {
    try {
      const devices = await deviceRepository.getAll();
      return sendSuccess(res, devices);
    } catch (error) {
      next(error);
    }
  }

  async createDevice(req, res, next) {
    try {
      const device = await deviceRepository.create(req.body);
      return sendSuccess(res, device, 'Thêm thiết bị thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  // Audit logs
  async getAuditLogs(req, res, next) {
    try {
      const { rows, total } = await auditLogRepository.findAll(req.query);
      return sendPaginated(res, rows, { page: req.query.page, limit: req.query.limit, total });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SettingController();
