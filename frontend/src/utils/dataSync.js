/**
 * System Data Event Bus (Đồng Bộ Dữ Liệu Thời Gian Thực Giữa Các Component & Tab Trình Duyệt)
 * Tự động làm tươi dữ liệu tức thì mà không cần ấn F5.
 */

const SYNC_EVENT_NAME = 'app_data_sync_event';
const STORAGE_SIGNAL_KEY = 'app_data_sync_signal';

/**
 * Phát tín hiệu thay đổi dữ liệu cho toàn bộ ứng dụng & các Tab khác
 * @param {string|string[]} entityNames - Tên phân hệ dữ liệu (vd: 'products', 'orders', 'employees', 'settings', 'cashbook', 'categories')
 */
export const notifyDataChanged = (entityNames) => {
  const entities = Array.isArray(entityNames) ? entityNames : [entityNames];
  const payload = { entities, timestamp: Date.now() };

  // 1. Phát event trong cùng Tab
  try {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: payload }));
  } catch (e) {
    console.warn('Lỗi khi phát event đồng bộ nội bộ:', e);
  }

  // 2. Phát signal sang các Tab trình duyệt khác qua localStorage
  try {
    localStorage.setItem(STORAGE_SIGNAL_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Lỗi khi phát signal đồng bộ cross-tab:', e);
  }
};

/**
 * Đăng ký lắng nghe tín hiệu thay đổi dữ liệu
 * @param {string|string[]} targetEntities - Phân hệ cần theo dõi (vd: 'products' hoặc ['products', 'categories'])
 * @param {Function} callback - Hàm thực thi làm tươi dữ liệu
 * @returns {Function} Hàm hủy đăng ký
 */
export const subscribeDataSync = (targetEntities, callback) => {
  const targets = (Array.isArray(targetEntities) ? targetEntities : [targetEntities]).map((e) =>
    String(e).toLowerCase()
  );

  const shouldTrigger = (entities) => {
    if (!entities || !Array.isArray(entities)) return true;
    return entities.some((e) => targets.includes(String(e).toLowerCase()) || targets.includes('*'));
  };

  // 1. Xử lý event cùng Tab
  const handleLocalSync = (event) => {
    if (event.detail && shouldTrigger(event.detail.entities)) {
      callback();
    }
  };

  // 2. Xử lý signal cross-tab từ Storage event
  const handleStorageSync = (event) => {
    if (event.key === STORAGE_SIGNAL_KEY && event.newValue) {
      try {
        const payload = JSON.parse(event.newValue);
        if (shouldTrigger(payload.entities)) {
          callback();
        }
      } catch (e) {
        callback();
      }
    }
  };

  // 3. Xử lý khi quay lại Tab trình duyệt (Tab Focus / Visibility Change)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      callback();
    }
  };

  window.addEventListener(SYNC_EVENT_NAME, handleLocalSync);
  window.addEventListener('storage', handleStorageSync);
  window.addEventListener('focus', callback);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Tra về hàm dọn dẹp
  return () => {
    window.removeEventListener(SYNC_EVENT_NAME, handleLocalSync);
    window.removeEventListener('storage', handleStorageSync);
    window.removeEventListener('focus', callback);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};
