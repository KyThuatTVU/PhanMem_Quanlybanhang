const { pool } = require('../config/database');

class CustomerRepository {
  async findAll({ keyword, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'c.deleted_at IS NULL';

    if (keyword) {
      whereClause += ' AND (c.name LIKE ? OR c.phone LIKE ? OR c.code LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const countQuery = `SELECT COUNT(*) AS total FROM customers c WHERE ${whereClause}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const query = `
      SELECT c.*, cg.name AS group_name
      FROM customers c
      LEFT JOIN customer_groups cg ON c.group_id = cg.id
      WHERE ${whereClause}
      ORDER BY c.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(query, [...params, parseInt(limit, 10), parseInt(offset, 10)]);
    return { rows, total };
  }

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL', [id]);
    return rows[0] || null;
  }

  async create({ code, name, phone, email = null, address = null, groupId = null, debtLimit = 0 }) {
    const [result] = await pool.query(
      `INSERT INTO customers (code, name, phone, email, address, group_id, debt_limit) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, name, phone, email, address, groupId, debtLimit]
    );
    return this.findById(result.insertId);
  }

  async getDebtHistory(customerId) {
    const query = `
      SELECT cd.*, u.full_name AS recorded_by_name
      FROM customer_debts cd
      INNER JOIN users u ON cd.recorded_by = u.id
      WHERE cd.customer_id = ?
      ORDER BY cd.id DESC
    `;
    const [rows] = await pool.query(query, [customerId]);
    return rows;
  }
}

module.exports = new CustomerRepository();
