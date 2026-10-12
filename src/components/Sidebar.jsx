import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Logo from './Logo';
import { navLinks } from './navLinks';

// Bočni meni, samo na desktopu. Na telefonu je donji meni u Layout-u.
export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Odjavljen si');
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 bg-white border-r border-slate-200/70 flex-col">
      <div className="px-6 h-20 flex items-center">
        <Logo />
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navLinks.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-semibold text-sm ${
                isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-page">
          <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-900 font-semibold truncate">{user?.username}</p>
            <p className="text-xs text-slate-500 truncate">
              {user?.username === 'demo' || user?.role === 'demo'
                ? 'Samo pregled'
                : user?.role === 'admin'
                  ? 'Administrator'
                  : 'Zaposleni'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white"
            aria-label="Odjavi se"
            title="Odjavi se"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
