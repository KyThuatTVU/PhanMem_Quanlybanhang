const { pool } = require('../config/database');

class BrandRepository {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM brands WHERE is_active = 1 ORDER BY name ASC');
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM brands WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async create({ code, name }) {
    const [result] = await pool.query('INSERT INTO brands (code, name) VALUES (?, ?)', [code, name]);
    return this.findById(result.insertId);
  }
}

module.exports = new BrandRepository();
