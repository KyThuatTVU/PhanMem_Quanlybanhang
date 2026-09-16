const customerRepository = require('../repositories/customer.repository');
const { sendSuccess, sendPaginated } = require('../utils/response.util');

class CustomerController {
  async getCustomers(req, res, next) {
    try {
      const { rows, total } = await customerRepository.findAll(req.query);
      return sendPaginated(res, rows, { page: req.query.page, limit: req.query.limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req, res, next) {
    try {
      const customer = await customerRepository.findById(req.params.id);
      return sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }

  async createCustomer(req, res, next) {
    try {
      const customer = await customerRepository.create(req.body);
      return sendSuccess(res, customer, 'Thêm khách hàng thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  async getDebtHistory(req, res, next) {
    try {
      const rows = await customerRepository.getDebtHistory(req.params.id);
      return sendSuccess(res, rows);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
