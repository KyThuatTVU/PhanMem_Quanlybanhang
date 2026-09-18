const { AppError } = require('../utils/response.util');
const logger = require('../utils/logger.util');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Lỗi máy chủ nội bộ';
  let details = err.details || null;

  // Log lỗi hệ thống ra console/file
  if (statusCode >= 500) {
    logger.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, err);
  } else {
    logger.warn(`[Client Error ${statusCode}] ${req.method} ${req.originalUrl}: ${message}`);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    details,
    ...(process.env.NODE_ENV === 'development' && process.env.EXPOSE_ERROR_STACK === 'true' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
