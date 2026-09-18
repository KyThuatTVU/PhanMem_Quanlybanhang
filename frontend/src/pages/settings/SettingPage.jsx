import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { useStoreSettings } from '../../stores/useStoreSettings';
import { Settings, Printer, Shield, Save, CheckCircle2 } from 'lucide-react';

export const SettingPage = () => {
  const [activeTab, setActiveTab] = useState('STORE'); // 'STORE' | 'DEVICES' | 'AUDIT'
  const [settings, setSettings] = useState({
    STORE_NAME: '',
    STORE_PHONE: '',
    STORE_ADDRESS: '',
    INVOICE_FOOTER: '',
    OWNER_QR_IMAGE: '',
  });
  const [devices, setDevices] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setSettings: setStoreSettings } = useStoreSettings();

  useEffect(() => {
    fetchSettings();
  }, [activeTab]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      if (activeTab === 'STORE') {
        const res = await apiClient.get('/settings');
        setSettings(res.data || {});
        setStoreSettings(res.data || {});
      } else if (activeTab === 'DEVICES') {
        const res = await apiClient.get('/settings/devices');
        setDevices(res.data || []);
      } else {
        const res = await apiClient.get('/settings/audit-logs');
        setAuditLogs(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/settings', settings);
      setStoreSettings(settings);
      alert('Lưu cấu hình cửa hàng thành công!');
    } catch (err) {
      alert(err.message || 'Lỗi lưu cấu hình');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Cấu Hình Hệ Thống & Thiết Bị POS
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Thông tin cửa hàng in trên hóa đơn, máy in bill và nhật ký hoạt động
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-200/80 rounded-xl">
          <button
            onClick={() => setActiveTab('STORE')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'STORE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Thông Tin Quán
          </button>
          <button
            onClick={() => setActiveTab('DEVICES')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'DEVICES' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Thiết Bị Phần Cứng
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'AUDIT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Nhật Ký Thao Tác
          </button>
        </div>
      </div>

      {activeTab === 'STORE' && (
        <div className="soft-card max-w-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b pb-2">Thông Tin Xuất Hóa Đơn</h2>
          <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
            <Input
              label="Tên cửa hàng tạp hóa"
              value={settings.STORE_NAME || ''}
              onChange={(e) => setSettings({ ...settings, STORE_NAME: e.target.value })}
            />
            <Input
              label="Hotline cửa hàng"
              value={settings.STORE_PHONE || ''}
              onChange={(e) => setSettings({ ...settings, STORE_PHONE: e.target.value })}
            />
            <Input
              label="Địa chỉ cửa hàng"
              value={settings.STORE_ADDRESS || ''}
              onChange={(e) => setSettings({ ...settings, STORE_ADDRESS: e.target.value })}
            />
            <Input
              label="Lời chào chân trang bill"
              value={settings.INVOICE_FOOTER || ''}
              onChange={(e) => setSettings({ ...settings, INVOICE_FOOTER: e.target.value })}
            />
            <div className="border-t border-slate-200/70 pt-4 mt-4 space-y-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Mã QR nhận thanh toán</h3>
                <p className="text-[11px] text-slate-500 mt-1">Chỉ cần tải lên ảnh QR thẻ ngân hàng của chủ cửa hàng. Ảnh này sẽ được in trên mọi bill.</p>
              </div>
              <ImageUpload
                label="Ảnh QR ngân hàng của chủ cửa hàng"
                monochrome
                value={settings.OWNER_QR_IMAGE || ''}
                onChange={(image) => setSettings({ ...settings, OWNER_QR_IMAGE: image })}
              />
              <Input
                label="Tên ngân hàng hiển thị trên bill (không bắt buộc)"
                placeholder="Ví dụ: Vietcombank"
                value={settings.BANK_NAME || ''}
                onChange={(e) => setSettings({ ...settings, BANK_NAME: e.target.value })}
              />
            </div>
            <Button type="submit" variant="3d-solid" icon={Save} className="mt-2">
              Lưu Cấu Hình
            </Button>
          </form>
        </div>
      )}

      {activeTab === 'DEVICES' && (
        <div className="soft-card p-0 overflow-hidden">
          <div className="p-4 border-b font-bold text-xs flex justify-between items-center">
            <span>Danh Sách Thiết Bị Ngoại Vi</span>
            <Button variant="3d-primary" size="sm" onClick={() => alert('Đang dò tìm thiết bị trong mạng LAN...')}>
              Dò Tìm Máy In
            </Button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4">Tên Thiết Bị</th>
                <th className="p-4">Loại Thiết Bị</th>
                <th className="p-4">Kết Nối</th>
                <th className="p-4">Địa Chỉ IP / Port</th>
                <th className="p-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              <tr className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-900">Máy in Bill Quầy 1</td>
                <td className="p-4">PRINTER (Khổ 80mm)</td>
                <td className="p-4">LAN_TCP</td>
                <td className="p-4 font-mono">192.168.1.200:9100</td>
                <td className="p-4"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full">Sẵn sàng</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-900">Súng Quét Mã Vạch</td>
                <td className="p-4">BARCODE_SCANNER</td>
                <td className="p-4">USB HID</td>
                <td className="p-4 font-mono">COM3</td>
                <td className="p-4"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full">Hoạt động</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'AUDIT' && (
        <div className="soft-card p-0 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4">Thời Gian</th>
                <th className="p-4">Người Thực Hiện</th>
                <th className="p-4">Hành Động</th>
                <th className="p-4">Phân Hệ</th>
                <th className="p-4">Địa Chỉ IP</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {auditLogs.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center">Chưa có nhật ký ghi nhận</td></tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-4">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                    <td className="p-4 font-bold text-slate-900">{log.user_name}</td>
                    <td className="p-4 font-bold text-blue-600">{log.action}</td>
                    <td className="p-4">{log.module}</td>
                    <td className="p-4 font-mono">{log.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
