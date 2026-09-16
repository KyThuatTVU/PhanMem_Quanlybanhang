import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import {
  FileInput,
  Plus,
  Search,
  Filter,
  Truck,
  Eye,
  Printer,
  Trash2,
  Calendar,
  DollarSign,
  Building,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const PurchaseOrderListPage = () => {
  const [keyword, setKeyword] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  // Danh sách nhà cung cấp
  const suppliers = [
    { id: 1, name: 'Công ty TNHH Nước Giải Khát Coca-Cola VN', phone: '028 3896 1000' },
    { id: 2, name: 'Công ty CP Acecook Việt Nam', phone: '028 3815 4064' },
    { id: 3, name: 'Công ty CP Sữa Việt Nam (Vinamilk)', phone: '028 5415 5555' },
    { id: 4, name: 'Công ty TNHH Orion Food Vina', phone: '028 3770 0800' },
  ];

  // Danh sách phiếu nhập
  const [purchaseOrders, setPurchaseOrders] = useState([
    {
      id: 1,
      poNumber: 'PO-20260916-0001',
      supplierName: 'Công ty TNHH Nước Giải Khát Coca-Cola VN',
      orderDate: '16/09/2026',
      totalAmount: 11040000,
      discount: 0,
      paidAmount: 11040000,
      debtAmount: 0,
      status: 'COMPLETED',
      note: 'Nhập lô nước ngọt cuối tuần',
      items: [
        { name: 'Nước ngọt Coca-Cola 330ml', unit: 'Thùng (24 Lon)', quantity: 50, costPrice: 204000, subtotal: 10200000 },
        { name: 'Nước ngọt Sprite 330ml', unit: 'Thùng (24 Lon)', quantity: 4, costPrice: 210000, subtotal: 840000 },
      ],
    },
    {
      id: 2,
      poNumber: 'PO-20260915-0002',
      supplierName: 'Công ty CP Acecook Việt Nam',
      orderDate: '15/09/2026',
      totalAmount: 5200000,
      discount: 100000,
      paidAmount: 3000000,
      debtAmount: 2100000,
      status: 'PARTIAL_DEBT',
      note: 'Gối đầu công nợ đợt 1',
      items: [
        { name: 'Mì Hảo Hảo Tôm Chua Cay 75g', unit: 'Thùng (30 Gói)', quantity: 45, costPrice: 115000, subtotal: 5175000 },
      ],
    },
  ]);

  // Form Tạo Phiếu Nhập
  const [newPO, setNewPO] = useState({
    supplierId: 1,
    orderDate: new Date().toISOString().slice(0, 10),
    note: '',
    discount: 0,
    paidAmount: '',
    items: [
      { name: 'Nước ngọt Coca-Cola 330ml', unit: 'Thùng (24 Lon)', quantity: 10, costPrice: 204000 },
    ],
  });

  const handleAddItemRow = () => {
    setNewPO({
      ...newPO,
      items: [
        ...newPO.items,
        { name: '', unit: 'Thùng', quantity: 1, costPrice: 0 },
      ],
    });
  };

  const handleRemoveItemRow = (index) => {
    const updated = [...newPO.items];
    updated.splice(index, 1);
    setNewPO({ ...newPO, items: updated });
  };

  const calculateSubtotal = () => {
    return newPO.items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.costPrice) || 0), 0);
  };

  const handleSavePO = (e) => {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === Number(newPO.supplierId));
    const rawTotal = calculateSubtotal();
    const finalTotal = Math.max(0, rawTotal - Number(newPO.discount || 0));
    const paid = Number(newPO.paidAmount) || 0;
    const debt = Math.max(0, finalTotal - paid);

    const createdPO = {
      id: Date.now(),
      poNumber: 'PO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000),
      supplierName: supplier?.name || 'Nhà cung cấp mới',
      orderDate: newPO.orderDate,
      totalAmount: finalTotal,
      discount: Number(newPO.discount) || 0,
      paidAmount: paid,
      debtAmount: debt,
      status: debt > 0 ? 'PARTIAL_DEBT' : 'COMPLETED',
      note: newPO.note,
      items: newPO.items.map((it) => ({
        ...it,
        subtotal: (Number(it.quantity) || 0) * (Number(it.costPrice) || 0),
      })),
    };

    setPurchaseOrders([createdPO, ...purchaseOrders]);
    setIsCreateModalOpen(false);
  };

  const filteredPOs = purchaseOrders.filter((po) => {
    return (
      po.poNumber.toLowerCase().includes(keyword.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(keyword.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileInput className="w-6 h-6 text-blue-600" />
            Nhập Hàng & Quản Lý Phiếu Nhập (PO)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Lập phiếu nhập kho từ nhà phân phối, tính toán giá vốn và hạch toán sổ công nợ nhà cung cấp
          </p>
        </div>

        <Button
          variant="3d-solid"
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Tạo Phiếu Nhập Hàng
        </Button>
      </div>

      {/* 2. Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="soft-card p-4">
          <p className="text-[11px] text-slate-500 font-semibold">Tổng số phiếu nhập</p>
          <p className="text-xl font-black text-slate-900 mt-1">{purchaseOrders.length} phiếu</p>
        </div>
        <div className="soft-card p-4">
          <p className="text-[11px] text-slate-500 font-semibold">Tổng giá trị tiền hàng</p>
          <p className="text-xl font-black text-blue-700 mt-1">
            {purchaseOrders.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
        <div className="soft-card p-4">
          <p className="text-[11px] text-slate-500 font-semibold">Đã thanh toán NCC</p>
          <p className="text-xl font-black text-emerald-600 mt-1">
            {purchaseOrders.reduce((sum, p) => sum + p.paidAmount, 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
        <div className="soft-card p-4">
          <p className="text-[11px] text-slate-500 font-semibold">Còn nợ đọng NCC</p>
          <p className="text-xl font-black text-rose-600 mt-1">
            {purchaseOrders.reduce((sum, p) => sum + p.debtAmount, 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      {/* 3. Search & Filter */}
      <div className="soft-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo mã phiếu (PO) hoặc tên nhà cung cấp..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-slate-100 border border-transparent focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition"
          />
        </div>
      </div>

      {/* 4. Table */}
      <div className="soft-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Mã Phiếu Nhập</th>
                <th className="p-4">Ngày Nhập</th>
                <th className="p-4">Nhà Cung Cấp</th>
                <th className="p-4 text-right">Tổng Tiền Hàng</th>
                <th className="p-4 text-right">Đã Thanh Toán</th>
                <th className="p-4 text-right">Còn Nợ NCC</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4 text-right">Chi Tiết / In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPOs.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4">
                    <span className="font-mono font-bold text-blue-700">{po.poNumber}</span>
                  </td>
                  <td className="p-4 text-slate-600">{po.orderDate}</td>
                  <td className="p-4 font-bold text-slate-900">{po.supplierName}</td>
                  <td className="p-4 text-right font-black text-slate-900">
                    {po.totalAmount.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-4 text-right font-bold text-emerald-600">
                    {po.paidAmount.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-4 text-right font-bold text-rose-600">
                    {po.debtAmount > 0 ? po.debtAmount.toLocaleString('vi-VN') + ' đ' : '0 đ'}
                  </td>
                  <td className="p-4 text-center">
                    {po.debtAmount === 0 ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-md border border-emerald-200">
                        Đã thanh toán đủ
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold text-[10px] rounded-md border border-rose-200">
                        Ghi nợ NCC
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedPO(po);
                          setIsDetailModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Xem chi tiết phiếu nhập"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="In phiếu nhập kho"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tạo Phiếu Nhập Hàng */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <FileInput className="w-5 h-5 text-blue-600" />
              Lập Phiếu Nhập Kho Hàng Hóa Mới
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Nhập danh sách sản phẩm thực nhập từ nhà phân phối và xác định hình thức thanh toán
            </p>

            <form onSubmit={handleSavePO} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhà Cung Cấp *
                  </label>
                  <select
                    value={newPO.supplierId}
                    onChange={(e) => setNewPO({ ...newPO, supplierId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày Nhập Kho
                  </label>
                  <input
                    type="date"
                    required
                    value={newPO.orderDate}
                    onChange={(e) => setNewPO({ ...newPO, orderDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Bảng Mặt Hàng Nhập */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800">Danh Sách Mặt Hàng Nhập Kho:</h3>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    + Thêm dòng sản phẩm
                  </button>
                </div>

                {newPO.items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl text-xs">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Tên sản phẩm nhập..."
                        value={it.name}
                        onChange={(e) => {
                          const updated = [...newPO.items];
                          updated[idx].name = e.target.value;
                          setNewPO({ ...newPO, items: updated });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="ĐVT (Thùng/Lon)"
                        value={it.unit}
                        onChange={(e) => {
                          const updated = [...newPO.items];
                          updated[idx].unit = e.target.value;
                          setNewPO({ ...newPO, items: updated });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="SL"
                        value={it.quantity}
                        onChange={(e) => {
                          const updated = [...newPO.items];
                          updated[idx].quantity = e.target.value;
                          setNewPO({ ...newPO, items: updated });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-bold text-xs text-center"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Đơn giá nhập"
                        value={it.costPrice}
                        onChange={(e) => {
                          const updated = [...newPO.items];
                          updated[idx].costPrice = e.target.value;
                          setNewPO({ ...newPO, items: updated });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-bold text-xs"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tính Toán Thanh Toán & Công Nợ */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Tổng tiền hàng:</span>
                  <span className="text-base font-black text-slate-900">
                    {calculateSubtotal().toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chiết Khấu / Giảm Giá
                    </label>
                    <input
                      type="number"
                      value={newPO.discount}
                      onChange={(e) => setNewPO({ ...newPO, discount: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Thực Thanh Toán Trước Cho NCC
                    </label>
                    <input
                      type="number"
                      value={newPO.paidAmount}
                      onChange={(e) => setNewPO({ ...newPO, paidAmount: e.target.value })}
                      placeholder="Nhập số tiền đã trả..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-700">Số tiền ghi nợ NCC:</span>
                  <span className="text-sm font-black text-rose-600">
                    {Math.max(
                      0,
                      calculateSubtotal() -
                        Number(newPO.discount || 0) -
                        Number(newPO.paidAmount || 0)
                    ).toLocaleString('vi-VN')}{' '}
                    đ
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="3d-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Hủy Bỏ
                </Button>
                <Button type="submit" variant="3d-solid">
                  Hoàn Tất Nhập Kho
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chi Tiết Phiếu Nhập */}
      {isDetailModalOpen && selectedPO && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 mb-1">
              Chi Tiết Phiếu Nhập: {selectedPO.poNumber}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Nhà cung cấp: {selectedPO.supplierName} | Ngày nhập: {selectedPO.orderDate}
            </p>

            <div className="space-y-2 mb-4">
              {selectedPO.items.map((it, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{it.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {it.quantity} x {it.costPrice.toLocaleString('vi-VN')} đ ({it.unit})
                    </p>
                  </div>
                  <span className="font-black text-slate-800">
                    {it.subtotal.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-slate-100 p-3 rounded-xl space-y-1.5 text-xs mb-4">
              <div className="flex justify-between">
                <span>Tổng tiền hàng:</span>
                <span className="font-bold">{selectedPO.totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between">
                <span>Đã thanh toán:</span>
                <span className="font-bold text-emerald-600">
                  {selectedPO.paidAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span>Còn nợ NCC:</span>
                <span className="font-bold text-rose-600">
                  {selectedPO.debtAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="3d-secondary" onClick={() => setIsDetailModalOpen(false)}>
                Đóng
              </Button>
              <Button variant="3d-solid" icon={Printer} onClick={() => window.print()}>
                In Phiếu Nhập Kho
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
