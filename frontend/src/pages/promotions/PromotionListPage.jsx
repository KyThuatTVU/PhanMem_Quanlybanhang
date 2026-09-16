import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Percent, Plus, Calendar, Tag, CheckCircle2, Clock, X } from 'lucide-react';

export const PromotionListPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    promoType: 'DISCOUNT_PERCENT_ORDER',
    startDate: '',
    endDate: '',
    minOrderValue: 0,
    discountValue: 10,
    maxDiscountAmount: 50000,
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/promotions');
      setPromotions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/promotions', formData);
      setShowModal(false);
      fetchPromotions();
      alert('Tạo chương trình khuyến mãi thành công!');
    } catch (err) {
      alert(err.message || 'Lỗi tạo khuyến mãi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Chương Trình Khuyến Mãi & Chiết Khấu
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Quản lý giảm giá theo %, theo số tiền, mua X tặng Y và áp dụng tự động tại quầy POS
          </p>
        </div>
        <Button variant="3d-solid" icon={Plus} onClick={() => setShowModal(true)}>
          Tạo Khuyến Mãi Mới
        </Button>
      </div>

      <div className="soft-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Mã KM</th>
                <th className="p-4">Tên Chương Trình</th>
                <th className="p-4">Loại Khuyến Mãi</th>
                <th className="p-4">Giá Trị Giảm</th>
                <th className="p-4">Thời Gian Hiệu Lực</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr><td colSpan="7" className="p-4 text-center">Đang tải khuyến mãi...</td></tr>
              ) : promotions.length === 0 ? (
                <tr><td colSpan="7" className="p-4 text-center">Chưa có chương trình khuyến mãi nào</td></tr>
              ) : (
                promotions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-blue-600">{p.code}</td>
                    <td className="p-4 font-bold text-slate-900">{p.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded">
                        {p.promo_type}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-slate-900">
                      {p.promo_type.includes('PERCENT') ? `${p.discount_value}%` : `${Number(p.discount_value).toLocaleString('vi-VN')} đ`}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(p.start_date).toLocaleDateString('vi-VN')} - {new Date(p.end_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.timeline_status === 'RUNNING'
                          ? 'bg-emerald-50 text-emerald-700'
                          : p.timeline_status === 'UPCOMING'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.timeline_status === 'RUNNING' ? 'Đang Chạy' : p.timeline_status === 'UPCOMING' ? 'Sắp Diễn Ra' : 'Hết Hạn'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-blue-600 hover:underline font-bold">Chỉnh sửa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Khuyến Mãi */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="soft-card bg-white max-w-lg w-full p-6 space-y-4 rounded-3xl animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Tạo Chương Trình Khuyến Mãi</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <Input
                label="Tên chương trình khuyến mãi *"
                required
                placeholder="VD: Tri ân khách hàng giảm giá 10%..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Loại khuyến mãi</label>
                  <select
                    value={formData.promoType}
                    onChange={(e) => setFormData({ ...formData, promoType: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="DISCOUNT_PERCENT_ORDER">Giảm % Tổng Đơn</option>
                    <option value="DISCOUNT_AMOUNT_ORDER">Giảm Tiền Tổng Đơn</option>
                    <option value="BUY_X_GET_Y">Mua X Tặng Y</option>
                  </select>
                </div>
                <Input
                  label="Giá trị giảm (% hoặc số tiền) *"
                  type="number"
                  required
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Ngày bắt đầu *"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <Input
                  label="Ngày kết thúc *"
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="3d-secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="3d-solid" className="flex-1">
                  Kích Hoạt Khuyến Mãi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
