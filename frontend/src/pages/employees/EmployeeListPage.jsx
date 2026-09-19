import React, { useState, useEffect } from 'react';
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
  Pencil,
  Trash2,
  RotateCcw,
  AlertCircle,
  Mail,
  User,
  Phone
} from 'lucide-react';

export const EmployeeListPage = () => {
  const [activeTab, setActiveTab] = useState('employees'); // 'employees' hoặc 'matrix'
  const [keyword, setKeyword] = useState('');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [resetPassEmp, setResetPassEmp] = useState(null);
  const [deleteEmp, setDeleteEmp] = useState(null);
  
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // 1. Danh sách Nhân viên
  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem('employee_catalog');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 1,
        fullName: 'Nguyễn Văn Chủ Quán',
        username: 'owner_ankhang',
        email: 'owner@ankhang.com',
        role: 'OWNER',
        password: '123',
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
        email: 'manager.lan@gmail.com',
        role: 'MANAGER',
        password: '123',
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
        email: 'cashier.minh@gmail.com',
        role: 'CASHIER',
        password: '123',
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
        email: 'warehouse.tuan@gmail.com',
        role: 'WAREHOUSE',
        password: '123',
        phone: '0933 777 888',
        status: 'ACTIVE',
        salesThisMonth: 0,
        commission: 0,
        createdAt: '10/02/2026',
      },
    ];
  });

  // Đồng bộ danh sách nhân viên vào localStorage cho máy POS
  useEffect(() => {
    try {
      localStorage.setItem('employee_catalog', JSON.stringify(employees));
    } catch (e) {
      console.error('Không thể lưu danh mục nhân viên:', e);
    }
  }, [employees]);

  // 2. Ma trận phân quyền RBAC
  const defaultMatrix = [
    { id: 'dashboard', name: 'Tổng Quan & Thống Kê (Dashboard)', actions: { OWNER: true, MANAGER: true, CASHIER: false, WAREHOUSE: false } },
    { id: 'pos', name: 'Bán Hàng Máy POS (Bán Lẻ)', actions: { OWNER: true, MANAGER: true, CASHIER: true, WAREHOUSE: false } },
    { id: 'products', name: 'Danh Mục Sản Phẩm & Giá Bán', actions: { OWNER: true, MANAGER: true, CASHIER: false, WAREHOUSE: false } },
    { id: 'inventory', name: 'Kho Hàng, Thẻ Kho & Kiểm Kê', actions: { OWNER: true, MANAGER: true, CASHIER: false, WAREHOUSE: true } },
    { id: 'purchases', name: 'Nhập Hàng (PO) & Nhà Cung Cấp', actions: { OWNER: true, MANAGER: true, CASHIER: false, WAREHOUSE: true } },
    { id: 'orders', name: 'Quản Lý & Hủy Hóa Đơn', actions: { OWNER: true, MANAGER: true, CASHIER: false, WAREHOUSE: false } },
    { id: 'returns', name: 'Khách Trả Hàng', actions: { OWNER: true, MANAGER: true, CASHIER: true, WAREHOUSE: false } },
    { id: 'debts', name: 'Sổ Nợ (Công Nợ Khách & NCC)', actions: { OWNER: true, MANAGER: true, CASHIER: false, WAREHOUSE: false } },
    { id: 'cashbook', name: 'Sổ Thu Chi Trong Ngày', actions: { OWNER: true, MANAGER: true, CASHIER: true, WAREHOUSE: false } },
    { id: 'reports', name: 'Báo Cáo Doanh Thu & Lợi Nhuận', actions: { OWNER: true, MANAGER: true, CASHIER: false, WAREHOUSE: false } },
    { id: 'settings', name: 'Cài Đặt Cửa Hàng & Cấu Hình', actions: { OWNER: true, MANAGER: false, CASHIER: false, WAREHOUSE: false } },
  ];

  const [modulesList, setModulesList] = useState(() => {
    try {
      const saved = localStorage.getItem('rbac_matrix');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultMatrix;
  });

  // Lưu ma trận phân quyền khi Admin thay đổi
  const handleTogglePermission = (moduleId, role) => {
    if (role === 'OWNER') return; // OWNER luôn có toàn quyền
    const updated = modulesList.map((m) => {
      if (m.id === moduleId) {
        return {
          ...m,
          actions: {
            ...m.actions,
            [role]: !m.actions[role],
          },
        };
      }
      return m;
    });
    setModulesList(updated);
    try {
      localStorage.setItem('rbac_matrix', JSON.stringify(updated));
    } catch (e) {
      console.error('Lỗi lưu ma trận phân quyền:', e);
    }
  };

  // Form Thêm Nhân Viên
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    role: 'CASHIER',
    password: '',
  });

  const handleCreateEmployee = (e) => {
    e.preventDefault();
    const cleanUser = formData.username.trim().toLowerCase();
    const cleanEmail = formData.email.trim().toLowerCase();

    if (employees.some((emp) => emp.username.toLowerCase() === cleanUser)) {
      alert('Tên đăng nhập (username) này đã tồn tại! Vui lòng chọn tên đăng nhập khác.');
      return;
    }

    const newEmp = {
      id: Date.now(),
      fullName: formData.fullName.trim(),
      username: cleanUser,
      email: cleanEmail,
      phone: formData.phone.trim(),
      role: formData.role,
      password: formData.password.trim() || '123',
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
      email: '',
      phone: '',
      role: 'CASHIER',
      password: '',
    });
  };

  // Form Sửa Nhân Viên (Cho phép sửa Username & Email & Họ tên & SĐT & Role)
  const handleSaveEditEmployee = (e) => {
    e.preventDefault();
    if (!editingEmp) return;

    const cleanUser = editingEmp.username.trim().toLowerCase();
    const cleanEmail = (editingEmp.email || '').trim().toLowerCase();

    // Kiểm tra xem username có bị trùng với nhân viên khác không
    const isDuplicateUser = employees.some(
      (emp) => emp.id !== editingEmp.id && emp.username.toLowerCase() === cleanUser
    );

    if (isDuplicateUser) {
      alert('Tên đăng nhập (username) này đã trùng với nhân viên khác!');
      return;
    }

    setEmployees(
      employees.map((emp) =>
        emp.id === editingEmp.id
          ? {
              ...emp,
              fullName: editingEmp.fullName.trim(),
              username: cleanUser,
              email: cleanEmail,
              phone: (editingEmp.phone || '').trim(),
              role: editingEmp.role,
            }
          : emp
      )
    );
    setEditingEmp(null);
  };

  // Đặt lại mật khẩu
  const handleSaveResetPassword = (e) => {
    e.preventDefault();
    if (!resetPassEmp || !newPasswordInput.trim()) return;

    setEmployees(
      employees.map((emp) =>
        emp.id === resetPassEmp.id
          ? { ...emp, password: newPasswordInput.trim() }
          : emp
      )
    );
    alert(`Đã cập nhật mật khẩu thành công cho tài khoản @${resetPassEmp.username}!`);
    setResetPassEmp(null);
    setNewPasswordInput('');
  };

  // Xóa nhân viên
  const handleConfirmDelete = () => {
    if (!deleteEmp) return;
    if (deleteEmp.role === 'OWNER') {
      alert('Không thể xóa tài khoản Chủ Quán (OWNER)!');
      setDeleteEmp(null);
      return;
    }
    setEmployees(employees.filter((emp) => emp.id !== deleteEmp.id));
    setDeleteEmp(null);
  };

  // Khóa / Mở khóa nhân viên
  const handleToggleLock = (id) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === id
          ? { ...emp, status: emp.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' }
          : emp
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            Nhân Viên & Ma Trận Phân Quyền (RBAC)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Tùy chỉnh Tên Đăng Nhập, Email, Cấp Mật Khẩu Đăng Nhập POS và phân quyền từng vai trò
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
          1. Danh Sách Nhân Viên & Cài Đặt Tài Khoản
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'matrix'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          2. Ma Trận Phân Quyền Động (RBAC Matrix)
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
                placeholder="Tìm theo tên đăng nhập, email, họ tên, số điện thoại..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-slate-100 border border-transparent focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              Tổng số tài khoản: <strong className="text-slate-800">{employees.length}</strong>
            </div>
          </div>

          <div className="soft-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Họ & Tên</th>
                    <th className="p-4">Tên Đăng Nhập (Tên Login)</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Vai Trò (Role)</th>
                    <th className="p-4">Số Điện Thoại</th>
                    <th className="p-4 text-center">Mật Khẩu Ca POS</th>
                    <th className="p-4 text-center">Trạng Thái</th>
                    <th className="p-4 text-right">Thao Tác Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees
                    .filter(
                      (e) =>
                        e.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
                        e.username.toLowerCase().includes(keyword.toLowerCase()) ||
                        (e.email && e.email.toLowerCase().includes(keyword.toLowerCase())) ||
                        (e.phone && e.phone.includes(keyword))
                    )
                    .map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-extrabold text-slate-900">{emp.fullName}</td>
                        <td className="p-4 font-mono text-blue-700 font-bold">
                          @{emp.username}
                        </td>
                        <td className="p-4 text-slate-600 font-medium">
                          {emp.email ? (
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{emp.email}</span>
                            </span>
                          ) : (
                            <span className="text-slate-300 font-semibold">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                              emp.role === 'OWNER' || emp.role === 'ADMIN'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : emp.role === 'MANAGER'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : emp.role === 'CASHIER'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {emp.role === 'OWNER' || emp.role === 'ADMIN'
                              ? 'Chủ Quán (Admin)'
                              : emp.role === 'MANAGER'
                              ? 'Quản Lý'
                              : emp.role === 'CASHIER'
                              ? 'Thu Ngân'
                              : 'Thủ Kho'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 font-medium">{emp.phone || '—'}</td>
                        <td className="p-4 text-center">
                          <span className="font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-800 font-bold border border-slate-200/80">
                            {emp.password || '123'}
                          </span>
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
                        <td className="p-4 text-right space-x-1.5">
                          {/* Đổi Mật Khẩu */}
                          <button
                            onClick={() => {
                              setResetPassEmp(emp);
                              setNewPasswordInput(emp.password || '123');
                            }}
                            className="btn-3d-icon-view"
                            title="Đặt lại mật khẩu cho nhân viên"
                          >
                            <KeyRound className="w-4 h-4 text-blue-600" />
                          </button>

                          {/* Sửa thông tin & Email */}
                          <button
                            onClick={() => setEditingEmp({ ...emp })}
                            className="btn-3d-icon-edit"
                            title="Sửa tên login, email, họ tên, vai trò"
                          >
                            <Pencil className="w-4 h-4 text-amber-600" />
                          </button>

                          {/* Khóa / Mở Khóa */}
                          {emp.role !== 'OWNER' && (
                            <button
                              onClick={() => handleToggleLock(emp.id)}
                              className={emp.status === 'ACTIVE' ? 'btn-3d-icon-delete' : 'btn-3d-icon-edit'}
                              title={emp.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                              {emp.status === 'ACTIVE' ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* Xóa nhân viên */}
                          {emp.role !== 'OWNER' && (
                            <button
                              onClick={() => setDeleteEmp(emp)}
                              className="btn-3d-icon-delete"
                              title="Xóa tài khoản nhân viên"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600" />
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
          <div className="soft-card p-4 bg-blue-50/70 border-blue-200 text-blue-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-blue-600 shrink-0" />
              <span>
                <strong>Tùy chỉnh ma trận phân quyền linh hoạt:</strong> Bật/Tắt trực tiếp quyền truy cập của từng Vai trò nhân viên. Dữ liệu áp dụng tức thì cho cả Admin và Cổng máy POS!
              </span>
            </div>
            <button
              onClick={() => {
                setModulesList(defaultMatrix);
                localStorage.setItem('rbac_matrix', JSON.stringify(defaultMatrix));
                alert('Đã khôi phục ma trận phân quyền mặc định!');
              }}
              className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Mặc định
            </button>
          </div>

          <div className="soft-card p-0 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Chức Năng Module Nghiệp Vụ</th>
                  <th className="p-4 text-center">Chủ Quán (OWNER)</th>
                  <th className="p-4 text-center">Quản Lý (MANAGER)</th>
                  <th className="p-4 text-center">Thu Ngân (CASHIER)</th>
                  <th className="p-4 text-center">Thủ Kho (WAREHOUSE)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {modulesList.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-extrabold text-slate-800">{m.name}</td>
                    
                    {/* OWNER Always True */}
                    <td className="p-4 text-center">
                      <span className="inline-block w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-black leading-6 text-center text-xs">
                        ✓
                      </span>
                    </td>

                    {/* MANAGER Toggle */}
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={!!m.actions.MANAGER}
                        onChange={() => handleTogglePermission(m.id, 'MANAGER')}
                        className="w-5 h-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* CASHIER Toggle */}
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={!!m.actions.CASHIER}
                        onChange={() => handleTogglePermission(m.id, 'CASHIER')}
                        className="w-5 h-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* WAREHOUSE Toggle */}
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={!!m.actions.WAREHOUSE}
                        onChange={() => handleTogglePermission(m.id, 'WAREHOUSE')}
                        className="w-5 h-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Thêm Nhân Viên Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Thêm Nhân Viên & Cấp Tên Đăng Nhập / Email
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Khởi tạo thông tin nhân viên, cài đặt tên đăng nhập (login) và email cá nhân
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
                    Tên Đăng Nhập (Tên Login) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="VD: cashier_mai"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Cá Nhân
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="VD: mai.tran@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật Khẩu Máy POS *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="123..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

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
                    <option value="MANAGER">Quản Lý (MANAGER)</option>
                    <option value="WAREHOUSE">Thủ Kho (WAREHOUSE)</option>
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

      {/* Modal 2: Sửa Nhân Viên & Email & Username */}
      {editingEmp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-amber-600" />
              Chỉnh Sửa Thông Tin & Email Nhân Viên
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Cập nhật Tên Đăng Nhập, Email, Họ Tên và Vai trò cho nhân viên
            </p>

            <form onSubmit={handleSaveEditEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ & Tên Nhân Viên *
                </label>
                <input
                  type="text"
                  required
                  value={editingEmp.fullName}
                  onChange={(e) => setEditingEmp({ ...editingEmp, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên Đăng Nhập (Tên Login) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEmp.username}
                    onChange={(e) => setEditingEmp({ ...editingEmp, username: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Cá Nhân
                  </label>
                  <input
                    type="email"
                    value={editingEmp.email || ''}
                    onChange={(e) => setEditingEmp({ ...editingEmp, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
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
                    value={editingEmp.phone || ''}
                    onChange={(e) => setEditingEmp({ ...editingEmp, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vai Trò (Role)
                  </label>
                  <select
                    value={editingEmp.role}
                    onChange={(e) => setEditingEmp({ ...editingEmp, role: e.target.value })}
                    disabled={editingEmp.role === 'OWNER'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500 disabled:opacity-60"
                  >
                    <option value="CASHIER">Thu Ngân (CASHIER)</option>
                    <option value="MANAGER">Quản Lý (MANAGER)</option>
                    <option value="WAREHOUSE">Thủ Kho (WAREHOUSE)</option>
                    <option value="OWNER">Chủ Quán (OWNER)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="3d-secondary"
                  onClick={() => setEditingEmp(null)}
                >
                  Hủy Bỏ
                </Button>
                <Button type="submit" variant="3d-solid">
                  Lưu Thay Đổi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Đặt Lại Mật Khẩu */}
      {resetPassEmp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              Cấp Mật Khẩu Đăng Nhập POS
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Đặt lại mật khẩu mới cho nhân viên <strong className="text-slate-800">{resetPassEmp.fullName}</strong> (@{resetPassEmp.username})
            </p>

            <form onSubmit={handleSaveResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật Khẩu Mới *
                </label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  * Mật khẩu này được nhân viên dùng để đăng nhập vào trạm POS.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="3d-secondary"
                  onClick={() => setResetPassEmp(null)}
                >
                  Hủy Bỏ
                </Button>
                <Button type="submit" variant="3d-solid">
                  Cập Nhật Mật Khẩu
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Xóa Nhân Viên */}
      {deleteEmp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mb-1">
              Xóa Tài Khoản Nhân Viên?
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Bạn có chắc chắn muốn xóa tài khoản <strong className="text-slate-800">{deleteEmp.fullName}</strong> (@{deleteEmp.username}) khỏi hệ thống?
            </p>

            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="3d-secondary"
                onClick={() => setDeleteEmp(null)}
              >
                Hủy Bỏ
              </Button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Đồng Ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
