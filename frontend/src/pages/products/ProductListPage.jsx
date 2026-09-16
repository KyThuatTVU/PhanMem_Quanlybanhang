import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Search, Filter, Package, Barcode, Layers, ArrowUpDown } from 'lucide-react';

export const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [keyword]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/products', {
        params: { keyword, limit: 20 },
      });
      setProducts(response.data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Sản Phẩm / Hàng Hóa
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Danh sách toàn bộ mặt hàng, đơn vị quy đổi và mức tồn kho tối thiểu
          </p>
        </div>

        <Button variant="3d-solid" icon={Plus}>
          Thêm Sản Phẩm Mới
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="soft-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo mã SP, tên sản phẩm hoặc mã vạch..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-slate-100 border border-transparent focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="3d-secondary" size="sm" icon={Filter}>
            Lọc Ngành Hàng
          </Button>
        </div>
      </div>

      {/* Bảng Danh Sách Sản Phẩm */}
      <div className="soft-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Mã SP / Barcode</th>
                <th className="p-4">Tên Sản Phẩm</th>
                <th className="p-4">Ngành Hàng</th>
                <th className="p-4">Đơn Vị Cơ Sở</th>
                <th className="p-4">Tồn Kho</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    Đang tải danh sách sản phẩm...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    Không tìm thấy sản phẩm phù hợp
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-blue-600">
                      <div>{item.code}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{item.sku || 'N/A'}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{item.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                        {item.category_name || 'Khác'}
                      </span>
                    </td>
                    <td className="p-4 font-semibold">{item.base_unit_name}</td>
                    <td className="p-4">
                      <span
                        className={`font-extrabold ${
                          item.quantity_on_hand <= item.min_stock_alert
                            ? 'text-rose-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {Number(item.quantity_on_hand).toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px]">
                        Đang Kinh Doanh
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button className="text-blue-600 hover:underline font-bold">Sửa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
