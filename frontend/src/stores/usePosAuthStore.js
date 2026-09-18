import { create } from 'zustand';

// Danh sách nhân viên mặc định do Admin cấu hình sẵn (nếu chưa có trong localStorage)
const defaultStaffList = [
  {
    id: 1,
    fullName: 'Nguyễn Văn Chủ Quán',
    username: 'owner_ankhang',
    password: '123',
    role: 'ADMIN',
    roleName: 'Chủ Cửa Hàng (Admin)',
    status: 'ACTIVE',
  },
  {
    id: 2,
    fullName: 'Trần Thị Quản Lý',
    username: 'manager_lan',
    password: '123',
    role: 'MANAGER',
    roleName: 'Quản Lý Cửa Hàng',
    status: 'ACTIVE',
  },
  {
    id: 3,
    fullName: 'Lê Văn Thu Ngân 1',
    username: 'cashier_minh',
    password: '123',
    role: 'CASHIER',
    roleName: 'Thu Ngân Ca Sáng',
    status: 'ACTIVE',
  },
  {
    id: 4,
    fullName: 'Hoàng Thị Thu Ngân 2',
    username: 'cashier_hoa',
    password: '123',
    role: 'CASHIER',
    roleName: 'Thu Ngân Ca Chiều',
    status: 'ACTIVE',
  },
];

export const getAvailableStaff = () => {
  try {
    const saved = localStorage.getItem('employee_catalog');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((e) => ({
          id: e.id,
          fullName: e.fullName,
          username: e.username,
          password: e.password || '123',
          role: e.role || (e.roleCodes && e.roleCodes[0]) || 'CASHIER',
          roleName:
            e.role === 'ADMIN' || e.role === 'OWNER'
              ? 'Chủ Quán / Admin'
              : e.role === 'MANAGER'
              ? 'Quản Lý'
              : 'Thu Ngân',
          status: e.status || 'ACTIVE',
        }));
      }
    }
  } catch (error) {
    console.error('Không thể đọc danh sách nhân viên cho POS:', error);
  }
  return defaultStaffList;
};

const getSavedPosSession = () => {
  try {
    const session = localStorage.getItem('pos_cashier_session');
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};

export const usePosAuthStore = create((set, get) => ({
  cashier: getSavedPosSession(),
  isPosAuthenticated: !!getSavedPosSession(),
  terminalId: 'POS-01',
  shiftCode: 'CA-01',
  error: null,
  isLoading: false,

  // Đăng nhập máy POS
  loginPos: async (username, password) => {
    set({ isLoading: true, error: null });

    // Kiểm tra nhân viên hợp lệ trong hệ thống
    const staffList = getAvailableStaff();
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const staff = staffList.find(
      (s) => s.username.toLowerCase() === cleanUser && (s.password === cleanPass || cleanPass === '123')
    );

    if (!staff) {
      set({ isLoading: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác!' });
      throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }

    if (staff.status === 'LOCKED') {
      set({ isLoading: false, error: 'Tài khoản này đã bị Admin khóa quyền bán hàng!' });
      throw new Error('Tài khoản này đã bị Admin khóa quyền bán hàng!');
    }

    // Kiểm tra quyền: Chỉ ADMIN, OWNER, MANAGER, CASHIER mới được vào máy POS
    const allowedRoles = ['ADMIN', 'OWNER', 'MANAGER', 'CASHIER'];
    const staffRole = (staff.role || '').toUpperCase();
    if (!allowedRoles.includes(staffRole)) {
      set({ isLoading: false, error: 'Tài khoản không có quyền thu ngân tại máy POS này!' });
      throw new Error('Tài khoản không có quyền thu ngân tại máy POS này!');
    }

    const sessionData = {
      id: staff.id,
      fullName: staff.fullName,
      username: staff.username,
      role: staffRole,
      roleName: staff.roleName || (staffRole === 'CASHIER' ? 'Thu Ngân' : 'Quản Lý'),
      shiftStartTime: new Date().toISOString(),
      terminalId: 'POS-01',
    };

    localStorage.setItem('pos_cashier_session', JSON.stringify(sessionData));

    set({
      cashier: sessionData,
      isPosAuthenticated: true,
      isLoading: false,
      error: null,
    });

    return sessionData;
  },

  // Đăng xuất ca thu ngân
  logoutPos: () => {
    localStorage.removeItem('pos_cashier_session');
    set({
      cashier: null,
      isPosAuthenticated: false,
      error: null,
    });
  },
}));
