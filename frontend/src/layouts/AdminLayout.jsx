import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Boxes,
  Truck,
  FileInput,
  FileText,
  RotateCcw,
  Users,
  Percent,
  UserCheck,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Store,
  Barcode,
  Cpu,
  User,
  Sparkles
} from 'lucide-react';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Bán Hàng POS', path: '/pos', icon: ShoppingCart, highlight: true },
    { title: 'Sản Phẩm', path: '/products', icon: Package },
    { title: 'Mã Vạch & Tem', path: '/barcodes', icon: Barcode },
    { title: 'Danh Mục & Hiệu', path: '/categories', icon: Layers },
    { title: 'Kho Hàng & Thẻ Kho', path: '/inventory', icon: Boxes },
    { title: 'Nhà Cung Cấp', path: '/suppliers', icon: Truck },
    { title: 'Nhập Hàng (PO)', path: '/purchases', icon: FileInput },
    { title: 'Hóa Đơn Bán', path: '/orders', icon: FileText },
    { title: 'Khách Trả Hàng', path: '/returns', icon: RotateCcw },
    { title: 'Khách Hàng', path: '/customers', icon: Users },
    { title: 'Sổ Công Nợ', path: '/debts', icon: CreditCard },
    { title: 'Khuyến Mãi', path: '/promotions', icon: Percent },
    { title: 'Nhân Viên & Quyền', path: '/employees', icon: UserCheck, role: 'ADMIN' },
    { title: 'Báo Cáo Doanh Thu', path: '/reports', icon: BarChart3 },
    { title: 'Cấu Hình Thiết Bị', path: '/devices', icon: Cpu },
    { title: 'Cài Đặt Cửa Hàng', path: '/settings', icon: Settings, role: 'ADMIN' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* 1. HEADER XANH TRẮNG HIỆN ĐẠI */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-500 hover:text-sky-600 rounded-xl hover:bg-sky-50 transition"
            title="Đóng / Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center font-extrabold shadow-md shadow-sky-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold text-slate-900 leading-none">
                  Tạp Hóa An Khang
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Hệ thống online" />
              </div>
              <span className="text-[10px] text-sky-600 font-bold tracking-wide">
                Hệ Thống Bán Lẻ POS & Quản Lý
              </span>
            </div>
          </div>
        </div>

        {/* Thanh tìm kiếm nhanh */}
        <div className="hidden lg:flex items-center max-w-md w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            placeholder="Tìm nhanh hóa đơn, khách hàng, mã vạch (Ctrl + K)..."
            className="w-full bg-slate-50 border border-slate-200/80 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>

        {/* Khu vực thông báo & Tài khoản người dùng */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:text-sky-600 rounded-xl hover:bg-sky-50 relative transition">
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-2 right-2 ring-2 ring-white" />
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <Link
              to="/profile"
              className="flex items-center gap-2 text-right hover:opacity-85 transition hidden sm:flex bg-slate-50 hover:bg-sky-50/70 p-1.5 pr-3 rounded-xl border border-slate-200/80"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.fullName || 'Nhân viên'}
                </p>
                <span className="inline-block px-1.5 py-0.2 bg-sky-100 text-sky-700 font-bold text-[9px] rounded">
                  {user?.roles?.[0] || 'CASHIER'}
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. SIDEBAR TRẮNG SÁNG & KHÔNG GIAN NỘI DUNG */}
      <div className="flex pt-16 min-h-screen">
        <aside
          className={`fixed left-0 top-16 bottom-0 bg-white border-r border-slate-200/80 transition-all duration-300 flex flex-col justify-between z-20 ${
            isSidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          <div className="p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                      : item.highlight
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80'
                      : 'text-slate-600 hover:bg-sky-50/80 hover:text-sky-700'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'
                    }`}
                  />
                  {isSidebarOpen && <span className="truncate">{item.title}</span>}
                </Link>
              );
            })}
          </div>

          {isSidebarOpen && (
            <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/50 border border-sky-100/80 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 text-sky-800 font-extrabold">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Tạp Hóa An Khang</span>
              </div>
              <p className="text-slate-500 text-[10px]">Phiên bản 1.0.0 • Xanh Sáng & Trắng</p>
            </div>
          )}
        </aside>

        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 bg-[#F8FAFC] ${
            isSidebarOpen ? 'ml-64' : 'ml-20'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
