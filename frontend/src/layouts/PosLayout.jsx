import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { usePosAuthStore } from '../stores/usePosAuthStore';
import { useStoreSettings } from '../stores/useStoreSettings';
import brandLogo from '../assets/images/logo.png';
import {
  Monitor,
  Clock,
  UserCheck,
  Maximize2,
  Minimize2,
  Lock,
  LogOut,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Wifi
} from 'lucide-react';

export const PosLayout = () => {
  const navigate = useNavigate();
  const { cashier, logoutPos, terminalId } = usePosAuthStore();
  const { settings } = useStoreSettings();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Cập nhật đồng hồ thời gian thực mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Xử lý bật / tắt Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn kết thúc ca trực và đăng xuất khỏi máy POS?')) {
      logoutPos();
      navigate('/pos/login');
    }
  };

  const isManagement = cashier?.role === 'ADMIN' || cashier?.role === 'OWNER' || cashier?.role === 'MANAGER';

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F0F9F4] font-sans overflow-hidden select-none">
      {/* 1. THANH HEADER CHUYÊN DỤNG CHO TRẠM BÁN HÀNG POS */}
      <header className="h-14 sm:h-16 bg-white border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between shadow-sm shrink-0 z-30">
        {/* Khối Trái: Logo + Thông Tin Trạm Thu Ngân */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
              <img src={brandLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                  {settings.STORE_NAME || 'Tạp Hóa Vũ An'}
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" /> Sẵn sàng
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <span className="text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-black tracking-wide">
                  {terminalId || 'POS-01'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="hidden sm:inline text-slate-500">Trạm Thu Ngân Trực Tuyến</span>
              </div>
            </div>
          </div>
        </div>

        {/* Khối Giữa: Đồng Hồ Thời Gian Thực */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-slate-700 shadow-inner">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-black tracking-wider">
            {currentTime.toLocaleTimeString('vi-VN')}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] font-bold text-slate-500">
            {currentTime.toLocaleDateString('vi-VN', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Khối Phải: Thông Tin Thu Ngân & Thao Tác Nhanh */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Nút Về Trang Quản Trị (Chỉ hiển thị cho Admin / Quản lý) */}
          {isManagement && (
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-extrabold transition border border-slate-200"
              title="Quay lại trang quản trị cửa hàng"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
              <span>Về Admin</span>
            </Link>
          )}

          {/* Thông tin nhân viên trực ca */}
          <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/90 shadow-sm">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 text-white font-black text-xs flex items-center justify-center shadow-sm">
              {cashier?.fullName ? cashier.fullName.charAt(0).toUpperCase() : 'T'}
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 leading-tight truncate max-w-[120px] sm:max-w-[150px]">
                {cashier?.fullName || 'Thu Ngân'}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-[9.5px] font-extrabold text-blue-700 bg-blue-100/70 px-1 rounded">
                  {cashier?.role === 'ADMIN' || cashier?.role === 'OWNER'
                    ? 'Chủ Quán'
                    : cashier?.role === 'MANAGER'
                    ? 'Quản Lý'
                    : 'Thu Ngân'}
                </span>
              </div>
            </div>
          </div>

          {/* Nút Toàn Màn Hình */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Mở toàn màn hình (F11)'}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition border border-slate-200"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Nút Đăng Xuất Thu Ngân */}
          <button
            onClick={handleLogout}
            title="Kết thúc ca trực & Đăng xuất"
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-200/80 transition active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Đổi Ca</span>
          </button>
        </div>
      </header>

      {/* 2. KHU VỰC BÁN HÀNG CHÍNH TOÀN MÀN HÌNH */}
      <main className="flex-1 w-full max-w-full overflow-hidden p-2 sm:p-2.5">
        <Outlet />
      </main>
    </div>
  );
};
