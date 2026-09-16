const { pool } = require('../config/database');

class AuditLogRepository {
  async findAll({ moduleName, action, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereConditions = ['1=1'];

    if (moduleName) {
      whereConditions.push('al.module = ?');
      params.push(moduleName);
    }
    if (action) {
      whereConditions.push('al.action = ?');
      params.push(action);
    }

    const whereClause = whereConditions.join(' AND ');

    const countQuery = `SELECT COUNT(*) AS total FROM audit_logs al WHERE ${whereClause}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const query = `
      SELECT al.*, u.full_name AS user_name, u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE ${whereClause}
      ORDER BY al.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [...params, parseInt(limit, 10), parseInt(offset, 10)]);
    return { rows, total };
  }

  async log({ userId, action, moduleName, recordId, oldValues, newValues, ipAddress }) {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, module, record_id, old_values, new_values, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        action,
        moduleName,
        recordId || null,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress || null,
      ]
    );
  }
}

module.exports = new AuditLogRepository();
