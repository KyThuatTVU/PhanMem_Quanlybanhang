const { pool } = require('../config/database');

class InventoryRepository {
  /**
    Xem danh sách tồn kho thực tế
   */
  async getStocks({ keyword, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'p.deleted_at IS NULL';

    if (keyword) {
      whereClause += ' AND (p.name LIKE ? OR p.code LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const countQuery = `SELECT COUNT(*) AS total FROM inventory_stocks inv INNER JOIN products p ON inv.product_id = p.id WHERE ${whereClause}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const query = `
      SELECT inv.*, p.code AS product_code, p.name AS product_name, p.min_stock_alert, u.name AS base_unit_name
      FROM inventory_stocks inv
      INNER JOIN products p ON inv.product_id = p.id
      INNER JOIN units u ON inv.base_unit_id = u.id
      WHERE ${whereClause}
      ORDER BY inv.quantity_on_hand ASC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(query, [...params, parseInt(limit, 10), parseInt(offset, 10)]);
    return { rows, total };
  }

  /**
    Xem lịch sử Thẻ Kho (Inventory Movements)
   */
  async getMovements({ productId, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = '1=1';

    if (productId) {
      whereClause += ' AND im.product_id = ?';
      params.push(productId);
    }

    const countQuery = `SELECT COUNT(*) AS total FROM inventory_movements im WHERE ${whereClause}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const query = `
      SELECT im.*, p.code AS product_code, p.name AS product_name, u.name AS base_unit_name, usr.full_name AS user_name
      FROM inventory_movements im
      INNER JOIN products p ON im.product_id = p.id
      INNER JOIN units u ON im.base_unit_id = u.id
      LEFT JOIN users usr ON im.user_id = usr.id
      WHERE ${whereClause}
      ORDER BY im.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(query, [...params, parseInt(limit, 10), parseInt(offset, 10)]);
    return { rows, total };
  }
}

module.exports = new InventoryRepository();
