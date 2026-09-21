const LicenseService = require('../services/license.service');

/**
 * License Guard Middleware
 * Chặn các truy cập API nếu Giấy phép bản quyền phần mềm bị hết hạn hoặc không hợp lệ.
 */
const licenseGuard = (req, res, next) => {
  // Cho phép bỏ qua kiểm tra trên các đường dẫn tĩnh hoặc kiểm tra sức khỏe
  if (req.path === '/health' || req.path.startsWith('/uploads')) {
    return next();
  }

  const result = LicenseService.verifyLicense();
  if (!result.valid) {
    return res.status(403).json({
      success: false,
      message: `Cảnh báo bản quyền: ${result.reason}`,
      errorCode: 'LICENSE_INVALID_OR_EXPIRED',
    });
  }

  req.license = result;
  next();
};

module.exports = licenseGuard;
