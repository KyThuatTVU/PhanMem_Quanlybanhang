import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Store, KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-glass-3d mb-4 transform hover:scale-105 transition-transform duration-300">
            <Store className="w-8 h-8" />
          </div>
          <h1
            className="text-3xl font-black text-black tracking-tight"
            style={{ WebkitTextStroke: '0.65px #000000', letterSpacing: '-0.02em' }}
          >
            Khôi Phục Mật Khẩu
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-bold">
            Hệ thống Quản lý Bán hàng Cửa hàng Tạp hóa
          </p>
        </div>

        {/* 3D Glass Card */}
        <div className="soft-card p-6 sm:p-8 backdrop-blur-xl bg-white/80 border border-white/60 shadow-xl relative overflow-hidden">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Đã gửi hướng dẫn khôi phục!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Liên kết đặt lại mật khẩu hoặc mã OTP đã được gửi tới tài khoản{' '}
                <strong className="text-slate-900">{emailOrUsername}</strong>. Vui lòng kiểm tra email hoặc liên hệ Quản trị viên cửa hàng để cấp lại mật khẩu ngay lập tức.
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="3d-solid" className="w-full">
                    Quay Về Đăng Nhập
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Nhập tên đăng nhập hoặc địa chỉ email quản trị liên kết với tài khoản nhân viên của bạn:
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên đăng nhập hoặc Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="admin@ankhang.pos hoặc cashier1"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none transition"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="3d-solid"
                icon={KeyRound}
                disabled={loading}
                className="w-full mt-2"
              >
                {loading ? 'Đang xác thực...' : 'Gửi Yêu Cầu Đặt Lại'}
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
