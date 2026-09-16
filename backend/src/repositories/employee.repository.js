const { pool } = require('../config/database');

class EmployeeRepository {
  async findAll({ keyword, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'u.deleted_at IS NULL';

    if (keyword) {
      whereClause += ' AND (u.full_name LIKE ? OR u.username LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const countQuery = `SELECT COUNT(*) AS total FROM users u WHERE ${whereClause}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const query = `
      SELECT u.id, u.username, u.full_name, u.email, u.phone, u.auth_provider, u.is_active, u.created_at,
        (SELECT GROUP_CONCAT(r.name SEPARATOR ', ') 
         FROM roles r INNER JOIN user_roles ur ON r.id = ur.role_id 
         WHERE ur.user_id = u.id) AS role_names,
        (SELECT GROUP_CONCAT(r.code SEPARATOR ',') 
         FROM roles r INNER JOIN user_roles ur ON r.id = ur.role_id 
         WHERE ur.user_id = u.id) AS role_codes
      FROM users u
      WHERE ${whereClause}
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [...params, parseInt(limit, 10), parseInt(offset, 10)]);
    return { rows, total };
  }

  async findById(id) {
    const query = `
      SELECT u.id, u.username, u.full_name, u.email, u.phone, u.auth_provider, u.is_active, u.created_at,
        (SELECT GROUP_CONCAT(r.code SEPARATOR ',') 
         FROM roles r INNER JOIN user_roles ur ON r.id = ur.role_id 
         WHERE ur.user_id = u.id) AS role_codes
      FROM users u
      WHERE u.id = ? AND u.deleted_at IS NULL
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async create({ username, passwordHash, fullName, email, phone, roleCodes = ['CASHIER'] }) {
    const [result] = await pool.query(
      `INSERT INTO users (username, password_hash, full_name, email, phone, auth_provider, is_active)
       VALUES (?, ?, ?, ?, ?, 'LOCAL', 1)`,
      [username, passwordHash, fullName, email, phone || null]
    );
    const userId = result.insertId;

    for (const roleCode of roleCodes) {
      await pool.query(
        'INSERT INTO user_roles (user_id, role_id) SELECT ?, id FROM roles WHERE code = ?',
        [userId, roleCode]
      );
    }
    return this.findById(userId);
  }

  async update(id, { fullName, phone, roleCodes }) {
    await pool.query('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [fullName, phone, id]);

    if (roleCodes && Array.isArray(roleCodes)) {
      await pool.query('DELETE FROM user_roles WHERE user_id = ?', [id]);
      for (const roleCode of roleCodes) {
        await pool.query(
          'INSERT INTO user_roles (user_id, role_id) SELECT ?, id FROM roles WHERE code = ?',
          [id, roleCode]
        );
      }
    }
    return this.findById(id);
  }

  async toggleStatus(id) {
    await pool.query('UPDATE users SET is_active = NOT is_active WHERE id = ?', [id]);
    return this.findById(id);
  }

  async getSalesKpi(userId, { startDate, endDate }) {
    let dateFilter = '';
    const params = [userId];

    if (startDate) {
      dateFilter += ' AND DATE(o.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND DATE(o.created_at) <= ?';
      params.push(endDate);
    }

    const query = `
      SELECT 
        COUNT(o.id) AS total_orders,
        COALESCE(SUM(o.grand_total), 0) AS total_sales,
        COALESCE(SUM(o.commission_total), 0) AS total_commission
      FROM orders o
      WHERE (o.cashier_id = ? OR o.seller_id = ?) AND o.order_status = 'COMPLETED' ${dateFilter}
    `;
    const [rows] = await pool.query(query, [userId, ...params]);
    return rows[0];
  }

  async getAllRoles() {
    const [rows] = await pool.query('SELECT * FROM roles ORDER BY id ASC');
    return rows;
  }

  async getAllPermissions() {
    const [rows] = await pool.query('SELECT * FROM permissions ORDER BY module ASC, id ASC');
    return rows;
  }
}

module.exports = new EmployeeRepository();
