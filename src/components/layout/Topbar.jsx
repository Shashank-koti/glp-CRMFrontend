import React from 'react';
import { Menu, Plus, Search, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../common/Button';

export const Topbar = ({ onToggleSidebar }) => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'System Overview & Analytics';
    if (path.startsWith('/categories')) return 'Product Categories';
    if (path.includes('/impurities/new')) return 'New Impurity Registration';
    if (path.includes('/impurities/edit')) return 'Edit Impurity Standard';
    if (path.includes('/impurities')) return 'Parent API Impurities & Standards';
    if (path.startsWith('/main-products')) return 'Main Products (Parent APIs)';
    if (path === '/products/new') return 'New SubProduct / Impurity Registration';
    if (path.startsWith('/products/edit')) return 'Edit SubProduct / Impurity';
    if (path.startsWith('/products')) return 'SubProducts Catalog & Standards';
    if (path.startsWith('/documents')) return 'Compliance & Regulatory Documents Hub';
    if (path.startsWith('/inquiries')) return 'Customer Inquiries & Quote Requests';
    if (path.startsWith('/clients')) return 'Client Directory & Registered Accounts';
    return 'CRM Administration';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between gap-4 shadow-2xs">
      {/* Left Title & Mobile Menu Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {getPageTitle()}
          </h1>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <span>GLP Pharma Enterprise</span>
            <span>/</span>
            <span className="text-emerald-700 font-medium">Production Database</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">

        <Link to="/products/new">
          <Button variant="orange" size="sm" icon={Plus}>
            <span className="hidden sm:inline">Add Impurity</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
