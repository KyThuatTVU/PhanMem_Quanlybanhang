const { AppError } = require('../utils/response.util');
const ERROR_CODES = require('../constants/error-codes');

/**
  Middleware kiểm tra vai trò người dùng (Role)
  @param  {...string} requiredRoles - Danh sách mã vai trò được phép (VD: 'ADMIN', 'MANAGER')
 */
const authorizeRoles = (...requiredRoles) => (req, res, next) => {
  if (!req.user || !req.user.roles) {
    return next(new AppError(ERROR_CODES.FORBIDDEN));
  }

  const hasRole = req.user.roles.some((role) => requiredRoles.includes(role));

  if (!hasRole) {
    return next(new AppError(ERROR_CODES.FORBIDDEN, `Yêu cầu vai trò: ${requiredRoles.join(', ')}`));
  }

  next();
};

/**
  Middleware kiểm tra quyền chi tiết (Permission)
  @param {string} requiredPermission - Mã quyền bắt buộc (VD: 'POS_SELL', 'PRODUCT_MANAGE')
 */
const authorizePermission = (requiredPermission) => (req, res, next) => {
  if (!req.user || !req.user.permissions) {
    return next(new AppError(ERROR_CODES.FORBIDDEN));
  }

  // Admin mặc định có toàn quyền
  if (req.user.roles && req.user.roles.includes('ADMIN')) {
    return next();
  }

  const hasPermission = req.user.permissions.includes(requiredPermission);

  if (!hasPermission) {
    return next(new AppError(ERROR_CODES.FORBIDDEN, `Yêu cầu quyền: ${requiredPermission}`));
  }

  next();
};

module.exports = {
  authorizeRoles,
  authorizePermission,
};
