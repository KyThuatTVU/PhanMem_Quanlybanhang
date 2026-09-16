import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Truck,
  FileText,
  Users,
  Percent,
  UserCheck,
  CreditCard,
  BarChart3,
  Printer,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Store,
  ChevronRight,
} from 'lucide-react';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Danh mục menu điều hướng hệ thống
  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Bán Hàng POS', path: '/pos', icon: ShoppingCart, highlight: true },
    { title: 'Sản Phẩm', path: '/products', icon: Package, permission: 'PRODUCT_VIEW' },
    { title: 'Kho Hàng', path: '/inventory', icon: Boxes, permission: 'INVENTORY_VIEW' },
    { title: 'Nhà Cung Cấp', path: '/suppliers', icon: Truck },
    { title: 'Đơn Hàng', path: '/orders', icon: FileText },
    { title: 'Khách Hàng', path: '/customers', icon: Users },
    { title: 'Khuyến Mãi', path: '/promotions', icon: Percent },
    { title: 'Nhân Viên', path: '/employees', icon: UserCheck, role: 'ADMIN' },
    { title: 'Công Nợ', path: '/debts', icon: CreditCard, permission: 'DEBT_COLLECT' },
    { title: 'Báo Cáo', path: '/reports', icon: BarChart3, permission: 'REPORT_VIEW' },
    { title: 'Cấu Hình System', path: '/settings', icon: Settings, role: 'ADMIN' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      
      {/* 1. HEADER CỐ ĐỊNH PHÍA TRÊN */}
      <header className="h-16 bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm">
        
        {/* Logo & Toggle Sidebar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition hidden md:flex"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-glass-3d">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 leading-none">
                Tạp Hóa An Khang
              </h1>
              <span className="text-[10px] text-blue-600 font-semibold tracking-wide">
                Hệ Thống Bán Hàng POS
              </span>
            </div>
          </div>
        </div>

        {/* Thanh Tìm kiếm Nhanh */}
        <div className="hidden lg:flex items-center max-w-md w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            placeholder="Tìm nhanh hóa đơn, khách hàng, mã vạch (Ctrl + K)..."
            className="w-full bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition-all"
          />
        </div>

        {/* Thông báo & User Profile */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 relative transition">
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-2 right-2 animate-ping" />
            <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-2 right-2" />
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* User Badge */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {user?.fullName || 'Nhân viên'}
              </p>
              <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-md mt-0.5">
                {user?.roles?.[0] || 'CASHIER'}
              </span>
            </div>

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

      {/* 2. THÂN GIAO DIỆN (SIDEBAR + MAIN CONTENT) */}
      <div className="flex pt-16 min-h-screen">
        
        {/* LEFT SIDEBAR DESKTOP */}
        <aside
          className={`fixed left-0 top-16 bottom-0 bg-sidebar text-slate-300 z-20 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between hidden md:flex ${
            isSidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          {/* Navigation Links */}
          <div className="p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-glass-3d'
                      : item.highlight
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : ''}`} />
                  {isSidebarOpen && <span>{item.title}</span>}
                </Link>
              );
            })}
          </div>

          {/* Footer Sidebar */}
          {isSidebarOpen && (
            <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
              <p className="font-bold text-slate-400">POS Tạp Hóa v1.0.0</p>
              <p>MySQL 8.x + Express API</p>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT AREA */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
            isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
