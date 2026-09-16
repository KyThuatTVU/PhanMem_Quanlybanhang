import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { RotateCcw, Search, Check, AlertCircle, ShoppingBag } from 'lucide-react';

export const CustomerReturnPage = () => {
  const [orderCode, setOrderCode] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [returnItems, setReturnItems] = useState({});
  const [reason, setReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returnHistory, setReturnHistory] = useState([]);

  useEffect(() => {
    fetchReturnHistory();
  }, []);

  const fetchReturnHistory = async () => {
    try {
      const res = await apiClient.get('/returns');
      setReturnHistory(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchOrder = async (e) => {
    e.preventDefault();
    if (!orderCode.trim()) return;

    try {
      // Tìm đơn hàng theo mã
      const orderRes = await apiClient.get('/orders', { params: { keyword: orderCode.trim() } });
      const foundOrder = orderRes.data?.[0];
      if (!foundOrder) {
        alert('Không tìm thấy hóa đơn có mã: ' + orderCode);
        return;
      }

      // Lấy chi tiết mặt hàng và số lượng còn lại có thể trả
      const itemsRes = await apiClient.get(`/returns/order/${foundOrder.id}/items`);
      setSearchedOrder({ ...foundOrder, items: itemsRes.data });
      setReturnItems({});
    } catch (err) {
      alert('Lỗi tra cứu đơn: ' + err.message);
    }
  };

  const handleQuantityChange = (itemId, val, maxVal) => {
    const num = Math.min(Math.max(0, parseFloat(val) || 0), maxVal);
    setReturnItems((prev) => ({ ...prev, [itemId]: num }));
  };

  const handleSubmitReturn = async () => {
    const selectedItems = Object.entries(returnItems)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const originalItem = searchedOrder.items.find((it) => it.id === parseInt(id, 10));
        return {
          productId: originalItem.product_id,
          productUnitId: originalItem.product_unit_id,
          quantity: qty,
          unitPrice: parseFloat(originalItem.unit_price),
          conversionRate: parseFloat(originalItem.conversion_rate),
        };
      });

    if (selectedItems.length === 0) {
      alert('Vui lòng nhập số lượng hàng muốn trả lại!');
      return;
    }

    const totalRefund = selectedItems.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

    setIsSubmitting(true);
    try {
      await apiClient.post('/returns', {
        originalOrderId: searchedOrder.id,
        customerId: searchedOrder.customer_id,
        items: selectedItems,
        totalRefundAmount: totalRefund,
        refundMethod,
        debtDeduction: refundMethod === 'DEDUCT_DEBT' ? totalRefund : 0,
        reason,
      });

      alert(`Tiếp nhận trả hàng thành công! Hoàn tiền: ${totalRefund.toLocaleString('vi-VN')} đ`);
      setSearchedOrder(null);
      setOrderCode('');
      fetchReturnHistory();
    } catch (err) {
      alert(err.message || 'Lỗi xử lý trả hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Tiếp Nhận Khách Hàng Trả Hàng
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Tra cứu hóa đơn gốc, chọn mặt hàng khách trả lại, hoàn tiền và tự động tăng lại tồn kho
        </p>
      </div>

      {/* Form Tra Cứu Hóa Đơn Gốc */}
      <div className="soft-card p-4">
        <form onSubmit={handleSearchOrder} className="flex gap-2 max-w-md">
          <Input
            placeholder="Nhập mã hóa đơn gốc (VD: HD20260915-001)..."
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
          />
          <Button type="submit" variant="3d-solid" icon={Search}>
            Tìm Hóa Đơn
          </Button>
        </form>
      </div>

      {/* Hiển Thị Chi Tiết Đơn Đã Tìm Thấy Để Chọn Trả Hàng */}
      {searchedOrder && (
        <div className="soft-card space-y-4 border-2 border-blue-500/30">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Hóa đơn: {searchedOrder.code} - Khách: {searchedOrder.customer_name || 'Khách lẻ'}
              </h3>
              <span className="text-[11px] text-slate-400">
                Tổng đã mua: {Number(searchedOrder.grand_total).toLocaleString('vi-VN')} đ
              </span>
            </div>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg">
              Đang Tiếp Nhận Đổi Trả
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b">
                <tr>
                  <th className="p-3">Tên Hàng Hóa</th>
                  <th className="p-3">Đơn Vị</th>
                  <th className="p-3 text-center">Đã Mua</th>
                  <th className="p-3 text-center">Đã Trả Trước Đó</th>
                  <th className="p-3 text-center">Còn Lại Có Thể Trả</th>
                  <th className="p-3 text-right">Đơn Giá Hoàn</th>
                  <th className="p-3 text-center w-36">SL Khách Trả</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-800 font-medium">
                {searchedOrder.items?.map((item) => {
                  const maxReturnable = item.quantity - item.previously_returned_quantity;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{item.product_name}</td>
                      <td className="p-3">{item.unit_name}</td>
                      <td className="p-3 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-center text-slate-400">{item.previously_returned_quantity}</td>
                      <td className="p-3 text-center font-bold text-blue-600">{maxReturnable}</td>
                      <td className="p-3 text-right font-bold">{Number(item.unit_price).toLocaleString('vi-VN')} đ</td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max={maxReturnable}
                          disabled={maxReturnable <= 0}
                          placeholder="0"
                          value={returnItems[item.id] || ''}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value, maxReturnable)}
                          className="w-24 text-center border border-slate-300 rounded-lg py-1 text-xs font-bold text-blue-600 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t">
            <Input
              label="Lý do khách trả hàng"
              placeholder="Hàng cận hạn, bao bì móp méo..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phương thức hoàn tiền</label>
              <select
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="CASH">Tiền Mặt (Xuất từ két ca bán hàng)</option>
                <option value="BANK_TRANSFER">Chuyển Khoản Ngân Hàng</option>
                <option value="DEDUCT_DEBT">Cấn Trừ Vào Nợ Cũ Của Khách</option>
              </select>
            </div>
          </div>

          <Button
            variant="3d-solid"
            size="lg"
            isLoading={isSubmitting}
            onClick={handleSubmitReturn}
            className="w-full font-bold"
          >
            Xác Nhận Trả Hàng & Hoàn Kho
          </Button>
        </div>
      )}

      {/* Lịch Sử Các Lần Trả Hàng */}
      {/* Lịch Sử Các Lần Trả Hàng */}
      <div className="table-glass-container">
        <div className="p-4 border-b border-white/60 font-black text-xs text-slate-800 bg-white/40 backdrop-blur-sm">
          Lịch Sử Trả Hàng Gần Đây ({returnHistory.length})
        </div>
        <div className="overflow-x-auto">
          <table className="table-3d-glass text-left text-xs">
            <thead>
              <tr>
                <th>Mã Phiếu Trả</th>
                <th>Hóa Đơn Gốc</th>
                <th>Khách Hàng</th>
                <th>Tổng Tiền Hoàn</th>
                <th>Phương Thức</th>
                <th>Lý Do</th>
                <th>Thời Gian</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 font-medium">
              {returnHistory.map((rh) => (
                <tr key={rh.id}>
                  <td className="p-3 font-bold text-rose-600">{rh.code}</td>
                  <td className="p-3 font-semibold text-blue-600">{rh.original_order_code}</td>
                  <td className="p-3">{rh.customer_name || 'Khách lẻ'}</td>
                  <td className="p-3 font-bold text-slate-900">{Number(rh.total_refund_amount).toLocaleString('vi-VN')} đ</td>
                  <td className="p-3">{rh.refund_method}</td>
                  <td className="p-3 max-w-[150px] truncate">{rh.reason || '---'}</td>
                  <td className="p-3 text-slate-400">{new Date(rh.created_at).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
