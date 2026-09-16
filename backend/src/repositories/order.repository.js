const { pool } = require('../config/database');

class OrderRepository {
  async findAll({ keyword, customerId, cashierId, orderStatus, paymentStatus, startDate, endDate, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereConditions = ['1=1'];

    if (keyword) {
      whereConditions.push('(o.code LIKE ? OR c.name LIKE ? OR c.phone LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (customerId) {
      whereConditions.push('o.customer_id = ?');
      params.push(customerId);
    }
    if (cashierId) {
      whereConditions.push('o.cashier_id = ?');
      params.push(cashierId);
    }
    if (orderStatus) {
      whereConditions.push('o.order_status = ?');
      params.push(orderStatus);
    }
    if (paymentStatus) {
      whereConditions.push('o.payment_status = ?');
      params.push(paymentStatus);
    }
    if (startDate) {
      whereConditions.push('DATE(o.created_at) >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('DATE(o.created_at) <= ?');
      params.push(endDate);
    }

    const whereClause = whereConditions.join(' AND ');

    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM orders o 
      LEFT JOIN customers c ON o.customer_id = c.id 
      WHERE ${whereClause}
    `;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const query = `
      SELECT o.*, c.name AS customer_name, c.phone AS customer_phone, 
             u.full_name AS cashier_name, cs.shift_code
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      INNER JOIN users u ON o.cashier_id = u.id
      LEFT JOIN cashier_shifts cs ON o.shift_id = cs.id
      WHERE ${whereClause}
      ORDER BY o.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [...params, parseInt(limit, 10), parseInt(offset, 10)]);
    return { rows, total };
  }

  async findById(id) {
    const query = `
      SELECT o.*, c.name AS customer_name, c.phone AS customer_phone, c.address AS customer_address,
             u.full_name AS cashier_name, s.full_name AS seller_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      INNER JOIN users u ON o.cashier_id = u.id
      LEFT JOIN users s ON o.seller_id = s.id
      WHERE o.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    if (!rows[0]) return null;

    const [items] = await pool.query(
      `SELECT od.*, p.name AS product_name, p.code AS product_code, u.name AS unit_name
       FROM order_details od
       INNER JOIN products p ON od.product_id = p.id
       INNER JOIN product_units pu ON od.product_unit_id = pu.id
       INNER JOIN units u ON pu.unit_id = u.id
       WHERE od.order_id = ?`,
      [id]
    );

    const [payments] = await pool.query(
      `SELECT op.*, u.full_name AS created_by_name
       FROM order_payments op
       INNER JOIN users u ON op.created_by = u.id
       WHERE op.order_id = ?`,
      [id]
    );

    return {
      ...rows[0],
      items,
      payments,
    };
  }

  async cancelOrderTransaction(connection, orderId, userId, reason) {
    const [orderRows] = await connection.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    const order = orderRows[0];
    if (!order) throw new Error('Hóa đơn không tồn tại');
    if (order.order_status === 'CANCELLED') throw new Error('Hóa đơn này đã bị hủy trước đó');

    // 1. Đổi trạng thái sang CANCELLED
    await connection.query(
      `UPDATE orders SET order_status = 'CANCELLED', note = CONCAT(COALESCE(note, ''), ' [Đã hủy: ', ?) WHERE id = ?`,
      [`Lý do: ${reason || 'Không nêu'}]`, orderId]
    );

    // 2. Lấy chi tiết đơn hàng để hoàn lại tồn kho
    const [items] = await connection.query(
      'SELECT product_id, base_quantity, cost_price FROM order_details WHERE order_id = ?',
      [orderId]
    );

    for (const item of items) {
      const [stockRows] = await connection.query(
        'SELECT quantity_on_hand FROM inventory_stocks WHERE product_id = ? FOR UPDATE',
        [item.product_id]
      );
      const qtyBefore = stockRows[0] ? parseFloat(stockRows[0].quantity_on_hand) : 0;
      const qtyAfter = qtyBefore + parseFloat(item.base_quantity);

      // Cộng lại tồn kho
      await connection.query(
        'UPDATE inventory_stocks SET quantity_on_hand = quantity_on_hand + ? WHERE product_id = ?',
        [item.base_quantity, item.product_id]
      );

      // Ghi thẻ kho hoàn hàng
      await connection.query(
        `INSERT INTO inventory_movements (product_id, base_unit_id, movement_type, reference_type, reference_id, quantity_change, quantity_before, quantity_after, unit_cost, total_value, user_id, note)
         SELECT ?, p.base_unit_id, 'CUSTOMER_RETURN', 'orders', ?, ?, ?, ?, ?, ?, ?, ?
         FROM products p WHERE p.id = ?`,
        [
          item.product_id,
          orderId,
          item.base_quantity,
          qtyBefore,
          qtyAfter,
          item.cost_price,
          item.base_quantity * item.cost_price,
          userId,
          `Hủy đơn hàng ${order.code}`,
          item.product_id,
        ]
      );
    }

    // 3. Nếu đơn có ghi nợ khách hàng -> Giảm nợ
    if (order.debt_amount > 0 && order.customer_id) {
      const [custRows] = await connection.query('SELECT current_debt FROM customers WHERE id = ? FOR UPDATE', [order.customer_id]);
      const currentDebt = parseFloat(custRows[0]?.current_debt || 0);
      const balanceAfter = Math.max(0, currentDebt - parseFloat(order.debt_amount));

      await connection.query(
        `INSERT INTO customer_debts (customer_id, order_id, transaction_type, amount, balance_after, recorded_by, note)
         VALUES (?, ?, 'RETURN_DEDUCTION', ?, ?, ?, ?)`,
        [order.customer_id, orderId, -order.debt_amount, balanceAfter, userId, `Hủy hóa đơn ${order.code}`]
      );

      await connection.query('UPDATE customers SET current_debt = ? WHERE id = ?', [balanceAfter, order.customer_id]);
    }

    // 4. Nếu đơn thuộc ca đang mở -> Trừ bớt doanh số ca
    if (order.shift_id) {
      const [shiftRows] = await connection.query("SELECT status FROM cashier_shifts WHERE id = ?", [order.shift_id]);
      if (shiftRows[0]?.status === 'OPEN') {
        await connection.query(
          `UPDATE cashier_shifts 
           SET cash_sales_amount = GREATEST(0, cash_sales_amount - ?),
               expected_cash_end = GREATEST(0, expected_cash_end - ?)
           WHERE id = ?`,
          [order.paid_amount, order.paid_amount, order.shift_id]
        );
      }
    }
  }
}

module.exports = new OrderRepository();
