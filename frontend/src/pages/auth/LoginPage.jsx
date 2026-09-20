import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useStoreSettings } from '../../stores/useStoreSettings';
import { AlertCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import brandLogo from '../../assets/images/logo.png';
import storeBanner from '../../assets/images/nenlogin.png';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogleUser, isLoading, error } = useAuthStore();
  const { settings } = useStoreSettings();

  const [localError, setLocalError] = useState('');
  const isInactiveLogout = location.search.includes('reason=inactivity');

  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  // Xử lý Đăng nhập qua Google OAuth 2.0 Chính Thức
  const handleGoogleLogin = () => {
    setLocalError('');
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '731513721810-8rnkehsr1v4slnfhr80fbhltb0mego0l.apps.googleusercontent.com';

    if (window.google?.accounts?.oauth2) {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.access_token) {
            try {
              // Lấy thông tin tài khoản trực tiếp từ API Google
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const googleUser = await res.json();

              // Xác thực nghiêm ngặt tài khoản Google & kiểm tra quyền Admin
              await loginWithGoogleUser(googleUser);
              navigate('/dashboard');
            } catch (err) {
              setLocalError(err.message || 'Xác thực tài khoản Google thất bại!');
            }
          } else {
            setLocalError('Đăng nhập Google bị hủy hoặc không nhận được Token!');
          }
        },
        error_callback: (err) => {
          console.error('Lỗi Google OAuth:', err);
          setLocalError('Không thể kết nối dịch vụ xác thực Google!');
        },
      });

      tokenClient.requestAccessToken();
    } else {
      const redirectUri = window.location.origin + window.location.pathname;
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email%20profile%20openid`;
      window.location.href = googleAuthUrl;
    }
  };

  // Xử lý nhận Token khi dùng luồng chuyển hướng URL
  React.useEffect(() => {
    if (location.hash && location.hash.includes('access_token')) {
      const params = new URLSearchParams(location.hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        window.history.replaceState({}, document.title, window.location.pathname);
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => res.json())
          .then(async (googleUser) => {
            await loginWithGoogleUser(googleUser);
            navigate('/dashboard');
          })
          .catch((err) => {
            setLocalError(err.message || 'Xác thực tài khoản Google thất bại!');
          });
      }
    }
  }, [location, loginWithGoogleUser, navigate]);

  return (
    <div
      className="min-h-screen w-screen flex flex-col justify-between items-center p-4 font-sans select-none relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${storeBanner})` }}
    >
      {/* Lớp phủ mờ nền đồng nhất */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-none" />

      {/* Khung Đăng Nhập Đã Đồng Nhất Cấu Trúc */}
      <div className="w-full max-w-md my-auto relative z-10">
        <div className="bg-white/95 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/80 space-y-6 text-center">
          
          {/* Header Logo & Tiêu Đề Đồng Nhất */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white p-2.5 border border-slate-100 shadow-lg shadow-cyan-950/10 mb-1">
              <img src={brandLogo} alt={settings.STORE_NAME || 'Tạp Hóa Vũ An'} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {settings.STORE_NAME || 'Tạp Hóa Vũ An'}
            </h1>
            <p className="text-xs font-bold text-sky-600 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              Hệ Thống Quản Trị Cửa Hàng & POS
            </p>
          </div>

          {/* Thông báo Đăng xuất do Không hoạt động */}
          {isInactiveLogout && (
            <div className="w-full flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Phiên đăng nhập đã tự động ngắt sau 3 phút không hoạt động để bảo mật dữ liệu.</span>
            </div>
          )}

          {/* Thông báo Lỗi nếu có */}
          {(localError || error) && (
            <div className="w-full flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Nút Đăng nhập bằng Google Đồng Nhất */}
          <div className="space-y-4 pt-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black text-sm rounded-full shadow-xl shadow-sky-500/25 transition transform active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-3"
            >
              <div className="w-6 h-6 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <span>{isLoading ? 'ĐANG XÁC THỰC GOOGLE...' : 'ĐĂNG NHẬP VỚI GOOGLE'}</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Đăng Nhập An Toàn Với Google OAuth 2.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bản quyền đồng nhất */}
      <p className="text-center text-xs text-white/80 pb-2 font-medium drop-shadow-sm relative z-10">
        &copy; 2026 {settings.STORE_NAME || 'Tạp Hóa Vũ An'}. Tất cả quyền được bảo lưu.
      </p>
    </div>
  );
};
