import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { employeeApi } from '../../api/employee.api';
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
  AlertCircle
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

  // 1. Danh sách Nhân viên Mặc Định Chuẩn Đơn Vị
  const defaultEmployeesList = [
    {
      id: 1,
      fullName: 'Hoàng Thục Linh',
      username: 'hoangthuclinh',
      role: 'OWNER',
      password: '123',
      phone: '0933 777 888',
      status: 'ACTIVE',
      salesThisMonth: 120500000,
      commission: 0,
      createdAt: '01/01/2026',
    },
    {
      id: 2,
      fullName: 'Trần Thị Lan',
      username: 'manager_lan',
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
      fullName: 'Lê Văn Minh',
      username: 'cashier_minh',
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
      fullName: 'Trần Thùy Loan',
      username: 'warehouse_loan',
      role: 'WAREHOUSE',
      password: '123',
      phone: '0903 334 455',
      status: 'ACTIVE',
      salesThisMonth: 0,
      commission: 0,
      createdAt: '10/02/2026',
    },
    {
      id: 5,
      fullName: 'Trần Thị Thu Ngân',
      username: 'thungan01',
      role: 'CASHIER',
      password: '123',
      phone: '0902 223 344',
      status: 'ACTIVE',
      salesThisMonth: 18500000,
      commission: 370000,
      createdAt: '15/02/2026',
    },
  ];

  // Hàm tự động chuẩn hóa & dọn dẹp dữ liệu nhân viên
  const sanitizeEmployeeCatalog = (list) => {
    if (!Array.isArray(list) || list.length === 0) return defaultEmployeesList;

    // Loại bỏ chủ quán cũ mâu thuẫn 'owner_ankhang' hoặc 'Nguyễn Văn Chủ Quán'
    let cleaned = list.filter((emp) => {
      if (emp.username === 'owner_ankhang' || (emp.fullName === 'Nguyễn Văn Chủ Quán' && emp.username !== 'hoangthuclinh')) {
        return false;
      }
      return true;
    });

    cleaned = cleaned.map((emp) => {
      let cleanUser = (emp.username || '').replace(/@/g, '').trim().toLowerCase();
      let cleanName = emp.fullName || '';
      let phone = emp.phone || '';

      if (cleanName.includes('Hoàng Thục Linh') || emp.role === 'OWNER') {
        if (!cleanUser || cleanUser === 'owner_ankhang' || cleanUser === 'warehouse_tuan') {
          cleanUser = 'hoangthuclinh';
        }
        if (!phone || phone === '—') phone = '0933 777 888';
      }

      return {
        ...emp,
        fullName: cleanName,
        username: cleanUser || `user_${emp.id}`,
        phone: phone || '',
      };
    });

    // Đảm bảo đủ các tài khoản nhân viên mặc định nếu mảng rỗng
    if (cleaned.length < 5) {
      defaultEmployeesList.forEach((def) => {
        const exists = cleaned.some(
          (c) =>
            (c.username && c.username.toLowerCase() === def.username.toLowerCase()) ||
            c.id === def.id
        );
        if (!exists) {
          cleaned.push(def);
        }
      });
    }

    return cleaned;
  };

  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem('employee_catalog');
      if (saved) {
        const parsed = JSON.parse(saved);
        return sanitizeEmployeeCatalog(parsed);
      }
    } catch {}
    return defaultEmployeesList;
  });

  // Tải danh sách Nhân viên trực tiếp từ MySQL CSDL và hợp nhất chuẩn hóa
  useEffect(() => {
    const fetchDbEmployees = async () => {
      try {
        const savedCatalog = (() => {
          try {
            const saved = localStorage.getItem('employee_catalog');
            return saved ? JSON.parse(saved) : [];
          } catch {
            return [];
          }
        })();

        const res = await employeeApi.getEmployees();
        if (res && (res.rows || Array.isArray(res))) {
          const rows = res.rows || res;
          if (rows.length > 0) {
            const mapped = rows.map((u) => {
              const uUser = (u.username || '').replace(/@/g, '').trim().toLowerCase();
              const savedEmp = savedCatalog.find(
                (s) => String(s.id) === String(u.id) || (s.username && s.username.toLowerCase() === uUser)
              );

              const isOwner = u.full_name?.includes('Hoàng Thục Linh') || (u.role_codes && u.role_codes.includes('ADMIN'));

              let fullName = savedEmp?.fullName || u.full_name || u.fullName || '';
              let username = savedEmp?.username || uUser;
              let phone = savedEmp?.phone || u.phone || '';
              let role = savedEmp?.role || (u.role_codes && u.role_codes.split(',')[0]) || u.role || 'CASHIER';

              if (isOwner && (!username || username === 'warehouse_tuan' || username === 'owner_ankhang')) {
                username = 'hoangthuclinh';
                if (!phone || phone === '—') phone = '0933 777 888';
              }

              return {
                id: u.id,
                fullName,
                username: (username || `emp_${u.id}`).replace(/@/g, ''),
                role,
                password: savedEmp?.password || '123',
                phone: phone || '',
                status: u.is_active === 0 ? 'LOCKED' : 'ACTIVE',
                salesThisMonth: savedEmp?.salesThisMonth || 0,
                commission: savedEmp?.commission || 0,
                createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : (savedEmp?.createdAt || '01/01/2026'),
              };
            });

            // Giữ lại các nhân viên từ savedCatalog nếu DB chưa có
            const dbIds = new Set(mapped.map((m) => String(m.id)));
            const dbUsernames = new Set(mapped.map((m) => m.username.toLowerCase()));
            const localOnly = savedCatalog.filter(
              (s) => !dbIds.has(String(s.id)) && (!s.username || !dbUsernames.has(s.username.toLowerCase()))
            );

            const combined = [...mapped, ...localOnly];
            const sanitizedCombined = sanitizeEmployeeCatalog(combined);
            setEmployees(sanitizedCombined);
            localStorage.setItem('employee_catalog', JSON.stringify(sanitizedCombined));
          }
        }
      } catch (e) {
        console.error('Không thể tải nhân viên từ CSDL:', e);
      }
    };
    fetchDbEmployees();
  }, []);

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
    { id: 'pos', name: 'Bán Hàng Máy POS (Bán Lẻ)', actions: { OWNER: true, MANAGER: true, CASHIER: true, WAREHOUSE: true } },
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

  // Form Thêm Nhân Viên (Họ tên, Username, Password, SĐT, Role)
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    role: 'CASHIER',
    password: '',
  });

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    const cleanUser = formData.username.trim().toLowerCase().replace(/@/g, '');

    if (employees.some((emp) => emp.username.toLowerCase() === cleanUser)) {
      alert('Tên đăng nhập (username) này đã tồn tại! Vui lòng chọn tên khác.');
      return;
    }

    const inputPassword = formData.password.trim() || '123';
    let realId = Date.now();

    try {
      // Lưu vào MySQL CSDL qua API backend trước
      const res = await employeeApi.createEmployee({
        username: cleanUser,
        password: inputPassword,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        roleCodes: [formData.role],
      });
      if (res && res.data && res.data.id) {
        realId = res.data.id;
      }
    } catch (err) {
      console.warn('Lỗi lưu nhân viên vào MySQL backend:', err.message);
    }

    const newEmp = {
      id: realId,
      fullName: formData.fullName.trim(),
      username: cleanUser,
      phone: formData.phone.trim(),
      role: formData.role,
      password: inputPassword,
      status: 'ACTIVE',
      salesThisMonth: 0,
      commission: 0,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    const updatedList = [newEmp, ...employees];
    setEmployees(updatedList);
    try {
      localStorage.setItem('employee_catalog', JSON.stringify(updatedList));
    } catch {}

    setIsAddModalOpen(false);

    setFormData({
      fullName: '',
      username: '',
      phone: '',
      role: 'CASHIER',
      password: '',
    });
  };

  // Form Sửa Nhân Viên (Sửa Họ tên, Username, SĐT, Role)
  const handleSaveEditEmployee = async (e) => {
    e.preventDefault();
    if (!editingEmp) return;

    const cleanUser = editingEmp.username.trim().toLowerCase().replace(/@/g, '');

    // Kiểm tra trùng username với nhân viên khác
    const isDuplicateUser = employees.some(
      (emp) => emp.id !== editingEmp.id && emp.username.toLowerCase() === cleanUser
    );

    if (isDuplicateUser) {
      alert('Tên đăng nhập (username) này đã trùng với nhân viên khác!');
      return;
    }

    const updatedList = employees.map((emp) =>
      emp.id === editingEmp.id
        ? {
            ...emp,
            fullName: editingEmp.fullName.trim(),
            username: cleanUser,
            phone: (editingEmp.phone || '').trim(),
            role: editingEmp.role,
          }
        : emp
    );

    setEmployees(updatedList);
    try {
      localStorage.setItem('employee_catalog', JSON.stringify(updatedList));
    } catch {}

    const targetEmp = { ...editingEmp };
    setEditingEmp(null);

    // Cập nhật vào MySQL CSDL qua API backend
    try {
      await employeeApi.updateEmployee(targetEmp.id, {
        username: cleanUser,
        fullName: targetEmp.fullName.trim(),
        phone: (targetEmp.phone || '').trim(),
        roleCodes: [targetEmp.role],
      });
    } catch (err) {
      console.warn('Lỗi cập nhật CSDL:', err.message);
    }
  };

  // Đặt lại mật khẩu
  const handleSaveResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPassEmp || !newPasswordInput.trim()) return;

    setEmployees(
      employees.map((emp) =>
        emp.id === resetPassEmp.id
          ? { ...emp, password: newPasswordInput.trim() }
          : emp
      )
    );
    const targetEmp = { ...resetPassEmp };
    const pass = newPasswordInput.trim();
    setResetPassEmp(null);
    setNewPasswordInput('');

    alert(`Đã cập nhật mật khẩu thành công cho tài khoản @${targetEmp.username}!`);

    // Đặt lại mật khẩu vào MySQL CSDL qua API backend
    await employeeApi.resetPassword(targetEmp.id, pass);
  };

  // Xóa nhân viên
  const handleConfirmDelete = async () => {
    if (!deleteEmp) return;
    if (deleteEmp.role === 'OWNER') {
      alert('Không thể xóa tài khoản Chủ Quán (OWNER)!');
      setDeleteEmp(null);
      return;
    }
    const targetId = deleteEmp.id;
    setEmployees(employees.filter((emp) => emp.id !== targetId));
    setDeleteEmp(null);

    // Xóa khỏi MySQL CSDL qua API backend
    await employeeApi.deleteEmployee(targetId);
  };

  // Khóa / Mở khóa nhân viên
  const handleToggleLock = async (id) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === id
          ? { ...emp, status: emp.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' }
          : emp
      )
    );

    // Cập nhật trạng thái vào MySQL CSDL qua API backend
    await employeeApi.toggleStatus(id);
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
            Tạo Tên Đăng Nhập, Cấp Mật Khẩu Đăng Nhập POS và phân quyền chức năng cho từng nhân viên
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
          1. Danh Sách Nhân Viên & Cài Đặt Mật Khẩu
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
                placeholder="Tìm theo họ tên, username hoặc số điện thoại..."
                value={keyword || ''}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-slate-100 border border-transparent focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              Tổng số tài khoản: <strong className="text-slate-800">{employees.length}</strong>
            </div>
          </div>

          <div className="soft-card p-0 overflow-hidden border border-slate-200/80 shadow-sm rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50/90 text-slate-600 font-extrabold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4 whitespace-nowrap">Họ & Tên</th>
                    <th className="p-4 whitespace-nowrap">Tên Đăng Nhập (Tên Login)</th>
                    <th className="p-4 whitespace-nowrap">Vai Trò (Role)</th>
                    <th className="p-4 whitespace-nowrap">Số Điện Thoại</th>
                    <th className="p-4 text-center whitespace-nowrap">Mật Khẩu Ca POS</th>
                    <th className="p-4 text-center whitespace-nowrap">Trạng Thái</th>
                    <th className="p-4 text-right whitespace-nowrap">Thao Tác Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees
                    .filter(
                      (e) =>
                        e.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
                        e.username.toLowerCase().includes(keyword.toLowerCase()) ||
                        (e.phone && e.phone.includes(keyword))
                    )
                    .map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/90 transition-colors">
                        <td className="p-4 font-extrabold text-slate-900 whitespace-nowrap">{emp.fullName}</td>
                        <td className="p-4 font-mono text-blue-700 font-bold whitespace-nowrap">
                          <span className="bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                            @{emp.username.replace(/^@+/, '')}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full font-extrabold text-[11px] whitespace-nowrap ${
                              emp.role === 'OWNER' || emp.role === 'ADMIN'
                                ? 'bg-amber-100 text-amber-800'
                                : emp.role === 'MANAGER'
                                ? 'bg-purple-100 text-purple-800'
                                : emp.role === 'CASHIER'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
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
                        <td className="p-4 text-slate-600 font-medium whitespace-nowrap">{emp.phone || '—'}</td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <span className="font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-bold border border-slate-200">
                            {emp.password || '123'}
                          </span>
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          {emp.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] rounded-full border border-emerald-200 whitespace-nowrap">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đang hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 font-extrabold text-[11px] rounded-full border border-rose-200 whitespace-nowrap">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" /> Đã khóa
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {/* Đổi Mật Khẩu */}
                            <button
                              onClick={() => {
                                setResetPassEmp(emp);
                                setNewPasswordInput(emp.password || '123');
                              }}
                              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 text-blue-600 border border-slate-200 hover:border-blue-200 flex items-center justify-center transition"
                              title="Đặt lại mật khẩu cho nhân viên"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {/* Sửa thông tin */}
                            <button
                              onClick={() => setEditingEmp({ ...emp })}
                              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-amber-50 text-amber-600 border border-slate-200 hover:border-amber-200 flex items-center justify-center transition"
                              title="Sửa tên login, họ tên, vai trò"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            {/* Khóa / Mở Khóa */}
                            {emp.role !== 'OWNER' && (
                              <button
                                onClick={() => handleToggleLock(emp.id)}
                                className={`w-8 h-8 rounded-full border flex items-center justify-center transition ${
                                  emp.status === 'ACTIVE'
                                    ? 'bg-slate-100 hover:bg-rose-50 text-rose-600 border-slate-200 hover:border-rose-200'
                                    : 'bg-slate-100 hover:bg-emerald-50 text-emerald-600 border-slate-200 hover:border-emerald-200'
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

                            {/* Xóa nhân viên */}
                            {emp.role !== 'OWNER' && (
                              <button
                                onClick={() => setDeleteEmp(emp)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 flex items-center justify-center transition"
                                title="Xóa tài khoản nhân viên"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
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
              className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-full font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Mặc định
            </button>
          </div>

          <div className="soft-card p-0 overflow-hidden border border-slate-200/80 shadow-sm rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
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
        </div>
      )}

      {/* Modal 1: Thêm Nhân Viên Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Thêm Nhân Viên & Cấp Tài Khoản POS
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Cấp Tên Đăng Nhập, Mật Khẩu ca POS và phân vai trò làm việc
            </p>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ & Tên Nhân Viên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName || ''}
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
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="VD: cashier_mai"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật Khẩu Máy POS *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="VD: 123"
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
                    value={formData.phone || ''}
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
                    value={formData.role || 'CASHIER'}
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

      {/* Modal 2: Sửa Nhân Viên & Username */}
      {editingEmp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-amber-600" />
              Chỉnh Sửa Thông Tin Nhân Viên
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Cập nhật Tên Đăng Nhập, Họ Tên, Số điện thoại và Vai trò cho nhân viên
            </p>

            <form onSubmit={handleSaveEditEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ & Tên Nhân Viên *
                </label>
                <input
                  type="text"
                  required
                  value={editingEmp.fullName || ''}
                  onChange={(e) => setEditingEmp({ ...editingEmp, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Đăng Nhập (Tên Login) *
                </label>
                <input
                  type="text"
                  required
                  value={editingEmp.username || ''}
                  onChange={(e) => setEditingEmp({ ...editingEmp, username: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
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
                    value={editingEmp.role || 'CASHIER'}
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
                  value={newPasswordInput || ''}
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
