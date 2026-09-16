const { pool } = require('../config/database');

class CategoryRepository {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM categories WHERE is_active = 1 ORDER BY name ASC');
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async create({ code, name, description = null, parentId = null }) {
    const [result] = await pool.query(
      'INSERT INTO categories (code, name, description, parent_id) VALUES (?, ?, ?, ?)',
      [code, name, description, parentId]
    );
    return this.findById(result.insertId);
  }

  async update(id, { name, description = null, parentId = null, isActive = 1 }) {
    await pool.query(
      'UPDATE categories SET name = ?, description = ?, parent_id = ?, is_active = ? WHERE id = ?',
      [name, description, parentId, isActive, id]
    );
    return this.findById(id);
  }
}

module.exports = new CategoryRepository();
