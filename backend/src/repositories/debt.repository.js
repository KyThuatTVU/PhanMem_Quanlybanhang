const { pool } = require('../config/database');

class DebtRepository {
  // 1. Danh sách khách hàng nợ
  async getCustomerDebts({ keyword, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'c.current_debt > 0 AND c.deleted_at IS NULL';

    if (keyword) {
      whereClause += ' AND (c.name LIKE ? OR c.phone LIKE ? OR c.code LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const countQuery = `SELECT COUNT(*) AS total FROM customers c WHERE ${whereClause}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const query = `
      SELECT c.id, c.code, c.name, c.phone, c.address, c.current_debt, c.debt_limit,
        (SELECT MAX(created_at) FROM customer_debts cd WHERE cd.customer_id = c.id) AS last_transaction_at
      FROM customers c
      WHERE ${whereClause}
      ORDER BY c.current_debt DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [...params, parseInt(limit, 10), parseInt(offset, 10)]);
    return { rows, total };
  }

  // 2. Lịch sử sổ nợ khách hàng
  async getCustomerDebtLedger(customerId) {
    const query = `
      SELECT cd.*, o.code AS order_code, ro.code AS return_code, u.full_name AS recorded_by_name
      FROM customer_debts cd
      LEFT JOIN orders o ON cd.order_id = o.id
      LEFT JOIN return_orders ro ON cd.return_order_id = ro.id
      INNER JOIN users u ON cd.recorded_by = u.id
      WHERE cd.customer_id = ?
      ORDER BY cd.id DESC
    `;
    const [rows] = await pool.query(query, [customerId]);
    return rows;
  }

  // 3. Khách hàng trả nợ trong Transaction
  async payCustomerDebtTransaction(connection, { customerId, amount, paymentMethod, shiftId, recordedBy, note }) {
    const [custRows] = await connection.query('SELECT current_debt FROM customers WHERE id = ? FOR UPDATE', [customerId]);
    const currentDebt = parseFloat(custRows[0]?.current_debt || 0);

    if (amount <= 0) throw new Error('Số tiền trả nợ phải lớn hơn 0');
    if (amount > currentDebt) throw new Error(`Số tiền trả (${amount}) lớn hơn số nợ hiện tại (${currentDebt})`);

    const balanceAfter = currentDebt - amount;

    await connection.query(
      `INSERT INTO customer_debts (customer_id, transaction_type, amount, balance_after, recorded_by, payment_method, note)
       VALUES (?, 'DEBT_REPAYMENT', ?, ?, ?, ?, ?)`,
      [customerId, -amount, balanceAfter, recordedBy, paymentMethod || 'CASH', note || 'Khách thanh toán trả nợ']
    );

    await connection.query('UPDATE customers SET current_debt = ? WHERE id = ?', [balanceAfter, customerId]);

    // Nếu thanh toán tiền mặt và đang có ca mở
    if (paymentMethod === 'CASH' && shiftId) {
      await connection.query(
        `UPDATE cashier_shifts 
         SET cash_sales_amount = cash_sales_amount + ?,
             expected_cash_end = expected_cash_end + ?
         WHERE id = ?`,
        [amount, amount, shiftId]
      );
    }

    return { customerId, paidAmount: amount, balanceAfter };
  }

  // 4. Danh sách nhà cung cấp nợ
  async getSupplierDebts({ keyword, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 's.current_debt > 0 AND s.deleted_at IS NULL';

    if (keyword) {
      whereClause += ' AND (s.name LIKE ? OR s.phone LIKE ? OR s.code LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const countQuery = `SELECT COUNT(*) AS total FROM suppliers s WHERE ${whereClause}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const query = `
      SELECT s.id, s.code, s.name, s.phone, s.contact_name, s.current_debt,
        (SELECT MAX(created_at) FROM supplier_debts sd WHERE sd.supplier_id = s.id) AS last_transaction_at
      FROM suppliers s
      WHERE ${whereClause}
      ORDER BY s.current_debt DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [...params, parseInt(limit, 10), parseInt(offset, 10)]);
    return { rows, total };
  }

  // 5. Lịch sử sổ nợ nhà cung cấp
  async getSupplierDebtLedger(supplierId) {
    const query = `
      SELECT sd.*, po.code AS purchase_code, pr.code AS return_code, u.full_name AS recorded_by_name
      FROM supplier_debts sd
      LEFT JOIN purchase_orders po ON sd.purchase_order_id = po.id
      LEFT JOIN purchase_returns pr ON sd.purchase_return_id = pr.id
      INNER JOIN users u ON sd.recorded_by = u.id
      WHERE sd.supplier_id = ?
      ORDER BY sd.id DESC
    `;
    const [rows] = await pool.query(query, [supplierId]);
    return rows;
  }

  // 6. Quán trả nợ nhà cung cấp trong Transaction
  async paySupplierDebtTransaction(connection, { supplierId, amount, paymentMethod, recordedBy, note }) {
    const [suppRows] = await connection.query('SELECT current_debt FROM suppliers WHERE id = ? FOR UPDATE', [supplierId]);
    const currentDebt = parseFloat(suppRows[0]?.current_debt || 0);

    if (amount <= 0) throw new Error('Số tiền trả nợ phải lớn hơn 0');
    if (amount > currentDebt) throw new Error(`Số tiền trả (${amount}) lớn hơn số nợ hiện tại (${currentDebt})`);

    const balanceAfter = currentDebt - amount;

    await connection.query(
      `INSERT INTO supplier_debts (supplier_id, transaction_type, amount, balance_after, recorded_by, payment_method, note)
       VALUES (?, 'DEBT_PAYMENT', ?, ?, ?, ?, ?)`,
      [supplierId, -amount, balanceAfter, recordedBy, paymentMethod || 'BANK_TRANSFER', note || 'Thanh toán nợ cho nhà cung cấp']
    );

    await connection.query('UPDATE suppliers SET current_debt = ? WHERE id = ?', [balanceAfter, supplierId]);

    return { supplierId, paidAmount: amount, balanceAfter };
  }
}

module.exports = new DebtRepository();
