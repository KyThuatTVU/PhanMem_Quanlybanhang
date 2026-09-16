import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CreditCard, ArrowDownRight, ArrowUpRight, Search, DollarSign, X, Check } from 'lucide-react';

export const DebtListPage = () => {
  const [activeTab, setActiveTab] = useState('CUSTOMERS'); // 'CUSTOMERS' | 'SUPPLIERS'
  const [customerDebts, setCustomerDebts] = useState([]);
  const [supplierDebts, setSupplierDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [payAmount, setPayAmount] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    fetchDebts();
  }, [activeTab]);

  const fetchDebts = async () => {
    setLoading(true);
    try {
      if (activeTab === 'CUSTOMERS') {
        const res = await apiClient.get('/debts/customers');
        setCustomerDebts(res.data || []);
      } else {
        const res = await apiClient.get('/debts/suppliers');
        setSupplierDebts(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPay = async (entity) => {
    setSelectedEntity(entity);
    setPayAmount('');
    try {
      if (activeTab === 'CUSTOMERS') {
        const res = await apiClient.get(`/debts/customers/${entity.id}`);
        setLedger(res.data || []);
      } else {
        const res = await apiClient.get(`/debts/suppliers/${entity.id}`);
        setLedger(res.data || []);
      }
      setShowPayModal(true);
    } catch (err) {
      alert('Lỗi lấy sổ nợ: ' + err.message);
    }
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) {
      alert('Vui lòng nhập số tiền thanh toán hợp lệ');
      return;
    }

    try {
      if (activeTab === 'CUSTOMERS') {
        await apiClient.post(`/debts/customers/${selectedEntity.id}/payments`, {
          amount,
          paymentMethod: 'CASH',
          note: 'Khách thanh toán nợ',
        });
        alert('Thu nợ khách hàng thành công!');
      } else {
        await apiClient.post(`/debts/suppliers/${selectedEntity.id}/payments`, {
          amount,
          paymentMethod: 'BANK_TRANSFER',
          note: 'Quán thanh toán nợ cho nhà cung cấp',
        });
        alert('Thanh toán nợ cho nhà cung cấp thành công!');
      }
      setShowPayModal(false);
      fetchDebts();
    } catch (err) {
      alert(err.message || 'Lỗi thanh toán nợ');
    }
  };

  const currentList = activeTab === 'CUSTOMERS' ? customerDebts : supplierDebts;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Sổ Công Nợ Hai Chiều
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Theo dõi dòng tiền nợ mua hàng của khách và nợ tiền hàng nhà phân phối
          </p>
        </div>

        {/* Tab chuyển đổi */}
        <div className="flex p-1 bg-slate-200/80 rounded-xl">
          <button
            onClick={() => setActiveTab('CUSTOMERS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'CUSTOMERS'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Khách Đang Nợ Quán ({customerDebts.length})
          </button>
          <button
            onClick={() => setActiveTab('SUPPLIERS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'SUPPLIERS'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quán Nợ Nhà Cung Cấp ({supplierDebts.length})
          </button>
        </div>
      </div>

      {/* Bảng Danh Sách Đối Tượng Nợ Dạng 3D Thủy Tinh */}
      <div className="table-glass-container">
        <div className="overflow-x-auto">
          <table className="table-3d-glass text-left text-xs">
            <thead>
              <tr>
                <th>Mã</th>
                <th>{activeTab === 'CUSTOMERS' ? 'Tên Khách Hàng' : 'Tên Nhà Phân Phối'}</th>
                <th>Số Điện Thoại</th>
                <th>Số Tiền Đang Nợ</th>
                <th>Giao Dịch Gần Nhất</th>
                <th className="text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="font-medium text-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center">Đang tải sổ nợ...</td></tr>
              ) : currentList.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center">Không có công nợ nào phát sinh!</td></tr>
              ) : (
                currentList.map((item) => (
                  <tr key={item.id}>
                    <td className="p-4 font-bold text-blue-600">{item.code}</td>
                    <td className="p-4 font-bold text-slate-900">{item.name}</td>
                    <td className="p-4 text-slate-600">{item.phone}</td>
                    <td className="p-4 font-extrabold text-base text-rose-600">
                      {Number(item.current_debt).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-4 text-slate-400">
                      {item.last_transaction_at ? new Date(item.last_transaction_at).toLocaleDateString('vi-VN') : '---'}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="3d-primary"
                        size="sm"
                        onClick={() => handleOpenPay(item)}
                      >
                        {activeTab === 'CUSTOMERS' ? 'Thu Nợ' : 'Trả Nợ'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xem Sổ Nợ & Lập Phiếu Thu/Chi Nợ */}
      {showPayModal && selectedEntity && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="soft-card bg-white max-w-lg w-full p-6 space-y-4 rounded-3xl animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {activeTab === 'CUSTOMERS' ? 'Thu Nợ Khách Hàng' : 'Thanh Toán Nợ Cho Nhà Cung Cấp'}
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  Đối tượng: {selectedEntity.name} ({selectedEntity.phone})
                </span>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex justify-between items-center text-xs">
              <span className="font-bold text-rose-700">Số tiền còn nợ hiện tại:</span>
              <span className="text-lg font-extrabold text-rose-800">
                {Number(selectedEntity.current_debt).toLocaleString('vi-VN')} đ
              </span>
            </div>

            {/* Form Thanh Toán Nợ */}
            <form onSubmit={handleConfirmPayment} className="space-y-3 text-xs">
              <Input
                label="Nhập số tiền thanh toán (VNĐ) *"
                type="number"
                required
                placeholder="VD: 500000..."
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="3d-secondary" className="flex-1" onClick={() => setShowPayModal(false)}>
                  Đóng
                </Button>
                <Button type="submit" variant="3d-solid" className="flex-1">
                  Xác Nhận Thanh Toán
                </Button>
              </div>
            </form>

            {/* Lịch Sử Sổ Nợ */}
            <div className="pt-2 border-t text-xs">
              <h4 className="font-bold text-slate-700 mb-2">Lịch Sử Giao Dịch Sổ Nợ Gần Đây</h4>
              <div className="max-h-40 overflow-y-auto divide-y border rounded-xl">
                {ledger.map((row) => (
                  <div key={row.id} className="p-2 flex justify-between text-[11px]">
                    <div>
                      <span className={`font-bold ${row.amount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {row.amount > 0 ? `+${Number(row.amount).toLocaleString('vi-VN')}` : Number(row.amount).toLocaleString('vi-VN')} đ
                      </span>
                      <p className="text-slate-400">{row.note || row.transaction_type}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-700">Dư: {Number(row.balance_after).toLocaleString('vi-VN')} đ</span>
                      <p className="text-slate-400">{new Date(row.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
