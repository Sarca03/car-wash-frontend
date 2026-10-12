export default function Loading({ message = 'Učitavanje...' }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <span className="w-5 h-5 border-2 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
        {message}
      </div>
    </div>
  );
}
