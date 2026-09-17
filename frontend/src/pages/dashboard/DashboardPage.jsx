import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  DollarSign,
  Clock,
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import brandLogo from '../../assets/images/logo.png';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState('7_DAYS'); // 'TODAY', '7_DAYS', 'THIS_MONTH'

  // Dữ liệu biểu đồ doanh thu & lợi nhuận
  const revenueTrendData = [
    { day: 'T2 (10/09)', doanhThu: 4200000, loiNhuan: 1250000, donHang: 24 },
    { day: 'T3 (11/09)', doanhThu: 5100000, loiNhuan: 1480000, donHang: 31 },
    { day: 'T4 (12/09)', doanhThu: 3900000, loiNhuan: 1100000, donHang: 22 },
    { day: 'T5 (13/09)', doanhThu: 6200000, loiNhuan: 1850000, donHang: 36 },
    { day: 'T6 (14/09)', doanhThu: 7500000, loiNhuan: 2200000, donHang: 45 },
    { day: 'T7 (15/09)', doanhThu: 9800000, loiNhuan: 2950000, donHang: 58 },
    { day: 'CN (16/09)', doanhThu: 8450000, loiNhuan: 2510000, donHang: 42 },
  ];

  // Cơ cấu doanh thu theo ngành hàng (Donut Chart)
  const categoryShareData = [
    { name: 'Nước giải khát', value: 38, color: '#0284C7' },   // Sky 600
    { name: 'Bánh kẹo & Snack', value: 24, color: '#0EA5E9' }, // Sky 500
    { name: 'Mì & Ăn liền', value: 18, color: '#38BDF8' },     // Sky 400
    { name: 'Sữa & Bơ sữa', value: 12, color: '#10B981' },     // Emerald
    { name: 'Gia vị & Khác', value: 8, color: '#6366F1' },      // Indigo
  ];

  // Top 5 sản phẩm bán chạy nhất
  const topProductsData = [
    { name: 'Coca-Cola 330ml', soLuong: 145, doanhThu: 1450000 },
    { name: 'Mì Hảo Hảo Tôm Cay', soLuong: 210, doanhThu: 945000 },
    { name: 'Sữa tươi Vinamilk 180ml', soLuong: 95, doanhThu: 855000 },
    { name: 'Snack khoai tây Ostar', soLuong: 80, doanhThu: 1120000 },
    { name: 'Dầu ăn Simply 1L', soLuong: 28, doanhThu: 1820000 },
  ];

  // Giao dịch quầy thu ngân gần đây
  const recentOrders = [
    { id: 'HD-8921', time: '14:25', customer: 'Khách lẻ', items: 3, total: 45000, method: 'Tiền mặt', status: 'Hoàn tất' },
    { id: 'HD-8920', time: '14:18', customer: 'Nguyễn Văn Minh (VIP)', items: 8, total: 240000, method: 'VietQR', status: 'Hoàn tất' },
    { id: 'HD-8919', time: '14:05', customer: 'Chị Lan (Tạp hóa hẻm)', items: 2, total: 460000, method: 'Ghi nợ', status: 'Ghi sổ nợ' },
    { id: 'HD-8918', time: '13:52', customer: 'Khách lẻ', items: 1, total: 10000, method: 'Tiền mặt', status: 'Hoàn tất' },
  ];

  const stockAlertData = [
    { name: 'Mì Hảo Hảo', tonKho: 18, nguongNhap: 50 },
    { name: 'Snack Ostar', tonKho: 6, nguongNhap: 20 },
    { name: 'Coca-Cola', tonKho: 24, nguongNhap: 40 },
    { name: 'Sữa Vinamilk', tonKho: 31, nguongNhap: 45 },
  ];

  const debtBalanceData = [
    { name: 'Khách hàng nợ', giaTri: 1450000, color: '#F43F5E' },
    { name: 'Nợ nhà cung cấp', giaTri: 2100000, color: '#0284C7' },
  ];

  // Custom Tooltip sang trọng cho Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 text-xs space-y-1.5 min-w-[170px]">
          <p className="font-extrabold text-slate-900 border-b border-slate-100 pb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-sky-600" /> {label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-extrabold text-slate-900">
                {Number(entry.value).toLocaleString('vi-VN')} đ
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. BANNER HÌNH ẢNH CỬA HÀNG TẠP HÓA AN KHANG (FULL GÓC ẢNH) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Thống Kê Cửa Hàng
            </h1>
            <p className="text-xs font-bold text-slate-500">
              Theo dõi doanh thu, tồn kho, công nợ và hiệu quả kinh doanh theo thời gian.
            </p>
          </div>
          <Link to="/pos" className="self-start sm:self-auto">
            <Button variant="3d-solid" icon={ShoppingCart} size="md">
              Vào Bán Hàng POS (F9)
            </Button>
          </Link>
        </div>

      </div>

      {/* 2. BỘ 4 THẺ CHỈ SỐ KPI CHÍNH */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Doanh thu hôm nay */}
        <div className="soft-card dashboard-glass-card p-5 border border-sky-100/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Doanh Thu Hôm Nay</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">8.450.000 đ</p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4%</span>
            <span className="text-slate-400 font-normal">so với hôm qua</span>
          </div>
        </div>

        {/* Số đơn hoàn tất */}
        <div className="soft-card dashboard-glass-card p-5 border border-sky-100/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Hóa Đơn Bán Ra</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">42 đơn</p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-2">
            <span>TB:</span>
            <strong className="text-slate-700">201.000 đ</strong>
            <span>/ hóa đơn</span>
          </div>
        </div>

        {/* Lợi nhuận gộp */}
        <div className="soft-card dashboard-glass-card p-5 border border-emerald-100/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Lợi Nhuận Gộp</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 tracking-tight">2.510.000 đ</p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-2">
            <span>Biên lãi gộp:</span>
            <span className="px-1.5 py-0.5 bg-emerald-50 rounded">29.7%</span>
          </div>
        </div>

        {/* Giá trị tồn kho */}
        <div className="soft-card dashboard-glass-card p-5 border border-indigo-100/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Giá Trị Tồn Kho</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-900 tracking-tight">68.420.000 đ</p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-2">
            <span>Đang quản lý:</span>
            <strong className="text-indigo-700 font-bold">345 mặt hàng</strong>
          </div>
        </div>
      </div>

      {/* 3. KHU VỰC BIỂU ĐỒ CHÍNH (DOANH THU & CƠ CẤU NGÀNH HÀNG) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ AreaChart: Xu hướng Doanh Thu & Lợi Nhuận 7 Ngày */}
        <div className="soft-card dashboard-glass-card p-6 lg:col-span-2 space-y-4 border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-600" />
                Xu Hướng Doanh Thu & Lợi Nhuận Thực Tế
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Số liệu phân tích dòng tiền bán hàng theo từng ngày trong tuần
              </p>
            </div>

            {/* Filter nút bấm xanh trắng */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {['7_DAYS', 'THIS_MONTH'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTimeRange(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    timeRange === tab
                      ? 'bg-white text-sky-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === '7_DAYS' ? '7 Ngày Qua' : 'Tháng Này'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  {/* Gradient Xanh Sáng Tươi Mới Cho Doanh Thu */}
                  <linearGradient id="skyRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity={0.4} />
                    <stop offset="60%" stopColor="#38BDF8" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>

                  {/* Gradient Xanh Lá Mịn Cho Lợi Nhuận */}
                  <linearGradient id="emeraldProfitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="doanhThu"
                  name="Doanh thu bán"
                  stroke="#0284C7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#skyRevenueGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="loiNhuan"
                  name="Lợi nhuận gộp"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#emeraldProfitGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs">
            <span className="flex items-center gap-2 text-slate-700 font-bold">
              <span className="w-3 h-3 rounded-full bg-[#0284C7]" />
              Doanh Thu Bán Ra
            </span>
            <span className="flex items-center gap-2 text-slate-700 font-bold">
              <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              Lợi Nhuận Gộp
            </span>
          </div>
        </div>

        {/* Biểu đồ Donut: Cơ Cấu Doanh Thu Theo Ngành Hàng */}
        <div className="soft-card dashboard-glass-card p-6 space-y-4 border border-slate-200/80 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-600" />
              Cơ Cấu Ngành Hàng
            </h2>
            <p className="text-xs text-slate-500">Tỷ trọng đóng góp doanh thu</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}%`, name]}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Chữ trung tâm Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-bold text-slate-400">Tổng</span>
              <span className="text-lg font-black text-sky-800">100%</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
            {categoryShareData.map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
                <span className="font-extrabold text-slate-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. TOP SẢN PHẨM BÁN CHẠY & BẢNG GIAO DỊCH QUẦY MỚI NHẤT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ Cột Ngang: Top 5 Sản Phẩm Bán Chạy */}
        <div className="soft-card dashboard-glass-card p-6 space-y-4 border border-slate-200/80">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-sky-600" />
                Top 5 Mặt Hàng Bán Chạy Nhất
              </h2>
              <p className="text-xs text-slate-500">Dẫn đầu về số lượng tiêu thụ trong tuần</p>
            </div>
            <Link to="/reports" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              Xem báo cáo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProductsData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#475569"
                  fontSize={11}
                  width={110}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val) => [`${val} đơn vị`, 'Đã bán']}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                />
                <Bar dataKey="soLuong" fill="#0284C7" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hóa đơn quầy thu ngân mới nhất */}
        <div className="soft-card dashboard-glass-card p-6 space-y-4 border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-600" />
                Giao Dịch Quầy Thu Ngân Gần Đây
              </h2>
              <p className="text-xs text-slate-500">Cập nhật hóa đơn bán hàng theo thời gian thực</p>
            </div>
            <Link to="/orders" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              Tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs flex-1">
            {recentOrders.map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between hover:bg-sky-50/40 px-2 rounded-xl transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sky-700">{ord.id}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{ord.time}</span>
                  </div>
                  <p className="font-bold text-slate-800 mt-0.5">{ord.customer}</p>
                  <span className="text-[10px] text-slate-500">{ord.items} sản phẩm • {ord.method}</span>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{ord.total.toLocaleString('vi-VN')} đ</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      ord.status === 'Hoàn tất'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link to="/pos">
              <Button variant="3d-primary" size="sm" className="w-full">
                Mở Quầy Thu Ngân & Bán Hàng Mới
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. BIỂU ĐỒ TỒN KHO & CÔNG NỢ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="soft-card dashboard-glass-card p-6 border border-amber-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Tồn Kho Cần Bổ Sung
            </h3>
            <Link to="/inventory" className="text-xs font-bold text-sky-600 hover:text-sky-700">Mở kho hàng</Link>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockAlertData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value, name) => [`${value} sản phẩm`, name === 'tonKho' ? 'Tồn hiện tại' : 'Ngưỡng nhập']} />
                <Bar dataKey="nguongNhap" name="Ngưỡng nhập" fill="#FCD34D" radius={[6, 6, 0, 0]} />
                <Bar dataKey="tonKho" name="Tồn hiện tại" fill="#F43F5E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 border-t border-slate-100 pt-3">Các cột đỏ đang thấp hơn mức tồn tối thiểu cần duy trì.</p>
        </div>

        <div className="soft-card dashboard-glass-card p-6 border border-sky-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sky-600" />
              Dòng Tiền Công Nợ
            </h3>
            <Link to="/debts" className="text-xs font-bold text-sky-600 hover:text-sky-700">
              Mở sổ nợ
            </Link>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={debtBalanceData} layout="vertical" margin={{ top: 8, right: 18, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} width={92} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} đ`, 'Giá trị']} />
                <Bar dataKey="giaTri" name="Giá trị công nợ" radius={[0, 7, 7, 0]}>
                  {debtBalanceData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 border-t border-slate-100 pt-3">Theo dõi khoản phải thu và phải trả để chủ động cân đối dòng tiền.</p>
        </div>
      </div>
    </div>
  );
};
