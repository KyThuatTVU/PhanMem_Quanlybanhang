import apiClient from './apiClient';

export const employeeApi = {
  // Lấy danh sách nhân viên từ MySQL CSDL
  getEmployees: async (params) => {
    try {
      const response = await apiClient.get('/employees', { params });
      return response.data;
    } catch (err) {
      console.warn('API /employees chưa khả dụng, đọc từ CSDL offline storage:', err.message);
      return null;
    }
  },

  // Tạo nhân viên mới vào MySQL CSDL
  createEmployee: async (data) => {
    try {
      const response = await apiClient.post('/employees', data);
      return response.data;
    } catch (err) {
      console.warn('Không thể tạo nhân viên qua API CSDL:', err.message);
      return null;
    }
  },

  // Cập nhật nhân viên trong MySQL CSDL
  updateEmployee: async (id, data) => {
    try {
      const response = await apiClient.put(`/employees/${id}`, data);
      return response.data;
    } catch (err) {
      console.warn('Không thể cập nhật nhân viên qua API CSDL:', err.message);
      return null;
    }
  },

  // Đặt lại mật khẩu trong MySQL CSDL
  resetPassword: async (id, password) => {
    try {
      const response = await apiClient.patch(`/employees/${id}/reset-password`, { password });
      return response.data;
    } catch (err) {
      console.warn('Không thể đặt lại mật khẩu qua API CSDL:', err.message);
      return null;
    }
  },

  // Khóa / Mở khóa trạng thái trong MySQL CSDL
  toggleStatus: async (id) => {
    try {
      const response = await apiClient.patch(`/employees/${id}/toggle-status`);
      return response.data;
    } catch (err) {
      console.warn('Không thể đổi trạng thái tài khoản qua API CSDL:', err.message);
      return null;
    }
  },

  // Xóa nhân viên trong MySQL CSDL
  deleteEmployee: async (id) => {
    try {
      const response = await apiClient.delete(`/employees/${id}`);
      return response.data;
    } catch (err) {
      console.warn('Không thể xóa nhân viên qua API CSDL:', err.message);
      return null;
    }
  },
};
