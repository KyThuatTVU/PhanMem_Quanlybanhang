import React, { useState, useEffect } from 'react';
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
  Plus,
  Eye,
  X,
  Image as ImageIcon,
  Trash2,
  Edit,
  Check,
  RotateCcw,
  Calendar
} from 'lucide-react';

const DEFAULT_STOCKS = [
  {
    id: 1,
    sku: 'COCA-330',
    barcode: '8934560111118',
    name: 'Nước ngọt Coca-Cola 330ml',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
    unit: 'Hộp',
    quantity: 85,
    minStock: 30,
    costPrice: 7600,
    retailPrice: 9000,
    category: 'Sữa & Sản phẩm từ sữa',
  },
  {
    id: 4,
    sku: 'OSTAR-65',
    barcode: '8936036010012',
    name: 'Bánh snack khoai tây Ostar 65g',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80',
    unit: 'Gói',
    quantity: 6,
    minStock: 20,
    costPrice: 11000,
    retailPrice: 14000,
    category: 'Bánh kẹo & Snack',
  },
  {
    id: 5,
    sku: 'SIMPLY-1L',
    barcode: '8935031201001',
    name: 'Dầu đậu nành nguyên chất Simply 1L',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80',
    unit: 'Chai',
    quantity: 40,
    minStock: 12,
    costPrice: 52000,
    retailPrice: 65000,
    category: 'Gia vị & Dầu ăn',
  },
];

export const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState('stocks'); // 'stocks', 'history', 'checks'
  const [keyword, setKeyword] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // State bộ lọc phiếu kiểm kê theo ngày & trạng thái
  const [checkStartDate, setCheckStartDate] = useState('');
  const [checkEndDate, setCheckEndDate] = useState('');
  const [checkStatusFilter, setCheckStatusFilter] = useState('ALL');
  const [checkSearchKw, setCheckSearchKw] = useState('');

  // 1. Danh sách sản phẩm & tồn kho
  const [stocks, setStocks] = useState(() => {
    try {
      const saved = localStorage.getItem('product_catalog');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          return parsed.map((p) => ({
            id: p.id,
            sku: p.sku || 'SKU-' + p.id,
            barcode: p.baseBarcode || p.barcode || '893' + p.id,
            name: p.name,
            image: p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
            unit: p.baseUnit || p.unit || 'Cái',
            quantity: Number(p.stock) || 0,
            minStock: Number(p.minStock) || 10,
            costPrice: Number(p.costPrice) || 0,
            retailPrice: Number(p.retailPrice) || 0,
            category: p.category || 'Gia vị & Dầu ăn',
          }));
        }
      }
    } catch (e) {
      console.error('Lỗi khi nạp dữ liệu tồn kho:', e);
    }
    return DEFAULT_STOCKS;
  });

  // Đồng bộ lại catalog vào localStorage khi stocks thay đổi
  useEffect(() => {
    try {
      const existingCatalog = JSON.parse(localStorage.getItem('product_catalog') || '[]');
      if (existingCatalog.length > 0) {
        const updatedCatalog = existingCatalog.map((item) => {
          const matched = stocks.find((s) => s.id === item.id);
          if (matched) {
            return { ...item, stock: matched.quantity };
          }
          return item;
        });
        localStorage.setItem('product_catalog', JSON.stringify(updatedCatalog));
      }
    } catch (e) {
      console.error('Lỗi cập nhật catalog:', e);
    }
  }, [stocks]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // 2. Lịch sử biến động kho
  const [historyMovements, setHistoryMovements] = useState([
    {
      id: 101,
      time: '18/09/2026 14:30',
      productName: 'Nước ngọt Coca-Cola 330ml',
      type: 'KIỂM KÊ CÂN BẰNG (ADJUSTMENT)',
      quantity: -2,
      beforeStock: 122,
      afterStock: 120,
      performer: 'Lê Văn C (Quản lý)',
      refCode: 'KK-20260918-001',
    },
    {
      id: 102,
      time: '17/09/2026 10:15',
      productName: 'Mì Hảo Hảo Tôm Chua Cay 75g',
      type: 'NHẬP HÀNG NCC (IN)',
      quantity: +100,
      beforeStock: 18,
      afterStock: 118,
      performer: 'Trần Thị B (Thủ kho)',
      refCode: 'PO-20260917-0004',
    },
    {
      id: 103,
      time: '16/09/2026 17:45',
      productName: 'Bánh snack khoai tây Ostar 65g',
      type: 'BÁN HÀNG POS (OUT)',
      quantity: -4,
      beforeStock: 10,
      afterStock: 6,
      performer: 'Nguyễn Văn A (Thu ngân)',
      refCode: 'ORD-20260916-0001',
    },
  ]);

  // 3. Danh sách Phiếu kiểm kê kho theo ngày
  const [stockChecks, setStockChecks] = useState([
    {
      id: 'KK-20260918-001',
      date: '18/09/2026 14:30',
      rawDate: '2026-09-18',
      creator: 'Lê Văn C (Quản lý)',
      note: 'Kiểm kê định kỳ tháng 9 nhóm Nước giải khát & Mì gói',
      status: 'ĐÃ CÂN BẰNG', // 'ĐÃ CÂN BẰNG' | 'NHÁP' | 'ĐÃ HỦY'
      totalItems: 3,
      matchedItems: 2,
      discrepancyItems: 1,
      totalDiscrepancyQty: -2,
      totalDiscrepancyValue: -17000,
      items: [
        {
          id: 1,
          sku: 'COCA-330',
          barcode: '8934560111118',
          name: 'Nước ngọt Coca-Cola 330ml',
          image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80',
          unit: 'Lon',
          costPrice: 8500,
          systemStock: 122,
          actualCount: 120,
          discrepancy: -2,
          note: 'Bị móp vỡ 2 lon',
        },
        {
          id: 2,
          sku: 'HAO-HAO-75',
          barcode: '8935001700018',
          name: 'Mì Hảo Hảo Tôm Chua Cay 75g',
          image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80',
          unit: 'Gói',
          costPrice: 3800,
          systemStock: 18,
          actualCount: 18,
          discrepancy: 0,
          note: 'Khớp 100%',
        },
        {
          id: 3,
          sku: 'VINAMILK-180',
          barcode: '8934673123456',
          name: 'Sữa tươi Vinamilk 100% 180ml',
          image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
          unit: 'Hộp',
          costPrice: 7600,
          systemStock: 85,
          actualCount: 85,
          discrepancy: 0,
          note: 'Khớp 100%',
        },
      ],
    },
  ]);

  // State Modals
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState(null);

  // Form Điều chỉnh lẻ
  const [adjustForm, setAdjustForm] = useState({
    productId: stocks[0]?.id || 1,
    adjustType: 'REDUCE',
    quantity: 1,
    reason: 'Rách bao bì / Hư hỏng',
    note: '',
  });

  // Form Tạo Phiếu Kiểm Kê Mới
  const [newCheckForm, setNewCheckForm] = useState({
    checkDate: new Date().toISOString().slice(0, 10),
    creator: 'Quản lý cửa hàng',
    note: 'Kiểm kê kho hàng ngày',
    searchKeyword: '',
    items: [],
  });

  // Mở modal Tạo Phiếu Kiểm Kê Mới
  const handleOpenCreateCheckModal = () => {
    const initialCheckItems = stocks.map((s) => ({
      id: s.id,
      sku: s.sku,
      barcode: s.barcode,
      name: s.name,
      image: s.image,
      unit: s.unit,
      costPrice: s.costPrice,
      systemStock: s.quantity,
      actualCount: s.quantity,
      discrepancy: 0,
      note: '',
    }));

    setNewCheckForm({
      checkDate: new Date().toISOString().slice(0, 10),
      creator: 'Quản lý cửa hàng',
      note: 'Kiểm kê định kỳ cửa hàng',
      searchKeyword: '',
      items: initialCheckItems,
    });
    setIsCheckModalOpen(true);
  };

  // Thay đổi số lượng thực tế khi kiểm kê
  const handleActualCountChange = (index, value) => {
    const updated = [...newCheckForm.items];
    const valNum = Number(value) < 0 ? 0 : Number(value);
    updated[index].actualCount = valNum;
    updated[index].discrepancy = valNum - updated[index].systemStock;
    setNewCheckForm({ ...newCheckForm, items: updated });
  };

  // Ghi chú dòng kiểm kê
  const handleItemNoteChange = (index, text) => {
    const updated = [...newCheckForm.items];
    updated[index].note = text;
    setNewCheckForm({ ...newCheckForm, items: updated });
  };

  // Lưu phiếu kiểm kê (Nháp hoặc Cân bằng)
  const handleSaveCheck = (shouldBalance = false) => {
    if (newCheckForm.items.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm để kiểm kê!');
      return;
    }

    const checkId = `KK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;
    
    // Định dạng ngày kiểm đếm
    const chosenDateStr = newCheckForm.checkDate
      ? newCheckForm.checkDate.split('-').reverse().join('/') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleString('vi-VN');

    const matchedCount = newCheckForm.items.filter((i) => i.discrepancy === 0).length;
    const discCount = newCheckForm.items.filter((i) => i.discrepancy !== 0).length;
    const totalDiscQty = newCheckForm.items.reduce((sum, i) => sum + i.discrepancy, 0);
    const totalDiscValue = newCheckForm.items.reduce((sum, i) => sum + i.discrepancy * i.costPrice, 0);

    const newCheckRecord = {
      id: checkId,
      date: chosenDateStr,
      rawDate: newCheckForm.checkDate || new Date().toISOString().slice(0, 10),
      creator: newCheckForm.creator || 'Quản lý cửa hàng',
      note: newCheckForm.note,
      status: shouldBalance ? 'ĐÃ CÂN BẰNG' : 'NHÁP',
      totalItems: newCheckForm.items.length,
      matchedItems: matchedCount,
      discrepancyItems: discCount,
      totalDiscrepancyQty: totalDiscQty,
      totalDiscrepancyValue: totalDiscValue,
      items: newCheckForm.items,
    };

    setStockChecks([newCheckRecord, ...stockChecks]);

    if (shouldBalance) {
      const newMovements = [];
      const updatedStocks = stocks.map((s) => {
        const audited = newCheckForm.items.find((item) => item.id === s.id);
        if (audited && audited.discrepancy !== 0) {
          newMovements.push({
            id: Date.now() + Math.random(),
            time: chosenDateStr,
            productName: s.name,
            type: 'KIỂM KÊ CÂN BẰNG (ADJUSTMENT)',
            quantity: audited.discrepancy,
            beforeStock: s.quantity,
            afterStock: audited.actualCount,
            performer: newCheckForm.creator,
            refCode: checkId,
          });
          return { ...s, quantity: audited.actualCount };
        }
        return s;
      });

      setStocks(updatedStocks);
      if (newMovements.length > 0) {
        setHistoryMovements([...newMovements, ...historyMovements]);
      }
      showToast(`Đã lưu & CÂN BẰNG TỒN KHO thành công ngày ${chosenDateStr} cho phiếu ${checkId}!`);
    } else {
      showToast(`Đã lưu NHÁP phiếu kiểm kê ${checkId}!`);
    }

    setIsCheckModalOpen(false);
  };

  // Cân bằng cho một phiếu nháp sẵn có
  const handleBalanceExistingCheck = (checkObj) => {
    if (checkObj.status === 'ĐÃ CÂN BẰNG') return;

    const nowStr = new Date().toLocaleString('vi-VN');
    const newMovements = [];
    const updatedStocks = stocks.map((s) => {
      const audited = checkObj.items.find((item) => item.id === s.id);
      if (audited && audited.discrepancy !== 0) {
        newMovements.push({
          id: Date.now() + Math.random(),
          time: nowStr,
          productName: s.name,
          type: 'KIỂM KÊ CÂN BẰNG (ADJUSTMENT)',
          quantity: audited.discrepancy,
          beforeStock: s.quantity,
          afterStock: audited.actualCount,
          performer: checkObj.creator,
          refCode: checkObj.id,
        });
        return { ...s, quantity: audited.actualCount };
      }
      return s;
    });

    setStocks(updatedStocks);
    if (newMovements.length > 0) {
      setHistoryMovements([...newMovements, ...historyMovements]);
    }

    const updatedChecks = stockChecks.map((c) =>
      c.id === checkObj.id ? { ...c, status: 'ĐÃ CÂN BẰNG' } : c
    );
    setStockChecks(updatedChecks);
    if (selectedCheck && selectedCheck.id === checkObj.id) {
      setSelectedCheck({ ...selectedCheck, status: 'ĐÃ CÂN BẰNG' });
    }
    showToast(`Đã cân bằng kho thành công cho phiếu ${checkObj.id}!`);
  };

  // Lọc phiếu kiểm kê theo Ngày & Trạng thái
  const filteredStockChecks = stockChecks.filter((c) => {
    // 1. Tìm từ khóa
    const matchKw =
      c.id.toLowerCase().includes(checkSearchKw.toLowerCase()) ||
      c.creator.toLowerCase().includes(checkSearchKw.toLowerCase()) ||
      (c.note && c.note.toLowerCase().includes(checkSearchKw.toLowerCase()));

    // 2. Lọc trạng thái
    const matchStatus = checkStatusFilter === 'ALL' || c.status === checkStatusFilter;

    // 3. Lọc khoảng ngày
    let matchDate = true;
    if (checkStartDate || checkEndDate) {
      const checkDateFormatted = c.rawDate || (c.date ? c.date.split(' ')[0].split('/').reverse().join('-') : '');
      if (checkStartDate && checkDateFormatted < checkStartDate) matchDate = false;
      if (checkEndDate && checkDateFormatted > checkEndDate) matchDate = false;
    }

    return matchKw && matchStatus && matchDate;
  });

  // Xuất Bảng Tồn Kho Ra Excel
  const handleExportStocks = () => {
    const filteredStocks = stocks.filter(
      (s) =>
        s.name.toLowerCase().includes(keyword.toLowerCase()) ||
        s.barcode.includes(keyword) ||
        s.sku.toLowerCase().includes(keyword.toLowerCase())
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
        'Giá vốn (đ)': stock.costPrice,
        'Giá trị vốn tồn (đ)': stock.quantity * stock.costPrice,
        'Tình trạng': stock.quantity <= stock.minStock ? 'Sắp hết hàng' : 'Đủ hàng',
      })),
      'DanhSachTonKho',
      'Tồn kho hiện tại'
    );
    showToast(`Đã xuất ${filteredStocks.length} sản phẩm tồn kho ra Excel.`);
  };

  // Xuất Danh Sách / Báo Cáo Phiếu Kiểm Kê Ra Excel (Theo ngày đã lọc)
  const handleExportStockChecks = () => {
    const rowsExport = [];
    filteredStockChecks.forEach((check) => {
      check.items.forEach((item) => {
        rowsExport.push({
          'Mã phiếu kiểm': check.id,
          'Ngày kiểm kê': check.date,
          'Người kiểm': check.creator,
          'Trạng thái báo cáo': check.status,
          SKU: item.sku,
          Barcode: item.barcode,
          'Tên sản phẩm': item.name,
          'Đơn vị tính': item.unit,
          'Tồn hệ thống': item.systemStock,
          'Tồn thực tế': item.actualCount,
          'Chênh lệch (SP)': item.discrepancy,
          'Giá vốn (đ)': item.costPrice,
          'Giá trị chênh lệch (đ)': item.discrepancy * item.costPrice,
          'Ghi chú': item.note || check.note || '',
        });
      });
    });

    const dateSuffix = checkStartDate || checkEndDate ? `_${checkStartDate}_den_${checkEndDate}` : '';
    exportToExcel(rowsExport, `BaoCaoKiemKeKho${dateSuffix}`, 'Phiếu Kiểm Kê Theo Ngày');
    showToast(`Đã xuất báo cáo ${filteredStockChecks.length} phiếu kiểm kê ra file Excel thành công!`);
  };

  // Xuất Excel cho riêng 1 phiếu kiểm kê
  const handleExportSingleCheck = (checkObj) => {
    const rowsExport = checkObj.items.map((item) => ({
      'Mã phiếu kiểm': checkObj.id,
      'Ngày kiểm kê': checkObj.date,
      'Người kiểm': checkObj.creator,
      'Trạng thái báo cáo': checkObj.status,
      SKU: item.sku,
      Barcode: item.barcode,
      'Tên sản phẩm': item.name,
      'Đơn vị tính': item.unit,
      'Tồn hệ thống': item.systemStock,
      'Tồn thực tế': item.actualCount,
      'Chênh lệch (SP)': item.discrepancy,
      'Giá vốn (đ)': item.costPrice,
      'Giá trị chênh lệch (đ)': item.discrepancy * item.costPrice,
      'Ghi chú lý do': item.note || '',
    }));

    exportToExcel(rowsExport, `PhieuKiemKe_${checkObj.id}`, checkObj.id);
    showToast(`Đã xuất file Excel cho phiếu ${checkObj.id}!`);
  };

  // Xử lý phiếu điều chỉnh lẻ
  const handleCreateAdjustment = (e) => {
    e.preventDefault();
    const prod = stocks.find((s) => s.id === Number(adjustForm.productId));
    if (!prod) return;

    const qtyChange =
      adjustForm.adjustType === 'INCREASE' ? Number(adjustForm.quantity) : -Number(adjustForm.quantity);
    const newQty = Math.max(0, prod.quantity + qtyChange);

    setStocks(stocks.map((s) => (s.id === prod.id ? { ...s, quantity: newQty } : s)));

    const newMovement = {
      id: Date.now(),
      time: new Date().toLocaleString('vi-VN'),
      productName: prod.name,
      type: adjustForm.adjustType === 'INCREASE' ? 'ĐIỀU CHỈNH TĂNG (IN)' : 'ĐIỀU CHỈNH GIẢM (OUT)',
      quantity: qtyChange,
      beforeStock: prod.quantity,
      afterStock: newQty,
      performer: 'Quản lý cửa hàng',
      refCode: 'ADJ-' + Date.now().toString().slice(-4),
    };

    setHistoryMovements([newMovement, ...historyMovements]);
    setIsAdjustModalOpen(false);
    showToast(`Đã điều chỉnh tồn kho sản phẩm "${prod.name}" thành công!`);
  };

  const totalStockValue = stocks.reduce((sum, s) => sum + s.quantity * s.costPrice, 0);
  const lowStockCount = stocks.filter((s) => s.quantity <= s.minStock).length;

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
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
            <Boxes className="w-6 h-6 text-blue-600" />
            Quản Lý Tồn Kho & Kiểm Kê Hàng Hóa Theo Ngày
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Lập phiếu kiểm kê theo ngày, theo dõi chênh lệch tồn, cân bằng kho tự động và xuất báo cáo Excel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="3d-secondary"
            icon={SlidersHorizontal}
            onClick={() => setIsAdjustModalOpen(true)}
          >
            Điều Chỉnh Lẻ
          </Button>
          <Button
            variant="3d-solid"
            icon={ClipboardCheck}
            onClick={handleOpenCreateCheckModal}
          >
            Lập Phiếu Kiểm Kê Mới
          </Button>
        </div>
      </div>

      {/* 2. Metrics overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="soft-card p-4">
          <p className="text-xs text-slate-500 font-semibold">Tổng mặt hàng trong kho</p>
          <p className="text-xl font-black text-slate-900 mt-1">{stocks.length} SP</p>
        </div>

        <div className="soft-card p-4">
          <p className="text-xs text-slate-500 font-semibold">Tổng giá trị vốn tồn kho</p>
          <p className="text-xl font-black text-blue-600 mt-1">
            {totalStockValue.toLocaleString('vi-VN')} đ
          </p>
        </div>

        <div className="soft-card p-4">
          <p className="text-xs text-slate-500 font-semibold">Cảnh báo sắp hết hàng</p>
          <p className="text-xl font-black text-amber-600 mt-1">{lowStockCount} SP</p>
        </div>

        <div className="soft-card p-4">
          <p className="text-xs text-slate-500 font-semibold">Phiếu kiểm kê đã lập</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{stockChecks.length} Phiếu</p>
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
          1. Danh Sách Tồn Kho Thực Tế
        </button>

        <button
          onClick={() => setActiveTab('checks')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'checks'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          2. Phiếu Kiểm Kê & Báo Cáo Theo Ngày ({filteredStockChecks.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          3. Thẻ Kho & Lịch Sử Biến Động
        </button>
      </div>

      {/* TAB 1: Danh sách tồn kho */}
      {activeTab === 'stocks' && (
        <div className="space-y-4">
          <div className="soft-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-96 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên, SKU hoặc barcode..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-slate-100 border border-transparent focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="3d-secondary" size="sm" icon={FileSpreadsheet} onClick={handleExportStocks}>
                Xuất Tồn Kho Excel
              </Button>
            </div>
          </div>

          <div className="table-glass-container">
            <div className="overflow-x-auto">
              <table className="table-3d-glass text-left text-xs">
                <thead>
                  <tr>
                    <th className="w-16 text-center whitespace-nowrap">Hình Ảnh</th>
                    <th className="whitespace-nowrap">Mã SKU / Barcode</th>
                    <th className="whitespace-nowrap">Tên Hàng Hóa</th>
                    <th className="whitespace-nowrap">Ngành Hàng</th>
                    <th className="text-center whitespace-nowrap">ĐVT Cơ Sở</th>
                    <th className="text-right whitespace-nowrap">Tồn Thực Tế</th>
                    <th className="text-right whitespace-nowrap">Mức Tối Thiểu</th>
                    <th className="text-right whitespace-nowrap">Giá Vốn (đ)</th>
                    <th className="text-right whitespace-nowrap">Giá Trị Vốn Tồn</th>
                    <th className="text-center whitespace-nowrap">Tình Trạng</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks
                    .filter(
                      (s) =>
                        s.name.toLowerCase().includes(keyword.toLowerCase()) ||
                        s.barcode.includes(keyword) ||
                        s.sku.toLowerCase().includes(keyword.toLowerCase())
                    )
                    .map((item) => {
                      const isLow = item.quantity <= item.minStock;
                      return (
                        <tr key={item.id}>
                          <td className="p-3 text-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200 mx-auto shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mx-auto text-slate-400 border border-slate-200">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="font-mono font-bold text-slate-800">{item.sku}</span>
                            <p className="text-[10px] text-blue-600 font-mono">{item.barcode}</p>
                          </td>
                          <td className="p-4 font-bold text-slate-900">{item.name}</td>
                          <td className="p-4 text-slate-600">{item.category}</td>
                          <td className="p-4 text-center">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[11px]">
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

      {/* TAB 2: Danh sách Phiếu Kiểm Kê & Báo Cáo Theo Ngày */}
      {activeTab === 'checks' && (
        <div className="space-y-4">
          {/* Thanh Bộ Lọc Ngày Tháng & Tìm Kiếm Phiếu Kiểm Kê */}
          <div className="soft-card p-4 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Lọc Phiếu Kiểm Kê Theo Ngày & Trạng Thái
                </h2>
                <p className="text-xs text-slate-500">
                  Chọn khoảng thời gian kiểm đếm kho để xuất báo cáo Excel chuẩn xác
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="3d-secondary"
                  size="sm"
                  icon={FileSpreadsheet}
                  onClick={handleExportStockChecks}
                >
                  Xuất Báo Cáo Excel
                </Button>
                <Button
                  variant="3d-solid"
                  size="sm"
                  icon={Plus}
                  onClick={handleOpenCreateCheckModal}
                >
                  Tạo Phiếu Kiểm Kê Mới
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2 border-t border-slate-100">
              {/* Ô Tìm kiếm */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm theo mã phiếu, người lập, ghi chú..."
                  value={checkSearchKw}
                  onChange={(e) => setCheckSearchKw(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Lọc Khoảng Ngày */}
              <div className="md:col-span-5 flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[11px] font-bold text-slate-600 shrink-0">Từ ngày:</span>
                <input
                  type="date"
                  value={checkStartDate}
                  onChange={(e) => setCheckStartDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none w-full"
                />
                <span className="text-[11px] font-bold text-slate-600 shrink-0">Đến ngày:</span>
                <input
                  type="date"
                  value={checkEndDate}
                  onChange={(e) => setCheckEndDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none w-full"
                />
              </div>

              {/* Lọc Trạng Thái */}
              <div className="md:col-span-3">
                <select
                  value={checkStatusFilter}
                  onChange={(e) => setCheckStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ĐÃ CÂN BẰNG">Đã cân bằng</option>
                  <option value="NHÁP">Lưu nháp</option>
                </select>
              </div>
            </div>

            {/* Phím tắt chọn nhanh khoảng ngày */}
            <div className="flex items-center gap-2 pt-2 text-xs border-t border-slate-100/80">
              <span className="text-[11px] font-bold text-slate-500">Lọc nhanh ngày:</span>
              <button
                type="button"
                onClick={() => {
                  setCheckStartDate('');
                  setCheckEndDate('');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  !checkStartDate && !checkEndDate
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  setCheckStartDate(today);
                  setCheckEndDate(today);
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 font-bold text-blue-700 text-[11px] transition"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - 7);
                  setCheckStartDate(start.toISOString().slice(0, 10));
                  setCheckEndDate(end.toISOString().slice(0, 10));
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 font-bold text-blue-700 text-[11px] transition"
              >
                7 ngày qua
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const start = new Date(now.getFullYear(), now.getMonth(), 1);
                  setCheckStartDate(start.toISOString().slice(0, 10));
                  setCheckEndDate(now.toISOString().slice(0, 10));
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 font-bold text-blue-700 text-[11px] transition"
              >
                Tháng này
              </button>
            </div>
          </div>

          {/* Bảng phiếu kiểm kê đã lọc theo ngày */}
          <div className="table-glass-container">
            <div className="overflow-x-auto">
              <table className="table-3d-glass text-left text-xs">
                <thead>
                  <tr>
                    <th className="whitespace-nowrap">Mã Phiếu Kiểm</th>
                    <th className="whitespace-nowrap">Thời Gian Kiểm</th>
                    <th className="whitespace-nowrap">Người Thực Hiện</th>
                    <th className="text-center whitespace-nowrap">Số Mặt Hàng</th>
                    <th className="text-center whitespace-nowrap">Số Mặt Hàng Khớp</th>
                    <th className="text-right whitespace-nowrap">Chênh Lệch Tồn</th>
                    <th className="text-right whitespace-nowrap">Giá Trị Chênh Lệch</th>
                    <th className="text-center whitespace-nowrap">Trạng Thái Báo Cáo</th>
                    <th className="text-right whitespace-nowrap">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStockChecks.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-8 text-slate-400 text-xs italic">
                        Không tìm thấy phiếu kiểm kê nào trong khoảng thời gian đã chọn.
                      </td>
                    </tr>
                  ) : (
                    filteredStockChecks.map((c) => (
                      <tr key={c.id}>
                        <td className="p-4 font-mono font-bold text-blue-700">{c.id}</td>
                        <td className="p-4 text-slate-600 font-medium">{c.date}</td>
                        <td className="p-4 text-slate-800 font-bold">{c.creator}</td>
                        <td className="p-4 text-center font-bold text-slate-800">{c.totalItems} SP</td>
                        <td className="p-4 text-center text-emerald-700 font-bold">{c.matchedItems} SP</td>
                        <td className="p-4 text-right">
                          <span
                            className={`font-black text-xs ${
                              c.totalDiscrepancyQty === 0
                                ? 'text-slate-600'
                                : c.totalDiscrepancyQty > 0
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {c.totalDiscrepancyQty > 0
                              ? `+${c.totalDiscrepancyQty}`
                              : c.totalDiscrepancyQty}{' '}
                            SP
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold">
                          <span
                            className={
                              c.totalDiscrepancyValue === 0
                                ? 'text-slate-700'
                                : c.totalDiscrepancyValue > 0
                                ? 'text-emerald-700'
                                : 'text-rose-600'
                            }
                          >
                            {c.totalDiscrepancyValue > 0 ? '+' : ''}
                            {c.totalDiscrepancyValue.toLocaleString('vi-VN')} đ
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {c.status === 'ĐÃ CÂN BẰNG' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold text-[10px] rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ĐÃ CÂN BẰNG
                            </span>
                          ) : c.status === 'NHÁP' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 font-bold text-[10px] rounded-lg border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> LƯU NHÁP
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-lg">
                              ĐÃ HỦY
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedCheck(c);
                                setIsDetailModalOpen(true);
                              }}
                              className="btn-3d-icon-view"
                              title="Xem chi tiết phiếu kiểm"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleExportSingleCheck(c)}
                              className="btn-3d-icon"
                              title="Xuất Excel phiếu này"
                            >
                              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            </button>

                            {c.status === 'NHÁP' && (
                              <button
                                onClick={() => handleBalanceExistingCheck(c)}
                                className="px-2 py-1 bg-emerald-600 text-white font-bold text-[11px] rounded-lg hover:bg-emerald-700 transition"
                                title="Cân bằng kho cho phiếu nháp này"
                              >
                                Cân Bằng Kho
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Thẻ kho & lịch sử */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="soft-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4 whitespace-nowrap">Thời Gian</th>
                    <th className="p-4 whitespace-nowrap">Mã Tham Chiếu</th>
                    <th className="p-4 whitespace-nowrap">Sản Phẩm</th>
                    <th className="p-4 whitespace-nowrap">Loại Biến Động</th>
                    <th className="p-4 text-right whitespace-nowrap">Số Lượng</th>
                    <th className="p-4 text-right whitespace-nowrap">Tồn Trước</th>
                    <th className="p-4 text-right whitespace-nowrap">Tồn Sau</th>
                    <th className="p-4 whitespace-nowrap">Người Thực Hiện</th>
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

      {/* Modal Lập Phiếu Kiểm Kê Mới Kèm Ngày Kiểm Kê & Hình Ảnh */}
      {isCheckModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                Lập Phiếu Kiểm Kê Hàng Hóa Theo Ngày
              </h2>
              <button
                type="button"
                onClick={() => setIsCheckModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Chọn ngày kiểm đếm và nhập tồn đếm thực tế của từng sản phẩm. Hệ thống sẽ tự tính chênh lệch tồn và giá trị chênh lệch.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ngày Kiểm Kê *</label>
                <input
                  type="date"
                  value={newCheckForm.checkDate}
                  onChange={(e) => setNewCheckForm({ ...newCheckForm, checkDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-blue-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Người Kiểm Kê *</label>
                <input
                  type="text"
                  value={newCheckForm.creator}
                  onChange={(e) => setNewCheckForm({ ...newCheckForm, creator: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi Chú Đợt Kiểm</label>
                <input
                  type="text"
                  placeholder="VD: Kiểm đếm định kỳ cuối tuần"
                  value={newCheckForm.note}
                  onChange={(e) => setNewCheckForm({ ...newCheckForm, note: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Ô lọc sản phẩm nhanh */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Lọc sản phẩm cần kiểm đếm..."
                value={newCheckForm.searchKeyword}
                onChange={(e) => setNewCheckForm({ ...newCheckForm, searchKeyword: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Bảng danh sách sản phẩm kiểm đếm */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-center w-14 whitespace-nowrap">Hình Ảnh</th>
                    <th className="p-2.5 whitespace-nowrap">Sản Phẩm & Barcode</th>
                    <th className="p-2.5 text-center whitespace-nowrap">ĐVT</th>
                    <th className="p-2.5 text-right whitespace-nowrap">Tồn Hệ Thống</th>
                    <th className="p-2.5 text-center w-28 whitespace-nowrap">Tồn Thực Tế</th>
                    <th className="p-2.5 text-right whitespace-nowrap">Lệch Tồn</th>
                    <th className="p-2.5 text-right whitespace-nowrap">Giá Trị Lệch (đ)</th>
                    <th className="p-2.5 whitespace-nowrap">Lý Do / Ghi Chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {newCheckForm.items
                    .filter(
                      (item) =>
                        item.name.toLowerCase().includes(newCheckForm.searchKeyword.toLowerCase()) ||
                        item.barcode.includes(newCheckForm.searchKeyword) ||
                        item.sku.toLowerCase().includes(newCheckForm.searchKeyword.toLowerCase())
                    )
                    .map((item) => {
                      const realIndex = newCheckForm.items.findIndex((i) => i.id === item.id);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          {/* Hình Ảnh Thực Tế */}
                          <td className="p-2 text-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-9 h-9 object-cover rounded-lg border border-slate-200 mx-auto"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                          </td>

                          <td className="p-2">
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-blue-600 font-mono">
                              SKU: {item.sku} | Barcode: {item.barcode}
                            </p>
                          </td>

                          <td className="p-2 text-center">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md">
                              {item.unit}
                            </span>
                          </td>

                          <td className="p-2 text-right font-bold text-slate-700">
                            {item.systemStock}
                          </td>

                          {/* Nhập Tồn Thực Tế */}
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              value={item.actualCount}
                              onChange={(e) => handleActualCountChange(realIndex, e.target.value)}
                              className="w-20 bg-emerald-50 border border-emerald-300 rounded-lg px-2 py-1 text-xs font-black text-center text-slate-900 focus:outline-none focus:border-emerald-600"
                            />
                          </td>

                          {/* Lệch Tồn */}
                          <td className="p-2 text-right">
                            <span
                              className={`font-black text-xs ${
                                item.discrepancy === 0
                                  ? 'text-slate-500'
                                  : item.discrepancy > 0
                                  ? 'text-emerald-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy}
                            </span>
                          </td>

                          {/* Giá Trị Lệch */}
                          <td className="p-2 text-right font-bold text-xs">
                            <span
                              className={
                                item.discrepancy === 0
                                  ? 'text-slate-400'
                                  : item.discrepancy > 0
                                  ? 'text-emerald-700'
                                  : 'text-rose-600'
                              }
                            >
                              {item.discrepancy > 0 ? '+' : ''}
                              {(item.discrepancy * item.costPrice).toLocaleString('vi-VN')} đ
                            </span>
                          </td>

                          {/* Ghi chú lý do */}
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="Lý do lệch..."
                              value={item.note}
                              onChange={(e) => handleItemNoteChange(realIndex, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-blue-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Tổng chênh lệch:{' '}
                <strong className="text-slate-900 font-black">
                  {newCheckForm.items.reduce((s, i) => s + i.discrepancy, 0)} SP
                </strong>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="3d-secondary"
                  onClick={() => setIsCheckModalOpen(false)}
                >
                  Hủy Bỏ
                </Button>
                <Button
                  type="button"
                  variant="3d-secondary"
                  onClick={() => handleSaveCheck(false)}
                >
                  Lưu Nháp Phiếu
                </Button>
                <Button
                  type="button"
                  variant="3d-solid"
                  onClick={() => handleSaveCheck(true)}
                >
                  Lưu & Cân Bằng Kho Nhanh
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem Chi Tiết Phiếu Kiểm Kê Kèm Ảnh & Xuất Excel */}
      {isDetailModalOpen && selectedCheck && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-blue-600" />
                  Báo Cáo Chi Tiết Phiếu Kiểm Kê: {selectedCheck.id}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ngày kiểm: {selectedCheck.date} · Người kiểm: {selectedCheck.creator}
                </p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl mb-4 text-xs border border-slate-200">
              <div>
                <span className="text-slate-400 block">Trạng thái:</span>
                <span className="font-bold text-emerald-700">{selectedCheck.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Số SP kiểm:</span>
                <span className="font-bold text-slate-800">{selectedCheck.totalItems} SP</span>
              </div>
              <div>
                <span className="text-slate-400 block">Số SP lệch:</span>
                <span className="font-bold text-rose-600">{selectedCheck.discrepancyItems} SP</span>
              </div>
              <div>
                <span className="text-slate-400 block">Tổng giá trị lệch:</span>
                <span className="font-black text-blue-700">
                  {selectedCheck.totalDiscrepancyValue.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            {/* Bảng chi tiết sản phẩm kiểm đếm */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-center w-14 whitespace-nowrap">Hình Ảnh</th>
                    <th className="p-2.5 whitespace-nowrap">Tên Sản Phẩm</th>
                    <th className="p-2.5 text-center whitespace-nowrap">ĐVT</th>
                    <th className="p-2.5 text-right whitespace-nowrap">Tồn Hệ Thống</th>
                    <th className="p-2.5 text-right whitespace-nowrap">Tồn Thực Tế</th>
                    <th className="p-2.5 text-right whitespace-nowrap">Chênh Lệch</th>
                    <th className="p-2.5 text-right whitespace-nowrap">Giá Trị Lệch</th>
                    <th className="p-2.5 whitespace-nowrap">Ghi Chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedCheck.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2 text-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-9 h-9 object-cover rounded-lg border border-slate-200 mx-auto"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-blue-600 font-mono">{item.barcode}</p>
                      </td>
                      <td className="p-2 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md">
                          {item.unit}
                        </span>
                      </td>
                      <td className="p-2 text-right font-bold text-slate-700">{item.systemStock}</td>
                      <td className="p-2 text-right font-black text-emerald-700">{item.actualCount}</td>
                      <td className="p-2 text-right font-black">
                        <span
                          className={
                            item.discrepancy === 0
                              ? 'text-slate-500'
                              : item.discrepancy > 0
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }
                        >
                          {item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy}
                        </span>
                      </td>
                      <td className="p-2 text-right font-bold">
                        {(item.discrepancy * item.costPrice).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="p-2 text-slate-600 italic">{item.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Button
                variant="3d-secondary"
                icon={FileSpreadsheet}
                onClick={() => handleExportSingleCheck(selectedCheck)}
              >
                Xuất Excel Phiếu Này
              </Button>
              <div className="flex items-center gap-2">
                {selectedCheck.status === 'NHÁP' && (
                  <Button
                    variant="3d-solid"
                    onClick={() => handleBalanceExistingCheck(selectedCheck)}
                  >
                    Cân Bằng Kho Ngay
                  </Button>
                )}
                <Button variant="3d-secondary" onClick={() => setIsDetailModalOpen(false)}>
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Điều Chỉnh Kho Lẻ */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-blue-600" />
              Phiếu Điều Chỉnh Tồn Kho Lẻ
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Ghi nhận biến động hư hỏng, rách bao bì, quá hạn sử dụng hoặc kiểm đếm bù trừ lẻ
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
