const { pool } = require('../config/database');

class SupplierRepository {
  async findAll({ keyword, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 's.deleted_at IS NULL';

    if (keyword) {
      whereClause += ' AND (s.name LIKE ? OR s.code LIKE ? OR s.phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const countQuery = `SELECT COUNT(*) AS total FROM suppliers s WHERE ${whereClause}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const query = `
      SELECT s.*, 
        (SELECT COUNT(*) FROM purchase_orders po WHERE po.supplier_id = s.id) AS total_orders
      FROM suppliers s
      WHERE ${whereClause}
      ORDER BY s.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [...params, parseInt(limit, 10), parseInt(offset, 10)]);
    return { rows, total };
  }

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ? AND deleted_at IS NULL', [id]);
    return rows[0] || null;
  }

  async create({ code, name, contactName, phone, email, address, taxCode }) {
    const [result] = await pool.query(
      `INSERT INTO suppliers (code, name, contact_name, phone, email, address, tax_code)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, name, contactName || null, phone, email || null, address || null, taxCode || null]
    );
    return this.findById(result.insertId);
  }

  async update(id, { name, contactName, phone, email, address, taxCode, isActive }) {
    await pool.query(
      `UPDATE suppliers 
       SET name = ?, contact_name = ?, phone = ?, email = ?, address = ?, tax_code = ?, is_active = ?
       WHERE id = ?`,
      [name, contactName, phone, email, address, taxCode, isActive !== undefined ? isActive : 1, id]
    );
    return this.findById(id);
  }

  async delete(id) {
    await pool.query('UPDATE suppliers SET deleted_at = NOW(), is_active = 0 WHERE id = ?', [id]);
  }

  async getPurchaseHistory(supplierId) {
    const [rows] = await pool.query(
      `SELECT po.*, u.full_name AS created_by_name
       FROM purchase_orders po
       INNER JOIN users u ON po.user_id = u.id
       WHERE po.supplier_id = ?
       ORDER BY po.id DESC LIMIT 50`,
      [supplierId]
    );
    return rows;
  }
}

module.exports = new SupplierRepository();
