import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { LogoMark } from '../components/Logo';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // Besplatan server na Render-u se uspava; prvi zahtev zna da traje i do minut
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [loading]);
  const { login } = useAuth();
  const navigate = useNavigate();

  const signIn = async (u, p) => {
    setLoading(true);
    try {
      await login(u, p);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Greška pri prijavi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(username, password);
  };

  // Javni nalog koji backend pušta samo da čita
  const handleDemo = () => signIn('demo', 'demo');

  const inputClass =
    'w-full bg-page border border-transparent rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition';

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <div className="bg-brand-600 rounded-b-[2.5rem] px-6 pt-14 pb-28 text-center">
        <div className="inline-flex p-2 rounded-2xl bg-white/15 mb-4">
          <LogoMark size={44} />
        </div>
        <h1 className="text-2xl font-bold text-white">Auto perionica</h1>
        <p className="text-brand-100 text-sm mt-1">Termini, klijenti i prihod na jednom mestu</p>
      </div>

      <div className="flex-1 px-4 -mt-20 pb-10">
        <div className="card w-full max-w-md mx-auto p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Prijava</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">Za vlasnika i zaposlene.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-slate-600 mb-2">
                Korisničko ime
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="username"
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="korisničko ime"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-600 mb-2">
                Lozinka
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-3.5 rounded-full font-semibold text-sm shadow-lg transition flex items-center justify-center gap-2 !mt-6"
            >
              {loading ? 'Prijavljivanje...' : 'Prijavi se'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {slow && (
            <p className="mt-4 rounded-xl bg-amber-50 text-amber-800 px-4 py-3 text-xs" role="status">
              Server se budi posle pauze, ovo može da potraje do jednog minuta. Ne moraš ništa da klikćeš.
            </p>
          )}

          <div className="flex items-center gap-3 my-6 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            ili
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleDemo}
            disabled={loading}
            className="w-full bg-brand-50 hover:bg-brand-100 disabled:opacity-60 text-brand-700 py-3.5 rounded-full font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <Eye size={18} />
            Pogledaj demo
          </button>
          <p className="text-center text-xs text-slate-500 mt-3">Bez lozinke. U demo režimu podaci se samo pregledaju.</p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">© 2026 Bogdan Šarčević</p>
      </div>
    </div>
  );
}
