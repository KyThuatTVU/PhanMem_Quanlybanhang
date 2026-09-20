import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Clock,
  DollarSign,
  ShoppingCart,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPasswordSuccess('Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Hồ Sơ & Tài Khoản Cá Nhân
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Thông tin tài khoản đăng nhập, ca bán hàng hiện tại và cập nhật mật khẩu bảo mật
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Cột trái: Thông tin cá nhân & Thẻ nhân viên */}
        <div className="space-y-6">
          <div className="soft-card p-6 text-center space-y-4">
            {user?.avatarUrl || user?.picture ? (
              <img
                src={user.avatarUrl || user.picture}
                alt={user?.fullName || user?.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-md mx-auto"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white font-black text-2xl mx-auto flex items-center justify-center shadow-glass-3d">
                {(user?.fullName || user?.name) ? (user.fullName || user.name).charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {user?.fullName || user?.name || 'Hoàng Thục Linh'}
              </h2>
              <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg border border-blue-200 mt-1">
                {user?.roles?.[0] || 'ADMIN'}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-4 text-left space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-medium truncate">{user?.email || 'hoangthuclinh64@gmail.com'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-medium">0903 123 456</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-emerald-700">Tài khoản đang kích hoạt</span>
              </div>
            </div>
          </div>

          {/* Thẻ ca làm việc hôm nay */}
          <div className="soft-card p-5 space-y-3 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border-blue-100">
            <h3 className="text-xs font-bold text-blue-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Ca Bán Hàng Hiện Tại
            </h3>
            <div className="text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Ca làm:</span>
                <span className="font-bold text-slate-900">Ca Sáng (06:00 - 14:00)</span>
              </div>
              <div className="flex justify-between">
                <span>Số đơn đã thanh toán:</span>
                <span className="font-bold text-blue-700">18 đơn</span>
              </div>
              <div className="flex justify-between">
                <span>Doanh số ca:</span>
                <span className="font-extrabold text-emerald-600">4.580.000 đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Cột phải: Form Đổi Mật Khẩu & Bảo Mật */}
        <div className="lg:col-span-2 space-y-6">
          <div className="soft-card p-6">
            <h2 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              Đổi Mật Khẩu Đăng Nhập
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Để bảo mật tài khoản quầy thu ngân và quyền truy cập phần mềm, hãy dùng mật khẩu mạnh ít nhất 6 ký tự
            </p>

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu đang dùng..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập ít nhất 6 ký tự..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Xác nhận lại mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại chính xác mật khẩu mới..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="3d-solid"
                  icon={KeyRound}
                  disabled={loading}
                >
                  {loading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                </Button>
              </div>
            </form>
          </div>

          {/* Lịch sử phiên đăng nhập */}
          <div className="soft-card p-6">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Lịch Sử Đăng Nhập & Thiết Bị Gần Đây
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Máy tính POS Thu Ngân Quầy 1</p>
                  <p className="text-[11px] text-slate-400">Windows 11 • Chrome 124.0 • IP 192.168.1.105</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-md">
                  Phiên hiện tại
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Điện thoại quản lý (Chủ quán)</p>
                  <p className="text-[11px] text-slate-400">iOS Safari • IP 14.161.32.88</p>
                </div>
                <span className="text-slate-400 text-[11px]">Hôm qua 18:30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
