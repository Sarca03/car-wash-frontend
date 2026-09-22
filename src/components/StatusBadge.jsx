import { statusColors } from '../utils/formatters';

export default function StatusBadge({ status }) {
  const colors = statusColors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${colors}`}
    >
      {status}
    </span>
  );
}