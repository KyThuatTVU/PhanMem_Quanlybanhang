import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import {
  Printer,
  Barcode,
  Coins,
  Cpu,
  CheckCircle2,
  RefreshCw,
  Power,
  Settings,
  Sliders,
  Send
} from 'lucide-react';

export const DevicePage = () => {
  const [testingDevice, setTestingDevice] = useState(null);
  const [testResult, setTestResult] = useState('');

  const [receiptPrinter, setReceiptPrinter] = useState({
    name: 'Xprinter XP-Q800 (Khổ 80mm)',
    type: 'K80 (Thermal)',
    connection: 'LAN / Ethernet',
    ipAddress: '192.168.1.200',
    port: '9100',
    autoCut: true,
    status: 'CONNECTED',
  });

  const [barcodePrinter, setBarcodePrinter] = useState({
    name: 'Xprinter XP-350B (Máy in tem mã vạch)',
    type: 'Direct Thermal',
    connection: 'USB Port',
    paperSize: '35x22mm (2 tem)',
    density: '203 DPI',
    status: 'CONNECTED',
  });

  const [barcodeScanner, setBarcodeScanner] = useState({
    name: 'Honeywell Youjie HF600 (Máy quét đa tia)',
    type: '2D / 1D Image Scanner',
    connection: 'USB HID Keyboard',
    triggerMode: 'Tự động cảm ứng (Auto-sense)',
    suffix: 'Enter (CR+LF)',
    status: 'CONNECTED',
  });

  const [cashDrawer, setCashDrawer] = useState({
    name: 'Két Thu Ngân Maken MK-410',
    connection: 'RJ11 (Qua cổng máy in Bill)',
    autoOpenOnPayment: true,
    pulseTime: '50ms',
    status: 'READY',
  });

  const handleTestPrint = (deviceName) => {
    setTestingDevice(deviceName);
    setTestResult('Đang gửi tín hiệu kiểm tra thiết bị...');
    setTimeout(() => {
      setTestingDevice(null);
      setTestResult(`Đã gửi lệnh thành công tới [${deviceName}]! Thiết bị phản hồi tín hiệu OK.`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-600" />
            Cấu Hình Thiết Bị & Phần Cứng Bán Hàng
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Quản lý và kiểm tra kết nối Máy in bill K80, Máy in tem mã vạch, Máy quét barcode và Két đựng tiền
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="3d-secondary"
            icon={RefreshCw}
            onClick={() => handleTestPrint('Toàn bộ thiết bị')}
          >
            Quét Lại Thiết Bị
          </Button>
        </div>
      </div>

      {testResult && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{testResult}</span>
          </div>
          <button
            onClick={() => setTestResult('')}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Đóng
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Máy in hóa đơn */}
        <div className="soft-card p-5 space-y-4 border-t-4 border-t-blue-600">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Máy In Hóa Đơn (Bill)</h2>
                <span className="text-[11px] text-slate-500">{receiptPrinter.name}</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Khổ in giấy:</span>
              <span className="font-bold text-slate-800">{receiptPrinter.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kiểu kết nối:</span>
              <span className="font-bold text-slate-800">{receiptPrinter.connection}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Địa chỉ IP & Port:</span>
              <span className="font-mono font-bold text-blue-700">
                {receiptPrinter.ipAddress}:{receiptPrinter.port}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tự động cắt giấy:</span>
              <span className="font-bold text-emerald-600">Bật (Auto-cut)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="3d-primary"
              size="sm"
              icon={Send}
              onClick={() => handleTestPrint('Máy in hóa đơn K80')}
              disabled={testingDevice === 'Máy in hóa đơn K80'}
            >
              {testingDevice === 'Máy in hóa đơn K80' ? 'Đang in...' : 'In Hóa Đơn Thử'}
            </Button>
            <Button variant="3d-secondary" size="sm" icon={Settings}>
              Cài Đặt IP
            </Button>
          </div>
        </div>

        {/* Máy in mã vạch */}
        <div className="soft-card p-5 space-y-4 border-t-4 border-t-emerald-600">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Barcode className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Máy In Tem Mã Vạch</h2>
                <span className="text-[11px] text-slate-500">{barcodePrinter.name}</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Công nghệ:</span>
              <span className="font-bold text-slate-800">{barcodePrinter.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cổng cắm:</span>
              <span className="font-bold text-slate-800">{barcodePrinter.connection}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kích thước tem:</span>
              <span className="font-bold text-slate-800">{barcodePrinter.paperSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Độ phân giải:</span>
              <span className="font-bold text-slate-800">{barcodePrinter.density}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="3d-primary"
              size="sm"
              icon={Send}
              onClick={() => handleTestPrint('Máy in mã vạch')}
              disabled={testingDevice === 'Máy in mã vạch'}
            >
              {testingDevice === 'Máy in mã vạch' ? 'Đang in...' : 'In Tem Nhãn Thử'}
            </Button>
            <Button variant="3d-secondary" size="sm" icon={Sliders}>
              Cân Chỉnh Lề
            </Button>
          </div>
        </div>

        {/* Máy quét mã vạch */}
        <div className="soft-card p-5 space-y-4 border-t-4 border-t-amber-500">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Barcode className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Máy Quét Barcode</h2>
                <span className="text-[11px] text-slate-500">{barcodeScanner.name}</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Chuẩn hỗ trợ:</span>
              <span className="font-bold text-slate-800">{barcodeScanner.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Giao tiếp:</span>
              <span className="font-bold text-slate-800">{barcodeScanner.connection}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Chế độ kích hoạt:</span>
              <span className="font-bold text-slate-800">{barcodeScanner.triggerMode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Hậu tố sau quét:</span>
              <span className="font-mono font-bold text-blue-700">{barcodeScanner.suffix}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              placeholder="Nhấp vào đây và quét thử mã vạch..."
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Két đựng tiền */}
        <div className="soft-card p-5 space-y-4 border-t-4 border-t-indigo-600">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Két Đựng Tiền Thu Ngân</h2>
                <span className="text-[11px] text-slate-500">{cashDrawer.name}</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Cổng cắm:</span>
              <span className="font-bold text-slate-800">{cashDrawer.connection}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tự bật két khi in hóa đơn:</span>
              <span className="font-bold text-emerald-600">Đã kích hoạt</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Thời gian kích xung điện:</span>
              <span className="font-bold text-slate-800">{cashDrawer.pulseTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ngăn chứa:</span>
              <span className="font-bold text-slate-800">4 ngăn tiền giấy + 5 ngăn tiền xu</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="3d-primary"
              size="sm"
              icon={Power}
              onClick={() => handleTestPrint('Két tiền thu ngân')}
              disabled={testingDevice === 'Két tiền thu ngân'}
            >
              {testingDevice === 'Két tiền thu ngân' ? 'Đang bật...' : 'Bật Két Thử (Kick Drawer)'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
