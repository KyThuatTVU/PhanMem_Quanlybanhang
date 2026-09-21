import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Package,
  CreditCard,
  ShoppingCart,
  ShieldCheck,
  CheckCheck,
  Trash2,
  X,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useNotificationStore } from '../../stores/useNotificationStore';

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'STOCK' | 'DEBT' | 'ORDER' | 'SECURITY'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
    syncRealNotifications,
  } = useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Quét và cập nhật thông báo kho thực tế khi mount
  useEffect(() => {
    syncRealNotifications();
  }, [syncRealNotifications]);

  // Đóng dropdown khi click bên ngoài trên desktop
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'STOCK') return n.type === 'STOCK_LOW';
    if (filter === 'DEBT') return n.type === 'DEBT_LIMIT';
    if (filter === 'ORDER') return n.type === 'ORDER_NEW';
    if (filter === 'SECURITY') return n.type === 'SECURITY' || n.type === 'LICENSE';
    return true;
  });

  const get3DIconStyle = (severity, type) => {
    switch (type) {
      case 'STOCK_LOW':
        return {
          bg: 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white shadow-amber-500/35 border-amber-300/60',
          dot: 'bg-amber-500 ring-4 ring-amber-100',
        };
      case 'DEBT_LIMIT':
        return {
          bg: 'bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 text-white shadow-rose-500/35 border-rose-300/60',
          dot: 'bg-rose-500 ring-4 ring-rose-100',
        };
      case 'ORDER_NEW':
        return {
          bg: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white shadow-emerald-500/35 border-emerald-300/60',
          dot: 'bg-emerald-500 ring-4 ring-emerald-100',
        };
      case 'SECURITY':
      case 'LICENSE':
        return {
          bg: 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white shadow-blue-500/35 border-sky-300/60',
          dot: 'bg-sky-500 ring-4 ring-sky-100',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-500 to-slate-700 text-white shadow-slate-500/30 border-slate-300/60',
          dot: 'bg-slate-500 ring-4 ring-slate-100',
        };
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'STOCK_LOW':
        return <Package className="w-5 h-5 drop-shadow-sm" />;
      case 'DEBT_LIMIT':
        return <CreditCard className="w-5 h-5 drop-shadow-sm" />;
      case 'ORDER_NEW':
        return <ShoppingCart className="w-5 h-5 drop-shadow-sm" />;
      case 'SECURITY':
      case 'LICENSE':
        return <ShieldCheck className="w-5 h-5 drop-shadow-sm" />;
      default:
        return <AlertTriangle className="w-5 h-5 drop-shadow-sm" />;
    }
  };

  const formatRelativeTime = (timeStr) => {
    const diffMs = Date.now() - new Date(timeStr).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return new Date(timeStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Chuông Thông Báo 3D Nổi Bật */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-full relative transition-all duration-200 border shadow-sm active:scale-95 cursor-pointer ${
          isOpen
            ? 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white border-sky-400 shadow-md shadow-sky-500/30'
            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
        }`}
        title="Trung tâm thông báo & cảnh báo"
      >
        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
        {unreadCount > 0 && (
          <span className="min-w-[20px] h-5 px-1 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black rounded-full absolute -top-1 -right-1 flex items-center justify-center ring-2 ring-white animate-pulse shadow-md shadow-rose-900/30 border border-white/40">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop mờ màn hình cho thiết bị Di Động / Smartphone */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel Dropdown Trung Tâm Thông Báo - Tối Ưu Đáp Ứng Cả Desktop & Mobile */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-3 top-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-[440px] max-h-[85vh] sm:max-h-[540px] bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-sky-950/25 border-2 border-sky-100/90 z-50 overflow-hidden flex flex-col ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header 3D Glossy Crystal */}
          <div className="relative p-4 sm:p-5 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 text-white border-b border-white/20 shadow-md shrink-0 overflow-hidden">
            {/* Glossy Sheen Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-inner flex items-center justify-center text-white shrink-0">
                  <Bell className="w-5 h-5 text-white drop-shadow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm sm:text-base leading-tight tracking-tight drop-shadow-sm text-white">
                      THÔNG BÁO & CẢNH BÁO
                    </h3>
                    {unreadCount > 0 && (
                      <span className="px-2.5 py-0.5 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black rounded-full shadow-md shadow-rose-900/40 border border-white/40 animate-pulse">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-cyan-100 font-semibold mt-0.5">
                    Hệ thống giám sát cửa hàng thời gian thực
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition backdrop-blur-sm shrink-0 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Toolbar 3D */}
          <div className="p-3 bg-slate-100/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
            {/* Filter Tabs 3D */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all duration-150 ${
                  filter === 'ALL'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 border border-sky-400/40'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-sm'
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('STOCK')}
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all duration-150 ${
                  filter === 'STOCK'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 border border-sky-400/40'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-sm'
                }`}
              >
                Kho
              </button>
              <button
                onClick={() => setFilter('DEBT')}
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all duration-150 ${
                  filter === 'DEBT'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 border border-sky-400/40'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-sm'
                }`}
              >
                Nợ
              </button>
              <button
                onClick={() => setFilter('SECURITY')}
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all duration-150 ${
                  filter === 'SECURITY'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 border border-sky-400/40'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-sm'
                }`}
              >
                Bảo mật
              </button>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-xl bg-white hover:bg-slate-200/80 text-slate-600 hover:text-sky-600 border border-slate-200 shadow-sm transition active:scale-95"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 rounded-xl bg-white hover:bg-rose-100 text-slate-600 hover:text-rose-600 border border-slate-200 shadow-sm transition active:scale-95"
                  title="Xóa tất cả thông báo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Danh sách thẻ thông báo 3D Glossy (Cho phép cuộn và xóa từng mục) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[200px]">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-25 text-slate-400" />
                <p className="text-xs font-bold text-slate-500">Đã sạch thông báo (Không có thông báo nào)</p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const style3d = get3DIconStyle(n.severity, n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      markAsRead(n.id);
                      if (n.link) {
                        navigate(n.link);
                        setIsOpen(false);
                      }
                    }}
                    className={`p-3.5 rounded-2xl transition-all duration-200 cursor-pointer border shadow-sm relative flex items-start gap-3.5 group ${
                      !n.read
                        ? 'bg-gradient-to-br from-white via-sky-50/50 to-sky-100/40 border-sky-200/90 shadow-sky-500/10 hover:shadow-md hover:-translate-y-0.5'
                        : 'bg-white/90 hover:bg-slate-50 border-slate-200/70 opacity-90'
                    }`}
                  >
                    {/* Badge 3D Icon Box */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md border ${style3d.bg}`}>
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-[13px] font-extrabold text-slate-900 group-hover:text-sky-700 transition leading-snug">
                          {n.title}
                        </h4>
                        
                        {/* Nút xóa 1 thông báo cụ thể */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(n.id);
                          }}
                          className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                          title="Xóa thông báo này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-snug font-medium">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                        <span className="text-[10.5px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatRelativeTime(n.time)}
                        </span>
                        {n.link && (
                          <span className="text-xs font-black text-sky-600 group-hover:text-blue-700 flex items-center gap-0.5 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200/60 group-hover:border-sky-300 transition shadow-2xs">
                            Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Panel 3D */}
          <div className="p-3 bg-slate-50 border-t border-slate-200/80 text-center shrink-0">
            <span className="text-[11px] text-slate-500 font-extrabold flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Tạp Hóa Vũ An - Hệ Thống Tự Động Giám Sát 24/7
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
