import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Boxes, CheckCircle2, Clock3, ShoppingCart, Store } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import storeBanner from '../../assets/images/nen.png';
import { useAuthStore } from '../../stores/useAuthStore';

const getGreeting = (hour) => {
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

export const OverviewPage = () => {
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const greeting = getGreeting(currentTime.getHours());
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(currentTime);
  const formattedTime = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const adminName = user?.fullName || user?.name || 'Admin';

  return (
    <div className="space-y-5">
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-sky-600 uppercase tracking-wide">Không gian làm việc KORA Retail</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {greeting}, {adminName}
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
            <Clock3 className="w-4 h-4 text-sky-600" />
            <span className="capitalize">{formattedDate}</span>
            <span className="text-slate-300">|</span>
            <span className="font-bold text-slate-700 tabular-nums">{formattedTime}</span>
          </div>
        </div>
        <Link to="/pos" className="self-start lg:self-auto">
          <Button variant="3d-solid" icon={ShoppingCart} size="md">
            Vào bán hàng POS
          </Button>
        </Link>
      </section>

      <section className="overview-banner w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg bg-white">
        <img
          src={storeBanner}
          alt="Không gian cửa hàng KORA Retail"
          className="w-full h-full object-cover object-center block"
        />
      </section>

      <section className="dashboard-glass-card rounded-3xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-wide text-sky-600">Giới thiệu phần mềm</p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">KORA Retail giúp bạn quản lý cửa hàng từ một nơi</h2>
          <p className="text-sm leading-6 text-slate-600 mt-3">
            Phần mềm kết nối các công việc hằng ngày của cửa hàng: nhập sản phẩm, bán hàng tại quầy, quản lý tồn kho, theo dõi công nợ và xem kết quả kinh doanh. Bạn chỉ cần cập nhật dữ liệu một lần, hệ thống sẽ giúp kiểm soát số liệu rõ ràng hơn.
          </p>
        </div>

        <div className="mt-7 border-t border-slate-200/70 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-sky-600">Quy trình sử dụng</p>
              <h3 className="text-lg font-extrabold text-slate-900 mt-1">Bắt đầu theo 5 bước sau</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">Dành cho chủ quán và nhân viên</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
          {[
            { number: '01', title: 'Thiết lập thông tin cửa hàng', description: 'Vào Cài Đặt để nhập tên, số điện thoại, địa chỉ và lời chào in trên hóa đơn.', path: '/settings' },
            { number: '02', title: 'Tạo danh mục hàng hóa', description: 'Thêm tên hàng, mã SKU, mã vạch, giá vốn, giá bán và mức tồn tối thiểu.', path: '/products' },
            { number: '03', title: 'Cập nhật số lượng trong kho', description: 'Ghi nhận hàng nhập, kiểm kê hoặc điều chỉnh để số tồn luôn chính xác.', path: '/inventory' },
            { number: '04', title: 'Thực hiện bán hàng tại quầy', description: 'Mở Máy Bán Hàng, chọn sản phẩm, nhận thanh toán và hoàn tất hóa đơn.', path: '/pos' },
            { number: '05', title: 'Kiểm tra kết quả kinh doanh', description: 'Xem doanh thu, lợi nhuận, công nợ và hàng bán chạy trong Báo Cáo.', path: '/reports' },
          ].map(({ number, title, description, path }) => (
            <Link
              key={number}
              to={path}
              className="group rounded-2xl border border-white/80 bg-white/55 p-4 transition hover:-translate-y-1 hover:bg-white/85 hover:shadow-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-sky-700 bg-sky-50 border border-sky-100 rounded-lg px-2 py-1">Bước {number}</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mt-4">{title}</h3>
              <p className="text-xs leading-5 text-slate-500 mt-1.5">{description}</p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 mt-3">
                Mở chức năng <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6">
        <div className="soft-card p-6 sm:p-8 border border-slate-200/80 bg-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-sky-600">KORA Retail</p>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Quản lý cửa hàng nhẹ nhàng hơn</h2>
              <p className="text-sm leading-6 text-slate-600 mt-3">
                Một nền tảng tập trung giúp bạn bán hàng, quản lý kho, theo dõi công nợ và nắm bắt hiệu quả kinh doanh trong cùng một nơi.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
            {[
              { icon: ShoppingCart, label: 'Bán hàng nhanh' },
              { icon: Boxes, label: 'Kho hàng chính xác' },
              { icon: BarChart3, label: 'Số liệu rõ ràng' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700">
                <Icon className="w-4 h-4 text-sky-600" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card p-6 border border-emerald-100/80 bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-extrabold text-slate-900">Bắt đầu ngày làm việc</h2>
          </div>
          <p className="text-sm leading-6 text-slate-600 mt-4">
            Mọi hoạt động quan trọng của cửa hàng đang được sắp xếp để bạn theo dõi nhanh chóng.
          </p>
          <Link to="/statistics" className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-700 hover:text-sky-800 mt-5">
            Xem thống kê cửa hàng <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};