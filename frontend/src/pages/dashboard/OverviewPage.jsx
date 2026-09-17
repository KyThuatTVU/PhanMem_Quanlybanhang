import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Boxes, CheckCircle2, Clock3, ShoppingCart, Store } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import storeBanner from '../../assets/images/banner.png';
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
    <div className="space-y-6">
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
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

      <section className="w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg bg-white">
        <img
          src={storeBanner}
          alt="Không gian cửa hàng KORA Retail"
          className="w-full h-auto object-contain block"
        />
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