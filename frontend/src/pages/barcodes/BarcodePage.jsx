import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useStoreSettings } from '../../stores/useStoreSettings';
import {
  Barcode,
  Plus,
  Search,
  Printer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Copy,
  RefreshCw
} from 'lucide-react';

export const BarcodePage = () => {
  const { settings } = useStoreSettings();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedBarcodeForPrint, setSelectedBarcodeForPrint] = useState(null);
  const [printQuantity, setPrintQuantity] = useState(10);
  const [paperType, setPaperType] = useState('35x22');

  const [barcodes, setBarcodes] = useState([
    {
      id: 1,
      code: '8934560111118',
      productName: 'Nước ngọt Coca-Cola 330ml',
      unitName: 'Lon (Cơ sở)',
      type: 'EAN-13',
      price: 10000,
      status: 'VALID',
      createdAt: '2026-03-10',
    },
    {
      id: 2,
      code: '8934560111125',
      productName: 'Nước ngọt Coca-Cola 330ml',
      unitName: 'Lốc (6 Lon)',
      type: 'EAN-13',
      price: 58000,
      status: 'VALID',
      createdAt: '2026-03-10',
    },
    {
      id: 3,
      code: '8934560111132',
      productName: 'Nước ngọt Coca-Cola 330ml',
      unitName: 'Thùng (24 Lon)',
      type: 'EAN-13',
      price: 230000,
      status: 'VALID',
      createdAt: '2026-03-10',
    },
    {
      id: 4,
      code: '8935001700018',
      productName: 'Mì Hảo Hảo Tôm Chua Cay 75g',
      unitName: 'Gói (Cơ sở)',
      type: 'EAN-13',
      price: 4500,
      status: 'VALID',
      createdAt: '2026-03-11',
    },
    {
      id: 5,
      code: '8935001700025',
      productName: 'Mì Hảo Hảo Tôm Chua Cay 75g',
      unitName: 'Thùng (30 Gói)',
      type: 'EAN-13',
      price: 130000,
      status: 'VALID',
      createdAt: '2026-03-11',
    },
    {
      id: 6,
      code: '8934673123456',
      productName: 'Sữa tươi Vinamilk 100% 180ml',
      unitName: 'Hộp (Cơ sở)',
      type: 'EAN-13',
      price: 9000,
      status: 'VALID',
      createdAt: '2026-03-12',
    },
    {
      id: 7,
      code: '2001002003001',
      productName: 'Thịt Heo Ba Rọi Cân Ký (Mã nội bộ)',
      unitName: 'Kg (Cân điện tử)',
      type: 'CODE-128',
      price: 145000,
      status: 'VALID',
      createdAt: '2026-03-14',
    },
    {
      id: 8,
      code: '8934560111118',
      productName: 'Trùng mã (Kiểm tra cảnh báo)',
      unitName: 'Lon',
      type: 'EAN-13',
      price: 10000,
      status: 'DUPLICATE',
      createdAt: '2026-03-15',
    },
    {
      id: 9,
      code: '8930000000009',
      productName: 'Mã vạch trống / Chưa gán SP',
      unitName: 'Chưa gắn',
      type: 'EAN-13',
      price: 0,
      status: 'UNUSED',
      createdAt: '2026-03-15',
    }
  ]);

  const [newBarcode, setNewBarcode] = useState({
    code: '',
    productName: '',
    unitName: 'Cái',
    type: 'EAN-13',
    price: '',
  });

  const handleGenerateRandomCode = () => {
    const prefix = '893';
    const randomBody = Math.floor(100000000 + Math.random() * 900000000).toString();
    setNewBarcode({ ...newBarcode, code: prefix + randomBody });
  };

  const handleCreateBarcode = (e) => {
    e.preventDefault();
    const item = {
      id: Date.now(),
      code: newBarcode.code || '893' + Math.floor(100000000 + Math.random() * 900000000),
      productName: newBarcode.productName || 'Sản phẩm mới',
      unitName: newBarcode.unitName,
      type: newBarcode.type,
      price: Number(newBarcode.price) || 0,
      status: 'VALID',
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setBarcodes([item, ...barcodes]);
    setIsGenerateModalOpen(false);
    setNewBarcode({
      code: '',
      productName: '',
      unitName: 'Cái',
      type: 'EAN-13',
      price: '',
    });
  };

  const filteredBarcodes = barcodes.filter((b) => {
    const matchKw =
      b.code.toLowerCase().includes(keyword.toLowerCase()) ||
      b.productName.toLowerCase().includes(keyword.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchKw && matchStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VALID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ
          </span>
        );
      case 'DUPLICATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Trùng mã
          </span>
        );
      case 'INVALID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Sai định dạng
          </span>
        );
      case 'UNUSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-lg border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5" /> Chưa dùng
          </span>
        );
      default:
        return status;
    }
  };

  const openPrintModal = (item) => {
    setSelectedBarcodeForPrint(item);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Barcode className="w-6 h-6 text-blue-600" />
            Quản Lý Mã Vạch (Barcode & QR)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Quản lý danh mục mã vạch, tạo mã nội bộ EAN-13/Code-128 và in tem nhãn dán quầy kệ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="3d-solid"
            icon={Plus}
            onClick={() => {
              handleGenerateRandomCode();
              setIsGenerateModalOpen(true);
            }}
          >
            Tạo Mã Vạch Mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="soft-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Barcode className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold">Tổng số mã</p>
            <p className="text-lg font-extrabold text-slate-800">{barcodes.length}</p>
          </div>
        </div>

        <div className="soft-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold">Hợp lệ (Valid)</p>
            <p className="text-lg font-extrabold text-slate-800">
              {barcodes.filter((b) => b.status === 'VALID').length}
            </p>
          </div>
        </div>

        <div className="soft-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold">Trùng lặp (Duplicate)</p>
            <p className="text-lg font-extrabold text-slate-800">
              {barcodes.filter((b) => b.status === 'DUPLICATE').length}
            </p>
          </div>
        </div>

        <div className="soft-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold">Chưa gán SP (Unused)</p>
            <p className="text-lg font-extrabold text-slate-800">
              {barcodes.filter((b) => b.status === 'UNUSED').length}
            </p>
          </div>
        </div>
      </div>

      <div className="soft-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo dãy số mã vạch hoặc tên sản phẩm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-slate-100 border border-transparent focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-100 border border-transparent focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none transition"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="VALID">Hợp lệ (Valid)</option>
            <option value="DUPLICATE">Trùng lặp (Duplicate)</option>
            <option value="INVALID">Sai mã (Invalid)</option>
            <option value="UNUSED">Chưa gán SP (Unused)</option>
          </select>
        </div>
      </div>

      <div className="soft-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Mã Vạch (Barcode)</th>
                <th className="p-4">Chuẩn</th>
                <th className="p-4">Sản Phẩm & Đơn Vị</th>
                <th className="p-4">Giá Niêm Yết</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4">Ngày Tạo</th>
                <th className="p-4 text-right">In Tem / Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBarcodes.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-blue-700 tracking-wider bg-blue-50/80 px-2 py-1 rounded border border-blue-100">
                        {item.code}
                      </span>
                      <button
                        title="Copy mã vạch"
                        onClick={() => navigator.clipboard.writeText(item.code)}
                        className="text-slate-400 hover:text-blue-600 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-600">{item.type}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{item.productName}</p>
                    <span className="text-[11px] text-slate-500">{item.unitName}</span>
                  </td>
                  <td className="p-4 font-extrabold text-slate-800">
                    {item.price > 0 ? item.price.toLocaleString('vi-VN') + ' đ' : '—'}
                  </td>
                  <td className="p-4">{getStatusBadge(item.status)}</td>
                  <td className="p-4 text-slate-500">{item.createdAt}</td>
                  <td className="p-4 text-right">
                    <Button
                      variant="3d-primary"
                      size="sm"
                      icon={Printer}
                      onClick={() => openPrintModal(item)}
                    >
                      In Tem Nhãn
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <Barcode className="w-5 h-5 text-blue-600" />
              Tạo Mã Vạch Mới Cho Hàng Hóa
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Tạo mã vạch theo chuẩn quốc tế EAN-13 hoặc chuẩn nội bộ cửa hàng Code-128
            </p>

            <form onSubmit={handleCreateBarcode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã Vạch (Barcode Dãy Số)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newBarcode.code}
                    onChange={(e) => setNewBarcode({ ...newBarcode, code: e.target.value })}
                    placeholder="Nhập 13 số EAN hoặc mã tự do..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    variant="3d-secondary"
                    icon={RefreshCw}
                    onClick={handleGenerateRandomCode}
                  >
                    Tạo Mã
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Hàng Hóa Gắn Liền
                </label>
                <input
                  type="text"
                  required
                  value={newBarcode.productName}
                  onChange={(e) =>
                    setNewBarcode({ ...newBarcode, productName: e.target.value })
                  }
                  placeholder="Ví dụ: Bánh snack khoai tây O'star 65g"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đơn Vị Tính
                  </label>
                  <input
                    type="text"
                    value={newBarcode.unitName}
                    onChange={(e) => setNewBarcode({ ...newBarcode, unitName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chuẩn Mã Vạch
                  </label>
                  <select
                    value={newBarcode.type}
                    onChange={(e) => setNewBarcode({ ...newBarcode, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="EAN-13">EAN-13 (Tiêu chuẩn GS1)</option>
                    <option value="CODE-128">CODE-128 (Nội bộ quầy cân)</option>
                    <option value="QR-CODE">QR Code (Mã ma trận 2D)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giá Niêm Yết Trên Tem (VNĐ)
                </label>
                <input
                  type="number"
                  value={newBarcode.price}
                  onChange={(e) => setNewBarcode({ ...newBarcode, price: e.target.value })}
                  placeholder="VD: 15000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="3d-secondary"
                  onClick={() => setIsGenerateModalOpen(false)}
                >
                  Hủy Bỏ
                </Button>
                <Button type="submit" variant="3d-solid">
                  Lưu Mã Vạch
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPrintModalOpen && selectedBarcodeForPrint && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <Printer className="w-5 h-5 text-blue-600" />
              In Tem Nhãn Mã Vạch Dán Kệ Hàng
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Cấu hình số lượng tem nhãn cần in và xem trước bản in tem nhãn nhiệt
            </p>

            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center mb-5">
              <p className="text-[11px] text-slate-400 font-semibold mb-2">
                Xem trước con tem (Khổ {paperType}mm)
              </p>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm w-64 text-center">
                <p className="text-[11px] font-extrabold text-slate-900 truncate">
                  {selectedBarcodeForPrint.productName}
                </p>
                <div className="py-2 flex justify-center">
                  <div className="h-10 w-44 bg-slate-900 flex items-center justify-center font-mono text-[10px] text-white tracking-widest font-black">
                    |||||| | ||||| ||||||| |
                  </div>
                </div>
                <p className="font-mono font-bold text-xs text-slate-800 tracking-wider">
                  {selectedBarcodeForPrint.code}
                </p>
                <p className="text-xs font-black text-blue-700 mt-1">
                  {selectedBarcodeForPrint.price.toLocaleString('vi-VN')} đ
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">{settings.STORE_NAME.toUpperCase()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Khổ Giấy In Tem
                </label>
                <select
                  value={paperType}
                  onChange={(e) => setPaperType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="35x22">Giấy Decal 35x22mm (2 tem / hàng)</option>
                  <option value="50x30">Giấy Decal 50x30mm (1 tem / hàng)</option>
                  <option value="A4-Tomy">Khổ A4 Tomy 145 (65 tem / tờ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số Lượng Tem Cần In
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={printQuantity}
                  onChange={(e) => setPrintQuantity(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="3d-secondary"
                onClick={() => setIsPrintModalOpen(false)}
              >
                Đóng
              </Button>
              <Button
                variant="3d-solid"
                icon={Printer}
                onClick={() => {
                  window.print();
                  setIsPrintModalOpen(false);
                }}
              >
                Gửi Lệnh In ({printQuantity} tem)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
