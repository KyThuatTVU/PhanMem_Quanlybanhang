import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useStoreSettings } from '../stores/useStoreSettings';
import apiClient from '../api/apiClient';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
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
  Menu,
  X,
  Store,
  Barcode,
  Cpu,
  User,
  Sparkles,
  WalletCards,
  ShieldAlert,
  Clock
} from 'lucide-react';
import brandLogo from '../assets/images/logo.png';

import { useDataSync } from '../hooks/useDataSync';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { settings, setSettings } = useStoreSettings();
  const { showWarning, remainingSeconds, resetTimer } = useInactivityLogout(180000, 30000);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });

  const fetchStoreSettings = React.useCallback(() => {
    apiClient.get('/settings').then((response) => {
      if (response.data) setSettings(response.data);
    }).catch(() => {});
  }, [setSettings]);

  useDataSync(['settings'], fetchStoreSettings);

  React.useEffect(() => {
    fetchStoreSettings();
  }, [fetchStoreSettings]);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuSections = [
    {
      label: 'Bán Hàng & Thu Ngân',
      items: [
        { title: 'Tổng Quan (Dashboard)', path: '/dashboard', icon: LayoutDashboard },
        { title: 'Thống Kê Cửa Hàng', path: '/statistics', icon: BarChart3 },
        { title: 'Hóa Đơn Bán Hàng', path: '/orders', icon: FileText },
        { title: 'Khách Trả Hàng', path: '/returns', icon: RotateCcw },
      ],
    },
    {
      label: 'Máy Bán Hàng',
      items: [
        {
          title: 'Bán Hàng POS',
          path: '/pos/login',
          icon: ShoppingCart,
          highlight: true,
          openNewTab: true,
        },
      ],
    },
    {
      label: 'Hàng Hóa & Kho Bãi',
      items: [
        { title: 'Danh Mục Hàng Hóa', path: '/products', icon: Package },
        { title: 'Mã Vạch & In Tem', path: '/barcodes', icon: Barcode },
        { title: 'Ngành Hàng & Hiệu', path: '/categories', icon: Layers },
        { title: 'Kho Hàng & Thẻ Kho', path: '/inventory', icon: Boxes },
      ],
    },
    {
      label: 'Nhập Hàng & Đối Tác',
      items: [
        { title: 'Nhập Hàng (PO)', path: '/purchases', icon: FileInput },
        { title: 'Nhà Cung Cấp', path: '/suppliers', icon: Truck },
        { title: 'Khách Hàng', path: '/customers', icon: Users },
        { title: 'Sổ Nợ (Công Nợ)', path: '/debts', icon: CreditCard },
      ],
    },
    {
      label: 'Tài Chính & Thu Chi',
      items: [
        { title: 'Sổ Thu Chi Trong Ngày', path: '/cashbook', icon: WalletCards, highlight: true },
      ],
    },
    {
      label: 'Kinh Doanh & Báo Cáo',
      items: [
        { title: 'Khuyến Mãi & Giảm Giá', path: '/promotions', icon: Percent },
        { title: 'Báo Cáo Doanh Thu', path: '/reports', icon: BarChart3 },
      ],
    },
    {
      label: 'Quản Trị & Cấu Hình',
      items: [
        { title: 'Nhân Viên & Quyền', path: '/employees', icon: UserCheck, role: 'ADMIN' },
        { title: 'Cấu Hình Thiết Bị', path: '/devices', icon: Cpu },
        { title: 'Cài Đặt Cửa Hàng', path: '/settings', icon: Settings, role: 'ADMIN' },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDF4] via-[#F4FAF6] to-[#EDF8F2] flex flex-col font-sans relative overflow-x-hidden">
      {/* Hiệu ứng hào quang nền xanh lá & bạc hà dịu nhẹ tạo chiều sâu */}
      <div className="fixed -top-20 -left-20 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '7s' }} />
      <div className="fixed top-28 left-60 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-10 right-10 w-96 h-96 bg-green-200/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/3 w-80 h-80 bg-emerald-200/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. HEADER MÀU TRẮNG TINH KHÔI NỔI BẬT KHỎI NỀN TRANG (WHITE NAVBAR) */}
      <header className="h-20 topbar-glass fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 text-slate-700 hover:text-sky-600 rounded-full bg-white hover:bg-slate-100 active:scale-95 transition shadow-sm border border-slate-200"
            title="Đóng / Mở menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-3.5 hover:opacity-95 transition group">
            {/* Logo Thương Hiệu Phóng To Rõ Nét */}
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition duration-200 ring-2 ring-sky-500/10">
              <img src={brandLogo} alt={`${settings.STORE_NAME} Logo`} className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-none tracking-tight">
                  {settings.STORE_NAME}
                </h1>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100/80" title="Hệ thống online" />
              </div>
              <span className="text-xs text-sky-600 font-extrabold tracking-wide mt-1 block">
                Hệ Thống Bán Lẻ POS & Quản Lý
              </span>
            </div>
          </Link>
        </div>

        {/* Tên hệ thống ở trung tâm header */}
        <div className="hidden lg:flex flex-1 justify-center text-center">
          <div>
            <h2 className="text-base font-bold font-sans text-slate-900 leading-tight tracking-normal">
              KORA Retail
            </h2>
            <p className="text-[11px] text-sky-600 font-semibold font-sans tracking-normal mt-0.5">
              Hệ thống quản lý bán hàng & kho
            </p>
          </div>
        </div>

        {/* Khu vực thông báo & Tài khoản người dùng */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button className="p-2.5 text-slate-700 hover:text-sky-600 rounded-full bg-white hover:bg-slate-100 relative transition border border-slate-200 shadow-sm">
            <Bell className="w-6 h-6" />
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full absolute top-2.5 right-2.5 ring-2 ring-white" />
          </button>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-3 text-right hover:opacity-90 transition hidden sm:flex bg-slate-50 hover:bg-slate-100 p-2 pr-4 rounded-full border border-slate-200 shadow-sm"
            >
              {user?.avatarUrl || user?.picture ? (
                <img
                  src={user.avatarUrl || user.picture}
                  alt={user?.fullName || user?.name || 'Avatar'}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-md shadow-sky-500/10 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
                  {(user?.fullName || user?.name) ? (user.fullName || user.name).charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div>
                <p className="text-sm font-black text-slate-800 leading-tight">
                  {user?.fullName || user?.name || 'Hoàng Thục Linh'}
                </p>
                <span className="inline-block px-2 py-0.5 bg-sky-100 text-sky-700 font-extrabold text-[10px] rounded-md tracking-wider mt-0.5">
                  {user?.roles?.[0] || 'ADMIN'}
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-2.5 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-2xl transition border border-slate-200 shadow-sm"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. SIDEBAR MÀU TRẮNG PHÂN CHIA THEO TỪNG MỤC (WHITE CATEGORIZED SIDEBAR) */}
      <div className="flex pt-20 min-h-screen">
        <aside
          className={`fixed left-0 top-20 bottom-0 sidebar-glass transition-all duration-300 flex flex-col justify-between z-20 ${
            isSidebarOpen ? 'w-[270px]' : 'w-20'
          } ${isSidebarOpen ? 'sidebar-open' : ''}`}
        >
          {/* Danh sách các nhóm chức năng */}
          <div className="p-3 overflow-y-auto flex-1 space-y-3 custom-sidebar-scrollbar">
            {menuSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {/* Tiêu đề phân mục */}
                {isSidebarOpen ? (
                  <div className="px-3 pt-2 pb-1 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                    <span className="truncate">{section.label}</span>
                  </div>
                ) : (
                  sIdx > 0 && <div className="h-px bg-slate-200 my-2 mx-2" />
                )}

                {/* Các mục con trong phân mục */}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        target={item.openNewTab ? '_blank' : undefined}
                        rel={item.openNewTab ? 'noopener noreferrer' : undefined}
                        title={!isSidebarOpen ? item.title : undefined}
                        onClick={() => {
                          if (window.innerWidth < 768) setIsSidebarOpen(false);
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-bold transition-all duration-150 ${
                          isActive
                            ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                            : item.highlight
                            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 font-extrabold shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-sky-700'
                        } ${!isSidebarOpen ? 'justify-center px-2' : ''}`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isActive
                              ? 'text-white'
                              : item.highlight
                              ? 'text-emerald-600'
                              : 'text-slate-400 group-hover:text-sky-600'
                          }`}
                        />
                        {isSidebarOpen && (
                          <div className="flex items-center justify-between flex-1 min-w-0 gap-1.5">
                            <span className="truncate leading-tight" title={item.title}>{item.title}</span>
                            {item.openNewTab && (
                              <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-md font-black shrink-0 tracking-tight shadow-sm">
                                TAB MỚI ↗
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer thương hiệu ở chân sidebar */}
          {isSidebarOpen && (
            <div className="p-3 m-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-3 shadow-sm shrink-0">
              <img src={brandLogo} alt="Logo" className="w-10 h-10 object-contain rounded-xl bg-white p-1 border border-slate-200 shadow-sm shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-slate-800 font-extrabold truncate">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate">{settings.STORE_NAME}</span>
                </div>
                <p className="text-slate-400 text-[10.5px] truncate">Hệ Thống Quản Lý POS</p>
              </div>
            </div>
          )}
        </aside>

        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setIsSidebarOpen(false)}
            className="mobile-sidebar-backdrop fixed inset-0 top-20 z-10 bg-slate-900/20 backdrop-blur-[2px]"
          />
        )}

        <main
          className={`app-main transition-all duration-300 bg-transparent min-w-0 w-full ml-0 ${
            location.pathname === '/pos' ? 'p-2 sm:p-3 pb-2' : 'p-3 sm:p-6 lg:p-8'
          } ${
            isSidebarOpen
              ? 'md:ml-[270px] md:w-[calc(100%-270px)] md:max-w-[calc(100%-270px)]'
              : 'md:ml-20 md:w-[calc(100%-5rem)] md:max-w-[calc(100%-5rem)]'
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* Modal Cảnh Báo Tự Động Đăng Xuất Bảo Mật 3 Phút */}
      {showWarning && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Phiên Đăng Nhập Sắp Hết Hạn!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bạn không có thao tác nào trong 2.5 phút vừa qua. Để đảm bảo an toàn bảo mật cho cửa hàng, hệ thống sẽ tự động đăng xuất sau:
              </p>
            </div>

            <div className="py-3 bg-amber-50 rounded-2xl border border-amber-200/70 inline-flex items-center justify-center gap-2 w-full">
              <Clock className="w-5 h-5 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="font-mono text-2xl font-black text-amber-700">
                {remainingSeconds}s
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={resetTimer}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-full shadow-lg shadow-sky-500/25 transition active:scale-95 cursor-pointer"
              >
                Tôi Vẫn Đang Làm Việc (Ở Lại)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
