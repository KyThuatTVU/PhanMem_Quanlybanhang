import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Button } from '../../components/ui/Button';
import {
  Layers,
  Bookmark,
  Scale,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Sparkles,
  X
} from 'lucide-react';

export const CategoryBrandPage = () => {
  const [activeTab, setActiveTab] = useState('CATEGORIES'); // 'CATEGORIES' | 'BRANDS' | 'UNITS'
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Gợi ý nhanh ngành hàng đặc trưng tạp hóa (Đặc biệt nhóm Gia vị & Dầu ăn)
  const categoryTemplates = [
    { name: 'Gia vị & Dầu ăn', code: 'CAT_GIAVI', desc: 'Nước mắm, bột ngọt, hạt nêm, tiêu, muối, dầu ăn các loại' },
    { name: 'Gia vị & Đồ khô', code: 'CAT_SPICE', desc: 'Gia vị nêm nếm, nấm hương, mộc nhĩ, hành tỏi khô' },
    { name: 'Nước giải khát & Bia', code: 'CAT_BEVERAGE', desc: 'Nước ngọt, nước suối, bia lon, nước tăng lực' },
    { name: 'Bánh kẹo & Snack', code: 'CAT_SNACK', desc: 'Bánh quy, kẹo, snack khoai tây, rong biển' },
    { name: 'Sữa & Sản phẩm từ sữa', code: 'CAT_MILK', desc: 'Sữa tươi, sữa chua, bơ, phô mai' },
    { name: 'Mì & Thực phẩm ăn liền', code: 'CAT_NOODLE', desc: 'Mì gói, phở gói, cháo, miến, xúc xích' },
    { name: 'Gạo & Nông sản khô', code: 'CAT_RICE', desc: 'Gạo tẻ, gạo nếp, các loại đậu hạt khô' },
    { name: 'Hóa mỹ phẩm & Tẩy rửa', code: 'CAT_CLEAN', desc: 'Nước rửa chén, bột giặt, dầu gội, xà phòng' },
  ];

  const brandTemplates = [
    { name: 'Masan Consumer', code: 'BR_MASAN' },
    { name: 'Knorr (Unilever)', code: 'BR_KNORR' },
    { name: 'Cholimex Food', code: 'BR_CHOLIMEX' },
    { name: 'Vinamilk', code: 'BR_VINAMILK' },
    { name: 'Acecook Việt Nam', code: 'BR_ACECOOK' },
    { name: 'Simply', code: 'BR_SIMPLY' },
    { name: 'Coca-Cola', code: 'BR_COCA' },
    { name: 'PepsiCo', code: 'BR_PEPSI' },
  ];

  const unitTemplates = ['Chai', 'Gói', 'Lon', 'Hộp', 'Thùng', 'Lốc', 'Kg', 'Bịch', 'Can', 'Hũ'];

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
      console.error('Lỗi nạp danh mục:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    let defaultCode = '';
    if (activeTab === 'CATEGORIES') {
      defaultCode = `CAT_${Date.now().toString().slice(-4)}`;
    } else if (activeTab === 'BRANDS') {
      defaultCode = `BR_${Date.now().toString().slice(-4)}`;
    }
    setFormData({ code: defaultCode, name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      code: item.code || '',
      name: item.name || '',
      description: item.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên!');
      return;
    }

    setSubmitting(true);
    try {
      if (activeTab === 'CATEGORIES') {
        if (editingItem) {
          await apiClient.put(`/products/categories/${editingItem.id}`, {
            name: formData.name.trim(),
            code: formData.code.trim() || undefined,
            description: formData.description.trim(),
          });
          showNotification(`Đã cập nhật ngành hàng "${formData.name}" thành công!`);
        } else {
          await apiClient.post('/products/categories', {
            name: formData.name.trim(),
            code: formData.code.trim() || `CAT_${Date.now().toString().slice(-4)}`,
            description: formData.description.trim(),
          });
          showNotification(`Đã thêm ngành hàng "${formData.name}" thành công!`);
        }
      } else if (activeTab === 'BRANDS') {
        await apiClient.post('/products/brands', {
          name: formData.name.trim(),
          code: formData.code.trim() || `BR_${Date.now().toString().slice(-4)}`,
        });
        showNotification(`Đã thêm thương hiệu "${formData.name}" thành công!`);
      } else if (activeTab === 'UNITS') {
        await apiClient.post('/products/units', {
          name: formData.name.trim(),
        });
        showNotification(`Đã thêm đơn vị tính "${formData.name}" thành công!`);
      }

      setIsModalOpen(false);
      fetchMeta();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (item) => {
    const itemName = item.name;
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa "${itemName}" không?`);
    if (!confirmDelete) return;

    try {
      if (activeTab === 'CATEGORIES') {
        await apiClient.delete(`/products/categories/${item.id}`);
        showNotification(`Đã xóa ngành hàng "${itemName}"`);
      } else if (activeTab === 'BRANDS') {
        await apiClient.delete(`/products/brands/${item.id}`);
        showNotification(`Đã xóa thương hiệu "${itemName}"`);
      } else if (activeTab === 'UNITS') {
        await apiClient.delete(`/products/units/${item.id}`);
        showNotification(`Đã xóa đơn vị tính "${itemName}"`);
      }
      fetchMeta();
    } catch (err) {
      console.error(err);
      alert('Không thể xóa mục này vì có thể đã phát sinh hàng hóa liên quan.');
    }
  };

  const applyTemplate = (tpl) => {
    if (typeof tpl === 'string') {
      setFormData((prev) => ({ ...prev, name: tpl }));
    } else {
      setFormData({
        name: tpl.name,
        code: tpl.code || `CAT_${Date.now().toString().slice(-4)}`,
        description: tpl.desc || '',
      });
    }
  };

  // Lọc theo từ khóa tìm kiếm
  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.code && c.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.code && b.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredUnits = units.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast thông báo */}
      {feedbackMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-500 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-xs font-bold">{feedbackMsg}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              {activeTab === 'CATEGORIES' ? (
                <Layers className="w-5 h-5" />
              ) : activeTab === 'BRANDS' ? (
                <Bookmark className="w-5 h-5" />
              ) : (
                <Scale className="w-5 h-5" />
              )}
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Danh Mục Ngành Hàng & Phân Loại Sản Phẩm
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Quản lý ngành hàng (ví dụ: <strong className="text-sky-700">Gia vị & Dầu ăn</strong>, Nước giải khát...), thương hiệu và quy cách tính chuẩn
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tab Selector */}
          <div className="flex p-1.5 bg-slate-100/90 rounded-full border border-slate-200 gap-1.5 shadow-inner">
            <button
              onClick={() => { setActiveTab('CATEGORIES'); setSearchTerm(''); }}
              className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                activeTab === 'CATEGORIES'
                  ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ngành Hàng ({categories.length})
            </button>
            <button
              onClick={() => { setActiveTab('BRANDS'); setSearchTerm(''); }}
              className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                activeTab === 'BRANDS'
                  ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thương Hiệu ({brands.length})
            </button>
            <button
              onClick={() => { setActiveTab('UNITS'); setSearchTerm(''); }}
              className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                activeTab === 'UNITS'
                  ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đơn Vị Tính ({units.length})
            </button>
          </div>

          {/* Action Thêm mới */}
          <Button
            variant="3d-solid"
            icon={Plus}
            onClick={handleOpenAddModal}
          >
            {activeTab === 'CATEGORIES'
              ? 'Thêm Ngành Hàng'
              : activeTab === 'BRANDS'
              ? 'Thêm Thương Hiệu'
              : 'Thêm Đơn Vị'}
          </Button>
        </div>
      </div>

      {/* Quick Templates Bar for Fast Adding */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Gợi ý mẫu thông dụng (Bấm để thêm nhanh):</span>
          </div>
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {activeTab === 'CATEGORIES' &&
            categoryTemplates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => {
                  setEditingItem(null);
                  setFormData({
                    name: tpl.name,
                    code: tpl.code,
                    description: tpl.desc,
                  });
                  setIsModalOpen(true);
                }}
                className="px-3.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-full text-xs font-bold transition flex items-center gap-1 shadow-sm"
              >
                <span>+ {tpl.name}</span>
              </button>
            ))}

          {activeTab === 'BRANDS' &&
            brandTemplates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => {
                  setEditingItem(null);
                  setFormData({
                    name: tpl.name,
                    code: tpl.code,
                    description: '',
                  });
                  setIsModalOpen(true);
                }}
                className="px-3.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-full text-xs font-bold transition flex items-center gap-1 shadow-sm"
              >
                <span>+ {tpl.name}</span>
              </button>
            ))}

          {activeTab === 'UNITS' &&
            unitTemplates.map((unitName, i) => (
              <button
                key={i}
                onClick={() => {
                  setEditingItem(null);
                  setFormData({
                    name: unitName,
                    code: '',
                    description: '',
                  });
                  setIsModalOpen(true);
                }}
                className="px-3.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold transition flex items-center gap-1 shadow-sm"
              >
                <span>+ {unitName}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Content Table */}
      <div className="table-glass-container bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="table-3d-glass w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
            <tr>
              <th className="w-16 p-3 text-center">STT</th>
              <th className="p-3">{activeTab === 'UNITS' ? 'Mã Quy Chuẩn' : 'Mã Định Danh'}</th>
              <th className="p-3">Tên Phân Loại / Hiển Thị</th>
              {activeTab === 'CATEGORIES' && <th className="p-3">Mô Tả Chi Tiết</th>}
              <th className="w-32 p-3 text-center">Trạng Thái</th>
              <th className="w-28 p-3 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {loading && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500 font-bold">
                  Đang tải dữ liệu danh mục...
                </td>
              </tr>
            )}

            {!loading && activeTab === 'CATEGORIES' && (
              filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">
                    Không tìm thấy ngành hàng nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c, i) => (
                  <tr key={c.id} className="hover:bg-sky-50/50 transition">
                    <td className="text-center font-bold text-slate-400">{i + 1}</td>
                    <td className="font-mono font-bold text-sky-700">{c.code}</td>
                    <td>
                      <span className="font-extrabold text-slate-900 text-sm">{c.name}</span>
                      {c.name.toLowerCase().includes('gia vị') && (
                        <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                          Thiết yếu
                        </span>
                      )}
                    </td>
                    <td className="text-slate-500 max-w-xs truncate">{c.description || 'Chưa có mô tả'}</td>
                    <td className="text-center">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200 text-[11px]">
                        Hoạt động
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          title="Sửa ngành hàng"
                          className="btn-3d-icon-edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(c)}
                          title="Xóa ngành hàng"
                          className="btn-3d-icon-delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )
            )}

            {!loading && activeTab === 'BRANDS' && (
              filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">
                    Không tìm thấy thương hiệu nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredBrands.map((b, i) => (
                  <tr key={b.id} className="hover:bg-sky-50/50 transition">
                    <td className="text-center font-bold text-slate-400">{i + 1}</td>
                    <td className="font-mono font-bold text-sky-700">{b.code}</td>
                    <td className="font-extrabold text-slate-900 text-sm">{b.name}</td>
                    <td className="text-center">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200 text-[11px]">
                        Hoạt động
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDeleteItem(b)}
                          title="Xóa thương hiệu"
                          className="btn-3d-icon-delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )
            )}

            {!loading && activeTab === 'UNITS' && (
              filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">
                    Không tìm thấy đơn vị tính nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredUnits.map((u, i) => (
                  <tr key={u.id} className="hover:bg-sky-50/50 transition">
                    <td className="text-center font-bold text-slate-400">{i + 1}</td>
                    <td className="font-mono font-bold text-sky-700">ĐVT-{u.id}</td>
                    <td className="font-extrabold text-slate-900 text-sm">{u.name}</td>
                    <td className="text-center">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200 text-[11px]">
                        Chuẩn hóa
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDeleteItem(u)}
                          title="Xóa đơn vị tính"
                          className="btn-3d-icon-delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingItem ? 'Chỉnh Sửa' : 'Thêm Mới'}{' '}
                {activeTab === 'CATEGORIES'
                  ? 'Ngành Hàng'
                  : activeTab === 'BRANDS'
                  ? 'Thương Hiệu'
                  : 'Đơn Vị Tính'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gợi ý chọn nhanh ngay trong modal */}
            {!editingItem && (
              <div className="bg-sky-50/50 p-3 rounded-xl border border-sky-100 space-y-2">
                <p className="text-[11px] font-bold text-sky-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  Gợi ý tên nhanh (Bấm để điền mẫu):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activeTab === 'CATEGORIES' &&
                    categoryTemplates.slice(0, 5).map((t, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => applyTemplate(t)}
                        className="text-[10px] font-bold bg-white text-sky-700 px-2 py-1 rounded-md border border-sky-200 hover:bg-sky-100 transition"
                      >
                        {t.name}
                      </button>
                    ))}
                  {activeTab === 'BRANDS' &&
                    brandTemplates.slice(0, 5).map((t, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => applyTemplate(t)}
                        className="text-[10px] font-bold bg-white text-sky-700 px-2 py-1 rounded-md border border-sky-200 hover:bg-sky-100 transition"
                      >
                        {t.name}
                      </button>
                    ))}
                  {activeTab === 'UNITS' &&
                    unitTemplates.slice(0, 6).map((unitName, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => applyTemplate(unitName)}
                        className="text-[10px] font-bold bg-white text-sky-700 px-2 py-1 rounded-md border border-sky-200 hover:bg-sky-100 transition"
                      >
                        {unitName}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitModal} className="space-y-3.5">
              {activeTab !== 'UNITS' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã Định Danh (Code)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ví dụ: CAT_GIAVI, BR_MASAN..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên {activeTab === 'CATEGORIES' ? 'Ngành Hàng' : activeTab === 'BRANDS' ? 'Thương Hiệu' : 'Đơn Vị'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={
                    activeTab === 'CATEGORIES'
                      ? 'Ví dụ: Gia vị & Dầu ăn, Nước giải khát...'
                      : activeTab === 'BRANDS'
                      ? 'Ví dụ: Masan, Knorr, Vinamilk...'
                      : 'Ví dụ: Chai, Gói, Hộp, Thùng...'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                  autoFocus
                />
              </div>

              {activeTab === 'CATEGORIES' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mô Tả & Ghi Chú Phân Loại
                  </label>
                  <textarea
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả các mặt hàng thuộc nhóm này..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold text-slate-600 px-4 py-2"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow"
                >
                  {submitting ? 'Đang Lưu...' : editingItem ? 'Cập Nhật' : 'Lưu Danh Mục'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

