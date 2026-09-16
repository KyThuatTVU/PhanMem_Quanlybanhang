const { pool } = require('../config/database');

class PosRepository {
  /**
    Lấy ca bán hàng đang mở (STATUS = 'OPEN') của Thu ngân
   */
  async findOpenShiftByUserId(userId) {
    const query = `
      SELECT * FROM cashier_shifts 
      WHERE user_id = ? AND status = 'OPEN' 
      ORDER BY id DESC LIMIT 1
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows[0] || null;
  }

  /**
    Mở ca làm việc mới cho Thu ngân
   */
  async openShift({ shiftCode, userId, startingCash }) {
    const query = `
      INSERT INTO cashier_shifts (shift_code, user_id, start_time, starting_cash, expected_cash_end, status)
      VALUES (?, ?, NOW(), ?, ?, 'OPEN')
    `;
    const [result] = await pool.query(query, [shiftCode, userId, startingCash, startingCash]);
    return result.insertId;
  }

  /**
    Chốt ca làm việc
   */
  async closeShift(shiftId, { actualCashEnd, note }) {
    const [rows] = await pool.query('SELECT expected_cash_end FROM cashier_shifts WHERE id = ?', [shiftId]);
    const expectedCash = rows[0]?.expected_cash_end || 0;
    const differenceAmount = actualCashEnd - expectedCash;

    await pool.query(
      `UPDATE cashier_shifts 
       SET end_time = NOW(), actual_cash_end = ?, difference_amount = ?, note = ?, status = 'CLOSED' 
       WHERE id = ?`,
      [actualCashEnd, differenceAmount, note || null, shiftId]
    );
  }

  /**
    Thực thi Thanh toán Đơn POS trong Transaction với LOCK FOR UPDATE
   */
  async processCheckoutTransaction(connection, checkoutData) {
    const {
      orderCode,
      shiftId,
      customerId,
      cashierId,
      sellerId,
      cartItems,
      subtotalAmount,
      discountAmount,
      grandTotal,
      paidAmount,
      changeAmount,
      debtAmount,
      paymentMethod,
      referenceCode,
    } = checkoutData;

    // 1. Dùng FOR UPDATE Khóa các bản ghi tồn kho và kiểm tra đủ hàng
    const productIds = cartItems.map((item) => item.productId);
    const [stockRows] = await connection.query(
      `SELECT product_id, quantity_on_hand FROM inventory_stocks WHERE product_id IN (?) FOR UPDATE`,
      [productIds]
    );

    const stockMap = new Map();
    stockRows.forEach((r) => stockMap.set(r.product_id, parseFloat(r.quantity_on_hand)));

    for (const item of cartItems) {
      const currentStock = stockMap.get(item.productId) || 0;
      const requiredBaseQty = item.quantity * item.conversionRate;
      if (currentStock < requiredBaseQty) {
        throw new Error(`Sản phẩm [ID: ${item.productId}] không đủ tồn kho (Còn: ${currentStock}, Cần: ${requiredBaseQty})`);
      }
    }

    // 2. Insert Bảng `orders`
    const [orderResult] = await connection.query(
      `INSERT INTO orders (code, shift_id, customer_id, cashier_id, seller_id, order_status, payment_status, 
                           subtotal_amount, discount_amount, grand_total, paid_amount, change_amount, debt_amount)
       VALUES (?, ?, ?, ?, ?, 'COMPLETED', ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderCode,
        shiftId || null,
        customerId || null,
        cashierId,
        sellerId || cashierId,
        debtAmount > 0 ? (paidAmount > 0 ? 'PARTIAL' : 'UNPAID') : 'PAID',
        subtotalAmount,
        discountAmount,
        grandTotal,
        paidAmount,
        changeAmount,
        debtAmount,
      ]
    );
    const orderId = orderResult.insertId;

    // 3. Insert `order_details` + Trừ `inventory_stocks` + Insert `inventory_movements`
    for (const item of cartItems) {
      const baseQty = item.quantity * item.conversionRate;
      const itemSubtotal = item.quantity * item.unitPrice - (item.discountAmount || 0);

      // 3.1 Chi tiết đơn
      await connection.query(
        `INSERT INTO order_details (order_id, product_id, product_unit_id, quantity, unit_price, cost_price, discount_amount, subtotal, conversion_rate, base_quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.productUnitId, item.quantity, item.unitPrice, item.costPrice || 0, item.discountAmount || 0, itemSubtotal, item.conversionRate, baseQty]
      );

      // 3.2 Lấy tồn trước khi trừ
      const qtyBefore = stockMap.get(item.productId);
      const qtyAfter = qtyBefore - baseQty;

      // 3.3 Trừ tồn kho thực tế
      await connection.query(
        `UPDATE inventory_stocks SET quantity_on_hand = quantity_on_hand - ? WHERE product_id = ?`,
        [baseQty, item.productId]
      );

      // 3.4 Ghi thẻ kho bất biến
      await connection.query(
        `INSERT INTO inventory_movements (product_id, base_unit_id, movement_type, reference_type, reference_id, quantity_change, quantity_before, quantity_after, unit_cost, total_value, user_id)
         SELECT ?, p.base_unit_id, 'SALE_EXPORT', 'orders', ?, ?, ?, ?, ?, ?, ?
         FROM products p WHERE p.id = ?`,
        [item.productId, orderId, -baseQty, qtyBefore, qtyAfter, item.costPrice || 0, baseQty * (item.costPrice || 0), cashierId, item.productId]
      );
    }

    // 4. Insert `order_payments`
    const actualPay = paidAmount - changeAmount;
    if (actualPay > 0) {
      await connection.query(
        `INSERT INTO order_payments (order_id, payment_method, amount, reference_code, created_by)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, paymentMethod || 'CASH', actualPay, referenceCode || null, cashierId]
      );
    }

    // 5. Nếu có nợ -> Cập nhật sổ nợ `customer_debts` và `customers.current_debt`
    if (debtAmount > 0 && customerId) {
      const [custRows] = await connection.query('SELECT current_debt FROM customers WHERE id = ? FOR UPDATE', [customerId]);
      const currentDebt = parseFloat(custRows[0]?.current_debt || 0);
      const balanceAfter = currentDebt + debtAmount;

      await connection.query(
        `INSERT INTO customer_debts (customer_id, transaction_type, order_id, amount, balance_after, recorded_by)
         VALUES (?, 'ORDER_DEBT', ?, ?, ?, ?)`,
        [customerId, orderId, debtAmount, balanceAfter, cashierId]
      );

      await connection.query('UPDATE customers SET current_debt = current_debt + ? WHERE id = ?', [debtAmount, customerId]);
    }

    // 6. Cập nhật Doanh số vào Ca bán hàng `cashier_shifts`
    if (shiftId) {
      if (paymentMethod === 'CASH') {
        await connection.query(
          `UPDATE cashier_shifts 
           SET cash_sales_amount = cash_sales_amount + ?, expected_cash_end = expected_cash_end + ? 
           WHERE id = ?`,
          [actualPay, actualPay, shiftId]
        );
      } else {
        await connection.query(
          `UPDATE cashier_shifts SET bank_sales_amount = bank_sales_amount + ? WHERE id = ?`,
          [actualPay, shiftId]
        );
      }
    }

    return orderId;
  }
}

module.exports = new PosRepository();
