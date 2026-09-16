import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Button } from '../../components/ui/Button';
import {
  Barcode,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  CheckCircle2,
  Printer,
  PauseCircle,
  PlayCircle,
  Clock
} from 'lucide-react';

export const PosPage = () => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [heldOrders, setHeldOrders] = useState([]);
  const [isHeldModalOpen, setIsHeldModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [searchKeyword]);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products', {
        params: { keyword: searchKeyword, limit: 12 },
      });
      setProducts(response.data || []);
    } catch (err) {
      console.error('Lỗi lấy sản phẩm:', err);
    }
  };

  const handleBarcodeScan = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    try {
      const response = await apiClient.get(`/products/barcodes/scan/${barcodeInput.trim()}`);
      const scannedItem = response.data;
      addToCartFromScan(scannedItem);
      setBarcodeInput('');
    } catch (err) {
      alert(err.message || 'Mã vạch không tồn tại!');
    }
  };

  const addToCartFromScan = (scannedItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productUnitId === scannedItem.product_unit_id);
      if (existing) {
        return prevCart.map((item) =>
          item.productUnitId === scannedItem.product_unit_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          productId: scannedItem.product_id,
          productUnitId: scannedItem.product_unit_id,
          name: scannedItem.product_name,
          unitName: scannedItem.unit_name,
          conversionRate: parseFloat(scannedItem.conversion_rate),
          unitPrice: parseFloat(scannedItem.retail_price),
          costPrice: parseFloat(scannedItem.cost_price),
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (productUnitId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productUnitId === productUnitId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productUnitId) => {
    setCart((prev) => prev.filter((item) => item.productUnitId !== productUnitId));
  };

  // Giữ đơn tạm
  const handleHoldOrder = () => {
    if (cart.length === 0) {
      alert('Giỏ hàng đang trống, không thể giữ đơn!');
      return;
    }
    const orderToHold = {
      id: Date.now(),
      holdTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      cart: [...cart],
      totalAmount: grandTotal,
    };
    setHeldOrders([orderToHold, ...heldOrders]);
    setCart([]);
    setPaidAmount('');
    alert('Đã giữ đơn tạm thành công! Bạn có thể tiếp tục tính tiền cho khách sau.');
  };

  // Khôi phục đơn tạm
  const handleRestoreOrder = (held) => {
    if (cart.length > 0 && !window.confirm('Giỏ hàng hiện tại có món. Bạn có muốn ghi đè bằng đơn tạm này?')) {
      return;
    }
    setCart(held.cart);
    setHeldOrders(heldOrders.filter((o) => o.id !== held.id));
    setIsHeldModalOpen(false);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = 0;
  const grandTotal = subtotal - discount;
  const customerPaid = parseFloat(paidAmount || 0);
  const changeAmount = Math.max(0, customerPaid - grandTotal);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Giỏ hàng đang trống!');
      return;
    }

    if (paymentMethod === 'CASH' && customerPaid < grandTotal) {
      alert('Số tiền khách đưa chưa đủ!');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiClient.post('/pos/checkout', {
        cartItems: cart,
        subtotalAmount: subtotal,
        discountAmount: discount,
        grandTotal: grandTotal,
        paidAmount: paymentMethod === 'CASH' ? customerPaid : grandTotal,
        changeAmount: paymentMethod === 'CASH' ? changeAmount : 0,
        debtAmount: 0,
        paymentMethod,
      });

      setCompletedOrder({
        code: response.data.orderCode,
        grandTotal,
        paidAmount: paymentMethod === 'CASH' ? customerPaid : grandTotal,
        changeAmount,
        cart: [...cart],
      });

      setCart([]);
      setPaidAmount('');
    } catch (err) {
      alert(err.message || 'Thanh toán đơn hàng thất bại!');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col lg:flex-row gap-4 overflow-hidden">
      {/* 1. KHU VỰC TRÁI: QUÉT MÃ VẠCH & CHỌN NHANH */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Thanh Nhập Mã Vạch */}
        <div className="soft-card p-4 flex flex-col sm:flex-row gap-3 items-center">
          <form onSubmit={handleBarcodeScan} className="w-full sm:w-1/2 relative">
            <Barcode className="w-5 h-5 text-blue-600 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Quét hoặc gõ mã vạch rồi nhấn Enter..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full bg-blue-50/50 border border-blue-200 focus:border-blue-600 rounded-xl pl-11 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none transition"
              autoFocus
            />
          </form>

          <div className="w-full sm:w-1/2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-slate-100 border border-transparent focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Grid Chọn Nhanh */}
        <div className="flex-1 overflow-y-auto soft-card p-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Sản Phẩm Chọn Nhanh ({products.length})
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {products.map((prod) => (
              <button
                key={prod.id}
                onClick={() =>
                  addToCartFromScan({
                    product_id: prod.id,
                    product_unit_id: prod.id,
                    product_name: prod.name,
                    unit_name: prod.base_unit_name || 'Lon',
                    conversion_rate: 1,
                    retail_price: 15000,
                    cost_price: 10000,
                  })
                }
                className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 rounded-xl text-left transition space-y-1.5 shadow-sm hover:shadow"
              >
                <p className="text-xs font-bold text-slate-900 line-clamp-2">{prod.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-blue-600">15.000 đ</span>
                  <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border">
                    {prod.base_unit_name || 'Lon'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. KHU VỰC PHẢI: GIỎ HÀNG & THANH TOÁN */}
      <div className="w-full lg:w-96 soft-card flex flex-col justify-between p-4 overflow-hidden border-l border-slate-200">
        {/* Header Giỏ Hàng + Nút Giữ Đơn */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900">Giỏ Hàng POS</h2>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {cart.length} món
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleHoldOrder}
              title="Giữ đơn tạm này"
              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
            >
              <PauseCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsHeldModalOpen(true)}
              title="Xem các đơn tạm đang giữ"
              className="relative p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              <PlayCircle className="w-4 h-4" />
              {heldOrders.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          </div>
        </div>

        {/* Danh Sách Món */}
        <div className="flex-1 overflow-y-auto py-3 divide-y divide-slate-100 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-8">
              <ShoppingCart className="w-12 h-12 stroke-1" />
              <p className="text-xs font-medium">Giỏ hàng đang trống</p>
              <span className="text-[10px] text-slate-400">Quét mã vạch hoặc bấm chọn sản phẩm</span>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productUnitId} className="pt-2 flex items-center justify-between text-xs">
                <div className="space-y-0.5 max-w-[160px]">
                  <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                  <span className="text-[10px] text-slate-400">
                    {item.unitPrice.toLocaleString('vi-VN')} đ / {item.unitName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.productUnitId, -1)}
                      className="p-1 hover:bg-slate-200 text-slate-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-bold text-slate-800 text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productUnitId, 1)}
                      className="p-1 hover:bg-slate-200 text-slate-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productUnitId)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tính Tiền & Thanh Toán */}
        <div className="border-t border-slate-100 pt-3 space-y-3 bg-slate-50/50 -mx-4 -mb-4 p-4">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Tổng tiền hàng:</span>
              <span className="font-bold text-slate-800">{subtotal.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Chiết khấu:</span>
              <span className="font-bold text-slate-800">0 đ</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-blue-600 border-t border-slate-200 pt-2">
              <span>Khách phải trả:</span>
              <span>{grandTotal.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setPaymentMethod('CASH')}
              className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                paymentMethod === 'CASH'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              <Banknote className="w-4 h-4" /> Tiền Mặt
            </button>
            <button
              onClick={() => setPaymentMethod('BANK_TRANSFER')}
              className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                paymentMethod === 'BANK_TRANSFER'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Chuyển Khoản QR
            </button>
          </div>

          {paymentMethod === 'CASH' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Tiền khách đưa:</span>
                <span className="font-bold text-emerald-600">
                  Tiền thừa: {changeAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <input
                type="number"
                placeholder="Nhập số tiền..."
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <Button
            variant="3d-solid"
            size="lg"
            isLoading={isProcessing}
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full py-3.5 text-base font-extrabold shadow-glass-3d"
          >
            THANH TOÁN (F9)
          </Button>
        </div>
      </div>

      {/* Modal Các Đơn Đang Giữ */}
      {isHeldModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Danh Sách Đơn Hàng Tạm Đang Giữ ({heldOrders.length})
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Chọn đơn hàng tạm để khôi phục lại giỏ hàng và tiếp tục thanh toán
            </p>

            {heldOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Không có đơn hàng nào đang giữ</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {heldOrders.map((held) => (
                  <div
                    key={held.id}
                    className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {held.cart.length} món • {held.totalAmount.toLocaleString('vi-VN')} đ
                      </p>
                      <span className="text-[10px] text-slate-400">Giữ lúc {held.holdTime}</span>
                    </div>
                    <Button
                      variant="3d-primary"
                      size="sm"
                      onClick={() => handleRestoreOrder(held)}
                    >
                      Mở Lại Đơn
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="3d-secondary" onClick={() => setIsHeldModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HOÀN TẤT ĐƠN HÀNG IN BILL */}
      {completedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="soft-card bg-white max-w-sm w-full p-6 space-y-4 rounded-3xl animate-scaleUp">
            <div className="text-center space-y-1">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-extrabold text-slate-900">Thanh Toán Thành Công!</h3>
              <p className="text-xs text-slate-500 font-bold">Mã Hóa Đơn: {completedOrder.code}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 text-xs border">
              <div className="flex justify-between">
                <span>Tổng cộng:</span>
                <span className="font-bold text-slate-900">
                  {completedOrder.grandTotal.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tiền khách đưa:</span>
                <span className="font-bold text-slate-900">
                  {completedOrder.paidAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between border-t pt-1 text-emerald-600 font-bold">
                <span>Tiền thối lại:</span>
                <span>{completedOrder.changeAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="3d-secondary"
                className="flex-1"
                onClick={() => setCompletedOrder(null)}
              >
                Đóng
              </Button>
              <Button
                variant="3d-solid"
                icon={Printer}
                className="flex-1"
                onClick={() => {
                  alert('Đã gửi lệnh tới máy in bill 80mm!');
                  setCompletedOrder(null);
                }}
              >
                In Hóa Đơn
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
