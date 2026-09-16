const { pool } = require('../config/database');

class PromotionRepository {
  async findAll({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const countQuery = 'SELECT COUNT(*) AS total FROM promotions';
    const [countRows] = await pool.query(countQuery);
    const total = countRows[0].total;

    const query = `
      SELECT p.*,
        CASE 
          WHEN NOW() BETWEEN p.start_date AND p.end_date AND p.is_active = 1 THEN 'RUNNING'
          WHEN NOW() < p.start_date AND p.is_active = 1 THEN 'UPCOMING'
          ELSE 'EXPIRED'
        END AS timeline_status
      FROM promotions p
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [parseInt(limit, 10), parseInt(offset, 10)]);
    return { rows, total };
  }

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM promotions WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async findActivePromotions() {
    const query = `
      SELECT * FROM promotions 
      WHERE is_active = 1 AND NOW() BETWEEN start_date AND end_date
      ORDER BY id DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  async create(data) {
    const { code, name, promoType, startDate, endDate, minOrderValue, minQuantity, discountValue, maxDiscountAmount } = data;
    const [result] = await pool.query(
      `INSERT INTO promotions (code, name, promo_type, start_date, end_date, min_order_value, min_quantity, discount_value, max_discount_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, name, promoType, startDate, endDate, minOrderValue || 0, minQuantity || 0, discountValue, maxDiscountAmount || 0]
    );
    return this.findById(result.insertId);
  }

  async update(id, data) {
    const { name, promoType, startDate, endDate, minOrderValue, minQuantity, discountValue, maxDiscountAmount, isActive } = data;
    await pool.query(
      `UPDATE promotions 
       SET name = ?, promo_type = ?, start_date = ?, end_date = ?, min_order_value = ?, min_quantity = ?, discount_value = ?, max_discount_amount = ?, is_active = ?
       WHERE id = ?`,
      [name, promoType, startDate, endDate, minOrderValue || 0, minQuantity || 0, discountValue, maxDiscountAmount || 0, isActive, id]
    );
    return this.findById(id);
  }
}

module.exports = new PromotionRepository();
