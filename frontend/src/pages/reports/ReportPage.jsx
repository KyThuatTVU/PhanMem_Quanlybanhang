import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import {
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Package,
  Boxes,
  Users,
  PieChart as PieIcon,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export const ReportPage = () => {
  const [timeFilter, setTimeFilter] = useState('7_DAYS'); // 'TODAY', '7_DAYS', '30_DAYS', 'THIS_MONTH'
  const [activeReportTab, setActiveReportTab] = useState('revenue'); // 'revenue', 'products', 'inventory'

  // Dữ liệu tài chính Doanh thu vs Giá vốn (COGS) vs Lợi nhuận
  const financialData = [
    { name: 'T2 (10/09)', doanhThu: 4200000, giaVon: 2950000, loiNhuan: 1250000 },
    { name: 'T3 (11/09)', doanhThu: 5100000, giaVon: 3620000, loiNhuan: 1480000 },
    { name: 'T4 (12/09)', doanhThu: 3900000, giaVon: 2800000, loiNhuan: 1100000 },
    { name: 'T5 (13/09)', doanhThu: 6200000, giaVon: 4350000, loiNhuan: 1850000 },
    { name: 'T6 (14/09)', doanhThu: 7500000, giaVon: 5300000, loiNhuan: 2200000 },
    { name: 'T7 (15/09)', doanhThu: 9800000, giaVon: 6850000, loiNhuan: 2950000 },
    { name: 'CN (16/09)', doanhThu: 8400000, giaVon: 5900000, loiNhuan: 2500000 },
  ];

  // Sản phẩm bán chạy & bán chậm
  const productPerformance = [
    { name: 'Mì Hảo Hảo Tôm Cay', category: 'Mì gói', soldQty: 210, revenue: 945000, profit: 245000, speed: 'Bán chạy' },
    { name: 'Coca-Cola 330ml', category: 'Nước ngọt', soldQty: 145, revenue: 1450000, profit: 410000, speed: 'Bán chạy' },
    { name: 'Sữa tươi Vinamilk 180ml', category: 'Sữa', soldQty: 95, revenue: 855000, profit: 220000, speed: 'Bán chạy' },
    { name: 'Dầu ăn Simply 1L', category: 'Gia vị', soldQty: 22, revenue: 1430000, profit: 280000, speed: 'Trung bình' },
    { name: 'Bột giặt OMO 800g', category: 'Hóa mỹ phẩm', soldQty: 4, revenue: 180000, profit: 28000, speed: 'Bán chậm' },
    { name: 'Nước xả Comfort túi 500ml', category: 'Hóa mỹ phẩm', soldQty: 2, revenue: 84000, profit: 12000, speed: 'Bán chậm' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Báo Cáo Doanh Thu, Lợi Nhuận & Tồn Kho
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Phân tích số liệu kinh doanh, giá vốn COGS, mặt hàng bán chạy và tốc độ quay vòng vốn
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="3d-secondary"
            icon={Download}
            onClick={() => alert('Đang xuất Báo Cáo Doanh Thu ra định dạng PDF...')}
          >
            Xuất PDF
          </Button>
          <Button
            variant="3d-solid"
            icon={FileSpreadsheet}
            onClick={() => alert('Đang xuất Báo Cáo Doanh Thu ra file Excel .xlsx...')}
          >
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* 2. Bộ Lọc Thời Gian */}
      <div className="soft-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['TODAY', '7_DAYS', '30_DAYS', 'THIS_MONTH'].map((tab) => {
            const labels = {
              TODAY: 'Hôm Nay',
              '7_DAYS': '7 Ngày Qua',
              '30_DAYS': '30 Ngày Qua',
              THIS_MONTH: 'Tháng Này',
            };
            return (
              <button
                key={tab}
                onClick={() => setTimeFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  timeFilter === tab
                    ? 'bg-blue-600 text-white shadow-glass-3d'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Khoảng: 10/09/2026 – 16/09/2026</span>
        </div>
      </div>

      {/* 3. Báo Cáo Tài Chính Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="soft-card p-5 border-t-4 border-t-blue-600">
          <p className="text-[11px] text-slate-500 font-bold uppercase">Tổng Doanh Thu</p>
          <p className="text-2xl font-black text-slate-900 mt-1">45.100.000 đ</p>
          <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-4 h-4" /> +18.4% so với kỳ trước
          </p>
        </div>

        <div className="soft-card p-5 border-t-4 border-t-slate-400">
          <p className="text-[11px] text-slate-500 font-bold uppercase">Tổng Giá Vốn (COGS)</p>
          <p className="text-2xl font-black text-slate-700 mt-1">31.770.000 đ</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Chiếm 70.4% doanh thu</p>
        </div>

        <div className="soft-card p-5 border-t-4 border-t-emerald-500">
          <p className="text-[11px] text-slate-500 font-bold uppercase">Lợi Nhuận Gộp</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">13.330.000 đ</p>
          <p className="text-xs text-emerald-700 font-bold mt-1">Biên lợi nhuận gộp: 29.6%</p>
        </div>
      </div>

      {/* 4. Biểu Đồ So Sánh Doanh Thu vs Giá Vốn vs Lợi Nhuận */}
      <div className="soft-card p-5 space-y-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900">
            Biểu Đồ Đối Soát Doanh Thu & Biên Lợi Nhuận
          </h2>
          <p className="text-xs text-slate-500">
            So sánh trực quan Doanh thu bán ra và Giá vốn nhập hàng theo từng ngày
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickFormatter={(val) => `${val / 1000000}M`}
              />
              <Tooltip
                formatter={(val) => [`${Number(val).toLocaleString('vi-VN')} đ`]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="doanhThu" name="Doanh thu bán" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="giaVon" name="Giá vốn (COGS)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="loiNhuan" name="Lợi nhuận gộp" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Báo Cáo Hiệu Quả Từng Sản Phẩm (Bán Chạy / Bán Chậm) */}
      <div className="soft-card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Phân Tích Sản Phẩm Bán Chạy & Bán Chậm
            </h2>
            <p className="text-xs text-slate-500">
              Giúp quản lý lên kế hoạch nhập thêm hàng hot và xả bớt hàng chậm luân chuyển
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Tên Mặt Hàng</th>
                <th className="p-4">Ngành Hàng</th>
                <th className="p-4 text-right">Số Lượng Bán</th>
                <th className="p-4 text-right">Doanh Thu Thu Được</th>
                <th className="p-4 text-right">Lợi Nhuận Gộp</th>
                <th className="p-4 text-center">Tốc Độ Bán Hàng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productPerformance.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-bold text-slate-900">{item.name}</td>
                  <td className="p-4 text-slate-600">{item.category}</td>
                  <td className="p-4 text-right font-black text-slate-800">{item.soldQty}</td>
                  <td className="p-4 text-right font-bold text-blue-700">
                    {item.revenue.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-4 text-right font-extrabold text-emerald-600">
                    {item.profit.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        item.speed === 'Bán chạy'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.speed === 'Trung bình'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {item.speed}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
