import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePosAuthStore } from '../../stores/usePosAuthStore';
import { useStoreSettings } from '../../stores/useStoreSettings';
import brandLogo from '../../assets/images/logo.png';
import storeBanner from '../../assets/images/nenlogin.png';
import {
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export const PosLoginPage = () => {
  const navigate = useNavigate();
  const { loginPos, isPosAuthenticated, cashier, error: authError } = usePosAuthStore();
  const { settings } = useStoreSettings();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setUsername('');
    setPassword('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim()) {
      setLocalError('Vui lòng nhập tên đăng nhập nhân viên!');
      return;
    }

    if (!password.trim()) {
      setLocalError('Vui lòng nhập mật khẩu ca làm!');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginPos(username, password);
      navigate('/pos', { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Đăng nhập không thành công. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-screen flex flex-col justify-between items-center p-4 font-sans select-none relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${storeBanner})` }}
    >
      {/* Lớp phủ mờ nền */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-none" />

      {/* Header nút quay lại Admin */}
   

      {/* Khung Đăng Nhập Gọn Gàng, Chuẩn Máy POS */}
      <div className="w-full max-w-md my-auto relative z-10">
        <div className="bg-white/95 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/80 space-y-6">
          
          {/* Header Logo & Tiêu Đề */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white p-2.5 border border-slate-100 shadow-lg shadow-cyan-950/10 mb-1">
              <img src={brandLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {settings.STORE_NAME || 'Tạp Hóa Vũ An'}
            </h1>
            <p className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Đăng Nhập Máy Bán Hàng POS
            </p>
          </div>

          {/* Thông báo lỗi nếu có */}
          {(localError || authError) && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || authError}</span>
            </div>
          )}

          {/* Form Đăng Nhập Đơn Giản & Trực Quan (Ngăn trình duyệt tự động điền mật khẩu) */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider">
                Tài khoản đăng nhập
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="pos_user_identifier"
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập nhân viên..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-800 focus:outline-none transition shadow-inner"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider">
                Mật khẩu ca làm
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="pos_user_secret"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu ca làm..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-800 focus:outline-none transition shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-4 px-6 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-black text-sm rounded-full shadow-xl shadow-blue-500/25 transition transform active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Đang xác thực POS...</span>
              ) : (
                <>
                  <span>BẮT ĐẦU CA BÁN HÀNG</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Trạm POS Bảo Mật Riêng Biệt</span>
          </div>
        </div>
      </div>

      {/* Footer bản quyền */}
      <p className="text-center text-xs text-white/80 pb-2 font-medium drop-shadow-sm relative z-10">
        &copy; 2026 {settings.STORE_NAME || 'Tạp Hóa Vũ An'}. Tất cả quyền được bảo lưu.
      </p>
    </div>
  );
};
