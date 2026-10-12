// Znak: kap vode u zaobljenom kvadratu. SVG da bude oštar u svakoj veličini.
export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-brand-600" />
      <path
        d="M16 6.5c-3.6 4.6-6.5 8.4-6.5 11.9A6.5 6.5 0 0 0 16 25a6.5 6.5 0 0 0 6.5-6.6C22.5 14.9 19.6 11.1 16 6.5Z"
        fill="#fff"
      />
      <path d="M13 18.6a3 3 0 0 0 3 3" fill="none" stroke="#6342e8" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ size = 32, subtitle = true }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={size} />
      <div className="leading-tight">
        <p className="text-[15px] font-bold text-slate-900 tracking-tight">Auto perionica</p>
        {subtitle && <p className="text-xs text-slate-500">Termini, klijenti i prihod</p>}
      </div>
    </div>
  );
}
