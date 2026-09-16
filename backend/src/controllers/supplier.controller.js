const supplierService = require('../services/supplier.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');

class SupplierController {
  async getSuppliers(req, res, next) {
    try {
      const { rows, total } = await supplierService.getSuppliers(req.query);
      return sendPaginated(res, rows, { page: req.query.page, limit: req.query.limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getSupplierById(req, res, next) {
    try {
      const supplier = await supplierService.getSupplierById(req.params.id);
      return sendSuccess(res, supplier);
    } catch (error) {
      next(error);
    }
  }

  async createSupplier(req, res, next) {
    try {
      const supplier = await supplierService.createSupplier(req.body);
      return sendSuccess(res, supplier, 'Tạo nhà cung cấp thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateSupplier(req, res, next) {
    try {
      const supplier = await supplierService.updateSupplier(req.params.id, req.body);
      return sendSuccess(res, supplier, 'Cập nhật nhà cung cấp thành công');
    } catch (error) {
      next(error);
    }
  }

  async deleteSupplier(req, res, next) {
    try {
      await supplierService.deleteSupplier(req.params.id);
      return sendSuccess(res, null, 'Xóa nhà cung cấp thành công');
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseHistory(req, res, next) {
    try {
      const history = await supplierService.getPurchaseHistory(req.params.id);
      return sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SupplierController();
