import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import {
  Users,
  Plus,
  Search,
  Phone,
  CreditCard,
  Award,
  ShoppingBag,
  Eye,
  Edit,
  History,
  CheckCircle2,
  Calendar,
  DollarSign
} from 'lucide-react';

export const CustomerListPage = () => {
  const [keyword, setKeyword] = useState('');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [customers, setCustomers] = useState([
    {
      id: 1,
      code: 'KH-0001',
      name: 'Nguyễn Văn Minh (Khách quen)',
      phone: '0912 345 678',
      group: 'VIP',
      points: 450,
      totalSpent: 12500000,
      currentDebt: 0,
      orderCount: 28,
      address: '123 Đường 30/4, P.1, TP. Trà Vinh',
      recentOrders: [
        { code: 'ORD-20260915-0012', date: '15/09/2026', total: 450000, status: 'Hoàn tất' },
        { code: 'ORD-20260910-0089', date: '10/09/2026', total: 680000, status: 'Hoàn tất' },
      ],
    },
    {
      id: 2,
      code: 'KH-0002',
      name: 'Chị Lan (Tạp hóa đầu hẻm)',
      phone: '0988 765 432',
      group: 'Khách sỉ',
      points: 120,
      totalSpent: 35800000,
      currentDebt: 1200000,
      orderCount: 15,
      address: '45 Hùng Vương, Khóm 2, Trà Vinh',
      recentOrders: [
        { code: 'ORD-20260914-0045', date: '14/09/2026', total: 3200000, status: 'Ghi nợ' },
      ],
    },
    {
      id: 3,
      code: 'KH-0003',
      name: 'Anh Hùng (Thợ hồ)',
      phone: '0909 112 233',
      group: 'Khách thường',
      points: 35,
      totalSpent: 1850000,
      currentDebt: 250000,
      orderCount: 9,
      address: 'Ấp Vĩnh Yên, Long Đức',
      recentOrders: [
        { code: 'ORD-20260912-0033', date: '12/09/2026', total: 250000, status: 'Ghi nợ' },
      ],
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    group: 'Khách thường',
    address: '',
    debtLimit: 2000000,
  });

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    const newCust = {
      id: Date.now(),
      code: 'KH-' + Math.floor(1000 + Math.random() * 9000),
      name: formData.name,
      phone: formData.phone,
      group: formData.group,
      points: 0,
      totalSpent: 0,
      currentDebt: 0,
      orderCount: 0,
      address: formData.address,
      recentOrders: [],
    };
    setCustomers([newCust, ...customers]);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      phone: '',
      group: 'Khách thường',
      address: '',
      debtLimit: 2000000,
    });
  };

  const filteredCustomers = customers.filter((c) => {
    const matchKw =
      c.name.toLowerCase().includes(keyword.toLowerCase()) ||
      c.phone.includes(keyword) ||
      c.code.toLowerCase().includes(keyword.toLowerCase());
    const matchGroup = groupFilter === 'ALL' || c.group === groupFilter;
    return matchKw && matchGroup;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Khách Hàng & Điểm Tích Lũy
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Quản lý thông tin khách lẻ, khách sỉ, điểm thưởng thành viên và hạn mức nợ
          </p>
        </div>

        <Button
          variant="3d-solid"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Thêm Khách Hàng Mới
        </Button>
      </div>

      {/* 2. Filter & Search */}
      <div className="soft-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT hoặc mã khách hàng..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-slate-100 border border-transparent focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="bg-slate-100 border border-transparent focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none transition"
          >
            <option value="ALL">Tất cả nhóm khách</option>
            <option value="Khách lẻ">Khách lẻ</option>
            <option value="Khách thường">Khách thường</option>
            <option value="Khách sỉ">Khách sỉ</option>
            <option value="VIP">VIP Thân thiết</option>
          </select>
        </div>
      </div>

      {/* 3. Table Dạng Lưới 3D Thủy Tinh */}
      <div className="table-glass-container">
        <div className="overflow-x-auto">
          <table className="table-3d-glass text-left text-xs">
            <thead>
              <tr>
                <th>Mã KH</th>
                <th>Họ & Tên</th>
                <th>Số Điện Thoại</th>
                <th>Nhóm Khách</th>
                <th className="text-right">Điểm Thưởng</th>
                <th className="text-right">Tổng Tiền Mua</th>
                <th className="text-right">Nợ Hiện Tại</th>
                <th className="text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td className="p-4 font-mono font-bold text-blue-700">{c.code}</td>
                  <td className="p-4 font-extrabold text-slate-900">{c.name}</td>
                  <td className="p-4 text-slate-600 font-medium">{c.phone}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        c.group === 'VIP'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : c.group === 'Khách sỉ'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.group}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-amber-600">
                    {c.points} điểm
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900">
                    {c.totalSpent.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-4 text-right font-black text-rose-600">
                    {c.currentDebt > 0 ? c.currentDebt.toLocaleString('vi-VN') + ' đ' : '0 đ'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedCustomer(c);
                          setIsDetailModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Xem chi tiết & lịch sử"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Khách Hàng */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Thêm Khách Hàng Mới
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Nhập thông tin liên hệ và thiết lập nhóm giá bán lẻ hoặc bán sỉ
            </p>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ & Tên Khách Hàng *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Anh Tuấn (Quán cơm)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số Điện Thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="09xx xxx xxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhóm Khách Hàng
                  </label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Khách lẻ">Khách lẻ</option>
                    <option value="Khách thường">Khách thường</option>
                    <option value="Khách sỉ">Khách sỉ (Ưu tiên giá buôn)</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Địa Chỉ</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Số nhà, khóm/ấp, xã/phường..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="3d-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Hủy Bỏ
                </Button>
                <Button type="submit" variant="3d-solid">
                  Lưu Khách Hàng
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chi Tiết Khách Hàng */}
      {isDetailModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 mb-1">
              Hồ Sơ: {selectedCustomer.name}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Mã KH: {selectedCustomer.code} • SĐT: {selectedCustomer.phone}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="soft-card p-3 bg-slate-50 text-center">
                <p className="text-[10px] text-slate-500 font-semibold">Tổng chi tiêu</p>
                <p className="text-sm font-black text-slate-900 mt-1">
                  {selectedCustomer.totalSpent.toLocaleString('vi-VN')} đ
                </p>
              </div>
              <div className="soft-card p-3 bg-slate-50 text-center">
                <p className="text-[10px] text-slate-500 font-semibold">Điểm tích lũy</p>
                <p className="text-sm font-black text-amber-600 mt-1">
                  {selectedCustomer.points} điểm
                </p>
              </div>
              <div className="soft-card p-3 bg-slate-50 text-center">
                <p className="text-[10px] text-slate-500 font-semibold">Sổ nợ hiện tại</p>
                <p className="text-sm font-black text-rose-600 mt-1">
                  {selectedCustomer.currentDebt.toLocaleString('vi-VN')} đ
                </p>
              </div>
            </div>

            <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-600" />
              Lịch Sử Đơn Hàng Gần Đây
            </h3>
            <div className="divide-y divide-slate-100 text-xs mb-5">
              {selectedCustomer.recentOrders.length > 0 ? (
                selectedCustomer.recentOrders.map((ord, i) => (
                  <div key={i} className="py-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-blue-700">{ord.code}</p>
                      <p className="text-[11px] text-slate-400">{ord.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{ord.total.toLocaleString('vi-VN')} đ</p>
                      <span className="text-[10px] font-bold text-emerald-600">{ord.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 py-3 text-center">Chưa có giao dịch nào</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="3d-secondary" onClick={() => setIsDetailModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
