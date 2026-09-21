import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: 'notif-default-1',
          type: 'STOCK_LOW',
          title: 'Cảnh báo tồn kho: Bánh snack khoai tây Ostar 65g sắp hết',
          message: 'Số lượng tồn kho hiện tại chỉ còn 18 gói (Mức tối thiểu: 50 gói).',
          time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          read: false,
          link: '/products',
          severity: 'warning',
        },
        {
          id: 'notif-default-2',
          type: 'DEBT_LIMIT',
          title: 'Cảnh báo nợ: Khách hàng Nguyễn Văn Tuấn',
          message: 'Tổng dư nợ đạt 2.150.000đ, đã vượt hạn mức nợ cho phép (2.000.000đ).',
          time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          read: false,
          link: '/debts',
          severity: 'danger',
        },
      ],

      // Danh sách các ID thông báo mà người dùng ĐÃ BẤM XÓA (để không tự động khôi phục)
      dismissedNotifIds: [],

      // Xóa 1 thông báo cụ thể theo ID
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          dismissedNotifIds: state.dismissedNotifIds.includes(id)
            ? state.dismissedNotifIds
            : [...state.dismissedNotifIds, id],
        }));
      },

      // Thêm thông báo mới
      addNotification: (notif) => {
        const newNotif = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          time: new Date().toISOString(),
          read: false,
          severity: 'warning',
          ...notif,
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
      },

      // Đánh dấu đã đọc 1 thông báo
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      // Đánh dấu tất cả đã đọc
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      // Xóa tất cả thông báo vĩnh viễn và đánh dấu tất cả ID hiện tại là đã bị xóa
      clearAll: () => {
        const currentIds = get().notifications.map((n) => n.id);
        set((state) => ({
          notifications: [],
          dismissedNotifIds: Array.from(new Set([...state.dismissedNotifIds, ...currentIds])),
        }));
      },

      // Đếm số thông báo chưa đọc
      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },

      // Tự động quét dữ liệu thực tế từ danh mục kho để phát cảnh báo thực (Chỉ tạo nếu chưa bị xóa)
      syncRealNotifications: () => {
        try {
          const storedCatalog = localStorage.getItem('product_catalog');
          if (storedCatalog) {
            const products = JSON.parse(storedCatalog);
            const state = get();
            const currentNotifs = state.notifications || [];
            const dismissed = state.dismissedNotifIds || [];

            products.forEach((p) => {
              if (p.stock <= p.minStock) {
                const notifId = `stock-alert-${p.id}`;
                const isExists = currentNotifs.some((n) => n.id === notifId);
                const isDismissed = dismissed.includes(notifId);

                // Chỉ thêm vào danh sách nếu thông báo này CHƯA TỒN TẠI và CHƯA BỊ NGƯỜI DÙNG XÓA
                if (!isExists && !isDismissed) {
                  const newStockNotif = {
                    id: notifId,
                    type: 'STOCK_LOW',
                    title: `Tồn kho sắp hết: ${p.name}`,
                    message: `Sản phẩm hiện còn ${p.stock} ${p.baseUnit} trong kho (Mức cảnh báo: ${p.minStock} ${p.baseUnit}).`,
                    time: new Date().toISOString(),
                    read: false,
                    link: '/products',
                    severity: 'warning',
                  };
                  set((s) => ({
                    notifications: [newStockNotif, ...s.notifications],
                  }));
                }
              }
            });
          }
        } catch (error) {
          console.error('Lỗi đồng bộ cảnh báo kho thực tế:', error);
        }
      },
    }),
    {
      name: 'app_notification_store', // Key lưu vĩnh viễn trong localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useNotificationStore;
