const debtService = require('../services/debt.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');

class DebtController {
  async getCustomerDebts(req, res, next) {
    try {
      const { rows, total } = await debtService.getCustomerDebts(req.query);
      return sendPaginated(res, rows, { page: req.query.page, limit: req.query.limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerDebtLedger(req, res, next) {
    try {
      const rows = await debtService.getCustomerDebtLedger(req.params.id);
      return sendSuccess(res, rows);
    } catch (error) {
      next(error);
    }
  }

  async payCustomerDebt(req, res, next) {
    try {
      const result = await debtService.payCustomerDebt(req.user.id, {
        customerId: req.params.id,
        amount: parseFloat(req.body.amount),
        paymentMethod: req.body.paymentMethod,
        note: req.body.note,
      });
      return sendSuccess(res, result, 'Thu tiền công nợ khách hàng thành công');
    } catch (error) {
      next(error);
    }
  }

  async getSupplierDebts(req, res, next) {
    try {
      const { rows, total } = await debtService.getSupplierDebts(req.query);
      return sendPaginated(res, rows, { page: req.query.page, limit: req.query.limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getSupplierDebtLedger(req, res, next) {
    try {
      const rows = await debtService.getSupplierDebtLedger(req.params.id);
      return sendSuccess(res, rows);
    } catch (error) {
      next(error);
    }
  }

  async paySupplierDebt(req, res, next) {
    try {
      const result = await debtService.paySupplierDebt(req.user.id, {
        supplierId: req.params.id,
        amount: parseFloat(req.body.amount),
        paymentMethod: req.body.paymentMethod,
        note: req.body.note,
      });
      return sendSuccess(res, result, 'Thanh toán nợ cho nhà cung cấp thành công');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DebtController();
