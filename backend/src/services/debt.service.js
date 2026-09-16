const debtRepository = require('../repositories/debt.repository');
const posRepository = require('../repositories/pos.repository');
const { withTransaction } = require('../config/database');

class DebtService {
  async getCustomerDebts(params) {
    return await debtRepository.getCustomerDebts(params);
  }

  async getCustomerDebtLedger(customerId) {
    return await debtRepository.getCustomerDebtLedger(customerId);
  }

  async payCustomerDebt(userId, data) {
    const currentShift = await posRepository.findOpenShiftByUserId(userId);
    return await withTransaction(async (connection) => {
      return await debtRepository.payCustomerDebtTransaction(connection, {
        ...data,
        recordedBy: userId,
        shiftId: currentShift ? currentShift.id : null,
      });
    });
  }

  async getSupplierDebts(params) {
    return await debtRepository.getSupplierDebts(params);
  }

  async getSupplierDebtLedger(supplierId) {
    return await debtRepository.getSupplierDebtLedger(supplierId);
  }

  async paySupplierDebt(userId, data) {
    return await withTransaction(async (connection) => {
      return await debtRepository.paySupplierDebtTransaction(connection, {
        ...data,
        recordedBy: userId,
      });
    });
  }
}

module.exports = new DebtService();
