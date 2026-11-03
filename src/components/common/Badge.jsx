import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 shadow-2xs',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    warning: 'bg-orange-50 text-orange-800 border-orange-200/90',
    orange: 'bg-orange-50 text-orange-800 border-orange-200/90',
    danger: 'bg-rose-50 text-rose-800 border-rose-200/90',
    info: 'bg-sky-50 text-sky-800 border-sky-200/90',
    purple: 'bg-purple-50 text-purple-800 border-purple-200/90',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
