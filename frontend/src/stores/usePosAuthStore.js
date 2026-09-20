import { create } from 'zustand';

// Danh sách nhân viên mặc định do Admin cấu hình sẵn (nếu chưa có trong localStorage)
const defaultStaffList = [
  {
    id: 1,
    fullName: 'Hoàng Thục Linh',
    username: 'hoangthuclinh',
    password: '123',
    role: 'ADMIN',
    roleName: 'Chủ Cửa Hàng (Admin)',
    status: 'ACTIVE',
  },
  {
    id: 2,
    fullName: 'Trần Thị Lan',
    username: 'manager_lan',
    password: '123',
    role: 'MANAGER',
    roleName: 'Quản Lý Cửa Hàng',
    status: 'ACTIVE',
  },
  {
    id: 3,
    fullName: 'Lê Văn Minh',
    username: 'cashier_minh',
    password: '123',
    role: 'CASHIER',
    roleName: 'Thu Ngân Ca Sáng',
    status: 'ACTIVE',
  },
  {
    id: 4,
    fullName: 'Trần Thùy Loan',
    username: 'warehouse_loan',
    password: '123',
    role: 'WAREHOUSE',
    roleName: 'Thủ Kho',
    status: 'ACTIVE',
  },
  {
    id: 5,
    fullName: 'Trần Thị Thu Ngân',
    username: 'thungan01',
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
          username: e.username ? String(e.username).trim() : '',
          email: e.email || '',
          password: e.password || '123',
          role: e.role || (e.roleCodes && e.roleCodes[0]) || 'CASHIER',
          roleName:
            e.role === 'ADMIN' || e.role === 'OWNER'
              ? 'Chủ Quán / Admin'
              : e.role === 'MANAGER'
              ? 'Quản Lý'
              : e.role === 'WAREHOUSE'
              ? 'Thủ Kho'
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
    const rawInput = (username || '').trim();
    const cleanInput = rawInput.toLowerCase().replace(/[@_\-\s]/g, '');
    const cleanPass = (password || '').trim();

    if (!rawInput) {
      set({ isLoading: false, error: 'Vui lòng nhập tên đăng nhập nhân viên!' });
      throw new Error('Vui lòng nhập tên đăng nhập nhân viên!');
    }

    // 1. TÌM KHỚP CHÍNH XÁC THEO TÊN ĐĂNG NHẬP
    let staff = staffList.find((s) => {
      const sUser = (s.username || '').trim().toLowerCase();
      return sUser === rawInput.toLowerCase();
    });

    // 2. TÌM KHỚP THEO CHUỖI ĐÃ LÀM SẠCH KÝ TỰ ĐẶC BIỆT (@, _, -, khoảng trắng)
    if (!staff) {
      staff = staffList.find((s) => {
        const sUserClean = (s.username || '').toLowerCase().replace(/[@_\-\s]/g, '');
        return sUserClean === cleanInput;
      });
    }

    // 3. TÌM KHỚP THEO EMAIL
    if (!staff) {
      staff = staffList.find((s) => {
        return s.email && s.email.trim().toLowerCase().replace(/[@_\-\s]/g, '') === cleanInput;
      });
    }

    // 4. TÌM KHỚP THÔNG MINH THEO TỪ KHÓA TÊN NHÂN VIÊN / USERNAME (ví dụ "@loan123", "loan123", "loan" -> Trần Thùy Loan)
    if (!staff) {
      const coreKeyword = cleanInput.replace(/\d+/g, ''); // "loan123" -> "loan"
      if (coreKeyword && coreKeyword.length >= 2) {
        staff = staffList.find((s) => {
          const sUser = (s.username || '').toLowerCase();
          const sName = (s.fullName || '').toLowerCase();
          return sUser.includes(coreKeyword) || sName.includes(coreKeyword);
        });
      }
    }

    if (!staff) {
      set({ isLoading: false, error: 'Tên đăng nhập hoặc Email không tồn tại trong hệ thống!' });
      throw new Error('Tên đăng nhập hoặc Email không tồn tại trong hệ thống!');
    }

    const expectedPassword = staff.password || '123';
    if (cleanPass !== expectedPassword) {
      set({ isLoading: false, error: 'Mật khẩu ca làm việc không chính xác!' });
      throw new Error('Mật khẩu ca làm việc không chính xác!');
    }

    if (staff.status === 'LOCKED') {
      set({ isLoading: false, error: 'Tài khoản này đã bị Admin khóa quyền bán hàng!' });
      throw new Error('Tài khoản này đã bị Admin khóa quyền bán hàng!');
    }

    // Kiểm tra Ma Trận Phân Quyền (RBAC Matrix) do Admin thiết lập
    const staffRole = (staff.role || '').toUpperCase();
    let hasPosPermission = true;

    try {
      const savedMatrix = localStorage.getItem('rbac_matrix');
      if (savedMatrix) {
        const matrix = JSON.parse(savedMatrix);
        const posModule = matrix.find((m) => m.id === 'pos');
        if (posModule && posModule.actions && posModule.actions[staffRole] !== undefined) {
          hasPosPermission = !!posModule.actions[staffRole];
        }
      } else {
        const allowedRoles = ['ADMIN', 'OWNER', 'MANAGER', 'CASHIER'];
        hasPosPermission = allowedRoles.includes(staffRole);
      }
    } catch (e) {
      const allowedRoles = ['ADMIN', 'OWNER', 'MANAGER', 'CASHIER'];
      hasPosPermission = allowedRoles.includes(staffRole);
    }

    if (!hasPosPermission) {
      set({ isLoading: false, error: `Vai trò (${staffRole}) đã bị Admin rút quyền truy cập Máy POS!` });
      throw new Error(`Vai trò (${staffRole}) đã bị Admin rút quyền truy cập Máy POS!`);
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
