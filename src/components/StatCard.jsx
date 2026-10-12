export default function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="card p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
      {Icon && (
        <span className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
          <Icon size={20} />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium">{title}</p>
        <p className="tabular text-xl sm:text-2xl font-bold text-slate-900 mt-1 whitespace-nowrap">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
