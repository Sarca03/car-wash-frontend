export default function Loading({ message = 'Učitavanje...' }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">{message}</p>
      </div>
    </div>
  );
}