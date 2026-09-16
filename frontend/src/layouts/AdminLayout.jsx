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
import brandLogo from '../assets/images/logo.png';

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
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDF4] via-[#F4FAF6] to-[#EDF8F2] flex flex-col font-sans relative overflow-x-hidden">
      {/* Hiệu ứng hào quang nền xanh lá & bạc hà dịu nhẹ tạo chiều sâu xuyên thấu */}
      <div className="fixed -top-20 -left-20 w-96 h-96 bg-emerald-300/25 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '7s' }} />
      <div className="fixed top-28 left-60 w-80 h-80 bg-teal-200/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-10 right-10 w-96 h-96 bg-green-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/3 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. HEADER TRONG SUỐT NHÌN XUYÊN THẤU (GLASSMORPHIC NAVBAR) */}
      <header className="h-20 nav-glass fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 text-slate-700 hover:text-sky-600 rounded-2xl hover:bg-white/70 active:scale-95 transition backdrop-blur-sm shadow-sm border border-white/60"
            title="Đóng / Mở menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-3.5 hover:opacity-95 transition group">
            {/* Logo Thương Hiệu Phóng To Rõ Nét */}
            <div className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-md p-1.5 border-2 border-white/90 shadow-md shadow-sky-900/5 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition duration-200 ring-2 ring-sky-500/10">
              <img src={brandLogo} alt="Tạp Hóa An Khang Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-none tracking-tight">
                  Tạp Hóa An Khang
                </h1>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100/80" title="Hệ thống online" />
              </div>
              <span className="text-xs text-sky-600 font-extrabold tracking-wide mt-1 block">
                Hệ Thống Bán Lẻ POS & Quản Lý
              </span>
            </div>
          </Link>
        </div>

        {/* Thanh tìm kiếm nhanh dạng kính trong suốt lớn hơn */}
        <div className="hidden lg:flex items-center max-w-md xl:max-w-lg w-full relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4" />
          <input
            type="text"
            placeholder="Tìm nhanh hóa đơn, khách hàng, mã vạch (Ctrl + K)..."
            className="w-full bg-white/60 backdrop-blur-md border border-white/90 focus:border-sky-500 focus:bg-white/95 focus:ring-4 focus:ring-sky-200/50 rounded-2xl pl-12 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Khu vực thông báo & Tài khoản người dùng phóng to */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button className="p-2.5 text-slate-700 hover:text-sky-600 rounded-2xl hover:bg-white/70 relative transition backdrop-blur-sm border border-white/60 shadow-sm">
            <Bell className="w-6 h-6" />
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full absolute top-2.5 right-2.5 ring-2 ring-white" />
          </button>

          <div className="h-8 w-px bg-slate-300/60 hidden sm:block" />

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-3 text-right hover:opacity-90 transition hidden sm:flex bg-white/65 hover:bg-white/90 backdrop-blur-md p-2 pr-4 rounded-2xl border border-white/90 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-sky-500/20">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 leading-tight">
                  {user?.fullName || 'Nguyễn Văn Chủ Quán'}
                </p>
                <span className="inline-block px-2 py-0.5 bg-sky-100/90 text-sky-700 font-extrabold text-[10px] rounded-md tracking-wider mt-0.5">
                  {user?.roles?.[0] || 'ADMIN'}
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white/70 rounded-2xl transition backdrop-blur-sm border border-white/60 shadow-sm"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. SIDEBAR TRONG SUỐT NHÌN XUYÊN THẤU (GLASSMORPHIC SIDEBAR) */}
      <div className="flex pt-20 min-h-screen">
        <aside
          className={`fixed left-0 top-20 bottom-0 sidebar-glass transition-all duration-300 flex flex-col justify-between z-20 ${
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
                      ? 'bg-gradient-to-r from-sky-500/90 to-blue-600/95 text-white shadow-md shadow-sky-500/30 border border-white/40 backdrop-blur-md'
                      : item.highlight
                      ? 'bg-emerald-500/15 text-emerald-800 hover:bg-emerald-500/25 border border-emerald-400/30 backdrop-blur-sm'
                      : 'text-slate-600 hover:bg-white/60 hover:text-sky-700 backdrop-blur-sm'
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
            <div className="p-3.5 m-3 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/90 text-xs flex items-center gap-3.5 shadow-sm">
              <img src={brandLogo} alt="Logo" className="w-11 h-11 object-contain rounded-xl bg-white/90 p-1 border border-white shadow-sm shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-sky-800 font-extrabold truncate">
                  <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">Tạp Hóa An Khang</span>
                </div>
                <p className="text-slate-500 text-[11px] truncate">Phiên bản 1.0.0 • Glass Design</p>
              </div>
            </div>
          )}
        </aside>

        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 bg-transparent ${
            isSidebarOpen ? 'ml-64' : 'ml-20'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
