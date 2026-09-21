import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const OfflineBanner = ({ isPos = false }) => {
  const { isOnline, isReconnecting, wasOffline, resetWasOffline, checkConnection } = useNetworkStatus();
  const [showRestoredToast, setShowRestoredToast] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowRestoredToast(true);
      const timer = setTimeout(() => {
        setShowRestoredToast(false);
        resetWasOffline();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, resetWasOffline]);

  // Thông báo khi vừa phục hồi kết nối thành công
  if (isOnline && showRestoredToast) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-bounce border border-emerald-400">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/80 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          </div>
          <div>
            <p className="font-extrabold text-xs">Đã Khôi Phục Kết Nối Wi-Fi / Internet!</p>
            <p className="text-[11px] text-emerald-100 mt-0.5">Dữ liệu đơn hàng đang được tự động đồng bộ lên máy chủ.</p>
          </div>
        </div>
        <button
          onClick={() => setShowRestoredToast(false)}
          className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg font-bold"
        >
          Đóng
        </button>
      </div>
    );
  }

  // Khi đang bị mất kết nối Wi-Fi
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 sm:right-6 z-50 max-w-md w-[92%] sm:w-[420px] bg-amber-500/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border-2 border-amber-300/80 flex flex-col gap-3 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-inner shrink-0">
            <WifiOff className="w-6 h-6 animate-ping" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-slate-900 tracking-tight">MẤT KẾT NỐI WI-FI / INTERNET</span>
              <span className="px-2 py-0.5 bg-rose-700 text-white text-[10px] font-black rounded-full uppercase">Offline</span>
            </div>
            <p className="text-xs font-semibold text-amber-950 mt-1 leading-snug">
              {isPos
                ? 'Máy bán hàng đã chuyển sang chế độ Offline. Quý khách vẫn bán hàng & in bill bình thường. Đơn hàng sẽ tự lưu và đồng bộ khi có mạng.'
                : 'Không thể kết nối với máy chủ. Vui lòng kiểm tra lại modem Wi-Fi hoặc cáp kết nối mạng.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-amber-400/60">
          <span className="text-[10px] font-extrabold text-amber-950 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-800" /> Dữ liệu đã lưu an toàn trên máy
          </span>
          <button
            onClick={checkConnection}
            disabled={isReconnecting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
            <span>{isReconnecting ? 'Đang thử lại...' : 'Thử kết nối lại'}</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OfflineBanner;
