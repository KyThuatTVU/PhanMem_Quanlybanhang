import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const DashboardPage = () => {
  // Mock dữ liệu biểu đồ doanh thu 7 ngày
  const revenueTrendData = [
    { day: 'T2 (10/09)', doanhThu: 4200000, loiNhuan: 1250000 },
    { day: 'T3 (11/09)', doanhThu: 5100000, loiNhuan: 1480000 },
    { day: 'T4 (12/09)', doanhThu: 3900000, loiNhuan: 1100000 },
    { day: 'T5 (13/09)', doanhThu: 6200000, loiNhuan: 1850000 },
    { day: 'T6 (14/09)', doanhThu: 7500000, loiNhuan: 2200000 },
    { day: 'T7 (15/09)', doanhThu: 9800000, loiNhuan: 2950000 },
    { day: 'CN (16/09)', doanhThu: 8400000, loiNhuan: 2500000 },
  ];

  // Top sản phẩm bán chạy
  const topProductsData = [
    { name: 'Coca-Cola 330ml', soLuong: 145 },
    { name: 'Mì Hảo Hảo Tôm Cay', soLuong: 210 },
    { name: 'Sữa tươi Vinamilk', soLuong: 95 },
    { name: 'Snack Ostar Khoai', soLuong: 80 },
    { name: 'Nước Tinh Khiết Aquafina', soLuong: 112 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Tổng Quan Tạp Hóa & Quầy Bán Lẻ
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Cập nhật dòng tiền, doanh số bán hàng, tồn kho và công nợ thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ca Sáng: Đang mở
          </span>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="soft-card p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Doanh Thu Hôm Nay</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900">8.450.000 đ</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.8% so với hôm qua
          </p>
        </div>

        <div className="soft-card p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Số Đơn Hoàn Tất</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900">42 đơn</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Trung bình 201.000 đ/đơn</p>
        </div>

        <div className="soft-card p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Lợi Nhuận Gộp Ước Tính</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-purple-700">2.510.000 đ</p>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Tỷ suất biên: 29.7%</p>
        </div>

        <div className="soft-card p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Giá Trị Vốn Tồn Kho</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-amber-700">68.420.000 đ</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">345 mã mặt hàng</p>
        </div>
      </div>

      {/* 3. Recharts Section: Xu Hướng Doanh Thu & Top Bán Chạy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ diện tích: Doanh thu & Lợi nhuận 7 ngày */}
        <div className="soft-card p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Xu Hướng Doanh Thu & Lợi Nhuận 7 Ngày Gần Nhất
              </h2>
              <p className="text-xs text-slate-500">Dữ liệu từ thứ Hai đến Chủ Nhật tuần này</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-blue-600 font-bold">
                <span className="w-3 h-3 rounded-full bg-blue-600" /> Doanh thu
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Lợi nhuận
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDoanhThu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorLoiNhuan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickFormatter={(val) => `${val / 1000000}M`}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val) => [`${Number(val).toLocaleString('vi-VN')} đ`]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
                <Area
                  type="monotone"
                  dataKey="doanhThu"
                  name="Doanh thu"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDoanhThu)"
                />
                <Area
                  type="monotone"
                  dataKey="loiNhuan"
                  name="Lợi nhuận"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLoiNhuan)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ cột: Top 5 Sản Phẩm Bán Chạy */}
        <div className="soft-card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Top 5 Bán Chạy Nhất</h2>
            <p className="text-xs text-slate-500">Số lượng bán ra trong tuần</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProductsData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} width={90} />
                <Tooltip
                  formatter={(val) => [`${val} đơn vị`, 'Đã bán']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
                <Bar dataKey="soLuong" fill="#2563EB" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Cảnh Báo Quầy Kệ & Công Nợ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cảnh báo tồn kho */}
        <div className="soft-card p-5 space-y-3 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Cảnh Báo Hàng Sắp Hết (Cần Nhập)
            </h3>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
              3 sản phẩm
            </span>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">Mì Hảo Hảo Tôm Chua Cay 75g</p>
                <p className="text-[11px] text-slate-400">Mức tối thiểu: 50 gói</p>
              </div>
              <span className="font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                Tồn: 18 gói
              </span>
            </div>
            <div className="py-2 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">Bánh snack khoai tây Ostar 65g</p>
                <p className="text-[11px] text-slate-400">Mức tối thiểu: 20 gói</p>
              </div>
              <span className="font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                Tồn: 6 gói
              </span>
            </div>
          </div>
        </div>

        {/* Cảnh báo công nợ khách & NCC */}
        <div className="soft-card p-5 space-y-3 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Tình Trạng Sổ Công Nợ Cửa Hàng
            </h3>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
              Đối soát
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Khách hàng còn nợ quán:</span>
              <span className="font-black text-rose-600 text-sm">1.450.000 đ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Quán đang nợ Nhà cung cấp:</span>
              <span className="font-black text-slate-900 text-sm">2.100.000 đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
