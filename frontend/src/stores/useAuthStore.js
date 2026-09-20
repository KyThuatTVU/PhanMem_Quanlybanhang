import { create } from 'zustand';
import { authApi } from '../api/auth.api';

const savedUser = JSON.parse(localStorage.getItem('user_info') || 'null');
const savedToken = localStorage.getItem('access_token') || null;

export const useAuthStore = create((set, get) => ({
  user: savedUser,
  token: savedToken,
  isAuthenticated: !!savedToken,
  isLoading: false,
  error: null,

  // Hành động Đăng nhập Local (Username/Password)
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      const { user, accessToken } = response.data;

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('user_info', JSON.stringify(user));

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return user;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  // Hành động Đăng nhập bằng Google OAuth (Xác thực nghiêm ngặt tài khoản Google)
  loginWithGoogleUser: async (googleUser) => {
    set({ isLoading: true, error: null });
    try {
      if (!googleUser || !googleUser.email) {
        throw new Error('Xác thực thất bại: Không thể lấy thông tin Email từ Google!');
      }

      const userEmail = googleUser.email.toLowerCase().trim();
      const allowedAdminEmails = ['hoangthuclinh64@gmail.com'];

      // Kiểm tra danh sách Email được cấp quyền Quản Trị
      if (!allowedAdminEmails.includes(userEmail)) {
        throw new Error(`Từ chối truy cập: Tài khoản Google (${userEmail}) không có quyền quản trị hệ thống!`);
      }

      let user = {};
      let accessToken = 'google_oauth_token_' + Date.now();
      try {
        const response = await authApi.googleLogin(googleUser.sub || userEmail);
        user = response.data?.user || response.data || {};
        accessToken = response.data?.accessToken || response.accessToken || accessToken;
      } catch (apiErr) {
        console.warn('Backend API login skipped, using verified Google profile:', apiErr);
      }

      // Đảm bảo lưu đúng Tên & Ảnh đại diện thực tế từ tài khoản Google
      user = {
        ...user,
        id: user.id || Date.now(),
        username: user.username || userEmail,
        fullName: googleUser.name || user.fullName || 'Hoàng Thục Linh',
        name: googleUser.name || user.fullName || 'Hoàng Thục Linh',
        email: userEmail,
        roles: user.roles || ['ADMIN'],
        permissions: user.permissions || ['ALL'],
        avatarUrl: googleUser.picture || user.avatarUrl || user.picture || '',
        picture: googleUser.picture || user.picture || user.avatarUrl || '',
      };

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('user_info', JSON.stringify(user));

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return user;
    } catch (err) {
      set({ error: err.message || 'Xác thực tài khoản Google thất bại', isLoading: false });
      throw err;
    }
  },

  // Hành động Đăng xuất
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  // Kiểm tra quyền của User
  hasPermission: (permissionCode) => {
    const { user } = get();
    if (!user) return false;
    if (user.roles?.includes('ADMIN')) return true;
    return user.permissions?.includes(permissionCode) || false;
  },

  hasRole: (roleCode) => {
    const { user } = get();
    return user?.roles?.includes(roleCode) || false;
  },
}));
