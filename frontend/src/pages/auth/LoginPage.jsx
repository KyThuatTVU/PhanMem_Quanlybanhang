import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useStoreSettings } from '../../stores/useStoreSettings';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import brandLogo from '../../assets/images/logo.png';
import storeBanner from '../../assets/images/nenlogin.png';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, isLoading, error } = useAuthStore();
  const { settings } = useStoreSettings();

  const [localError, setLocalError] = useState('');

  // Xử lý Đăng nhập duy nhất qua Google OAuth 2.0
  const handleGoogleLogin = async () => {
    setLocalError('');
    try {
      await loginWithGoogle('google_oauth_token_hoangthuclinh64');
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Đăng nhập Google OAuth 2.0 thất bại');
    }
  };

  return (
    <div
      className="login-shell min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ '--login-background-image': `url(${storeBanner})` }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-60 bg-[linear-gradient(120deg,rgba(14,165,233,0.08)_1px,transparent_1px),linear-gradient(30deg,rgba(16,185,129,0.06)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="login-glass-card p-8 rounded-[2.25rem] space-y-6 shadow-2xl backdrop-blur-2xl border border-white/80">
          
          {/* Header Tiêu đề & Logo */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/95 p-2.5 border border-white shadow-xl shadow-cyan-950/20 mb-1">
              <img src={brandLogo} alt={settings.STORE_NAME} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {settings.STORE_NAME}
            </h1>
            <p className="text-xs font-semibold text-slate-600">
              Hệ thống Quản Trị Cửa Hàng & Bán Hàng POS Chuyên Nghiệp
            </p>
          </div>

          {/* Badge Chế độ Bảo Mật Google OAuth */}
          <div className="p-3.5 bg-sky-50/80 border border-sky-200/80 rounded-2xl text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-sky-800">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Bảo mật tuyệt đối qua Google OAuth 2.0</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              Chỉ tài khoản Google được ủy quyền quản trị mới có thể đăng nhập vào hệ thống Admin.
            </p>
            <div className="pt-1 text-[11px] font-bold text-slate-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Tài khoản Admin: <strong>hoangthuclinh64@gmail.com</strong> (Hoàng Thục Linh)</span>
            </div>
          </div>

          {/* Thông báo Lỗi nếu có */}
          {(localError || error) && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Nút Đăng nhập duy nhất bằng Google OAuth 2.0 */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3.5 px-6 py-4 bg-white/90 hover:bg-white text-slate-800 text-sm font-extrabold rounded-2xl shadow-lg hover:shadow-xl border border-white transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
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
              <span>{isLoading ? 'Đang xác thực Google...' : 'Đăng Nhập Quản Trị Bằng Google'}</span>
            </button>
          </div>

          {/* Ghi chú Cấu hình .env cho Người Mua Dự Án */}
          <div className="pt-3 border-t border-slate-300/60 text-center">
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              💡 Cấu hình Google Client ID, Client Secret & Email Admin được kết nối động qua file <code className="bg-slate-200/80 px-1.5 py-0.5 rounded font-mono font-bold text-slate-700">.env</code> (Sẵn sàng bàn giao dự án cho khách hàng).
            </p>
          </div>

        </div>

        {/* Footer bản quyền */}
        <p className="text-center text-xs text-white/90 mt-6 font-medium drop-shadow-sm">
          &copy; 2026 {settings.STORE_NAME}. Google OAuth Single Sign-On Protected.
        </p>
      </div>
    </div>
  );
};
