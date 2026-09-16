const { pool } = require('../config/database');

class SettingRepository {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM system_settings');
    const settings = {};
    rows.forEach((r) => {
      settings[r.setting_key] = r.setting_value;
    });
    return settings;
  }

  async updateSetting(key, value) {
    await pool.query(
      `INSERT INTO system_settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [key, value, value]
    );
  }
}

module.exports = new SettingRepository();
