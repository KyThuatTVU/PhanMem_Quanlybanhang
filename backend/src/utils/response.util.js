/**
  Gửi Response thành công dạng JSON chuẩn hóa
 */
const sendSuccess = (res, data = null, message = 'Thao tác thành công', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
  Gửi Response dạng danh sách có phân trang chuẩn hóa
 */
const sendPaginated = (res, data = [], pagination = {}, message = 'Lấy dữ liệu thành công') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(pagination.page || 1, 10),
      limit: parseInt(pagination.limit || 20, 10),
      total: parseInt(pagination.total || 0, 10),
      totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 20)),
    },
  });
};

/**
  Tạo Custom Error Class dùng cho Service Layer
 */
class AppError extends Error {
  constructor(errorConstant, customMessage = null, details = null) {
    super(customMessage || errorConstant.message);
    this.statusCode = errorConstant.status || 500;
    this.errorCode = errorConstant.code || 'INTERNAL_SERVER_ERROR';
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  sendSuccess,
  sendPaginated,
  AppError,
};
