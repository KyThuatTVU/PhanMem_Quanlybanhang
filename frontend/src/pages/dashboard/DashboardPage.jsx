import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { DollarSign, ShoppingBag, Users, Boxes, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/dashboard/summary');
        setSummary(response.data);
      } catch (err) {
        console.error('Lỗi lấy dữ liệu dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Tổng Quan Cửa Hàng
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Số liệu kinh doanh hôm nay và cảnh báo tồn kho thực tế
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200">
          ● Hệ Thống Đang Vận Hành
        </span>
      </div>

      {/* Grid 4 Card Thống Kê Chính */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card Doanh Thu */}
        <div className="soft-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Doanh Thu Hôm Nay</p>
            <h3 className="text-xl font-extrabold text-slate-900">
              {summary?.todayRevenue ? Number(summary.todayRevenue).toLocaleString('vi-VN') : '0'} đ
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <TrendingUp className="w-3 h-3" /> +12.5% so với hôm qua
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card Đơn Hàng */}
        <div className="soft-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Đơn Hàng Hôm Nay</p>
            <h3 className="text-xl font-extrabold text-slate-900">
              {summary?.todayOrders || 0} đơn
            </h3>
            <span className="text-[11px] font-medium text-slate-400">
              Đã hoàn tất tại quầy POS
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Card Khách Hàng */}
        <div className="soft-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Khách Hàng</p>
            <h3 className="text-xl font-extrabold text-slate-900">
              {summary?.totalCustomers || 0} khách
            </h3>
            <span className="text-[11px] font-medium text-slate-400">
              Đã đăng ký hệ thống
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card Tồn Kho */}
        <div className="soft-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Tổng Tồn Kho</p>
            <h3 className="text-xl font-extrabold text-slate-900">
              {summary?.totalInventoryQty ? Number(summary.totalInventoryQty).toLocaleString('vi-VN') : '0'} sản phẩm
            </h3>
            <span className="text-[11px] font-medium text-amber-600 font-bold">
              {summary?.totalProducts || 0} danh mục hàng
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Grid Báo cáo Chi tiết & Top Bán Chạy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top 5 Sản phẩm Bán Chạy */}
        <div className="lg:col-span-2 soft-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Top Sản Phẩm Bán Chạy Trong Tháng
            </h2>
            <button className="text-xs font-semibold text-blue-600 hover:underline">
              Xem tất cả
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {summary?.topProducts && summary.topProducts.length > 0 ? (
              summary.topProducts.map((prod, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-600 flex items-center justify-center text-[11px]">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">{prod.product_name}</span>
                  </div>
                  <span className="font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {Number(prod.total_sold).toLocaleString('vi-VN')} lượt mua
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">Chưa có dữ liệu bán hàng tháng này</p>
            )}
          </div>
        </div>

        {/* Thống kê Công Nợ & Cảnh Báo */}
        <div className="soft-card space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Sổ Nợ & Cảnh Báo Cửa Hàng
          </h2>

          <div className="space-y-3">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-rose-700">Khách Hàng Đang Nợ Quán</span>
              <p className="text-base font-extrabold text-rose-800">
                {summary?.totalCustomerDebt ? Number(summary.totalCustomerDebt).toLocaleString('vi-VN') : '0'} đ
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-amber-700">Quán Nợ Nhà Cung Cấp</span>
              <p className="text-base font-extrabold text-amber-800">
                {summary?.totalSupplierDebt ? Number(summary.totalSupplierDebt).toLocaleString('vi-VN') : '0'} đ
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
