import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
