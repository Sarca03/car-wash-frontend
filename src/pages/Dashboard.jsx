import { useEffect, useState } from 'react';
import {
  CalendarDays,
  DollarSign,
  Users,
  Clock,
} from 'lucide-react';
import { appointmentsApi } from '../api/appointments';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import { formatPrice } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsApi
      .getStats()
      .then(setStats)
      .catch(() => toast.error('Greška pri učitavanju statistike'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Pregled poslovanja</p>
      </div>

      {/* Kartice */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Ukupno termina"
          value={stats?.total_appointments || 0}
          icon={CalendarDays}
          color="blue"
        />
        <StatCard
          title="Termini danas"
          value={stats?.appointments_today || 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Ukupan prihod"
          value={formatPrice(stats?.total_revenue || 0)}
          icon={DollarSign}
          color="emerald"
          subtitle="Samo završeni termini"
        />
        <StatCard
          title="Ukupno klijenata"
          value={stats?.total_clients || 0}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Termini po statusu */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Termini po statusu
        </h2>

        {stats?.by_status?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.by_status.map((s) => (
              <div
                key={s.status}
                className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center"
              >
                <p className="text-2xl font-bold text-white">{s.count}</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">
                  {s.status}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Nema podataka</p>
        )}
      </div>
    </div>
  );
}