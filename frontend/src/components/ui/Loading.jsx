import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Standard Spinning Loader
 */
export const LoadingSpinner = ({ size = 'md', text = '', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
    xl: 'w-12 h-12 text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`animate-spin text-sky-600 ${sizeClasses[size]}`} size={iconSizes[size]} />
      {text && <p className="text-slate-600 font-medium text-sm animate-pulse">{text}</p>}
    </div>
  );
};

/**
 * Full Page or Container Loading Overlay
 */
export const PageLoader = ({ message = 'Đang tải dữ liệu, vui lòng chờ...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 bg-slate-50/50 backdrop-blur-sm rounded-2xl border border-slate-100/80 shadow-inner">
      <div className="relative flex items-center justify-center mb-4">
        {/* Outer glowing ring */}
        <div className="w-16 h-16 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
        {/* Inner pulse circle */}
        <div className="absolute w-8 h-8 rounded-full bg-emerald-500/20 animate-ping" />
      </div>
      <p className="text-slate-700 font-semibold text-base animate-pulse">{message}</p>
      <p className="text-slate-400 text-xs mt-1">Tạp Hóa Vũ An - Hệ Thống Quản Lý Bán Hàng</p>
    </div>
  );
};

/**
 * Skeleton Loader for Data Tables
 */
export const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse border-b border-slate-100">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="p-4">
              <div
                className={`h-4 bg-slate-200/80 rounded-md ${
                  cIdx === 0
                    ? 'w-8 mx-auto'
                    : cIdx === 1
                    ? 'w-24 bg-sky-100/70'
                    : cIdx === cols - 1
                    ? 'w-16 mx-auto bg-slate-200'
                    : 'w-3/4'
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

/**
 * Skeleton Loader for Cards (e.g., POS Product Cards, Dashboard Cards)
 */
export const CardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-col gap-3"
        >
          {/* Image Placeholder */}
          <div className="w-full h-32 bg-slate-200/80 rounded-lg flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-300/50" />
          </div>
          {/* Title Placeholder */}
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-3 bg-slate-150 rounded w-1/2" />
          {/* Price Tag Placeholder */}
          <div className="mt-auto flex justify-between items-center pt-2">
            <div className="h-5 bg-sky-200/80 rounded w-20" />
            <div className="h-7 w-7 rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Simple Gray Block Skeleton Component
 */
export const InlineSkeleton = ({ width = 'w-20', height = 'h-4', className = '' }) => {
  return (
    <span
      className={`inline-block animate-pulse bg-slate-200/80 rounded ${width} ${height} ${className}`}
    />
  );
};

export default LoadingSpinner;
