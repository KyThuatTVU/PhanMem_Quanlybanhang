import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Button } from '../../components/ui/Button';
import { useStoreSettings } from '../../stores/useStoreSettings';
import { useAuthStore } from '../../stores/useAuthStore';
import { usePosAuthStore } from '../../stores/usePosAuthStore';
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
  Clock,
  Package,
  Image as ImageIcon
} from 'lucide-react';
import brandLogo from '../../assets/images/logo.png';
import { QRCodeSVG } from 'qrcode.react';

export const PosPage = () => {
  const { settings } = useStoreSettings();
  const { user } = useAuthStore();
  const { cashier } = usePosAuthStore();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('pos_cart');
      if (!savedCart) return [];
      const parsed = JSON.parse(savedCart);
      let changed = false;
      const cleaned = parsed.map((item) => {
        if (
          item.image &&
          (item.image.includes('photo-1622483767028-3f66f32aef97') ||
            (item.name && item.name.toLowerCase().includes('coca') && !item.image.includes('1554866585')))
        ) {
          changed = true;
          return {
            ...item,
            image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80',
          };
        }
        return item;
      });
      if (changed) {
        localStorage.setItem('pos_cart', JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  });
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [heldOrders, setHeldOrders] = useState([]);
  const [isHeldModalOpen, setIsHeldModalOpen] = useState(false);
  const [printMode, setPrintMode] = useState('THERMAL_80');
  const [printCopies, setPrintCopies] = useState(1);
  const [receiptStage, setReceiptStage] = useState('REVIEW');

  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem('pos_cart', JSON.stringify(cart));
      } else {
        localStorage.removeItem('pos_cart');
      }
    } catch (error) {
      console.error('Không thể lưu giỏ hàng POS:', error);
    }
  }, [cart]);

  const readCatalogProducts = () => {
    try {
      const savedProducts = localStorage.getItem('product_catalog');
      if (!savedProducts) return [];
      const parsed = JSON.parse(savedProducts);
      let changed = false;
      const cleaned = parsed.map((p) => {
        if (
          p.image &&
          (p.image.includes('photo-1622483767028-3f66f32aef97') ||
            (p.name && p.name.toLowerCase().includes('coca') && !p.image.includes('1554866585')))
        ) {
          changed = true;
          return {
            ...p,
            image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80',
          };
        }
        return p;
      });
      if (changed) {
        localStorage.setItem('product_catalog', JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  };

  const mapCatalogProduct = (product) => {
    let img = product.image;
    if (
      img &&
      (img.includes('photo-1622483767028-3f66f32aef97') ||
        (product.name && product.name.toLowerCase().includes('coca') && !img.includes('1554866585')))
    ) {
      img = 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80';
    }
    return {
      ...product,
      id: product.id,
      name: product.name,
      category: product.category || 'Nước giải khát & Bia',
      image: img,
      barcode: product.baseBarcode,
      base_unit_name: product.baseUnit,
      retail_price: Number(product.retailPrice) || 0,
      cost_price: Number(product.costPrice) || 0,
      stock: Number.isFinite(Number(product.stock)) ? Number(product.stock) : null,
      conversion_rate: 1,
    };
  };

  // Danh mục sản phẩm có sẵn hình ảnh thực tế (Phân loại rõ ngành hàng đặc biệt là Gia vị)
  const defaultProducts = [
    {
      id: 1,
      name: 'Nước ngọt Coca-Cola 330ml',
      category: 'Nước giải khát & Bia',
      image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80',
      barcode: '8934560111118',
      base_unit_name: 'Lon',
      retail_price: 10000,
      cost_price: 8500,
      stock: 120,
      conversion_rate: 1,
    },
    {
      id: 2,
      name: 'Mì Hảo Hảo Tôm Chua Cay 75g',
      category: 'Mì & Thực phẩm đóng gói',
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80',
      barcode: '8935001700018',
      base_unit_name: 'Gói',
      retail_price: 4500,
      cost_price: 3800,
      stock: 18,
      conversion_rate: 1,
    },
    {
      id: 3,
      name: 'Sữa tươi Vinamilk 100% 180ml',
      category: 'Sữa & Sản phẩm từ sữa',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
      barcode: '8934673123456',
      base_unit_name: 'Hộp',
      retail_price: 9000,
      cost_price: 7600,
      stock: 85,
      conversion_rate: 1,
    },
    {
      id: 4,
      name: 'Bánh snack khoai tây Ostar 65g',
      category: 'Bánh kẹo & Snack',
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80',
      barcode: '8936036010012',
      base_unit_name: 'Gói',
      retail_price: 14000,
      cost_price: 11000,
      stock: 35,
      conversion_rate: 1,
    },
    {
      id: 5,
      name: 'Dầu đậu nành Simply 1L',
      category: 'Gia vị & Dầu ăn',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80',
      barcode: '8935031201001',
      base_unit_name: 'Chai',
      retail_price: 65000,
      cost_price: 52000,
      stock: 40,
      conversion_rate: 1,
    },
    {
      id: 6,
      name: 'Nước khoáng thiên nhiên Lavie 500ml',
      category: 'Nước giải khát & Bia',
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80',
      barcode: '8934588012114',
      base_unit_name: 'Chai',
      retail_price: 6000,
      cost_price: 4500,
      stock: 60,
      conversion_rate: 1,
    },
    {
      id: 7,
      name: 'Tương ớt Cholimex chai 250g',
      category: 'Gia vị & Dầu ăn',
      image: 'https://images.unsplash.com/photo-1588615419957-660c04294d1b?w=400&auto=format&fit=crop&q=80',
      barcode: '8934752010115',
      base_unit_name: 'Chai',
      retail_price: 12000,
      cost_price: 9000,
      stock: 50,
      conversion_rate: 1,
    },
    {
      id: 8,
      name: 'Nước mắm Nam Ngư Đệ Nhị 900ml',
      category: 'Gia vị & Dầu ăn',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop&q=80',
      barcode: '8934563829102',
      base_unit_name: 'Chai',
      retail_price: 32000,
      cost_price: 26000,
      stock: 45,
      conversion_rate: 1,
    },
    {
      id: 9,
      name: 'Hạt nêm Knorr Thịt Thăn Xương Ống 400g',
      category: 'Gia vị & Dầu ăn',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80',
      barcode: '8934822001924',
      base_unit_name: 'Gói',
      retail_price: 36000,
      cost_price: 30000,
      stock: 65,
      conversion_rate: 1,
    },
  ];

  const [products, setProducts] = useState(defaultProducts);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/products/categories');
      if (response.data && response.data.length > 0) {
        setCategories(response.data);
      } else {
        setCategories([
          { id: 1, name: 'Gia vị & Dầu ăn' },
          { id: 2, name: 'Gia vị & Đồ khô' },
          { id: 3, name: 'Nước giải khát & Bia' },
          { id: 4, name: 'Bánh kẹo & Snack' },
          { id: 5, name: 'Sữa & Sản phẩm từ sữa' },
          { id: 6, name: 'Mì & Thực phẩm đóng gói' },
        ]);
      }
    } catch {
      setCategories([
        { id: 1, name: 'Gia vị & Dầu ăn' },
        { id: 2, name: 'Gia vị & Đồ khô' },
        { id: 3, name: 'Nước giải khát & Bia' },
        { id: 4, name: 'Bánh kẹo & Snack' },
        { id: 5, name: 'Sữa & Sản phẩm từ sữa' },
        { id: 6, name: 'Mì & Thực phẩm đóng gói' },
      ]);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => fetchProducts(), 300);
    return () => window.clearTimeout(timer);
  }, [searchKeyword]);

  const fetchProducts = async () => {
    const catalogProducts = readCatalogProducts();
    if (catalogProducts.length > 0) {
      const keyword = searchKeyword.trim().toLowerCase();
      const filteredCatalog = catalogProducts
        .filter((product) =>
          !keyword ||
          product.name.toLowerCase().includes(keyword) ||
          product.sku.toLowerCase().includes(keyword) ||
          product.baseBarcode.includes(keyword)
        )
        .map(mapCatalogProduct);
      setProducts(filteredCatalog);
      return;
    }

    try {
      const response = await apiClient.get('/products', {
        params: { keyword: searchKeyword, limit: 12 },
      });
      if (response.data && response.data.length > 0) {
        // Hợp nhất dữ liệu trả về và giữ fallback ảnh nếu có
        const mapped = response.data.map((item, idx) => ({
          ...item,
          image: item.primary_image_url || defaultProducts[idx % defaultProducts.length]?.image,
          retail_price: item.retail_price || 15000,
          cost_price: item.cost_price || 10000,
        }));
        setProducts(mapped);
      } else {
        const filtered = defaultProducts.filter((p) =>
          p.name.toLowerCase().includes(searchKeyword.toLowerCase())
        );
        setProducts(filtered);
      }
    } catch (err) {
      const filtered = defaultProducts.filter((p) =>
        p.name.toLowerCase().includes(searchKeyword.toLowerCase())
      );
      setProducts(filtered);
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
      // Tìm trong mock products nếu quét mã mẫu
      const found = readCatalogProducts()
        .map(mapCatalogProduct)
        .find((p) => p.barcode === barcodeInput.trim()) || defaultProducts.find((p) => p.barcode === barcodeInput.trim());
      if (found) {
        addToCartFromScan({
          product_id: found.id,
          product_unit_id: found.id,
          product_name: found.name,
          image: found.image,
          unit_name: found.base_unit_name,
          conversion_rate: found.conversion_rate,
          retail_price: found.retail_price,
          cost_price: found.cost_price,
          stock: found.stock,
        });
        setBarcodeInput('');
      } else {
        alert('Không tìm thấy sản phẩm có mã vạch: ' + barcodeInput);
      }
    }
  };

  const addToCartFromScan = (scannedItem) => {
    const availableStock = Number.isFinite(Number(scannedItem.stock)) ? Number(scannedItem.stock) : null;
    setCart((prevCart) => {
      const pUnitId = scannedItem.product_unit_id || scannedItem.id;
      const existing = prevCart.find((item) => item.productUnitId === pUnitId);
      if (existing) {
        if (availableStock !== null && existing.quantity >= availableStock) {
          alert(`Sản phẩm "${existing.name}" chỉ còn ${availableStock} ${existing.unitName}.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.productUnitId === pUnitId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          productId: scannedItem.product_id || scannedItem.id,
          productUnitId: pUnitId,
          name: scannedItem.product_name || scannedItem.name,
          image: scannedItem.image || scannedItem.primary_image_url || '',
          unitName: scannedItem.unit_name || scannedItem.base_unit_name || 'Lon',
          conversionRate: parseFloat(scannedItem.conversion_rate || 1),
          unitPrice: parseFloat(scannedItem.retail_price || 15000),
          costPrice: parseFloat(scannedItem.cost_price || 10000),
          stock: availableStock,
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
            if (delta > 0 && item.stock !== null && newQty > item.stock) {
              alert(`Sản phẩm "${item.name}" chỉ còn ${item.stock} ${item.unitName}.`);
              return item;
            }
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
    alert('Đã giữ đơn tạm thành công! Bạn có thể tiếp tục tính tiền cho khách sau.');
  };

  // Khôi phục đơn tạm
  const handleRestoreOrder = (held) => {
    if (cart.length > 0 && !window.confirm('Giỏ hàng hiện tại đang có món. Bạn có muốn ghi đè bằng đơn tạm này?')) {
      return;
    }
    setCart(held.cart);
    setHeldOrders(heldOrders.filter((o) => o.id !== held.id));
    setIsHeldModalOpen(false);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = 0;
  const grandTotal = subtotal - discount;
  const customerPaid = grandTotal;
  const changeAmount = 0;
  const receiptQrValue = completedOrder
    ? [
        settings.OWNER_QR_CONTENT || `BANK:${settings.BANK_NAME || 'CHUA_CAU_HINH'}`,
        `ACCOUNT:${settings.BANK_ACCOUNT || 'CHUA_CAU_HINH'}`,
        `NAME:${settings.BANK_ACCOUNT_NAME || settings.STORE_NAME}`,
        `AMOUNT:${completedOrder.grandTotal}`,
        `NOTE:${completedOrder.code}`,
      ].join('|')
    : '';
  const totalItemQuantity = completedOrder
    ? completedOrder.cart.reduce((total, item) => total + item.quantity, 0)
    : 0;

  const updateReviewItem = (productUnitId, field, value) => {
    setCompletedOrder((order) => {
      const nextCart = order.cart.map((item) => (
        item.productUnitId === productUnitId
          ? {
              ...item,
              [field]: field === 'quantity'
                ? Math.min(item.stock ?? Number.MAX_SAFE_INTEGER, Math.max(1, Number(value) || 0))
                : Math.max(0, Number(value) || 0),
            }
          : item
      ));
      const nextSubtotal = nextCart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const nextDiscount = Math.min(order.discount, nextSubtotal);
      return {
        ...order,
        cart: nextCart,
        subtotal: nextSubtotal,
        discount: nextDiscount,
        grandTotal: nextSubtotal - nextDiscount,
      };
    });
  };

  const updateReviewDiscount = (value) => {
    setCompletedOrder((order) => {
      const discount = Math.min(order.subtotal, Math.max(0, Number(value) || 0));
      return { ...order, discount, grandTotal: order.subtotal - discount };
    });
  };

  const handlePrintBill = () => {
    const receiptArea = document.querySelector('.receipt-print-area');
    if (!receiptArea) return;

    const printWindow = window.open('', '_blank', 'width=520,height=760');
    if (!printWindow) {
      alert('Trình duyệt đã chặn cửa sổ in. Vui lòng cho phép popup để in bill.');
      return;
    }

    const pageWidth = printMode === 'A4' ? '190mm' : '80mm';
    const receiptMarkup = receiptArea.outerHTML;
    const pageSize = printMode === 'A4' ? 'A4' : '80mm 500mm';
    const printStyles = `
      @page { size: ${pageSize}; margin: 0; }
      html, body { margin: 0; padding: 0; background: #fff; }
      body { width: ${pageWidth}; }
      .receipt-print-area { box-sizing: border-box !important; width: ${pageWidth} !important; max-width: ${pageWidth} !important; margin: 0 !important; padding: ${printMode === 'A4' ? '15mm' : '6mm'} !important; box-shadow: none !important; border: 0 !important; page-break-inside: avoid !important; break-inside: avoid !important; }
      .receipt-print-copy { page-break-before: always; }
    `;

    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html><head>${document.head.innerHTML}<style>${printStyles}</style></head><body>`);
    for (let copyIndex = 0; copyIndex < printCopies; copyIndex += 1) {
      printWindow.document.write(receiptMarkup);
      if (copyIndex < printCopies - 1) printWindow.document.write('<div class="receipt-print-copy"></div>');
    }
    printWindow.document.write('</body></html>');
    printWindow.document.title = `HoaDon-${completedOrder.code}`;
    printWindow.document.close();
    printWindow.onload = () => {
      if (printMode !== 'A4') {
        const printReceipt = printWindow.document.querySelector('.receipt-print-area');
        const contentHeight = Math.ceil(printReceipt.getBoundingClientRect().height * 25.4 / 96) + 2;
        const printSizeStyle = printWindow.document.createElement('style');
        printSizeStyle.textContent = `@page { size: 80mm ${contentHeight}mm; margin: 0; }`;
        printWindow.document.head.appendChild(printSizeStyle);
      }
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };
  };

  const handleProceedToPrint = async () => {
    if (!completedOrder) return;

    setIsProcessing(true);
    try {
      const response = await apiClient.post('/pos/checkout', {
        cartItems: completedOrder.cart,
        subtotalAmount: completedOrder.subtotal,
        discountAmount: completedOrder.discount,
        grandTotal: completedOrder.grandTotal,
        paidAmount: completedOrder.grandTotal,
        changeAmount: 0,
        debtAmount: 0,
        paymentMethod: completedOrder.paymentMethod,
      });

      setCompletedOrder((order) => ({ ...order, code: response.data?.orderCode || order.code }));

      // Cập nhật trừ tồn kho local để đồng bộ tức thì trên giao diện
      try {
        const savedProducts = localStorage.getItem('product_catalog');
        if (savedProducts) {
          const parsed = JSON.parse(savedProducts);
          const updatedCatalog = parsed.map((prod) => {
            const soldItem = completedOrder.cart.find((c) => (c.productId || c.product_id) === prod.id);
            if (soldItem && Number.isFinite(Number(prod.stock))) {
              const baseQty = soldItem.quantity * (soldItem.conversionRate || 1);
              return { ...prod, stock: Math.max(0, Number(prod.stock) - baseQty) };
            }
            return prod;
          });
          localStorage.setItem('product_catalog', JSON.stringify(updatedCatalog));
        }

        setProducts((prev) =>
          prev.map((prod) => {
            const soldItem = completedOrder.cart.find((c) => (c.productId || c.product_id) === prod.id);
            if (soldItem && Number.isFinite(Number(prod.stock))) {
              const baseQty = soldItem.quantity * (soldItem.conversionRate || 1);
              return { ...prod, stock: Math.max(0, Number(prod.stock) - baseQty) };
            }
            return prod;
          })
        );
      } catch (e) {
        console.error('Không thể cập nhật tồn kho local:', e);
      }
    } catch (error) {
      console.error('Không thể lưu hóa đơn:', error);
      alert('Không thể lưu hóa đơn. Vui lòng kiểm tra kết nối rồi thử lại. Giỏ hàng vẫn được giữ nguyên.');
      setIsProcessing(false);
      return;
    }

    setReceiptStage('PRINT');
    setCart([]);
    setIsProcessing(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Giỏ hàng đang trống!');
      return;
    }

    const outOfStockItem = cart.find((item) => item.stock !== null && item.quantity > item.stock);
    if (outOfStockItem) {
      alert(`Sản phẩm "${outOfStockItem.name}" vượt quá tồn kho (${outOfStockItem.stock} ${outOfStockItem.unitName}).`);
      return;
    }

    setCompletedOrder({
      code: 'HD-' + Math.floor(100000 + Math.random() * 900000),
      soldAt: new Date().toISOString(),
      subtotal,
      discount,
      grandTotal,
      paidAmount: grandTotal,
      changeAmount: 0,
      paymentMethod,
      cart: [...cart],
    });
    setReceiptStage('REVIEW');
  };

  return (
    <div className="w-full max-w-full h-full flex flex-row gap-3 overflow-hidden">
      {/* 1. KHU VỰC TRÁI: QUÉT MÃ VẠCH & GRID CHỌN SẢN PHẨM CÓ ẢNH */}
      <div className="flex-1 min-w-0 flex flex-col gap-2.5 overflow-hidden">
        {/* Thanh Nhập Mã Vạch */}
        <div className="soft-card p-3 flex flex-col sm:flex-row gap-2.5 items-center shrink-0">
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

        {/* Thanh Chọn Danh Mục Ngành Hàng (Category Filter Tabs) */}
        <div className="w-full min-w-0 flex items-center gap-1.5 overflow-x-auto pb-1 px-0.5 no-scrollbar shrink-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <span>Tất cả ({products.length})</span>
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => {
              const pCat = (p.category || p.category_name || '').toLowerCase();
              const cName = cat.name.toLowerCase();
              return pCat.includes(cName) || cName.includes(pCat);
            }).length;

            return (
              <button
                key={cat.id || cat.code || cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.name
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <span>{cat.name}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.name
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Grid Chọn Nhanh Sản Phẩm Có Hình Ảnh */}
        <div className="flex-1 overflow-y-auto soft-card p-3">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {selectedCategory === 'ALL' ? 'Tất cả sản phẩm' : `Ngành hàng: ${selectedCategory}`} ({
                products.filter((prod) => {
                  if (selectedCategory === 'ALL') return true;
                  const prodCat = (prod.category || prod.category_name || '').toLowerCase();
                  const selCat = selectedCategory.toLowerCase();
                  return prodCat.includes(selCat) || selCat.includes(prodCat);
                }).length
              })
            </h2>
            {selectedCategory !== 'ALL' && (
              <button
                onClick={() => setSelectedCategory('ALL')}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                Xem tất cả
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5">
            {products
              .filter((prod) => {
                if (selectedCategory === 'ALL') return true;
                const prodCat = (prod.category || prod.category_name || '').toLowerCase();
                const selCat = selectedCategory.toLowerCase();
                return prodCat.includes(selCat) || selCat.includes(prodCat);
              })
              .map((prod) => (
                <div
                  key={prod.id}
                  onClick={() =>
                    addToCartFromScan({
                      product_id: prod.id,
                      product_unit_id: prod.id,
                      product_name: prod.name,
                      image: prod.image,
                      unit_name: prod.base_unit_name || 'Lon',
                      conversion_rate: 1,
                      retail_price: prod.retail_price,
                      cost_price: prod.cost_price,
                      stock: prod.stock,
                    })
                  }
                  className="p-2.5 bg-white hover:bg-blue-50/30 border border-slate-200 hover:border-blue-400 rounded-2xl text-left transition flex flex-col justify-between shadow-sm hover:shadow-md group relative cursor-pointer active:scale-[0.99]"
                >
                  {/* Ảnh Thumbnail Sản Phẩm - object-contain giữ 100% trọn vẹn sản phẩm không bị cắt xén */}
                  <div className="w-full h-28 sm:h-32 rounded-xl overflow-hidden bg-slate-50/80 mb-2 flex items-center justify-center border border-slate-100 p-1.5 relative group">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition duration-200"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-slate-300" />
                    )}

                    {/* Badge Tồn Kho */}
                    {prod.stock !== null && (
                      <span className={`absolute top-1.5 left-1.5 text-[9.5px] font-black px-1.5 py-0.5 rounded-md backdrop-blur-sm border shadow-xs ${
                        prod.stock > 10
                          ? 'bg-emerald-500/90 text-white border-emerald-400'
                          : prod.stock > 0
                          ? 'bg-amber-500/90 text-white border-amber-400'
                          : 'bg-rose-500/90 text-white border-rose-400'
                      }`}>
                        {prod.stock > 0 ? `Tồn: ${prod.stock}` : 'Hết hàng'}
                      </span>
                    )}

                    {/* Nút THÊM VÀO GIỎ 3D Nổi Bật */}
                    <div className="absolute bottom-1.5 right-1.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white px-2.5 py-1 rounded-xl shadow-md shadow-blue-500/30 group-hover:scale-105 transition active:scale-90 flex items-center gap-1 font-black text-xs">
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Thêm</span>
                    </div>
                  </div>

                  <div className="space-y-1 w-full pt-0.5">
                    <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight min-h-[2rem]">
                      {prod.name}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-xs font-black text-blue-600">
                        {prod.retail_price.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {prod.base_unit_name || 'Lon'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* 2. KHU VỰC PHẢI: GIỎ HÀNG POS & THANH TOÁN */}
      <div className="w-72 sm:w-80 lg:w-[330px] xl:w-[360px] 2xl:w-[380px] shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between p-3.5 h-full overflow-hidden">
        {/* Header Giỏ Hàng + Nút Giữ Đơn */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
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

        {/* Danh Sách Món Trong Giỏ Kèm Ảnh Thu Nhỏ */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-slate-100 space-y-1.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-8">
              <ShoppingCart className="w-12 h-12 stroke-1" />
              <p className="text-xs font-medium">Giỏ hàng đang trống</p>
              <span className="text-[10px] text-slate-400">Quét mã vạch hoặc bấm chọn sản phẩm</span>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productUnitId} className="pt-2 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="font-bold text-slate-800 truncate">{item.name}</p>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {item.unitPrice.toLocaleString('vi-VN')} đ / {item.unitName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center border border-white/90 rounded-xl overflow-hidden bg-white/70 backdrop-blur-md shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.productUnitId, -1)}
                      className="p-1.5 hover:bg-white text-slate-700 active:scale-90 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-black text-slate-800 text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productUnitId, 1)}
                      className="p-1.5 hover:bg-white text-slate-700 active:scale-90 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productUnitId)}
                    className="btn-3d-icon-delete"
                    title="Xóa khỏi giỏ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tổng Tiền & Nút Thanh Toán */}
        <div className="border-t border-slate-100 pt-3 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Tạm tính:</span>
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
              onClick={() => {
                setPaymentMethod('CASH');
              }}
              className={`py-2.5 px-3 rounded-full font-bold flex items-center justify-center gap-1.5 transition ${
                paymentMethod === 'CASH'
                  ? 'pos-payment-active'
                  : 'btn-3d-secondary'
              }`}
            >
              <Banknote className="w-4 h-4" /> Tiền Mặt
            </button>
            <button
              onClick={() => {
                setPaymentMethod('BANK_TRANSFER');
              }}
              className={`py-2.5 px-3 rounded-full font-bold flex items-center justify-center gap-1.5 transition ${
                paymentMethod === 'BANK_TRANSFER'
                  ? 'pos-payment-active'
                  : 'btn-3d-secondary'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Chuyển Khoản QR
            </button>
          </div>

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
        <div className="receipt-modal-backdrop fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="receipt-modal-card max-w-4xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto overscroll-contain animate-scaleUp">
            {receiptStage === 'REVIEW' ? (
              <div className="receipt-review-screen soft-card p-5 sm:p-7 space-y-5">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-widest text-amber-600">Bước 1 / 2</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Kiểm tra lại sản phẩm</h3>
                  <p className="text-sm text-slate-500 mt-2">Xác nhận tên hàng, đơn giá và số lượng trước khi chuyển sang màn hình in bill.</p>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-3 bg-slate-50 px-4 py-3 text-xs font-extrabold text-slate-600">
                    <span>Sản phẩm</span><span>Đơn giá</span><span>Số lượng</span><span>Thành tiền</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {completedOrder.cart.map((item) => (
                      <div key={item.productUnitId} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-3 px-4 py-3 text-sm items-center">
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-800 break-words">{item.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.unitName}</p>
                          </div>
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(event) => updateReviewItem(item.productUnitId, 'unitPrice', event.target.value)}
                          className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-right text-xs font-bold text-slate-700 outline-none focus:border-sky-400"
                          aria-label={`Đơn giá ${item.name}`}
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => updateReviewItem(item.productUnitId, 'quantity', event.target.value)}
                          className="w-16 rounded-lg border border-sky-100 bg-sky-50 px-2 py-1.5 text-center text-xs font-black text-sky-700 outline-none focus:border-sky-400"
                          aria-label={`Số lượng ${item.name}`}
                        />
                        <strong className="text-right whitespace-nowrap text-slate-800">{(item.unitPrice * item.quantity).toLocaleString('vi-VN')} đ</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-sky-50/70 border border-sky-100 p-3"><span className="block text-xs text-slate-500">Số loại hàng</span><strong className="block text-lg text-slate-900 mt-1">{completedOrder.cart.length}</strong></div>
                  <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-3"><span className="block text-xs text-slate-500">Tổng số lượng</span><strong className="block text-lg text-slate-900 mt-1">{totalItemQuantity}</strong></div>
                  <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-3"><span className="block text-xs text-slate-500">Tổng thanh toán</span><strong className="block text-lg text-emerald-700 mt-1">{completedOrder.grandTotal.toLocaleString('vi-VN')} đ</strong></div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">Khuyến mãi / chiết khấu</p>
                    <p className="text-[11px] text-slate-500 mt-1">Nhập số tiền giảm trước khi lưu hóa đơn.</p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={completedOrder.subtotal}
                    value={completedOrder.discount}
                    onChange={(event) => updateReviewDiscount(event.target.value)}
                    className="w-full sm:w-36 rounded-lg border border-amber-200 bg-white px-3 py-2 text-right text-sm font-black text-amber-700 outline-none focus:border-amber-400"
                    aria-label="Khuyến mãi hoặc chiết khấu"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
                  <Button variant="3d-secondary" onClick={() => setCompletedOrder(null)}>Hủy và quay lại bán hàng</Button>
                  <Button variant="3d-solid" isLoading={isProcessing} onClick={handleProceedToPrint}>Đúng rồi, sang màn hình in bill</Button>
                </div>
              </div>
            ) : (
            <div className="receipt-modal-layout grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-4 items-start">
            <div className={`receipt-print-area receipt-paper receipt-print-area--${printMode === 'A4' ? 'a4' : 'thermal'} bg-white p-5 space-y-3`}>
              <div className="text-center space-y-0.5">
                <img src={brandLogo} alt={settings.STORE_NAME} className="w-28 h-28 mx-auto object-contain mb-1 grayscale" />
                <h3 className="text-xl font-black text-slate-900 uppercase">{settings.STORE_NAME}</h3>
                {settings.STORE_ADDRESS && <p className="text-[10px] text-slate-600">{settings.STORE_ADDRESS}</p>}
                {settings.STORE_PHONE && <p className="text-[10px] text-slate-600">ĐT: {settings.STORE_PHONE}</p>}
                <div className="border-t border-dashed border-slate-400 my-2" />
                <p className="text-sm font-black text-slate-900 uppercase">Hóa đơn tính tiền</p>
                <p className="text-[10px] text-slate-500">Mã HĐ: {completedOrder.code}</p>
                <p className="text-[10px] text-slate-500">Ngày: {new Date(completedOrder.soldAt).toLocaleString('vi-VN')}</p>
                <p className="text-[10px] text-slate-500">Người bán: {cashier?.fullName || user?.fullName || user?.name || 'Nhân viên bán hàng'}</p>
              </div>

              <div className="receipt-items border-y border-dashed border-slate-400 py-2">
                <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-1 text-[9px] font-black uppercase border-b border-slate-300 pb-1">
                  <span>Tên hàng</span><span>Đ.Giá</span><span>SL</span><span>T.Tiền</span>
                </div>
                {completedOrder.cart.map((item) => (
                  <div key={item.productUnitId} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-1 text-[10px] py-1 items-start">
                    <span className="pr-1 break-words">{item.name}</span>
                    <span className="text-right whitespace-nowrap">{item.unitPrice.toLocaleString('vi-VN')}</span>
                    <span className="text-center whitespace-nowrap">x{item.quantity}</span>
                    <span className="text-right whitespace-nowrap">{(item.unitPrice * item.quantity).toLocaleString('vi-VN')}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between"><span>Tổng tiền hàng:</span><strong>{completedOrder.subtotal.toLocaleString('vi-VN')} đ</strong></div>
                <div className="flex justify-between"><span>Chiết khấu:</span><span>{completedOrder.discount.toLocaleString('vi-VN')} đ</span></div>
                <div className="flex justify-between text-sm font-black border-t border-slate-300 pt-1"><span>Tổng cộng:</span><span>{completedOrder.grandTotal.toLocaleString('vi-VN')} đ</span></div>
              </div>

              <div className="flex flex-col items-center gap-1 border-t border-dashed border-slate-400 pt-3">
                {settings.OWNER_QR_IMAGE ? (
                  <img src={settings.OWNER_QR_IMAGE} alt="QR thanh toán của cửa hàng" className="receipt-qr w-[132px] h-[132px] object-contain bg-white" />
                ) : (
                  <QRCodeSVG className="receipt-qr" value={receiptQrValue} size={132} bgColor="#ffffff" fgColor="#111827" level="M" />
                )}
                <p className="text-[10px] font-bold text-center">Quét mã QR để thanh toán</p>
                {settings.BANK_NAME && <p className="text-[10px] text-center text-slate-600">Ngân hàng: {settings.BANK_NAME}</p>}
                {settings.BANK_ACCOUNT && <p className="text-[10px] text-center font-mono text-slate-600">STK: {settings.BANK_ACCOUNT}</p>}
                {settings.BANK_ACCOUNT_NAME && <p className="text-[10px] text-center text-slate-600">Chủ TK: {settings.BANK_ACCOUNT_NAME}</p>}
                <p className="text-[10px] text-center text-slate-600">Nội dung CK: {completedOrder.code}</p>
                <p className="text-[10px] text-center text-slate-500">Phương thức: {paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản QR'}</p>
              </div>

              <div className="text-center text-[10px] text-slate-500 leading-4">
                <p>{settings.INVOICE_FOOTER || 'Cảm ơn quý khách và hẹn gặp lại!'}</p>
              </div>
            </div>

            <div className="receipt-confirm-panel soft-card p-5 space-y-5">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-sky-600">Bước cuối</p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Xác nhận in bill</h3>
                <p className="text-xs text-slate-500 mt-2 leading-5">Kiểm tra bản xem trước bên trái, chọn khổ giấy phù hợp với máy in rồi bấm in.</p>
              </div>

              <div className="rounded-2xl bg-slate-50/80 border border-slate-200 p-3 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Mã hóa đơn</span><strong>{completedOrder.code}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Số mặt hàng</span><strong>{completedOrder.cart.length} loại / {totalItemQuantity} sản phẩm</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Tổng thanh toán</span><strong className="text-sky-700">{completedOrder.grandTotal.toLocaleString('vi-VN')} đ</strong></div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3">
                <p className="text-xs font-extrabold text-slate-800">Kiểm tra số lượng hàng</p>
                <div className="mt-2 space-y-1">
                  {completedOrder.cart.map((item) => (
                    <div key={item.productUnitId} className="flex justify-between gap-3 text-[11px] text-slate-600">
                      <span className="truncate">{item.name}</span>
                      <strong className="shrink-0">x{item.quantity}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-extrabold text-slate-700 mb-2">Chọn chế độ in</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setPrintMode('THERMAL_80')} className={`rounded-xl border p-3 text-left transition ${printMode === 'THERMAL_80' ? 'border-sky-400 bg-sky-50 text-sky-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600'}`}>
                    <span className="block text-sm font-extrabold">Khổ nhiệt 80mm</span>
                    <span className="block text-[10px] mt-1">Máy in bill quầy</span>
                  </button>
                  <button type="button" onClick={() => setPrintMode('A4')} className={`rounded-xl border p-3 text-left transition ${printMode === 'A4' ? 'border-sky-400 bg-sky-50 text-sky-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600'}`}>
                    <span className="block text-sm font-extrabold">Khổ A4</span>
                    <span className="block text-[10px] mt-1">Máy in văn phòng</span>
                  </button>
                </div>
              </div>

              <label className="block text-xs font-extrabold text-slate-700">
                Số lượng bill cần in
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="1"
                    value={printCopies}
                    onChange={(event) => setPrintCopies(Math.min(10, Math.max(1, Number(event.target.value) || 1)))}
                    className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-black text-slate-800 outline-none focus:border-sky-400"
                  />
                  <span className="text-[11px] font-medium text-slate-500">bản bill giống nhau</span>
                </div>
              </label>

              <div className="receipt-actions flex flex-col gap-2">
                <Button
                  variant="3d-solid"
                  icon={Printer}
                  className="w-full"
                  onClick={handlePrintBill}
                >
                  In Trực Tiếp Bill
                </Button>
                <Button variant="3d-secondary" className="w-full" onClick={() => setCompletedOrder(null)}>
                  Quay lại bán hàng
                </Button>
              </div>
            </div>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
