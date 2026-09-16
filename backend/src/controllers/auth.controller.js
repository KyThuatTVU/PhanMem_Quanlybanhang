const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response.util');

class AuthController {
  /**
    [POST] /api/v1/auth/login - Đăng nhập tài khoản Local
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, result, 'Đăng nhập thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
    [POST] /api/v1/auth/google - Đăng nhập Google OAuth2
   */
  async googleLogin(req, res, next) {
    try {
      const { idToken } = req.body;
      const result = await authService.loginWithGoogle(idToken);
      return sendSuccess(res, result, 'Đăng nhập Google thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
    [GET] /api/v1/auth/me - Lấy thông tin người dùng từ Token
   */
  async getProfile(req, res, next) {
    try {
      const result = await authService.getProfile(req.user.id);
      return sendSuccess(res, result, 'Lấy thông tin người dùng thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
    [PUT] /api/v1/auth/change-password - Đổi mật khẩu
   */
  async changePassword(req, res, next) {
    try {
      await authService.changePassword(req.user.id, req.body);
      return sendSuccess(res, null, 'Đổi mật khẩu thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
    [POST] /api/v1/auth/logout - Đăng xuất
   */
  async logout(req, res, next) {
    try {
      return sendSuccess(res, null, 'Đăng xuất thành công');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
