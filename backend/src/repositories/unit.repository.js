const { pool } = require('../config/database');

class UnitRepository {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM units ORDER BY name ASC');
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM units WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async create({ name }) {
    const [result] = await pool.query('INSERT INTO units (name) VALUES (?)', [name]);
    return this.findById(result.insertId);
  }

  async update(id, { name }) {
    await pool.query('UPDATE units SET name = ? WHERE id = ?', [name, id]);
    return this.findById(id);
  }

  async delete(id) {
    await pool.query('DELETE FROM units WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new UnitRepository();
