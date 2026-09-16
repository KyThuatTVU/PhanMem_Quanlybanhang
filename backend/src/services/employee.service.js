const bcrypt = require('bcryptjs');
const employeeRepository = require('../repositories/employee.repository');
const { AppError } = require('../utils/response.util');
const ERROR_CODES = require('../constants/error-codes');

class EmployeeService {
  async getEmployees(params) {
    return await employeeRepository.findAll(params);
  }

  async getEmployeeById(id) {
    const user = await employeeRepository.findById(id);
    if (!user) throw new AppError(ERROR_CODES.USER_NOT_FOUND, 'Nhân viên không tồn tại');
    return user;
  }

  async createEmployee(data) {
    const { username, password, fullName, email, phone, roleCodes } = data;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || '123456', salt);

    return await employeeRepository.create({
      username,
      passwordHash,
      fullName,
      email,
      phone,
      roleCodes,
    });
  }

  async updateEmployee(id, data) {
    await this.getEmployeeById(id);
    return await employeeRepository.update(id, data);
  }

  async toggleStatus(id) {
    await this.getEmployeeById(id);
    return await employeeRepository.toggleStatus(id);
  }

  async getSalesKpi(id, dateRange) {
    await this.getEmployeeById(id);
    return await employeeRepository.getSalesKpi(id, dateRange);
  }

  async getRoles() {
    return await employeeRepository.getAllRoles();
  }

  async getPermissions() {
    return await employeeRepository.getAllPermissions();
  }
}

module.exports = new EmployeeService();
