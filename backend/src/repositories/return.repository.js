const { pool } = require('../config/database');

class ReturnRepository {
  async findAll({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const countQuery = 'SELECT COUNT(*) AS total FROM return_orders';
    const [countRows] = await pool.query(countQuery);
    const total = countRows[0].total;

    const query = `
      SELECT ro.*, o.code AS original_order_code, c.name AS customer_name, u.full_name AS staff_name
      FROM return_orders ro
      INNER JOIN orders o ON ro.original_order_id = o.id
      LEFT JOIN customers c ON ro.customer_id = c.id
      INNER JOIN users u ON ro.user_id = u.id
      ORDER BY ro.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [parseInt(limit, 10), parseInt(offset, 10)]);
    return { rows, total };
  }

  async findById(id) {
    const query = `
      SELECT ro.*, o.code AS original_order_code, c.name AS customer_name, u.full_name AS staff_name
      FROM return_orders ro
      INNER JOIN orders o ON ro.original_order_id = o.id
      LEFT JOIN customers c ON ro.customer_id = c.id
      INNER JOIN users u ON ro.user_id = u.id
      WHERE ro.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    if (!rows[0]) return null;

    const [items] = await pool.query(
      `SELECT rod.*, p.name AS product_name, p.code AS product_code, u.name AS unit_name
       FROM return_order_details rod
       INNER JOIN products p ON rod.product_id = p.id
       INNER JOIN product_units pu ON rod.product_unit_id = pu.id
       INNER JOIN units u ON pu.unit_id = u.id
       WHERE rod.return_order_id = ?`,
      [id]
    );

    return { ...rows[0], items };
  }

  async getOrderPurchasedItems(orderId) {
    const query = `
      SELECT od.*, p.name AS product_name, p.code AS product_code, u.name AS unit_name,
        COALESCE(
          (SELECT SUM(rod.quantity) 
           FROM return_order_details rod 
           INNER JOIN return_orders ro ON rod.return_order_id = ro.id
           WHERE ro.original_order_id = od.order_id 
             AND rod.product_id = od.product_id 
             AND rod.product_unit_id = od.product_unit_id 
             AND ro.status = 'COMPLETED'), 0
        ) AS previously_returned_quantity
      FROM order_details od
      INNER JOIN products p ON od.product_id = p.id
      INNER JOIN product_units pu ON od.product_unit_id = pu.id
      INNER JOIN units u ON pu.unit_id = u.id
      WHERE od.order_id = ?
    `;
    const [rows] = await pool.query(query, [orderId]);
    return rows;
  }

  async processReturnTransaction(connection, data) {
    const {
      code,
      originalOrderId,
      customerId,
      userId,
      shiftId,
      items,
      totalRefundAmount,
      refundMethod,
      debtDeduction,
      reason,
    } = data;

    // 1. Kiểm tra số lượng trả hợp lệ so với đã mua
    const [orderItems] = await connection.query(
      'SELECT product_id, product_unit_id, quantity, unit_price FROM order_details WHERE order_id = ?',
      [originalOrderId]
    );

    const orderItemMap = new Map();
    orderItems.forEach((oi) => orderItemMap.set(`${oi.product_id}_${oi.product_unit_id}`, parseFloat(oi.quantity)));

    for (const item of items) {
      const key = `${item.productId}_${item.productUnitId}`;
      const purchasedQty = orderItemMap.get(key) || 0;

      // Lấy số lượng đã trả trước đó
      const [returnedRows] = await connection.query(
        `SELECT COALESCE(SUM(rod.quantity), 0) AS total_returned
         FROM return_order_details rod
         INNER JOIN return_orders ro ON rod.return_order_id = ro.id
         WHERE ro.original_order_id = ? AND rod.product_id = ? AND rod.product_unit_id = ? AND ro.status = 'COMPLETED'`,
        [originalOrderId, item.productId, item.productUnitId]
      );
      const previouslyReturned = parseFloat(returnedRows[0]?.total_returned || 0);
      const remainingReturnable = purchasedQty - previouslyReturned;

      if (item.quantity > remainingReturnable) {
        throw new Error(`Số lượng trả (${item.quantity}) vượt quá số lượng còn lại có thể trả (${remainingReturnable})`);
      }
    }

    // 2. Tạo phiếu trả hàng
    const [roResult] = await connection.query(
      `INSERT INTO return_orders (code, original_order_id, customer_id, user_id, shift_id, total_refund_amount, refund_method, debt_deduction, status, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', ?)`,
      [code, originalOrderId, customerId || null, userId, shiftId || null, totalRefundAmount, refundMethod || 'CASH', debtDeduction || 0, reason || null]
    );
    const returnId = roResult.insertId;

    // 3. Chi tiết trả hàng, tăng lại tồn kho và ghi thẻ kho
    for (const item of items) {
      const baseQuantity = item.quantity * item.conversionRate;
      const subtotal = item.quantity * item.unitPrice;

      await connection.query(
        `INSERT INTO return_order_details (return_order_id, product_id, product_unit_id, quantity, unit_price, subtotal, conversion_rate, base_quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [returnId, item.productId, item.productUnitId, item.quantity, item.unitPrice, subtotal, item.conversionRate, baseQuantity]
      );

      const [stockRows] = await connection.query(
        'SELECT quantity_on_hand FROM inventory_stocks WHERE product_id = ? FOR UPDATE',
        [item.productId]
      );
      const qtyBefore = stockRows[0] ? parseFloat(stockRows[0].quantity_on_hand) : 0;
      const qtyAfter = qtyBefore + baseQuantity;

      await connection.query(
        'UPDATE inventory_stocks SET quantity_on_hand = quantity_on_hand + ? WHERE product_id = ?',
        [baseQuantity, item.productId]
      );

      await connection.query(
        `INSERT INTO inventory_movements (product_id, base_unit_id, movement_type, reference_type, reference_id, quantity_change, quantity_before, quantity_after, unit_cost, total_value, user_id, note)
         SELECT ?, p.base_unit_id, 'CUSTOMER_RETURN', 'return_orders', ?, ?, ?, ?, ?, ?, ?, ?
         FROM products p WHERE p.id = ?`,
        [item.productId, returnId, baseQuantity, qtyBefore, qtyAfter, item.unitPrice / item.conversionRate, baseQuantity * (item.unitPrice / item.conversionRate), userId, `Khách trả hàng theo phiếu ${code}`, item.productId]
      );
    }

    // 4. Nếu giảm nợ khách hàng
    if (debtDeduction > 0 && customerId) {
      const [custRows] = await connection.query('SELECT current_debt FROM customers WHERE id = ? FOR UPDATE', [customerId]);
      const currentDebt = parseFloat(custRows[0]?.current_debt || 0);
      const balanceAfter = Math.max(0, currentDebt - debtDeduction);

      await connection.query(
        `INSERT INTO customer_debts (customer_id, return_order_id, transaction_type, amount, balance_after, recorded_by, note)
         VALUES (?, ?, 'RETURN_DEDUCTION', ?, ?, ?, ?)`,
        [customerId, returnId, -debtDeduction, balanceAfter, userId, `Khách trả hàng giảm nợ ${code}`]
      );

      await connection.query('UPDATE customers SET current_debt = ? WHERE id = ?', [balanceAfter, customerId]);
    }

    // 5. Nếu chi trả tiền mặt từ ca làm việc
    if (refundMethod === 'CASH' && shiftId && totalRefundAmount > 0) {
      await connection.query(
        `UPDATE cashier_shifts 
         SET cash_payout_amount = cash_payout_amount + ?,
             expected_cash_end = expected_cash_end - ?
         WHERE id = ?`,
        [totalRefundAmount, totalRefundAmount, shiftId]
      );
    }

    return returnId;
  }
}

module.exports = new ReturnRepository();
