const supplierRepository = require('../repositories/supplier.repository');
const { AppError } = require('../utils/response.util');
const ERROR_CODES = require('../constants/error-codes');

class SupplierService {
  async getSuppliers(params) {
    return await supplierRepository.findAll(params);
  }

  async getSupplierById(id) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) throw new AppError(ERROR_CODES.NOT_FOUND, 'Nhà cung cấp không tồn tại');
    return supplier;
  }

  async createSupplier(data) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const code = data.code || `NCC-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;
    return await supplierRepository.create({ ...data, code });
  }

  async updateSupplier(id, data) {
    await this.getSupplierById(id);
    return await supplierRepository.update(id, data);
  }

  async deleteSupplier(id) {
    await this.getSupplierById(id);
    await supplierRepository.delete(id);
  }

  async getPurchaseHistory(supplierId) {
    await this.getSupplierById(supplierId);
    return await supplierRepository.getPurchaseHistory(supplierId);
  }
}

module.exports = new SupplierService();
