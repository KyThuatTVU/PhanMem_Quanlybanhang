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

  async update(id, { name }) {
    await pool.query('UPDATE brands SET name = ? WHERE id = ?', [name, id]);
    return this.findById(id);
  }

  async delete(id) {
    await pool.query('UPDATE brands SET is_active = 0 WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new BrandRepository();
