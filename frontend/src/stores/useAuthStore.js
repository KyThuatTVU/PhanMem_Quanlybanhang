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

  // Hành động Đăng nhập bằng Google OAuth
  loginWithGoogle: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.googleLogin(idToken);
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
