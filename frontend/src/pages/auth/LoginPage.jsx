import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ShoppingBag, Lock, User, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isLoading, error } = useAuthStore();

  const [username, setUsername] = useState('thungan01');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Xử lý submit Đăng nhập tài khoản Local
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim() || !password) {
      setLocalError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Đăng nhập thất bại, vui lòng thử lại');
    }
  };

  // Xử lý Đăng nhập qua Google OAuth
  const handleGoogleLogin = async () => {
    setLocalError('');
    try {
      // Trong môi trường Dev gửi mock_token để đăng nhập tài khoản Google Admin
      await loginWithGoogle('mock_token_google_dev');
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Đăng nhập Google thất bại');
    }
  };

  // Điền nhanh tài khoản mẫu để dùng thử
  const fillQuickAccount = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setLocalError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Hiệu ứng nền 3D Glass mờ nhẹ */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card Đăng nhập 3D Glass Soft Card */}
        <div className="soft-card bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl p-8 rounded-3xl space-y-6">
          
          {/* Header Tiêu đề & Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-600 mb-2 shadow-inner">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Tạp Hóa An Khang
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Hệ thống phần mềm quản lý bán hàng POS chuyên nghiệp
            </p>
          </div>

          {/* Thông báo Lỗi nếu có */}
          {(localError || error) && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Form Đăng nhập Local */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Tên đăng nhập / Email"
              type="text"
              placeholder="Nhập tên đăng nhập..."
              icon={User}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <div className="relative">
              <Input
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu..."
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="text-blue-600 font-semibold hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            {/* Nút đăng nhập 3D Transparent */}
            <Button
              type="submit"
              variant="3d-solid"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Đăng Nhập Hệ Thống
            </Button>
          </form>

          {/* Đường gạch phân cách */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
              hoặc
            </span>
          </div>

          {/* Nút Đăng nhập bằng Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold shadow-sm hover:shadow transition duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span>Đăng nhập với Google</span>
          </button>

          {/* Khu vực Điền nhanh tài khoản dùng thử (Quick Demo Login) */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Dùng thử nhanh vai trò:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillQuickAccount('thungan01', '123456')}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition text-center"
              >
                Thu Ngân
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('admin', '123456')}
                className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-medium transition text-center"
              >
                Chủ Quán
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('kho01', '123456')}
                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-medium transition text-center"
              >
                Thủ Kho
              </button>
            </div>
          </div>

        </div>

        {/* Footer bản quyền */}
        <p className="text-center text-xs text-slate-500 mt-6 font-medium">
          &copy; 2026 Tạp Hóa An Khang. Powered by React.js & Node.js.
        </p>
      </div>
    </div>
  );
};
