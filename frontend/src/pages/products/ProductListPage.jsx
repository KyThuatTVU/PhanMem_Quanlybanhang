import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { exportToExcel } from '../../utils/excelExport';
import {
  Package,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Barcode,
  ArrowRightLeft,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const ProductListPage = () => {
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = tạo mới, object = đang sửa
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Danh mục mẫu
  const categories = [
    { id: 1, name: 'Nước giải khát' },
    { id: 2, name: 'Mì & Thực phẩm ăn liền' },
    { id: 3, name: 'Sữa & Bơ sữa' },
    { id: 4, name: 'Bánh kẹo & Snack' },
    { id: 5, name: 'Gia vị & Dầu ăn' },
  ];

  // Danh sách sản phẩm với hình ảnh và đa đơn vị tính
  const [products, setProducts] = useState([
    {
      id: 1,
      sku: 'COCA-330',
      name: 'Nước ngọt Coca-Cola 330ml',
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
      category: 'Nước giải khát',
      brand: 'Coca-Cola',
      baseUnit: 'Lon',
      baseBarcode: '8934560111118',
      costPrice: 8500,
      retailPrice: 10000,
      wholesalePrice: 9200,
      stock: 120,
      minStock: 24,
      status: 'ACTIVE',
      conversions: [
        { unit: 'Lốc (6 Lon)', factor: 6, barcode: '8934560111125', retailPrice: 58000, wholesalePrice: 54000 },
        { unit: 'Thùng (24 Lon)', factor: 24, barcode: '8934560111132', retailPrice: 230000, wholesalePrice: 215000 },
      ],
    },
    {
      id: 2,
      sku: 'HAO-HAO-75',
      name: 'Mì Hảo Hảo Tôm Chua Cay 75g',
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80',
      category: 'Mì & Thực phẩm ăn liền',
      brand: 'Acecook',
      baseUnit: 'Gói',
      baseBarcode: '8935001700018',
      costPrice: 3800,
      retailPrice: 4500,
      wholesalePrice: 4200,
      stock: 18,
      minStock: 50,
      status: 'ACTIVE',
      conversions: [
        { unit: 'Thùng (30 Gói)', factor: 30, barcode: '8935001700025', retailPrice: 130000, wholesalePrice: 124000 },
      ],
    },
    {
      id: 3,
      sku: 'VINAMILK-180',
      name: 'Sữa tươi Vinamilk 100% 180ml',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
      category: 'Sữa & Bơ sữa',
      brand: 'Vinamilk',
      baseUnit: 'Hộp',
      baseBarcode: '8934673123456',
      costPrice: 7600,
      retailPrice: 9000,
      wholesalePrice: 8500,
      stock: 85,
      minStock: 30,
      status: 'ACTIVE',
      conversions: [
        { unit: 'Lốc (4 Hộp)', factor: 4, barcode: '8934673123463', retailPrice: 35000, wholesalePrice: 33000 },
        { unit: 'Thùng (48 Hộp)', factor: 48, barcode: '8934673123470', retailPrice: 410000, wholesalePrice: 390000 },
      ],
    },
    {
      id: 4,
      sku: 'OSTAR-65',
      name: 'Bánh snack khoai tây Ostar 65g',
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80',
      category: 'Bánh kẹo & Snack',
      brand: 'Orion',
      baseUnit: 'Gói',
      baseBarcode: '8936036010012',
      costPrice: 11000,
      retailPrice: 14000,
      wholesalePrice: 13000,
      stock: 35,
      minStock: 20,
      status: 'ACTIVE',
      conversions: [
        { unit: 'Dây (10 Gói)', factor: 10, barcode: '8936036010029', retailPrice: 135000, wholesalePrice: 125000 },
      ],
    },
    {
      id: 5,
      sku: 'SIMPLY-1L',
      name: 'Dầu đậu nành nguyên chất Simply 1L',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80',
      category: 'Gia vị & Dầu ăn',
      brand: 'Simply',
      baseUnit: 'Chai',
      baseBarcode: '8935031201001',
      costPrice: 52000,
      retailPrice: 65000,
      wholesalePrice: 61000,
      stock: 40,
      minStock: 12,
      status: 'ACTIVE',
      conversions: [
        { unit: 'Thùng (12 Chai)', factor: 12, barcode: '8935031201018', retailPrice: 760000, wholesalePrice: 720000 },
      ],
    },
  ]);

  // State Form Thêm / Sửa Sản Phẩm
  const initialFormState = {
    sku: '',
    name: '',
    image: '',
    category: 'Nước giải khát',
    brand: 'Khác',
    baseUnit: 'Lon',
    baseBarcode: '',
    costPrice: '',
    retailPrice: '',
    wholesalePrice: '',
    stock: 0,
    minStock: 10,
    conversions: [
      { unit: 'Thùng', factor: 24, barcode: '', retailPrice: '', wholesalePrice: '' },
    ],
  };

  const [formData, setFormData] = useState(initialFormState);

  // Mở modal thêm mới
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setIsFormModalOpen(true);
  };

  // Mở modal chỉnh sửa sản phẩm
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku || '',
      name: product.name || '',
      image: product.image || '',
      category: product.category || 'Nước giải khát',
      brand: product.brand || 'Khác',
      baseUnit: product.baseUnit || 'Lon',
      baseBarcode: product.baseBarcode || '',
      costPrice: product.costPrice || '',
      retailPrice: product.retailPrice || '',
      wholesalePrice: product.wholesalePrice || '',
      stock: product.stock || 0,
      minStock: product.minStock || 10,
      conversions:
        product.conversions && product.conversions.length > 0
          ? JSON.parse(JSON.stringify(product.conversions))
          : [{ unit: 'Thùng', factor: 24, barcode: '', retailPrice: '', wholesalePrice: '' }],
    });
    setIsFormModalOpen(true);
  };

  // Xóa sản phẩm
  const handleDeleteProduct = (productId, productName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mặt hàng "${productName}" khỏi danh sách?`)) {
      setProducts(products.filter((p) => p.id !== productId));
      showToast(`Đã xóa thành công sản phẩm "${productName}"!`);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddConversion = () => {
    setFormData({
      ...formData,
      conversions: [
        ...formData.conversions,
        { unit: '', factor: 1, barcode: '', retailPrice: '', wholesalePrice: '' },
      ],
    });
  };

  const handleRemoveConversion = (index) => {
    const updated = [...formData.conversions];
    updated.splice(index, 1);
    setFormData({ ...formData, conversions: updated });
  };

  // Xử lý lưu (Thêm mới hoặc Cập nhật)
  const handleSaveProduct = (e) => {
    e.preventDefault();

    if (editingProduct) {
      // Cập nhật sản phẩm đang sửa
      const updatedList = products.map((p) => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            sku: formData.sku || p.sku,
            name: formData.name,
            image: formData.image || p.image,
            category: formData.category,
            brand: formData.brand,
            baseUnit: formData.baseUnit,
            baseBarcode: formData.baseBarcode || p.baseBarcode,
            costPrice: Number(formData.costPrice) || 0,
            retailPrice: Number(formData.retailPrice) || 0,
            wholesalePrice: Number(formData.wholesalePrice) || 0,
            stock: Number(formData.stock) || 0,
            minStock: Number(formData.minStock) || 5,
            conversions: formData.conversions.filter((c) => c.unit && c.factor > 1),
          };
        }
        return p;
      });

      setProducts(updatedList);
      showToast(`Đã cập nhật thông tin "${formData.name}" thành công!`);
    } else {
      // Thêm sản phẩm mới
      const newProd = {
        id: Date.now(),
        sku: formData.sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
        name: formData.name,
        image:
          formData.image ||
          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
        category: formData.category,
        brand: formData.brand,
        baseUnit: formData.baseUnit,
        baseBarcode: formData.baseBarcode || '893' + Math.floor(100000000 + Math.random() * 900000000),
        costPrice: Number(formData.costPrice) || 0,
        retailPrice: Number(formData.retailPrice) || 0,
        wholesalePrice: Number(formData.wholesalePrice) || 0,
        stock: Number(formData.stock) || 0,
        minStock: Number(formData.minStock) || 5,
        status: 'ACTIVE',
        conversions: formData.conversions.filter((c) => c.unit && c.factor > 1),
      };

      setProducts([newProd, ...products]);
      showToast(`Đã thêm mới sản phẩm "${newProd.name}" thành công!`);
    }

    setIsFormModalOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter((p) => {
    const matchKw =
      p.name.toLowerCase().includes(keyword.toLowerCase()) ||
      p.sku.toLowerCase().includes(keyword.toLowerCase()) ||
      p.baseBarcode.includes(keyword);
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchKw && matchCat;
  });

  const handleExportProducts = () => {
    exportToExcel(
      filteredProducts.map((product) => ({
        SKU: product.sku,
        'Tên sản phẩm': product.name,
        'Ngành hàng': product.category,
        'Thương hiệu': product.brand,
        'Đơn vị cơ sở': product.baseUnit,
        Barcode: product.baseBarcode,
        'Giá vốn': product.costPrice,
        'Giá bán lẻ': product.retailPrice,
        'Giá bán sỉ': product.wholesalePrice,
        'Tồn kho': product.stock,
        'Tồn tối thiểu': product.minStock,
        'Trạng thái': product.status === 'ACTIVE' ? 'Đang bán' : 'Ngừng bán',
        'Đơn vị quy đổi': (product.conversions || []).map((item) => item.unit).join(', '),
      })),
      'DanhSachSanPham',
      'Sản phẩm'
    );
    showToast(`Đã xuất ${filteredProducts.length} sản phẩm ra Excel.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast thông báo thành công */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-3.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Danh Mục Hàng Hóa & Hình Ảnh Sản Phẩm
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Quản lý hình ảnh thực tế, mã vạch, giá vốn, giá bán lẻ/sỉ và quy đổi đơn vị tính
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="3d-secondary"
            icon={Upload}
            onClick={() => setIsImportModalOpen(true)}
          >
            Nhập Excel
          </Button>
          <Button
            variant="3d-secondary"
            icon={Download}
            onClick={handleExportProducts}
          >
            Xuất Excel
          </Button>
          <Button
            variant="3d-solid"
            icon={Plus}
            onClick={handleOpenCreate}
          >
            Thêm Sản Phẩm Mới
          </Button>
        </div>
      </div>

      {/* 2. Bộ lọc tìm kiếm */}
      <div className="soft-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên SP, SKU hoặc quét barcode..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-emerald-50/40 border border-emerald-200/60 focus:border-emerald-500 focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-emerald-50/40 border border-emerald-200/60 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-700 font-semibold focus:outline-none transition shadow-inner"
          >
            <option value="ALL">Tất cả ngành hàng</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Bảng Sản Phẩm Kèm Hình Ảnh Thực Tế Dạng Lưới 3D Thủy Tinh */}
      <div className="table-glass-container">
        <div className="overflow-x-auto">
          <table className="table-3d-glass text-left text-xs">
            <thead>
              <tr>
                <th className="w-20 text-center">Hình Ảnh</th>
                <th>Mã SKU / Barcode</th>
                <th>Tên Hàng Hóa</th>
                <th>Ngành Hàng</th>
                <th>Đơn Vị Cơ Sở</th>
                <th>Quy Đổi Đơn Vị (ĐVT Phụ)</th>
                <th className="text-right">Giá Bán Lẻ</th>
                <th className="text-right">Giá Sỉ</th>
                <th className="text-right">Tồn Kho</th>
                <th className="text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  {/* Cột Hình Ảnh Sản Phẩm */}
                  <td className="p-3 text-center">
                    {p.image ? (
                      <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm mx-auto flex items-center justify-center p-0.5">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover rounded-lg hover:scale-110 transition duration-200 cursor-pointer"
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsDetailModalOpen(true);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </td>

                  <td className="p-4">
                    <span className="font-mono font-bold text-slate-800">{p.sku}</span>
                    <p className="font-mono text-[10px] text-blue-600 flex items-center gap-1">
                      <Barcode className="w-3 h-3" /> {p.baseBarcode}
                    </p>
                  </td>
                  <td className="p-4 font-extrabold text-slate-900">{p.name}</td>
                  <td className="p-4 text-slate-600">{p.category}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[11px] rounded-md border border-blue-200">
                      {p.baseUnit}
                    </span>
                  </td>
                  <td className="p-4">
                    {p.conversions && p.conversions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {p.conversions.map((c, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 font-medium text-[10px] rounded-md"
                          >
                            <ArrowRightLeft className="w-2.5 h-2.5 text-slate-400" />
                            {c.unit} (x{c.factor})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Chỉ bán lẻ</span>
                    )}
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900">
                    {p.retailPrice.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-4 text-right font-medium text-slate-600">
                    {p.wholesalePrice.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-4 text-right">
                    <span
                      className={`font-black text-xs ${
                        p.stock <= p.minStock ? 'text-amber-600' : 'text-slate-800'
                      }`}
                    >
                      {p.stock} {p.baseUnit}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsDetailModalOpen(true);
                        }}
                        className="btn-3d-icon p-2 text-slate-500 hover:text-sky-600"
                        title="Xem ảnh & chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="btn-3d-icon p-2 text-slate-500 hover:text-emerald-600"
                        title="Chỉnh sửa sản phẩm"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="btn-3d-icon p-2 text-slate-500 hover:text-rose-600"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Mới HOẶC Chỉnh Sửa Sản Phẩm */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              {editingProduct ? `Chỉnh Sửa Sản Phẩm: ${editingProduct.name}` : 'Thêm Mặt Hàng Mới & Hình Ảnh'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {editingProduct
                ? 'Cập nhật lại giá bán, mã vạch, số lượng tồn kho hoặc hình ảnh của sản phẩm này'
                : 'Tải ảnh sản phẩm và cấu hình các cấp đơn vị quy đổi (VD: 1 Thùng = 24 Lon)'}
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Component Upload Hình Ảnh Sản Phẩm */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <ImageUpload
                  label="Ảnh Đại Diện Mặt Hàng (Hiển thị POS & Danh mục)"
                  value={formData.image}
                  onChange={(img) => setFormData({ ...formData, image: img })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="VD: COCA-330"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã Vạch Cơ Sở (Barcode)
                  </label>
                  <input
                    type="text"
                    value={formData.baseBarcode}
                    onChange={(e) => setFormData({ ...formData, baseBarcode: e.target.value })}
                    placeholder="Quét hoặc nhập 13 số EAN..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Sản Phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Nước ngọt Coca-Cola 330ml"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngành Hàng</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đơn Vị Cơ Bản</label>
                  <input
                    type="text"
                    required
                    value={formData.baseUnit}
                    onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                    placeholder="Lon / Chai / Gói / Cái"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tồn Tối Thiểu
                  </label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giá Vốn (Nhập)
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="8500"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giá Bán Lẻ</label>
                  <input
                    type="number"
                    value={formData.retailPrice}
                    onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                    placeholder="10000"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-blue-700 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giá Bán Sỉ</label>
                  <input
                    type="number"
                    value={formData.wholesalePrice}
                    onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                    placeholder="9200"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Bảng Quy Đổi Đơn Vị Phụ */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                    Đơn Vị Quy Đổi Bán Sỉ (Thùng / Lốc / Hộp lớn)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddConversion}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    + Thêm quy đổi
                  </button>
                </div>

                {formData.conversions.map((conv, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 items-center bg-slate-50 p-2 rounded-lg text-xs">
                    <input
                      type="text"
                      placeholder="Tên ĐVT (VD: Thùng)"
                      value={conv.unit}
                      onChange={(e) => {
                        const updated = [...formData.conversions];
                        updated[idx].unit = e.target.value;
                        setFormData({ ...formData, conversions: updated });
                      }}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold"
                    />

                    <input
                      type="number"
                      placeholder="Quy đổi (VD: 24)"
                      value={conv.factor}
                      onChange={(e) => {
                        const updated = [...formData.conversions];
                        updated[idx].factor = Number(e.target.value);
                        setFormData({ ...formData, conversions: updated });
                      }}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-center"
                    />

                    <input
                      type="number"
                      placeholder="Giá lẻ (230.000)"
                      value={conv.retailPrice}
                      onChange={(e) => {
                        const updated = [...formData.conversions];
                        updated[idx].retailPrice = e.target.value;
                        setFormData({ ...formData, conversions: updated });
                      }}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold"
                    />

                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Mã vạch riêng"
                        value={conv.barcode}
                        onChange={(e) => {
                          const updated = [...formData.conversions];
                          updated[idx].barcode = e.target.value;
                          setFormData({ ...formData, conversions: updated });
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono w-full"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveConversion(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="3d-secondary"
                  onClick={() => {
                    setIsFormModalOpen(false);
                    setEditingProduct(null);
                  }}
                >
                  Hủy Bỏ
                </Button>
                <Button type="submit" variant="3d-solid">
                  {editingProduct ? 'Lưu Thay Đổi' : 'Lưu Sản Phẩm & Ảnh'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chi Tiết Sản Phẩm Kèm Ảnh Lớn */}
      {isDetailModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex gap-4 items-start mb-4">
              {selectedProduct.image ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-24 h-24 object-cover rounded-2xl border border-slate-200 shadow-sm shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                  {selectedProduct.name}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Mã SKU: <span className="font-mono font-bold text-slate-800">{selectedProduct.sku}</span>
                </p>
                <p className="text-xs text-blue-600 font-mono mt-0.5">
                  Barcode: {selectedProduct.baseBarcode}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Ngành hàng:</span>
                <span className="font-bold text-slate-800">{selectedProduct.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thương hiệu:</span>
                <span className="font-bold text-slate-800">{selectedProduct.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Đơn vị cơ sở:</span>
                <span className="font-bold text-blue-700">{selectedProduct.baseUnit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Giá vốn / Giá bán lẻ:</span>
                <span className="font-bold text-slate-900">
                  {selectedProduct.costPrice.toLocaleString('vi-VN')} đ / {selectedProduct.retailPrice.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tồn kho hiện tại:</span>
                <span className="font-black text-emerald-600">
                  {selectedProduct.stock} {selectedProduct.baseUnit}
                </span>
              </div>
            </div>

            <h3 className="text-xs font-bold text-slate-800 mb-2">Đơn Vị Quy Đổi:</h3>
            <div className="space-y-1.5 mb-5">
              {selectedProduct.conversions && selectedProduct.conversions.length > 0 ? (
                selectedProduct.conversions.map((c, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{c.unit}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Barcode: {c.barcode}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-700">{c.retailPrice.toLocaleString('vi-VN')} đ</p>
                      <p className="text-[10px] text-slate-500">Hệ số: x{c.factor}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Không có đơn vị quy đổi</p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="3d-primary"
                size="sm"
                icon={Edit}
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenEdit(selectedProduct);
                }}
              >
                Chỉnh Sửa Mặt Hàng Này
              </Button>
              <Button variant="3d-secondary" onClick={() => setIsDetailModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nhập Excel */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mb-1">
              Nhập Sản Phẩm Hàng Loạt Từ Excel
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Tải mẫu file Excel chuẩn (.xlsx) để nhập danh mục sản phẩm, mã vạch và giá bán
            </p>

            <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer mb-4">
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Kéo thả file Excel vào đây hoặc duyệt file</p>
              <p className="text-[10px] text-slate-400 mt-1">Hỗ trợ định dạng .XLSX, .CSV tối đa 10MB</p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button variant="3d-secondary" onClick={() => setIsImportModalOpen(false)}>
                Hủy Bỏ
              </Button>
              <Button
                variant="3d-solid"
                onClick={() => {
                  alert('Đã nhập thành công 45 sản phẩm từ file Excel!');
                  setIsImportModalOpen(false);
                }}
              >
                Bắt Đầu Nhập
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
