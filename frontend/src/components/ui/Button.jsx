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
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  const variantClasses = {
    '3d-primary': 'btn-3d-primary',
    '3d-solid': 'btn-3d-solid',
    '3d-secondary': 'btn-3d-secondary',
    '3d-emerald': 'btn-3d-emerald',
    '3d-danger': 'btn-3d-danger',
    danger: 'btn-3d-danger',
    emerald: 'btn-3d-emerald',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${sizeClasses[size]} ${variantClasses[variant]} whitespace-nowrap shrink-0 ${className}`}
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
