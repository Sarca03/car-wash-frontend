import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Users, Car, Sparkles, UserCog, LogOut, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/appointments', label: 'Termini', icon: CalendarDays },
  { to: '/clients', label: 'Klijenti', icon: Users },
  { to: '/vehicles', label: 'Vozila', icon: Car },
  { to: '/services', label: 'Usluge', icon: Sparkles },
  { to: '/workers', label: 'Radnici', icon: UserCog },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Odjavljeni ste');
    navigate('/login');
  };

  const handleLinkClick = () => {
    // Zatvori sidebar na mobilnom kad se klikne link
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay na mobilnom */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-slate-900 border-r border-slate-800 flex flex-col
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
              🚗 Auto Perionica
            </h1>
            <p className="text-xs text-slate-500 mt-1">Sistem za upravljanje</p>
          </div>
          {/* Close dugme samo na mobilnom */}
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1"
            aria-label="Zatvori meni"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigacija */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-semibold truncate">{user?.username}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition font-medium text-sm"
          >
            <LogOut size={16} />
            Odjavi se
          </button>
        </div>
      </aside>
    </>
  );
}