import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  const variants = {
    primary:
      'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm shadow-emerald-600/20 border border-emerald-600 hover:border-emerald-700',
    orange:
      'bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm shadow-orange-500/25 border border-orange-500 hover:border-orange-600',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs hover:border-slate-300',
    outline:
      'bg-transparent hover:bg-emerald-50 text-emerald-700 border border-emerald-300 hover:border-emerald-400 font-medium',
    danger:
      'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-base rounded-xl gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
