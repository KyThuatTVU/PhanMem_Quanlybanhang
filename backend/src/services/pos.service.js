const posRepository = require('../repositories/pos.repository');
const { withTransaction } = require('../config/database');
const { AppError } = require('../utils/response.util');
const ERROR_CODES = require('../constants/error-codes');

class PosService {
  async getOpenShift(userId) {
    return await posRepository.findOpenShiftByUserId(userId);
  }

  async openShift(userId, startingCash) {
    const existing = await posRepository.findOpenShiftByUserId(userId);
    if (existing) {
      throw new AppError(ERROR_CODES.SHIFT_ALREADY_OPEN, 'Bạn đã có một ca làm việc đang mở');
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const shiftCode = `CA-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

    const shiftId = await posRepository.openShift({
      shiftCode,
      userId,
      startingCash: parseFloat(startingCash || 0),
    });

    return { shiftId, shiftCode };
  }

  async closeShift(userId, { actualCashEnd, note }) {
    const shift = await posRepository.findOpenShiftByUserId(userId);
    if (!shift) {
      throw new AppError(ERROR_CODES.SHIFT_NOT_OPENED, 'Không tìm thấy ca làm việc đang mở để đóng');
    }

    await posRepository.closeShift(shift.id, { actualCashEnd, note });
    return { shiftId: shift.id };
  }

  async processCheckout(cashierId, checkoutData) {
    const {
      cartItems,
      subtotalAmount,
      discountAmount = 0,
      grandTotal,
      paidAmount,
      changeAmount = 0,
      debtAmount = 0,
      customerId,
    } = checkoutData;
    const calculatedSubtotal = cartItems.reduce(
      (total, item) => total + (item.quantity * item.unitPrice) - (item.discountAmount || 0),
      0
    );
    const calculatedGrandTotal = calculatedSubtotal - discountAmount;
    const settlementTotal = paidAmount - changeAmount + debtAmount;
    const amountsMatch = (left, right) => Math.abs(Number(left) - Number(right)) < 0.01;

    if (discountAmount > calculatedSubtotal || !amountsMatch(subtotalAmount, calculatedSubtotal) || !amountsMatch(grandTotal, calculatedGrandTotal) || !amountsMatch(settlementTotal, grandTotal)) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, 'Tổng tiền, chiết khấu và số tiền thanh toán không hợp lệ');
    }
    if (debtAmount > 0 && !customerId) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, 'Giao dịch ghi nợ phải có khách hàng');
    }

    // 1. Sinh Mã đơn tự động HD-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderCode = `HD-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Lấy ca làm việc hiện thời của thu ngân
    const currentShift = await posRepository.findOpenShiftByUserId(cashierId);

    // 3. Chạy Transaction Thanh toán an toàn
    return await withTransaction(async (connection) => {
      const orderId = await posRepository.processCheckoutTransaction(connection, {
        ...checkoutData,
        orderCode,
        cashierId,
        shiftId: currentShift ? currentShift.id : null,
      });

      return { orderId, orderCode };
    });
  }
}

module.exports = new PosService();
