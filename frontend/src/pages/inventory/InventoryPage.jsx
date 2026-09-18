import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { exportToExcel } from '../../utils/excelExport';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  ClipboardCheck,
  CheckCircle2,
  SlidersHorizontal,
  FileSpreadsheet,
  Plus
} from 'lucide-react';

export const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState('stocks'); // 'stocks', 'adjustments', 'checks', 'history'
  const [keyword, setKeyword] = useState('');

  // 1. Tồn kho thực tế
  const [stocks, setStocks] = useState([
    {
      id: 1,
      sku: 'COCA-330',
      barcode: '8934560111118',
      name: 'Nước ngọt Coca-Cola 330ml',
      unit: 'Lon',
      quantity: 120,
      minStock: 24,
      costPrice: 8500,
      retailPrice: 10000,
      category: 'Nước giải khát & Bia',
    },
    {
      id: 2,
      sku: 'HAO-HAO-75',
      barcode: '8935001700018',
      name: 'Mì Hảo Hảo Tôm Chua Cay 75g',
      unit: 'Gói',
      quantity: 18,
      minStock: 50,
      costPrice: 3800,
      retailPrice: 4500,
      category: 'Mì & Thực phẩm ăn liền',
    },
    {
      id: 3,
      sku: 'VINAMILK-180',
      barcode: '8934673123456',
      name: 'Sữa tươi Vinamilk 100% 180ml',
      unit: 'Hộp',
      quantity: 85,
      minStock: 30,
      costPrice: 7600,
      retailPrice: 9000,
      category: 'Sữa & Sản phẩm từ sữa',
    },
    {
      id: 4,
      sku: 'OSTAR-KHOAI',
      barcode: '8936036010012',
      name: 'Bánh snack khoai tây Ostar 65g',
      unit: 'Gói',
      quantity: 6,
      minStock: 20,
      costPrice: 11000,
      retailPrice: 14000,
      category: 'Bánh kẹo & Snack',
    },
  ]);

  // 2. Lịch sử biến động kho
  const [historyMovements, setHistoryMovements] = useState([
    {
      id: 101,
      time: '16/09/2026 10:30',
      productName: 'Nước ngọt Coca-Cola 330ml',
      type: 'BÁN HÀNG POS (OUT)',
      quantity: -2,
      beforeStock: 122,
      afterStock: 120,
      performer: 'Nguyễn Văn A (Thu ngân)',
      refCode: 'ORD-20260916-0001',
    },
    {
      id: 102,
      time: '16/09/2026 09:15',
      productName: 'Mì Hảo Hảo Tôm Chua Cay 75g',
      type: 'NHẬP HÀNG NCC (IN)',
      quantity: +100,
      beforeStock: 18,
      afterStock: 118,
      performer: 'Trần Thị B (Thủ kho)',
      refCode: 'PO-20260916-0004',
    },
    {
      id: 103,
      time: '15/09/2026 17:45',
      productName: 'Bánh snack khoai tây Ostar 65g',
      type: 'ĐIỀU CHỈNH HỎNG (OUT)',
      quantity: -2,
      beforeStock: 8,
      afterStock: 6,
      performer: 'Lê Văn C (Quản lý)',
      refCode: 'ADJ-20260915-001',
    },
  ]);

  // 3. Phiếu kiểm kê kho
  const [stockChecks, setStockChecks] = useState([
    {
      id: 'CHK-001',
      date: '15/09/2026',
      totalItems: 4,
      matched: 3,
      discrepancy: -1,
      status: 'ĐÃ CÂN BẰNG',
      creator: 'Lê Văn C (Quản lý)',
    },
  ]);

  // Modal điều chỉnh kho
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    productId: 1,
    adjustType: 'REDUCE', // 'INCREASE' hoặc 'REDUCE'
    quantity: 1,
    reason: 'Rách bao bì / Hư hỏng',
    note: '',
  });

  const handleExportStocks = () => {
    const filteredStocks = stocks.filter(
      (stock) =>
        stock.name.toLowerCase().includes(keyword.toLowerCase()) ||
        stock.barcode.includes(keyword)
    );

    exportToExcel(
      filteredStocks.map((stock) => ({
        SKU: stock.sku,
        Barcode: stock.barcode,
        'Tên hàng hóa': stock.name,
        'Ngành hàng': stock.category,
        'Đơn vị': stock.unit,
        'Tồn thực tế': stock.quantity,
        'Tồn tối thiểu': stock.minStock,
        'Giá vốn': stock.costPrice,
        'Giá trị vốn tồn': stock.quantity * stock.costPrice,
        'Tình trạng': stock.quantity <= stock.minStock ? 'Sắp hết hàng' : 'Đủ hàng',
      })),
      'TheKho',
      'Thẻ kho'
    );
  };

  const handleCreateAdjustment = (e) => {
    e.preventDefault();
    const prod = stocks.find((s) => s.id === Number(adjustForm.productId));
    if (!prod) return;

    const qtyChange = adjustForm.adjustType === 'INCREASE' ? Number(adjustForm.quantity) : -Number(adjustForm.quantity);
    const newQty = Math.max(0, prod.quantity + qtyChange);

    // Cập nhật tồn kho
    setStocks(stocks.map((s) => (s.id === prod.id ? { ...s, quantity: newQty } : s)));

    // Thêm lịch sử biến động
    const newMovement = {
      id: Date.now(),
      time: new Date().toLocaleString('vi-VN'),
      productName: prod.name,
      type: adjustForm.adjustType === 'INCREASE' ? 'ĐIỀU CHỈNH TĂNG (IN)' : 'ĐIỀU CHỈNH GIẢM (OUT)',
      quantity: qtyChange,
      beforeStock: prod.quantity,
      afterStock: newQty,
      performer: 'Người dùng hiện tại',
      refCode: 'ADJ-' + Date.now().toString().slice(-4),
    };
    setHistoryMovements([newMovement, ...historyMovements]);
    setIsAdjustModalOpen(false);
  };

  const totalStockValue = stocks.reduce((sum, s) => sum + s.quantity * s.costPrice, 0);
  const lowStockCount = stocks.filter((s) => s.quantity <= s.minStock).length;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-600" />
            Quản Lý Kho & Thẻ Kho Bán Lẻ
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Theo dõi tồn kho theo đơn vị cơ sở, lập phiếu kiểm kê cân bằng kho và truy xuất lịch sử thẻ kho
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="3d-secondary"
            icon={SlidersHorizontal}
            onClick={() => setIsAdjustModalOpen(true)}
          >
            Điều Chỉnh Kho
          </Button>
          <Button
            variant="3d-solid"
            icon={ClipboardCheck}
            onClick={() => setActiveTab('checks')}
          >
            Lập Phiếu Kiểm Kê
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="soft-card p-4">
          <p className="text-[11px] text-slate-500 font-semibold">Tổng mặt hàng trong kho</p>
          <p className="text-xl font-black text-slate-900 mt-1">{stocks.length} SP</p>
        </div>

        <div className="soft-card p-4">
          <p className="text-[11px] text-slate-500 font-semibold">Tổng giá trị vốn tồn kho</p>
          <p className="text-xl font-black text-blue-600 mt-1">
            {totalStockValue.toLocaleString('vi-VN')} đ
          </p>
        </div>

        <div className="soft-card p-4">
          <p className="text-[11px] text-slate-500 font-semibold">Cảnh báo sắp hết hàng</p>
          <p className="text-xl font-black text-amber-600 mt-1">{lowStockCount} SP</p>
        </div>

        <div className="soft-card p-4">
          <p className="text-[11px] text-slate-500 font-semibold">Sản phẩm hết hàng (Tồn = 0)</p>
          <p className="text-xl font-black text-rose-600 mt-1">
            {stocks.filter((s) => s.quantity === 0).length} SP
          </p>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'stocks'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          1. Danh Sách Tồn Kho Hiện Tại
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          2. Thẻ Kho & Lịch Sử Biến Động
        </button>

        <button
          onClick={() => setActiveTab('checks')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'checks'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          3. Phiếu Kiểm Kê & Cân Bằng Kho
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === 'stocks' && (
        <div className="space-y-4">
          <div className="soft-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-96 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên, mã SKU hoặc barcode..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-slate-100 border border-transparent focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="3d-secondary" size="sm" icon={FileSpreadsheet} onClick={handleExportStocks}>
                Xuất Thẻ Kho Excel
              </Button>
            </div>
          </div>

          <div className="table-glass-container">
            <div className="overflow-x-auto">
              <table className="table-3d-glass text-left text-xs">
                <thead>
                  <tr>
                    <th>Mã SKU / Barcode</th>
                    <th>Tên Hàng Hóa</th>
                    <th>Ngành Hàng</th>
                    <th className="text-center">ĐVT Cơ Sở</th>
                    <th className="text-right">Tồn Thực Tế</th>
                    <th className="text-right">Mức Tối Thiểu</th>
                    <th className="text-right">Giá Vốn</th>
                    <th className="text-right">Giá Trị Vốn Tồn</th>
                    <th className="text-center">Tình Trạng</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks
                    .filter(
                      (s) =>
                        s.name.toLowerCase().includes(keyword.toLowerCase()) ||
                        s.barcode.includes(keyword)
                    )
                    .map((item) => {
                      const isLow = item.quantity <= item.minStock;
                      return (
                        <tr key={item.id}>
                          <td className="p-4">
                            <span className="font-mono font-bold text-slate-700">{item.sku}</span>
                            <p className="text-[10px] text-slate-400 font-mono">{item.barcode}</p>
                          </td>
                          <td className="p-4 font-bold text-slate-900">{item.name}</td>
                          <td className="p-4 text-slate-600">{item.category}</td>
                          <td className="p-4 text-center">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[11px]">
                              {item.unit}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span
                              className={`font-black text-sm ${
                                isLow ? 'text-amber-600' : 'text-slate-900'
                              }`}
                            >
                              {item.quantity}
                            </span>
                          </td>
                          <td className="p-4 text-right text-slate-500">{item.minStock}</td>
                          <td className="p-4 text-right font-medium text-slate-700">
                            {item.costPrice.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="p-4 text-right font-black text-blue-700">
                            {(item.quantity * item.costPrice).toLocaleString('vi-VN')} đ
                          </td>
                          <td className="p-4 text-center">
                            {isLow ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 font-bold text-[10px] rounded-md border border-amber-200">
                                <AlertTriangle className="w-3 h-3" /> Sắp hết hàng
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-md border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> An toàn
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="soft-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Thời Gian</th>
                    <th className="p-4">Mã Tham Chiếu</th>
                    <th className="p-4">Sản Phẩm</th>
                    <th className="p-4">Loại Biến Động</th>
                    <th className="p-4 text-right">Số Lượng</th>
                    <th className="p-4 text-right">Tồn Trước</th>
                    <th className="p-4 text-right">Tồn Sau</th>
                    <th className="p-4">Người Thực Hiện</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 text-slate-500 font-medium">{m.time}</td>
                      <td className="p-4 font-mono font-bold text-blue-700">{m.refCode}</td>
                      <td className="p-4 font-bold text-slate-900">{m.productName}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            m.quantity > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td
                        className={`p-4 text-right font-black ${
                          m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className="p-4 text-right text-slate-500">{m.beforeStock}</td>
                      <td className="p-4 text-right font-bold text-slate-800">{m.afterStock}</td>
                      <td className="p-4 text-slate-600">{m.performer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'checks' && (
        <div className="space-y-4">
          <div className="soft-card p-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Danh Sách Phiếu Kiểm Kê</h2>
              <p className="text-xs text-slate-500">So khớp tồn hệ thống với kiểm đếm thực tế</p>
            </div>
            <Button
              variant="3d-solid"
              icon={Plus}
              onClick={() => alert('Mở form tạo phiếu kiểm kê quầy')}
            >
              Tạo Phiếu Kiểm Kê Mới
            </Button>
          </div>

          <div className="soft-card p-0 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Mã Phiếu</th>
                  <th className="p-4">Ngày Kiểm Kê</th>
                  <th className="p-4">Tổng Mặt Hàng</th>
                  <th className="p-4">Khớp Số Lượng</th>
                  <th className="p-4">Lệch Tồn (Discrepancy)</th>
                  <th className="p-4">Người Lập Phiếu</th>
                  <th className="p-4 text-right">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockChecks.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-blue-700">{c.id}</td>
                    <td className="p-4 text-slate-600">{c.date}</td>
                    <td className="p-4 font-bold text-slate-800">{c.totalItems} SP</td>
                    <td className="p-4 text-emerald-600 font-bold">{c.matched} SP</td>
                    <td className="p-4 text-rose-600 font-bold">{c.discrepancy} SP</td>
                    <td className="p-4 text-slate-600">{c.creator}</td>
                    <td className="p-4 text-right">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-lg border border-emerald-200">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Điều Chỉnh Kho */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-blue-600" />
              Phiếu Điều Chỉnh Tồn Kho
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Ghi nhận biến động hư hỏng, rách bao bì, quá hạn sử dụng hoặc kiểm đếm bù trừ
            </p>

            <form onSubmit={handleCreateAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn Sản Phẩm Cần Điều Chỉnh
                </label>
                <select
                  value={adjustForm.productId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                >
                  {stocks.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Tồn hiện tại: {s.quantity} {s.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hướng Điều Chỉnh
                  </label>
                  <select
                    value={adjustForm.adjustType}
                    onChange={(e) => setAdjustForm({ ...adjustForm, adjustType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="REDUCE">Giảm Tồn (Hư hỏng, mất mát)</option>
                    <option value="INCREASE">Tăng Tồn (Kiểm đếm thừa, bù)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số Lượng Thay Đổi
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustForm.quantity}
                    onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lý Do</label>
                <select
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Rách bao bì / Hư hỏng">Rách bao bì / Hư hỏng bể vỡ</option>
                  <option value="Hết hạn sử dụng">Hết hạn sử dụng (Expired)</option>
                  <option value="Sai lệch kiểm đếm thực tế">Sai lệch kiểm đếm thực tế</option>
                  <option value="Mất mát chưa rõ nguyên nhân">Mất mát chưa rõ nguyên nhân</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="3d-secondary"
                  onClick={() => setIsAdjustModalOpen(false)}
                >
                  Hủy Bỏ
                </Button>
                <Button type="submit" variant="3d-solid">
                  Xác Nhận Cập Nhật Kho
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
