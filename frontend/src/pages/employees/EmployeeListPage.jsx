import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import {
  UserCheck,
  Plus,
  Search,
  Lock,
  Unlock,
  Shield,
  CheckCircle2,
  XCircle,
  KeyRound,
  ShieldAlert,
  Award
} from 'lucide-react';

export const EmployeeListPage = () => {
  const [activeTab, setActiveTab] = useState('employees'); // 'employees' hoặc 'matrix'
  const [keyword, setKeyword] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [employees, setEmployees] = useState([
    {
      id: 1,
      fullName: 'Nguyễn Văn Chủ Quán',
      username: 'owner_ankhang',
      role: 'OWNER',
      phone: '0903 111 222',
      status: 'ACTIVE',
      salesThisMonth: 120500000,
      commission: 0,
      createdAt: '01/01/2026',
    },
    {
      id: 2,
      fullName: 'Trần Thị Quản Lý',
      username: 'manager_lan',
      role: 'MANAGER',
      phone: '0908 333 444',
      status: 'ACTIVE',
      salesThisMonth: 45000000,
      commission: 900000,
      createdAt: '15/01/2026',
    },
    {
      id: 3,
      fullName: 'Lê Văn Thu Ngân 1',
      username: 'cashier_minh',
      role: 'CASHIER',
      phone: '0912 555 666',
      status: 'ACTIVE',
      salesThisMonth: 28400000,
      commission: 568000,
      createdAt: '01/02/2026',
    },
    {
      id: 4,
      fullName: 'Phạm Văn Thủ Kho',
      username: 'warehouse_tuan',
      role: 'WAREHOUSE',
      phone: '0933 777 888',
      status: 'ACTIVE',
      salesThisMonth: 0,
      commission: 0,
      createdAt: '10/02/2026',
    },
  ]);

  // Form Thêm Nhân Viên
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    role: 'CASHIER',
    password: '',
  });

  const handleCreateEmployee = (e) => {
    e.preventDefault();
    const newEmp = {
      id: Date.now(),
      fullName: formData.fullName,
      username: formData.username,
      phone: formData.phone,
      role: formData.role,
      status: 'ACTIVE',
      salesThisMonth: 0,
      commission: 0,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    setEmployees([newEmp, ...employees]);
    setIsAddModalOpen(false);
    setFormData({
      fullName: '',
      username: '',
      phone: '',
      role: 'CASHIER',
      password: '',
    });
  };

  const handleToggleLock = (id) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === id
          ? { ...emp, status: emp.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' }
          : emp
      )
    );
  };

  // Ma Trận Phân Quyền RBAC theo Module x Action
  const modulesList = [
    { name: 'Dashboard', actions: { OWNER: true, MANAGER: true, CASHIER: false, WAREHOUSE: false } },
    { name: 'POS Bán Hàng', actions: { OWNER: true, MANAGER: true, CASHIER: true, WAREHOUSE: false } },
    { name: 'Sản Phẩm & Giá', actions: { OWNER: true, MANAGER: true, CASHIER: false, WAREHOUSE: false } },
    { name: 'Kho Hàng & Thẻ Kho', actions: { OWNER: true, MANAGER: true, CASHIER: false, WAREHOUSE: true } },
    { name: 'Nhập Hàng (PO)', actions: { OWNER: true, MANAGER: true, CASHIER: false, WAREHOUSE: true } },
    { name: 'Hủy Hóa Đơn Bán', actions: { OWNER: true, MANAGER: true, CASHIER: false, WAREHOUSE: false } },
    { name: 'Trả Hàng Khách', actions: { OWNER: true, MANAGER: true, CASHIER: true, WAREHOUSE: false } },
    { name: 'Sổ Công Nợ', actions: { OWNER: true, MANAGER: true, CASHIER: false, WAREHOUSE: false } },
    { name: 'Báo Cáo Doanh Thu', actions: { OWNER: true, MANAGER: true, CASHIER: false, WAREHOUSE: false } },
    { name: 'Cài Đặt Hệ Thống', actions: { OWNER: true, MANAGER: false, CASHIER: false, WAREHOUSE: false } },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            Nhân Viên & Phân Quyền (RBAC)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Quản lý tài khoản đăng nhập, khóa tài khoản, chỉ tiêu doanh số và ma trận phân quyền
          </p>
        </div>

        <Button
          variant="3d-solid"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Thêm Nhân Viên Mới
        </Button>
      </div>

      {/* 2. Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'employees'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          1. Danh Sách Nhân Viên & KPI
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'matrix'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          2. Ma Trận Phân Quyền (RBAC Matrix)
        </button>
      </div>

      {/* Tab 1: Danh Sách Nhân Viên */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="soft-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-96 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Tìm theo họ tên, username hoặc số điện thoại..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-slate-100 border border-transparent focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="soft-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Họ & Tên</th>
                    <th className="p-4">Tài Khoản (Username)</th>
                    <th className="p-4">Vai Trò (Role)</th>
                    <th className="p-4">Số Điện Thoại</th>
                    <th className="p-4 text-right">Doanh Số Tháng</th>
                    <th className="p-4 text-right">Hoa Hồng</th>
                    <th className="p-4 text-center">Trạng Thái</th>
                    <th className="p-4 text-right">Khóa / Mở Khóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees
                    .filter(
                      (e) =>
                        e.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
                        e.username.toLowerCase().includes(keyword.toLowerCase())
                    )
                    .map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-bold text-slate-900">{emp.fullName}</td>
                        <td className="p-4 font-mono text-blue-700 font-semibold">
                          @{emp.username}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                              emp.role === 'OWNER'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : emp.role === 'MANAGER'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : emp.role === 'CASHIER'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {emp.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{emp.phone}</td>
                        <td className="p-4 text-right font-black text-slate-900">
                          {emp.salesThisMonth.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-4 text-right font-bold text-emerald-600">
                          {emp.commission.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-4 text-center">
                          {emp.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Đang hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 font-bold text-[10px] rounded-md border border-rose-200">
                              <XCircle className="w-3 h-3" /> Đã khóa
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {emp.role !== 'OWNER' && (
                            <button
                              onClick={() => handleToggleLock(emp.id)}
                              className={`p-1.5 rounded-lg transition ${
                                emp.status === 'ACTIVE'
                                  ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-rose-600 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={emp.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                              {emp.status === 'ACTIVE' ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Ma Trận Phân Quyền RBAC */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="soft-card p-4 bg-blue-50/50 border-blue-200 text-blue-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>
                <strong>Hệ thống phân quyền 4 cấp độ (RBAC):</strong> Quyền hạn được kiểm soát độc lập tại cả giao diện Frontend và Middleware kiểm tra ở tầng Backend API.
              </span>
            </div>
            <span className="font-bold text-[11px] bg-blue-600 text-white px-2 py-1 rounded-lg">
              3NF Secure
            </span>
          </div>

          <div className="soft-card p-0 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Module Nghiệp Vụ</th>
                  <th className="p-4 text-center">Chủ Quán (OWNER)</th>
                  <th className="p-4 text-center">Quản Lý (MANAGER)</th>
                  <th className="p-4 text-center">Thu Ngân (CASHIER)</th>
                  <th className="p-4 text-center">Thủ Kho (WAREHOUSE)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {modulesList.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-800">{m.name}</td>
                    <td className="p-4 text-center">
                      <span className="inline-block w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black leading-5 text-center text-xs">
                        ✓
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {m.actions.MANAGER ? (
                        <span className="inline-block w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black leading-5 text-center text-xs">
                          ✓
                        </span>
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {m.actions.CASHIER ? (
                        <span className="inline-block w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black leading-5 text-center text-xs">
                          ✓
                        </span>
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {m.actions.WAREHOUSE ? (
                        <span className="inline-block w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black leading-5 text-center text-xs">
                          ✓
                        </span>
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Thêm Nhân Viên */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Thêm Nhân Viên & Cấp Tài Khoản
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Khởi tạo tài khoản đăng nhập ca làm và gán vai trò quyền hạn
            </p>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ & Tên Nhân Viên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="VD: Trần Thị Mai"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên Đăng Nhập *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="cashier_mai"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật Khẩu Khởi Tạo *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số Điện Thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="09xx xxx xxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vai Trò (Role)
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="CASHIER">Thu Ngân (CASHIER)</option>
                    <option value="WAREHOUSE">Thủ Kho (WAREHOUSE)</option>
                    <option value="MANAGER">Quản Lý (MANAGER)</option>
                    <option value="OWNER">Chủ Quán (OWNER)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="3d-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Hủy Bỏ
                </Button>
                <Button type="submit" variant="3d-solid">
                  Tạo Tài Khoản
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
