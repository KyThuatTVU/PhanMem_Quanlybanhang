const employeeService = require('../services/employee.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');

class EmployeeController {
  async getEmployees(req, res, next) {
    try {
      const { rows, total } = await employeeService.getEmployees(req.query);
      return sendPaginated(res, rows, { page: req.query.page, limit: req.query.limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req, res, next) {
    try {
      const user = await employeeService.getEmployeeById(req.params.id);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req, res, next) {
    try {
      const user = await employeeService.createEmployee(req.body);
      return sendSuccess(res, user, 'Tạo nhân viên thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req, res, next) {
    try {
      const user = await employeeService.updateEmployee(req.params.id, req.body);
      return sendSuccess(res, user, 'Cập nhật thông tin nhân viên thành công');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const user = await employeeService.resetPassword(req.params.id, req.body.password);
      return sendSuccess(res, user, 'Đặt lại mật khẩu nhân viên thành công');
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(req, res, next) {
    try {
      await employeeService.deleteEmployee(req.params.id);
      return sendSuccess(res, null, 'Xóa nhân viên thành công');
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req, res, next) {
    try {
      const user = await employeeService.toggleStatus(req.params.id);
      return sendSuccess(res, user, `Tài khoản hiện đang ${user.is_active ? 'HOẠT ĐỘNG' : 'BỊ KHÓA'}`);
    } catch (error) {
      next(error);
    }
  }

  async getSalesKpi(req, res, next) {
    try {
      const kpi = await employeeService.getSalesKpi(req.params.id, req.query);
      return sendSuccess(res, kpi);
    } catch (error) {
      next(error);
    }
  }

  async getRoles(req, res, next) {
    try {
      const roles = await employeeService.getRoles();
      return sendSuccess(res, roles);
    } catch (error) {
      next(error);
    }
  }

  async getPermissions(req, res, next) {
    try {
      const perms = await employeeService.getPermissions();
      return sendSuccess(res, perms);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployeeController();
