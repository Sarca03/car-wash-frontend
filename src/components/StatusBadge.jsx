import { statusLabel } from '../utils/formatters';

const styles = {
  Pending: 'bg-amber-50 text-amber-700',
  Confirmed: 'bg-brand-50 text-brand-700',
  Completed: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-red-50 text-red-600',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {statusLabel(status)}
    </span>
  );
}
