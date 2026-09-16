import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = '3d-primary', // '3d-primary' | '3d-solid' | '3d-secondary' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-2xl',
  };

  const variantClasses = {
    '3d-primary': 'btn-3d-primary',
    '3d-solid': 'btn-3d-solid',
    '3d-secondary': 'btn-3d-secondary',
    danger: 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl font-medium shadow-sm hover:shadow active:translate-y-0.5 transition-all',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};
