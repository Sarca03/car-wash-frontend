import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 p-4 flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-slate-300 hover:text-white p-1"
          aria-label="Otvori meni"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-blue-400">🚗 Auto Perionica</h1>
      </div>

      {/* Sidebar - desktop uvijek vidljiv, mobile kao overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content - pomjeren dole na mobilnom zbog top bara */}
      <main className="flex-1 overflow-x-auto pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}