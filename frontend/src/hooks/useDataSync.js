import { useEffect } from 'react';
import { subscribeDataSync } from '../utils/dataSync';

/**
 * Custom React Hook tự động lắng nghe và làm tươi dữ liệu tức thì mà không cần ấn F5
 * @param {string|string[]} entityNames - Tên phân hệ theo dõi (vd: 'products', 'orders', 'employees', 'settings')
 * @param {Function} refetchFn - Hàm tải lại dữ liệu của Component
 */
export const useDataSync = (entityNames, refetchFn) => {
  useEffect(() => {
    if (typeof refetchFn !== 'function') return;

    // Đăng ký nhận tín hiệu biến động dữ liệu
    const unsubscribe = subscribeDataSync(entityNames, () => {
      refetchFn();
    });

    return () => {
      unsubscribe();
    };
  }, [entityNames, refetchFn]);
};
