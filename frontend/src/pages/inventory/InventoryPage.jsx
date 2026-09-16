import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Boxes, ArrowDownRight, ArrowUpRight, History } from 'lucide-react';

export const InventoryPage = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await apiClient.get('/inventory/stocks');
        setStocks(response.data || []);
      } catch (err) {
        console.error('Lỗi lấy tồn kho:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Quản Lý Tồn Kho & Thẻ Kho
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Số lượng tồn kho thực tế tính theo Đơn vị cơ sở và lịch sử xuất nhập tồn
        </p>
      </div>

      <div className="soft-card p-0 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Mã SP</th>
              <th className="p-4">Tên Sản Phẩm</th>
              <th className="p-4">Đơn Vị Tính</th>
              <th className="p-4">Tồn Kho Hiện Tại</th>
              <th className="p-4">Cảnh Báo Tối Thiểu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {loading ? (
              <tr><td colSpan="5" className="p-4 text-center">Đang tải tồn kho...</td></tr>
            ) : (
              stocks.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-blue-600">{item.product_code}</td>
                  <td className="p-4 font-bold text-slate-900">{item.product_name}</td>
                  <td className="p-4">{item.base_unit_name}</td>
                  <td className="p-4 font-extrabold text-emerald-600">
                    {Number(item.quantity_on_hand).toLocaleString('vi-VN')}
                  </td>
                  <td className="p-4 text-slate-500">{item.min_stock_alert || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
