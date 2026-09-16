import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Layers, Bookmark, Scale, Plus } from 'lucide-react';

export const CategoryBrandPage = () => {
  const [activeTab, setActiveTab] = useState('CATEGORIES'); // 'CATEGORIES' | 'BRANDS' | 'UNITS'
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    setLoading(true);
    try {
      const [catRes, brandRes, unitRes] = await Promise.all([
        apiClient.get('/products/categories'),
        apiClient.get('/products/brands'),
        apiClient.get('/products/units'),
      ]);
      setCategories(catRes.data || []);
      setBrands(brandRes.data || []);
      setUnits(unitRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Danh Mục Ngành Hàng, Thương Hiệu & Đơn Vị
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Chuẩn hóa danh mục phân loại và quy cách đo lường hàng hóa tạp hóa
          </p>
        </div>

        {/* Tab Selector */}
        {/* Tab Selector 3D Glass */}
        <div className="flex p-1.5 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 gap-1.5 shadow-sm">
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={activeTab === 'CATEGORIES' ? 'btn-3d-tab-active' : 'btn-3d-tab'}
          >
            Ngành Hàng ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('BRANDS')}
            className={activeTab === 'BRANDS' ? 'btn-3d-tab-active' : 'btn-3d-tab'}
          >
            Thương Hiệu ({brands.length})
          </button>
          <button
            onClick={() => setActiveTab('UNITS')}
            className={activeTab === 'UNITS' ? 'btn-3d-tab-active' : 'btn-3d-tab'}
          >
            Đơn Vị Tính ({units.length})
          </button>
        </div>
      </div>

      {/* Content Table Dạng Lưới 3D Thủy Tinh */}
      <div className="table-glass-container">
        <table className="table-3d-glass text-left text-xs">
          <thead>
            <tr>
              <th className="w-16">STT</th>
              <th>{activeTab === 'UNITS' ? 'Tên Đơn Vị' : 'Mã Định Danh'}</th>
              <th>Tên Hiển Thị</th>
              <th className="w-32 text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="font-medium text-slate-700">
            {loading ? (
              <tr><td colSpan="4" className="p-4 text-center">Đang tải dữ liệu...</td></tr>
            ) : activeTab === 'CATEGORIES' ? (
              categories.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td className="font-bold text-sky-700">{c.code}</td>
                  <td className="font-bold text-slate-900">{c.name}</td>
                  <td className="text-center"><span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200">Hoạt động</span></td>
                </tr>
              ))
            ) : activeTab === 'BRANDS' ? (
              brands.map((b, i) => (
                <tr key={b.id}>
                  <td>{i + 1}</td>
                  <td className="font-bold text-sky-700">{b.code}</td>
                  <td className="font-bold text-slate-900">{b.name}</td>
                  <td className="text-center"><span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200">Hoạt động</span></td>
                </tr>
              ))
            ) : (
              units.map((u, i) => (
                <tr key={u.id}>
                  <td>{i + 1}</td>
                  <td className="font-bold text-sky-700">ĐVT-{u.id}</td>
                  <td className="font-bold text-slate-900">{u.name}</td>
                  <td className="text-center"><span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200">Chuẩn hóa</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
