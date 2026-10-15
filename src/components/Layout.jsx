import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import Logo from './Logo';
import { navLinks } from './navLinks';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const isDemo = user?.role === 'demo' || user?.username === 'demo';
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Odjavljen si');
    navigate('/login');
  };

  return (
    <div className={`flex min-h-screen bg-page ${isDemo ? 'is-demo' : ''}`}>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200/70 px-4 h-14 flex items-center justify-between">
        <Logo size={28} subtitle={false} />
        <button
          onClick={handleLogout}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
          aria-label="Odjavi se"
        >
          <LogOut size={18} />
        </button>
      </div>

      <Sidebar />

      <main className="flex-1 min-w-0 overflow-x-auto pt-14 pb-24 lg:pt-0 lg:pb-0">
        {isDemo && (
          <div className="mx-4 md:mx-6 lg:mx-8 mt-4 lg:mt-6 flex items-start gap-3 rounded-2xl bg-brand-50 text-brand-700 px-4 py-3 text-sm">
            <Eye size={18} className="shrink-0 mt-0.5" />
            <p>
              <span className="font-semibold">Demo režim.</span> Možeš da pregledaš sve, ali ne i da menjaš podatke.
            </p>
          </div>
        )}
        <Outlet />
      </main>

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/70 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] grid grid-cols-6"
        aria-label="Glavni meni"
      >
        {navLinks.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 text-[10px] font-semibold ${
                isActive ? 'text-brand-600' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`w-10 h-7 rounded-full flex items-center justify-center ${isActive ? 'bg-brand-50' : ''}`}>
                  <Icon size={18} strokeWidth={isActive ? 2.25 : 1.75} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
