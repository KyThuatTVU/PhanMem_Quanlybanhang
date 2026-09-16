const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const userRepository = require('../repositories/user.repository');
const { jwtSecret, jwtExpiresIn, jwtRefreshSecret, jwtRefreshExpiresIn } = require('../config/jwt');
const { AppError } = require('../utils/response.util');
const ERROR_CODES = require('../constants/error-codes');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  /**
    Sinh cặp Access Token và Refresh Token
   */
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
    const refreshToken = jwt.sign({ id: payload.id }, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
    return { accessToken, refreshToken };
  }

  /**
    Nghiệp vụ Đăng nhập tài khoản Local (Username/Password)
   */
  async login({ username, password }) {
    const user = await userRepository.findByUsernameOrEmail(username);

    if (!user) {
      throw new AppError(ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (!user.is_active) {
      throw new AppError(ERROR_CODES.ACCOUNT_LOCKED);
    }

    if (!user.password_hash) {
      throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 'Tài khoản này chỉ hỗ trợ đăng nhập qua Google');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError(ERROR_CODES.INVALID_CREDENTIALS);
    }

    const roles = await userRepository.getUserRoles(user.id);
    const permissions = await userRepository.getUserPermissions(user.id);

    const tokenPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.full_name,
      roles,
      permissions,
    };

    const tokens = this.generateTokens(tokenPayload);

    return {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        roles,
        permissions,
      },
      ...tokens,
    };
  }

  /**
    Nghiệp vụ Đăng nhập bằng Google OAuth 2.0
   */
  async loginWithGoogle(idToken) {
    let googlePayload;
    try {
      if (process.env.NODE_ENV === 'development' && idToken.startsWith('mock_token_')) {
        // Mock token dùng cho môi trường thử nghiệm Dev
        googlePayload = {
          sub: '109823471829374829102',
          email: 'admin.ankhang@gmail.com',
          name: 'Nguyễn Văn Chủ Quán',
        };
      } else {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        googlePayload = ticket.getPayload();
      }
    } catch (error) {
      throw new AppError(ERROR_CODES.GOOGLE_AUTH_FAILED, 'Token xác thực Google không hợp lệ');
    }

    const { sub: googleId, email, name: fullName } = googlePayload;

    // 1. Tìm xem user đã đăng ký bằng google_id chưa
    let user = await userRepository.findByGoogleId(googleId);

    // 2. Nếu chưa, tìm xem có user nào trùng Email không
    if (!user) {
      user = await userRepository.findByUsernameOrEmail(email);
      if (user) {
        // Cập nhật liên kết Google ID
        await userRepository.linkGoogleAccount(user.id, googleId);
      } else {
        // 3. Nếu chưa từng tồn tại, tạo mới User Google Auth
        user = await userRepository.createGoogleUser({ email, fullName, googleId });
      }
    }

    if (!user.is_active) {
      throw new AppError(ERROR_CODES.ACCOUNT_LOCKED);
    }

    const roles = await userRepository.getUserRoles(user.id);
    const permissions = await userRepository.getUserPermissions(user.id);

    const tokenPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.full_name,
      roles,
      permissions,
    };

    const tokens = this.generateTokens(tokenPayload);

    return {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        roles,
        permissions,
      },
      ...tokens,
    };
  }

  /**
    Nghiệp vụ Đổi mật khẩu
   */
  async changePassword(userId, { oldPassword, newPassword }) {
    const user = await userRepository.findByUsernameOrEmail(userId);
    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND);
    }

    if (user.password_hash) {
      const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isMatch) {
        throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 'Mật khẩu hiện tại không đúng');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await userRepository.updatePassword(userId, newPasswordHash);
  }

  /**
    Lấy thông tin tài khoản hiện tại từ Token
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND);
    }
    const roles = await userRepository.getUserRoles(userId);
    const permissions = await userRepository.getUserPermissions(userId);

    return {
      ...user,
      roles,
      permissions,
    };
  }
}

module.exports = new AuthService();
