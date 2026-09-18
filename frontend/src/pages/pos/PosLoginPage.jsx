import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePosAuthStore, getAvailableStaff } from '../../stores/usePosAuthStore';
import { useStoreSettings } from '../../stores/useStoreSettings';
import brandLogo from '../../assets/images/logo.png';
import {
  Monitor,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  KeyRound,
  Store,
  Clock,
  AlertCircle
} from 'lucide-react';

export const PosLoginPage = () => {
  const navigate = useNavigate();
  const { loginPos, isPosAuthenticated, error: authError } = usePosAuthStore();
  const { settings } = useStoreSettings();

  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Nếu đã đăng nhập POS trước đó thì chuyển thẳng vào màn hình bán hàng
    if (isPosAuthenticated) {
      navigate('/pos', { replace: true });
    }
    const list = getAvailableStaff();
    setStaffList(list);
    if (list.length > 0) {
      // Chọn sẵn thu ngân đầu tiên hoặc thu ngân thường
      const defaultCashier = list.find((s) => s.role === 'CASHIER') || list[0];
      setSelectedStaff(defaultCashier);
      setUsername(defaultCashier.username);
    }
  }, [isPosAuthenticated, navigate]);

  const handleSelectStaff = (staff) => {
    setSelectedStaff(staff);
    setUsername(staff.username);
    setPassword('');
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim()) {
      setLocalError('Vui lòng chọn hoặc nhập mã/tên đăng nhập nhân viên!');
      return;
    }

    if (!password.trim()) {
      setLocalError('Vui lòng nhập mật khẩu ca trực!');
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
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#E6F4EA] via-[#EDF7F0] to-[#E3F2EB] flex flex-col justify-between items-center p-4 font-sans select-none relative overflow-hidden">
      {/* Hào quang nền xanh dịu */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* 1. HEADER TRẠM BÁN HÀNG */}
      <div className="w-full max-w-5xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white p-1.5 border border-slate-200/80 shadow-sm flex items-center justify-center">
            <img src={brandLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 leading-tight">
              {settings.STORE_NAME || 'Tạp Hóa Vũ An'}
            </h1>
            <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Trạm POS Bán Lẻ Độc Lập
            </p>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm transition"
        >
          ← Cổng Quản Trị (Admin)
        </Link>
      </div>

      {/* 2. KHUNG ĐĂNG NHẬP CHUYÊN DỤNG CHO MÁY THU NGÂN */}
      <div className="w-full max-w-4xl my-auto py-6">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-white/80 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Cột Trái: Danh Sách Chọn Nhanh Thu Ngân Đang Làm Việc */}
          <div className="lg:col-span-5 bg-slate-50/70 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Monitor className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Trạm Thu Ngân #01
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Chạm chọn nhân viên trực ca do Admin phân quyền:
              </p>

              {/* Danh sách nhân viên */}
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {staffList.map((staff) => {
                  const isSelected = selectedStaff?.id === staff.id;
                  const isCashier = staff.role === 'CASHIER';
                  const isManager = staff.role === 'MANAGER';

                  return (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => handleSelectStaff(staff)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.01]'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {staff.fullName ? staff.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black truncate">{staff.fullName}</p>
                          <span
                            className={`text-[10px] font-bold block ${
                              isSelected ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            @{staff.username}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : isCashier
                            ? 'bg-emerald-100 text-emerald-800'
                            : isManager
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {staff.role === 'ADMIN' || staff.role === 'OWNER'
                          ? 'Admin'
                          : staff.role === 'MANAGER'
                          ? 'Quản Lý'
                          : 'Thu Ngân'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Bảo mật tuyệt đối • Tách biệt hoàn toàn quản trị</span>
            </div>
          </div>

          {/* Cột Phải: Form Nhập Mật Khẩu Vào Ca */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Mở Ca Bán Hàng POS
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Đăng nhập để bắt đầu quét mã vạch và thanh toán đơn hàng.
                </p>
              </div>

              {(localError || authError) && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{localError || authError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                    Tài khoản thu ngân
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Mã hoặc tên tài khoản thu ngân"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                    Mật khẩu ca trực (PIN)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu do Admin cấp..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none transition"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    * Mật khẩu mặc định do Admin cấp: <span className="font-bold text-slate-600">123</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/30 transition transform active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Đang kết nối trạm POS...</span>
                  ) : (
                    <>
                      <span>BẮT ĐẦU CA BÁN HÀNG</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Hệ thống POS V2.5</span>
              <span>Ca trực: Tự động ghi log theo nhân viên</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FOOTER BẢN QUYỀN */}
      <div className="text-center text-xs font-bold text-slate-400 pb-2">
        Hệ Thống Bán Lẻ & Quản Lý Kho KORA Retail • Trạm POS Bảo Mật Riêng Biệt
      </div>
    </div>
  );
};
