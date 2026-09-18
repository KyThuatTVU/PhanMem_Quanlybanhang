import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Truck, Plus, Search, Phone, MapPin, DollarSign, X, Check, Eye } from 'lucide-react';

export const SupplierListPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    taxCode: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, [keyword]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/suppliers', { params: { keyword } });
      setSuppliers(response.data || []);
    } catch (err) {
      console.error('Lỗi lấy nhà cung cấp:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/suppliers', formData);
      setShowModal(false);
      setFormData({ name: '', contactName: '', phone: '', email: '', address: '', taxCode: '' });
      fetchSuppliers();
      alert('Thêm nhà cung cấp thành công!');
    } catch (err) {
      alert(err.message || 'Lỗi thêm nhà cung cấp');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Nhà Cung Cấp & Đại Lý
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Danh sách đối tác cung ứng hàng hóa và theo dõi công nợ nhập hàng
          </p>
        </div>
        <Button variant="3d-solid" icon={Plus} onClick={() => setShowModal(true)}>
          Thêm Nhà Cung Cấp
        </Button>
      </div>

      <div className="soft-card p-4 flex items-center justify-between">
        <div className="w-full sm:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã NCC hoặc số điện thoại..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-slate-100 border border-transparent focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Tổng cộng: {suppliers.length} nhà cung ứng
        </span>
      </div>

      <div className="soft-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Mã NCC</th>
                <th className="p-4">Tên Nhà Phân Phối</th>
                <th className="p-4">Người Liên Hệ</th>
                <th className="p-4">Điện Thoại / Email</th>
                <th className="p-4">Địa Chỉ</th>
                <th className="p-4">Quán Đang Nợ</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr><td colSpan="7" className="p-4 text-center">Đang tải danh sách...</td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan="7" className="p-4 text-center">Chưa có nhà cung cấp nào</td></tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-blue-600">{s.code}</td>
                    <td className="p-4 font-bold text-slate-900">{s.name}</td>
                    <td className="p-4">{s.contact_name || '---'}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{s.phone}</div>
                      <span className="text-[10px] text-slate-400">{s.email || '---'}</span>
                    </td>
                    <td className="p-4 max-w-[200px] truncate">{s.address || '---'}</td>
                    <td className="p-4 font-extrabold text-amber-600">
                      {Number(s.current_debt || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end">
                        <button className="btn-3d-icon-view" title="Xem chi tiết nhà cung cấp">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Nhà Cung Cấp */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="soft-card bg-white max-w-lg w-full p-6 space-y-4 rounded-3xl animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Thêm Nhà Cung Cấp Mới</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <Input
                label="Tên nhà phân phối *"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Người đại diện"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                />
                <Input
                  label="Số điện thoại *"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <Input
                label="Địa chỉ"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="3d-secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="3d-solid" className="flex-1">
                  Lưu Nhà Cung Cấp
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
