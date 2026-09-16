module.exports = {
  // System Errors
  INTERNAL_SERVER_ERROR: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi hệ thống máy chủ', status: 500 },
  BAD_REQUEST: { code: 'BAD_REQUEST', message: 'Yêu cầu không hợp lệ', status: 400 },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Chưa xác thực hoặc token hết hạn', status: 401 },
  FORBIDDEN: { code: 'FORBIDDEN', message: 'Bạn không có quyền thực hiện thao tác này', status: 403 },
  NOT_FOUND: { code: 'NOT_FOUND', message: 'Tài nguyên không tồn tại', status: 404 },
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', message: 'Dữ liệu đầu vào không hợp lệ', status: 422 },

  // Auth Errors
  INVALID_CREDENTIALS: { code: 'INVALID_CREDENTIALS', message: 'Tên đăng nhập hoặc mật khẩu không đúng', status: 401 },
  ACCOUNT_LOCKED: { code: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa', status: 403 },
  EMAIL_EXISTED: { code: 'EMAIL_EXISTED', message: 'Email đã được sử dụng trong hệ thống', status: 400 },
  USER_NOT_FOUND: { code: 'USER_NOT_FOUND', message: 'Người dùng không tồn tại', status: 404 },
  GOOGLE_AUTH_FAILED: { code: 'GOOGLE_AUTH_FAILED', message: 'Xác thực Google OAuth thất bại', status: 401 },

  // Business Errors
  PRODUCT_NOT_FOUND: { code: 'PRODUCT_NOT_FOUND', message: 'Sản phẩm không tồn tại', status: 404 },
  INSUFFICIENT_STOCK: { code: 'INSUFFICIENT_STOCK', message: 'Tồn kho không đủ để thực hiện giao dịch', status: 400 },
  SHIFT_NOT_OPENED: { code: 'SHIFT_NOT_OPENED', message: 'Thu ngân chưa mở ca bán hàng', status: 400 },
  SHIFT_ALREADY_OPEN: { code: 'SHIFT_ALREADY_OPEN', message: 'Nhân viên đang có ca làm việc mở', status: 400 },
  DEBT_LIMIT_EXCEEDED: { code: 'DEBT_LIMIT_EXCEEDED', message: 'Vượt quá hạn mức nợ cho phép của khách hàng', status: 400 },
};
