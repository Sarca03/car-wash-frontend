import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Wallet, Users, Clock, ChevronRight } from 'lucide-react';
import { appointmentsApi } from '../api/appointments';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import { formatPrice, statusLabel, STATUSES } from '../utils/formatters';
import toast from 'react-hot-toast';

const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();
const timeOf = (iso) =>
  new Date(iso).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });

const barColor = {
  Pending: 'bg-amber-400',
  Confirmed: 'bg-brand-500',
  Completed: 'bg-emerald-500',
  Cancelled: 'bg-red-400',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [today, setToday] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([appointmentsApi.getStats(), appointmentsApi.getAll()])
      .then(([s, all]) => {
        setStats(s);
        setToday(
          all
            .filter((a) => isToday(a.appointment_time))
            .sort((a, b) => new Date(a.appointment_time) - new Date(b.appointment_time))
        );
      })
      .catch(() => toast.error('Greška pri učitavanju statistike'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const dateLabel = new Date().toLocaleDateString('sr-Latn-RS', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const byStatus = STATUSES.map((s) => ({
    status: s,
    count: Number(stats?.by_status?.find((x) => x.status === s)?.count || 0),
  }));
  const totalByStatus = byStatus.reduce((sum, s) => sum + s.count, 0);
  const now = new Date();
  const next = today.find(
    (a) => new Date(a.appointment_time) > now && a.status !== 'Completed' && a.status !== 'Cancelled'
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl">
      <div className="bg-brand-600 rounded-3xl p-6 md:p-8 mb-6 text-white relative overflow-hidden">
        <svg className="absolute -right-10 -top-10 w-56 h-56 text-white/10" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 3c-5 6.4-9 11.6-9 16.4A9 9 0 0 0 16 28.5a9 9 0 0 0 9-9.1C25 14.6 21 9.4 16 3Z" fill="currentColor" />
        </svg>
        <p className="text-brand-100 text-sm first-letter:uppercase">{dateLabel}</p>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">Danas u perionici</h1>
        <p className="text-brand-100 mt-2 text-sm">
          {today.length === 0
            ? 'Danas nema zakazanih termina.'
            : `Danas ima ${today.length} ${today.length % 10 === 1 && today.length % 100 !== 11 ? 'termin' : 'termina'}.`}
          {next && ` Sledeći je u ${timeOf(next.appointment_time)}: ${next.client_name}.`}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {/* Broji iz iste liste kao "Današnji termini", po lokalnom vremenu */}
        <StatCard title="Termini danas" value={today.length} icon={Clock} />
        <StatCard title="Ukupno termina" value={stats?.total_appointments || 0} icon={CalendarDays} />
        <StatCard title="Prihod" value={formatPrice(stats?.total_revenue || 0)} subtitle="završeni termini" icon={Wallet} />
        <StatCard title="Klijenti" value={stats?.total_clients || 0} icon={Users} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="card lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="font-bold text-slate-900">Današnji termini</h2>
            <Link to="/appointments" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-0.5">
              Svi termini <ChevronRight size={16} />
            </Link>
          </div>
          {today.length > 0 ? (
            <ul className="px-3 pb-3">
              {today.map((a) => (
                <li key={a.appointment_id} className="flex items-center gap-4 px-2 py-3 rounded-xl hover:bg-page">
                  <span className="tabular w-14 shrink-0 text-center rounded-xl bg-brand-50 text-brand-700 font-bold text-sm py-2">
                    {timeOf(a.appointment_time)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm truncate">{a.client_name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {a.service_name} · {a.vehicle} <span className="plate ml-1">{a.license_plate}</span>
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 pb-6 text-sm text-slate-500">Nema termina za danas.</p>
          )}
        </section>

        <section className="card p-5">
          <h2 className="font-bold text-slate-900 mb-4">Termini po statusu</h2>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-100 mb-5">
            {totalByStatus > 0 &&
              byStatus.map((s) =>
                s.count > 0 ? (
                  <div key={s.status} className={barColor[s.status]} style={{ width: `${(s.count / totalByStatus) * 100}%` }} />
                ) : null
              )}
          </div>
          <ul className="space-y-3">
            {byStatus.map((s) => (
              <li key={s.status} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 text-slate-600">
                  <span className={`w-2.5 h-2.5 rounded-full ${barColor[s.status]}`} />
                  {statusLabel(s.status)}
                </span>
                <span className="tabular font-bold text-slate-900">{s.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
