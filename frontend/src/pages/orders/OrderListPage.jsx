import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Button } from '../../components/ui/Button';
import { FileText, Search, Eye, Ban, Printer, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { TableSkeleton, LoadingSpinner } from '../../components/ui/Loading';

export const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => fetchOrders(), 300);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/orders', { params: { keyword } });
      setOrders(response.data || []);
    } catch (err) {
      console.error('Lỗi lấy đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const response = await apiClient.get(`/orders/${id}`);
      setSelectedOrder(response.data);
    } catch (err) {
      alert('Lỗi xem chi tiết đơn: ' + err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCancelOrder = async (id) => {
    const reason = prompt('Nhập lý do hủy hóa đơn và hoàn lại kho:');
    if (!reason) return;

    try {
      await apiClient.post(`/orders/${id}/cancel`, { reason });
      alert('Hủy hóa đơn thành công! Tồn kho đã được hoàn lại tự động.');
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Lỗi hủy đơn hàng');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Hóa Đơn Bán Hàng
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Xem lịch sử bán lẻ, trạng thái thanh toán và hỗ trợ in lại hóa đơn / hủy đơn
          </p>
        </div>
      </div>

      <div className="soft-card p-4 flex items-center justify-between">
        <div className="w-full sm:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo mã hóa đơn, tên khách, số điện thoại..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-slate-100 border border-transparent focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Tổng số đơn: {orders.length}
        </span>
      </div>

      <div className="table-glass-container">
        <div className="overflow-x-auto">
          <table className="table-3d-glass text-left text-xs">
            <thead>
              <tr>
                <th>Mã Hóa Đơn</th>
                <th>Thời Gian</th>
                <th>Khách Hàng</th>
                <th>Thu Ngân</th>
                <th>Tổng Thanh Toán</th>
                <th>Thanh Toán</th>
                <th>Trạng Thái Đơn</th>
                <th className="text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="font-medium text-slate-700">
              {loading ? (
                <TableSkeleton rows={6} cols={8} />
              ) : orders.length === 0 ? (
                <tr><td colSpan="8" className="p-4 text-center">Chưa có hóa đơn nào</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td className="p-4 font-bold text-blue-600">{o.code}</td>
                    <td className="p-4 text-slate-500">{new Date(o.created_at).toLocaleString('vi-VN')}</td>
                    <td className="p-4 font-semibold text-slate-900">{o.customer_name || 'Khách lẻ tại quầy'}</td>
                    <td className="p-4">{o.cashier_name}</td>
                    <td className="p-4 font-extrabold text-slate-900">
                      {Number(o.grand_total).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.payment_status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700'
                          : o.payment_status === 'PARTIAL'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {o.payment_status === 'PAID' ? 'Đã Thanh Toán' : o.payment_status === 'PARTIAL' ? 'Trả 1 phần' : 'Chưa Trả'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        o.order_status === 'COMPLETED'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-500 line-through'
                      }`}>
                        {o.order_status === 'COMPLETED' ? 'Hoàn Tất' : 'Đã Hủy'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleViewDetail(o.id)}
                        className="text-blue-600 hover:underline font-bold"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Chi Tiết Hóa Đơn & Hủy Đơn */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="soft-card bg-white max-w-lg w-full p-6 space-y-4 rounded-3xl animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Hóa Đơn: {selectedOrder.code}</h3>
                <span className="text-[11px] text-slate-500">
                  Thời gian: {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Khách hàng: <b>{selectedOrder.customer_name || 'Khách vãng lai'}</b></span>
                <span>Thu ngân: <b>{selectedOrder.cashier_name}</b></span>
              </div>

              {/* Danh sách mặt hàng */}
              <div className="border rounded-xl overflow-hidden divide-y">
                <div className="bg-slate-50 p-2 font-bold text-slate-600 grid grid-cols-12">
                  <span className="col-span-6">Sản phẩm</span>
                  <span className="col-span-2 text-center">SL</span>
                  <span className="col-span-4 text-right">Thành tiền</span>
                </div>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-2 grid grid-cols-12 items-center">
                    <div className="col-span-6">
                      <p className="font-bold text-slate-900">{item.product_name}</p>
                      <span className="text-[10px] text-slate-400">{item.unit_name}</span>
                    </div>
                    <span className="col-span-2 text-center font-bold">{item.quantity}</span>
                    <span className="col-span-4 text-right font-bold text-slate-800">
                      {Number(item.subtotal).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <div className="flex justify-between font-extrabold text-sm text-blue-600">
                  <span>Tổng thanh toán:</span>
                  <span>{Number(selectedOrder.grand_total).toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tiền khách đã trả:</span>
                  <span>{Number(selectedOrder.paid_amount).toLocaleString('vi-VN')} đ</span>
                </div>
                {selectedOrder.debt_amount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Ghi nợ lại:</span>
                    <span>{Number(selectedOrder.debt_amount).toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="3d-secondary"
                icon={Printer}
                className="flex-1"
                onClick={() => alert('Đã gửi hóa đơn tới máy in!')}
              >
                In Lại Bill
              </Button>
              {selectedOrder.order_status === 'COMPLETED' && (
                <Button
                  variant="danger"
                  icon={Ban}
                  className="flex-1"
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                >
                  Hủy Đơn & Hoàn Kho
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
