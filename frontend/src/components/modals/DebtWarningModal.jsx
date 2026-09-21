import React, { useState } from 'react';
import { AlertTriangle, CreditCard, ShieldAlert, X, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const DebtWarningModal = ({
  isOpen,
  onClose,
  customer,
  orderTotal = 0,
  onProceedCredit,
  onSwitchPayment,
}) => {
  const [managerPassword, setManagerPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !customer) return null;

  const currentDebt = Number(customer.currentDebt || customer.debt || 0);
  const limit = Number(customer.debtLimit || 2000000);
  const newTotalDebt = currentDebt + Number(orderTotal);
  const excess = newTotalDebt - limit;

  const handleVerifyManager = (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMsg('');

    // Giả lập hoặc kiểm tra mật khẩu chủ quán / quản lý (mặc định '123456' hoặc 'admin')
    setTimeout(() => {
      if (managerPassword === '123456' || managerPassword === 'admin' || managerPassword === '123') {
        setIsVerifying(false);
        onProceedCredit();
        onClose();
      } else {
        setIsVerifying(false);
        setErrorMsg('Mật khẩu quản lý không chính xác!');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-200 overflow-hidden flex flex-col">
        {/* Header Cảnh Báo Đỏ */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl shadow-inner">
              <ShieldAlert className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-900/60 px-2 py-0.5 rounded-md text-rose-100">
                Cảnh Báo Công Nợ
              </span>
              <h3 className="text-base font-black leading-tight mt-0.5">VƯỢT HẠN MỨC CHO NỢ</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-white/70 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội Dung Chi Tiết */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200 text-xs text-rose-950 font-semibold space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-rose-200/80">
              <span className="text-slate-600 font-medium">Khách hàng:</span>
              <span className="font-extrabold text-slate-900 text-sm">{customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Dư nợ hiện tại:</span>
              <span className="font-bold text-rose-700">{currentDebt.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Hạn mức tối đa:</span>
              <span className="font-bold text-slate-900">{limit.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Đơn hàng mới:</span>
              <span className="font-bold text-blue-700">+{Number(orderTotal).toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-rose-200/80 font-black text-xs text-rose-700">
              <span>Tổng nợ mới nếu duyệt:</span>
              <span>{newTotalDebt.toLocaleString('vi-VN')} đ</span>
            </div>
            {excess > 0 && (
              <div className="p-2 bg-rose-600 text-white font-extrabold text-center rounded-xl text-[11px] animate-pulse">
                ⚠️ Vượt hạn mức cho phép: {excess.toLocaleString('vi-VN')} đ!
              </div>
            )}
          </div>

          {/* Form Mật Khẩu Quản Lý Để Duyệt Nợ */}
          <form onSubmit={handleVerifyManager} className="space-y-3 pt-1">
            <label className="block text-xs font-bold text-slate-700">
              Mật khẩu Chủ Quán / Quản Lý để cấp phép nợ tiếp:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="Nhập mã xác thực của quản lý..."
                value={managerPassword}
                onChange={(e) => setManagerPassword(e.target.value)}
                className="w-full bg-slate-100 border border-slate-300 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
              />
            </div>
            {errorMsg && <p className="text-xs font-bold text-rose-600">{errorMsg}</p>}

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  onSwitchPayment();
                  onClose();
                }}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition border border-slate-300"
              >
                Đổi sang Tiền Mặt
              </button>
              <Button
                variant="3d-danger"
                size="sm"
                type="submit"
                isLoading={isVerifying}
                disabled={!managerPassword}
              >
                Duyệt Cho Nợ Tiếp
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DebtWarningModal;
