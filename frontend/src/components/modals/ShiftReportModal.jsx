import React, { useState } from 'react';
import { Calculator, DollarSign, Clock, UserCheck, AlertTriangle, Printer, CheckCircle2, X } from 'lucide-react';
import { Button } from '../ui/Button';

export const ShiftReportModal = ({
  isOpen,
  onClose,
  cashier,
  terminalId = 'POS-01',
  shiftSales = 2450000,
  initialCash = 500000,
  orderCount = 18,
  onConfirmLogout,
}) => {
  const [actualCash, setActualCash] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const expectedCash = initialCash + shiftSales;
  const counted = Number(actualCash || 0);
  const variance = actualCash !== '' ? counted - expectedCash : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirmLogout();
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/30 text-blue-400 rounded-2xl border border-blue-500/30">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                Báo Cáo Kết Ca & Đổi Ca
              </span>
              <h3 className="text-base font-black leading-tight mt-0.5">KIỂM BÀN GIAO KÉT TIỀN</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Kiểm Ca */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Thông tin nhân viên & ca */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400">Thu ngân trực ca:</span>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">{cashier?.fullName || 'Thu Ngân'}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Trạm POS:</span>
              <p className="font-extrabold text-blue-600 text-sm mt-0.5">{terminalId}</p>
            </div>
          </div>

          {/* Báo cáo số liệu */}
          <div className="space-y-2 text-xs font-semibold text-slate-700">
            <div className="flex justify-between p-2.5 bg-slate-100/70 rounded-xl">
              <span>Tiền đầu ca (Tiền thối ban đầu):</span>
              <span className="font-bold text-slate-900">{initialCash.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between p-2.5 bg-emerald-50 rounded-xl text-emerald-900">
              <span>Doanh thu tiền mặt trong ca ({orderCount} đơn):</span>
              <span className="font-extrabold">+{shiftSales.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between p-2.5 bg-blue-50 rounded-xl text-blue-900 font-black text-sm">
              <span>Tổng tiền mặt lý thuyết trong két:</span>
              <span>{expectedCash.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          {/* Ô Nhập Tiền Kiểm Đếm Thực Tế */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-800">
              Tiền mặt đếm thực tế trong két (VNĐ):
            </label>
            <div className="relative">
              <DollarSign className="w-5 h-5 text-emerald-600 absolute left-3.5 top-3" />
              <input
                type="number"
                placeholder="Nhập số tiền kiểm thực tế..."
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                className="w-full bg-emerald-50/50 border-2 border-emerald-300 focus:border-emerald-600 rounded-2xl pl-10 pr-4 py-2.5 text-base font-black text-slate-900 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Kết Quả Lệch Tiền */}
          {actualCash !== '' && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                variance === 0
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : variance < 0
                  ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              <span>{variance === 0 ? 'Két tiền khớp 100%' : variance < 0 ? 'Thất thoát tiền ca (Thiếu tiền)' : 'Tiền thừa trong két'}</span>
              <span className="text-sm font-black">
                {variance === 0 ? '0 đ (Chuẩn)' : `${variance > 0 ? '+' : ''}${variance.toLocaleString('vi-VN')} đ`}
              </span>
            </div>
          )}

          {/* Ghi chú ca */}
          <div>
            <input
              type="text"
              placeholder="Ghi chú thêm cho ca làm việc này (nếu có)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>

          {/* Nút hành động */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition border border-slate-300"
            >
              Hủy
            </button>
            <Button
              variant="3d-primary"
              size="md"
              type="submit"
              isLoading={isSubmitting}
            >
              Xác Nhận Kết Ca & Đổi Ca
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftReportModal;
