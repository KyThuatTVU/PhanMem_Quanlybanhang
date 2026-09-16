const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/jwt');
const { AppError } = require('../utils/response.util');
const ERROR_CODES = require('../constants/error-codes');

/**
  Middleware xác thực JWT Access Token từ Header Authorization
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(ERROR_CODES.UNAUTHORIZED, 'Không tìm thấy Access Token xác thực'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // { id, email, username, roles, permissions }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError(ERROR_CODES.UNAUTHORIZED, 'Access Token đã hết hạn'));
    }
    return next(new AppError(ERROR_CODES.UNAUTHORIZED, 'Access Token không hợp lệ'));
  }
};

module.exports = authenticate;
