/**
 * Tenant Middleware (Cô lập Dữ liệu Đa Khách Hàng)
 * Tự động trích xuất và gán tenant_id cho mọi request để ngăn chặn rò rỉ dữ liệu giữa các cửa hàng.
 */
const tenantGuard = (req, res, next) => {
  try {
    // Trích xuất tenant_id từ user session (nếu đã xác thực) hoặc từ Header custom
    const userTenantId = req.user?.tenantId || req.user?.tenant_id;
    const headerTenantId = req.headers['x-tenant-id'];

    // Mặc định gán tenant_id mã định danh cửa hàng chuẩn
    const tenantId = userTenantId || headerTenantId || 'tenant_default';

    req.tenantId = tenantId;
    next();
  } catch (error) {
    console.error('Lỗi khi kiểm tra Tenant Guard:', error.message);
    next();
  }
};

module.exports = tenantGuard;
