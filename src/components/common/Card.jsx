import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-xs p-6 ${
        hover ? 'transition-all duration-200 hover:border-slate-300 hover:shadow-md' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5 ${className}`}>
      <div>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

export default Card;
