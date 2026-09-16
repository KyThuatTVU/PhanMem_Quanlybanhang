const { pool } = require('../config/database');

class DeviceRepository {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM devices ORDER BY id ASC');
    return rows;
  }

  async create({ name, deviceType, connectionType, ipAddress, port, configData }) {
    const [result] = await pool.query(
      `INSERT INTO devices (name, device_type, connection_type, ip_address, port, config_data)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, deviceType, connectionType, ipAddress || null, port || null, configData ? JSON.stringify(configData) : null]
    );
    const [rows] = await pool.query('SELECT * FROM devices WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  async update(id, { name, status, configData }) {
    await pool.query(
      `UPDATE devices SET name = ?, status = ?, config_data = ? WHERE id = ?`,
      [name, status, configData ? JSON.stringify(configData) : null, id]
    );
    const [rows] = await pool.query('SELECT * FROM devices WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = new DeviceRepository();
