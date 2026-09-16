const { pool } = require('../config/database');

class UserRepository {
  /**
    Tìm người dùng theo Email hoặc Username
   */
  async findByUsernameOrEmail(identifier) {
    const query = `
      SELECT u.*, mf.file_url AS avatar_url
      FROM users u
      LEFT JOIN media_files mf ON u.avatar_id = mf.id
      WHERE (u.username = ? OR u.email = ?) AND u.deleted_at IS NULL
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [identifier, identifier]);
    return rows[0] || null;
  }

  /**
    Tìm người dùng theo Google ID
   */
  async findByGoogleId(googleId) {
    const query = `
      SELECT u.*, mf.file_url AS avatar_url
      FROM users u
      LEFT JOIN media_files mf ON u.avatar_id = mf.id
      WHERE u.google_id = ? AND u.deleted_at IS NULL
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [googleId]);
    return rows[0] || null;
  }

  /**
    Tìm người dùng theo ID kèm vai trò & danh sách quyền
   */
  async findById(userId) {
    const query = `
      SELECT id, username, full_name, email, phone, google_id, auth_provider, avatar_id, is_active, created_at
      FROM users
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows[0] || null;
  }

  /**
    Lấy danh sách mã vai trò của User (e.g. ['ADMIN', 'CASHIER'])
   */
  async getUserRoles(userId) {
    const query = `
      SELECT r.code
      FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows.map((r) => r.code);
  }

  /**
    Lấy danh sách mã quyền chi tiết của User (e.g. ['POS_SELL', 'PRODUCT_VIEW'])
   */
  async getUserPermissions(userId) {
    const query = `
      SELECT DISTINCT p.code
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = ?
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows.map((p) => p.code);
  }

  /**
    Tạo người dùng mới (đặc biệt khi đăng nhập Google lần đầu)
   */
  async createGoogleUser({ email, fullName, googleId, avatarUrl = null }) {
    const query = `
      INSERT INTO users (full_name, email, google_id, auth_provider, is_active)
      VALUES (?, ?, ?, 'GOOGLE', 1)
    `;
    const [result] = await pool.query(query, [fullName, email, googleId]);
    const userId = result.insertId;

    // Gán mặc định vai trò Thu ngân (CASHIER) cho user Google mới
    const defaultRoleQuery = `
      INSERT INTO user_roles (user_id, role_id)
      SELECT ?, id FROM roles WHERE code = 'CASHIER' LIMIT 1
    `;
    await pool.query(defaultRoleQuery, [userId]);

    return this.findById(userId);
  }

  /**
    Cập nhật Google ID cho tài khoản có sẵn trùng Email
   */
  async linkGoogleAccount(userId, googleId) {
    const query = `
      UPDATE users SET google_id = ?, auth_provider = 'GOOGLE' WHERE id = ?
    `;
    await pool.query(query, [googleId, userId]);
  }

  /**
    Cập nhật mật khẩu mã hóa mới
   */
  async updatePassword(userId, passwordHash) {
    const query = `
      UPDATE users SET password_hash = ? WHERE id = ?
    `;
    await pool.query(query, [passwordHash, userId]);
  }
}

module.exports = new UserRepository();
