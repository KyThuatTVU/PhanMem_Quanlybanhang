const auditLogRepository = require('../repositories/audit-log.repository');

/**
 * Audit Logger Middleware (Ghi Vết Gian Lận & Thao Tác Nhạy Cảm)
 * Tự động ghi vết các thao tác POST / PUT / PATCH / DELETE nhạy cảm vào CSDL Audit Logs.
 */
const auditLogger = (actionType = 'SYSTEM_ACTION') => {
  return async (req, res, next) => {
    // Chỉ ghi vết các thao tác thay đổi dữ liệu (POST, PUT, PATCH, DELETE)
    const method = req.method.toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return next();
    }

    const originalEnd = res.end;
    const startTime = Date.now();

    res.end = function (...args) {
      originalEnd.apply(res, args);

      // Chỉ ghi log nếu request xử lý thành công (Mã HTTP 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
          const userId = req.user?.id || 1; // Mặc định ID Admin nếu chưa xác thực

          const logPayload = {
            userId,
            action: `${actionType}_${method}`,
            resource: req.originalUrl,
            ipAddress: String(clientIp).split(',')[0].trim(),
            userAgent: req.headers['user-agent'] || 'Unknown',
            executionTimeMs: Date.now() - startTime,
            details: JSON.stringify({
              body: req.body ? { ...req.body, password: '[PROTECTED]' } : {},
              query: req.query || {},
            }),
          };

          // Ghi vết bất đồng bộ để không ảnh hưởng tốc độ phản hồi API
          auditLogRepository.createLog(logPayload).catch((err) => {
            console.warn('Không thể lưu Audit Log:', err.message);
          });
        } catch (e) {
          console.error('Lỗi khi ghi vết thao tác:', e.message);
        }
      }
    };

    next();
  };
};

module.exports = auditLogger;
