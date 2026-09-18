import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const incomeCategories = ['Bán hàng POS', 'Thu công nợ', 'Thu khác'];
const expenseCategories = ['Nhập hàng', 'Điện nước', 'Thuê mặt bằng', 'Lương nhân viên', 'Vận chuyển', 'Marketing', 'Hư hỏng / thất thoát', 'Chi khác'];
const today = new Date().toISOString().slice(0, 10);

const initialTransactions = [
  { id: 1, date: today, type: 'INCOME', category: 'Bán hàng POS', amount: 8450000, note: 'Doanh thu bán hàng trong ngày' },
  { id: 2, date: today, type: 'EXPENSE', category: 'Nhập hàng', amount: 1800000, note: 'Nhập bổ sung hàng hóa' },
  { id: 3, date: today, type: 'EXPENSE', category: 'Vận chuyển', amount: 120000, note: 'Phí giao hàng từ nhà cung cấp' },
];

const readTransactions = () => {
  try {
    const saved = localStorage.getItem('cashbook_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  } catch {
    return initialTransactions;
  }
};

const formatMoney = (amount) => `${Number(amount).toLocaleString('vi-VN')} đ`;

export const CashbookPage = () => {
  const [transactions, setTransactions] = useState(readTransactions);
  const [selectedDate, setSelectedDate] = useState(today);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ type: 'EXPENSE', category: 'Nhập hàng', amount: '', note: '' });

  const saveTransactions = (nextTransactions) => {
    setTransactions(nextTransactions);
    localStorage.setItem('cashbook_transactions', JSON.stringify(nextTransactions));
  };

  const visibleTransactions = useMemo(
    () => transactions.filter((item) => item.date === selectedDate && (typeFilter === 'ALL' || item.type === typeFilter)),
    [transactions, selectedDate, typeFilter]
  );

  const dailyTransactions = useMemo(
    () => transactions.filter((item) => item.date === selectedDate),
    [transactions, selectedDate]
  );

  const totalIncome = dailyTransactions.filter((item) => item.type === 'INCOME').reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpense = dailyTransactions.filter((item) => item.type === 'EXPENSE').reduce((sum, item) => sum + Number(item.amount), 0);
  const netProfit = totalIncome - totalExpense;

  const resetForm = () => {
    setEditingId(null);
    setForm({ type: 'EXPENSE', category: 'Nhập hàng', amount: '', note: '' });
  };

  const handleTypeChange = (type) => {
    setForm({ ...form, type, category: type === 'INCOME' ? incomeCategories[0] : expenseCategories[0] });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return;

    const entry = { ...form, amount, date: selectedDate };
    const nextTransactions = editingId
      ? transactions.map((item) => (item.id === editingId ? { ...item, ...entry } : item))
      : [{ id: Date.now(), ...entry }, ...transactions];

    saveTransactions(nextTransactions);
    resetForm();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({ type: item.type, category: item.category, amount: item.amount, note: item.note || '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa khoản thu chi này?')) {
      saveTransactions(transactions.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-sky-600">Quản lý dòng tiền</p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">Sổ Thu Chi Trong Ngày</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Ghi nhận từng khoản tiền vào, tiền ra và theo dõi lợi nhuận thực tế.</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white/55 border border-white/80 rounded-xl px-3 py-2">
          Ngày xem sổ
          <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="bg-transparent text-xs font-semibold outline-none" />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="cashbook-summary cashbook-summary--income rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-500">Tổng khoản thu</p>
          <p className="text-2xl font-black text-emerald-600 mt-2">{formatMoney(totalIncome)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Doanh thu và các khoản tiền vào</p>
        </div>
        <div className="cashbook-summary cashbook-summary--expense rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-500">Tổng khoản chi</p>
          <p className="text-2xl font-black text-rose-600 mt-2">{formatMoney(totalExpense)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Chi phí phát sinh trong ngày</p>
        </div>
        <div className="cashbook-summary cashbook-summary--profit rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-500">Lợi nhuận ròng</p>
          <p className={`text-2xl font-black mt-2 ${netProfit >= 0 ? 'text-sky-700' : 'text-rose-700'}`}>{formatMoney(netProfit)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Tổng thu - Tổng chi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-6">
        <form onSubmit={handleSubmit} className="cashbook-panel rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{editingId ? 'Chỉnh sửa khoản thu chi' : 'Thêm khoản thu chi'}</h2>
              <p className="text-xs text-slate-500 mt-1">Chọn đúng loại để báo cáo tính lợi nhuận chính xác.</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nhập liệu</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => handleTypeChange('INCOME')} className={`rounded-xl px-3 py-2.5 text-xs font-extrabold border ${form.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white/50 text-slate-500 border-white'}`}>
              Khoản thu
            </button>
            <button type="button" onClick={() => handleTypeChange('EXPENSE')} className={`rounded-xl px-3 py-2.5 text-xs font-extrabold border ${form.type === 'EXPENSE' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-white/50 text-slate-500 border-white'}`}>
              Khoản chi
            </button>
          </div>

          <label className="block text-xs font-bold text-slate-700">Loại {form.type === 'INCOME' ? 'thu' : 'chi'}
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1 w-full bg-white/70 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700">
              {(form.type === 'INCOME' ? incomeCategories : expenseCategories).map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>

          <label className="block text-xs font-bold text-slate-700">Số tiền
            <input required type="number" min="1" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="Nhập số tiền" className="mt-1 w-full bg-white/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800" />
          </label>

          <label className="block text-xs font-bold text-slate-700">Nội dung / ghi chú
            <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Ví dụ: tiền điện tháng này" rows="3" className="mt-1 w-full bg-white/70 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 resize-none" />
          </label>

          <div className="flex gap-2">
            <Button type="submit" variant="3d-solid" icon={editingId ? Pencil : Plus} className="flex-1">{editingId ? 'Cập nhật' : 'Thêm khoản này'}</Button>
            {editingId && <Button type="button" variant="3d-secondary" onClick={resetForm}>Hủy</Button>}
          </div>
        </form>

        <section className="cashbook-panel rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Các khoản phát sinh</h2>
              <p className="text-xs text-slate-500 mt-1">Ngày {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="flex gap-1.5">
              {[['ALL', 'Tất cả'], ['INCOME', 'Khoản thu'], ['EXPENSE', 'Khoản chi']].map(([value, label]) => <button key={value} type="button" onClick={() => setTypeFilter(value)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${typeFilter === value ? 'bg-sky-100 text-sky-700' : 'bg-white/60 text-slate-500'}`}>{label}</button>)}
            </div>
          </div>

          <div className="space-y-2">
            {visibleTransactions.length === 0 ? <div className="py-10 text-center text-xs text-slate-400">Chưa có khoản thu chi trong ngày này.</div> : visibleTransactions.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/55 border border-white/80 p-3">
                <div className={`w-12 rounded-lg py-1.5 text-center text-[10px] font-black uppercase shrink-0 ${item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {item.type === 'INCOME' ? 'THU' : 'CHI'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-slate-800 truncate">{item.category}</p>
                  <p className="text-[11px] text-slate-500 truncate">{item.note || 'Không có ghi chú'}</p>
                </div>
                <strong className={`text-xs whitespace-nowrap ${item.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'}`}>{item.type === 'INCOME' ? '+' : '-'}{formatMoney(item.amount)}</strong>
                <button type="button" onClick={() => handleEdit(item)} className="btn-3d-icon p-2 text-slate-500 hover:text-sky-600" title="Chỉnh sửa"><Pencil className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => handleDelete(item.id)} className="btn-3d-icon p-2 text-slate-500 hover:text-rose-600" title="Xóa"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="cashbook-note rounded-3xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Quy tắc tính lợi nhuận</h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-5">Lợi nhuận ròng trong ngày = Tổng các khoản thu - Tổng các khoản chi. Hãy ghi cả những chi phí nhỏ như vận chuyển, điện nước, bao bì và thất thoát để số liệu phản ánh đúng tình hình cửa hàng.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
