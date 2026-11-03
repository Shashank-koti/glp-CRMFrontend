import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  FolderTree,
  Package,
  Users,
  Inbox,
  FileCheck2,
  LogOut,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import Logo from "/logo.png";
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const catalogNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Categories', path: '/categories', icon: FolderTree },
    { label: 'Main Products', path: '/main-products', icon: Boxes },
    { label: 'SubProducts / Impurities', path: '/products', icon: Package },
  ];

  const crmNavItems = [
    { label: 'Clients & Accounts', path: '/clients', icon: Users },
    { label: 'Customer Inquiries', path: '/inquiries', icon: Inbox },
    { label: 'Documents Hub', path: '/documents', icon: FileCheck2 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200/90 shadow-sm flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <img src={Logo} alt="logo" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Catalog & Operations
          </div>
          {catalogNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-5 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Customer Relations
          </div>
          {crmNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Storefront
          </div>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50/70 border border-transparent hover:border-orange-200 transition-all"
          >
            <span className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Live Website</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </nav>

        {/* Admin User Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                {(user?.name || user?.clientName)?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {user?.name || user?.clientName || 'Administrator'}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {user?.email || 'admin@glppharma.com'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
