export function ScoreRing({
  value,
  label,
  sub,
  invert = false,
}: {
  value: number;
  label: string;
  sub?: string;
  /** invert=true when a LOWER number is better (risk scores) */
  invert?: boolean;
}) {
  const good = invert ? value < 34 : value >= 70;
  const warn = invert ? value < 67 : value >= 40;
  const color = good ? "#4a733c" : warn ? "#c68a2b" : "#c0392b";
  const r = 34;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0" role="img" aria-label={`${label}: ${clamped} out of 100`}>
        <svg viewBox="0 0 84 84" className="w-20 h-20 -rotate-90">
          <circle cx="42" cy="42" r={r} fill="none" stroke="#e8ede6" strokeWidth="9" />
          <circle
            cx="42"
            cy="42"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (clamped / 100) * c}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-xl font-bold text-stone-800">
          {clamped}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-stone-800">{label}</p>
        {sub && <p className="text-xs text-stone-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function RiskCard({
  title,
  value,
  hint,
  invert = false,
}: {
  title: string;
  value: number;
  hint: string;
  invert?: boolean;
}) {
  const level = invert ? (value < 34 ? "Low" : value < 67 ? "Medium" : "High") : value >= 70 ? "Good" : value >= 40 ? "Fair" : "Poor";
  const bar = invert
    ? value < 34
      ? "bg-field-500"
      : value < 67
        ? "bg-harvest-500"
        : "bg-red-500"
    : value >= 70
      ? "bg-field-500"
      : value >= 40
        ? "bg-harvest-500"
        : "bg-red-500";
  return (
    <div className="ks-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-stone-700">{title}</p>
        <p className="text-2xl font-bold text-stone-900 tabular-nums">{value}</p>
      </div>
      <div className="mt-2 h-2 rounded-full bg-stone-100 overflow-hidden" aria-hidden>
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <p className="mt-2 text-xs text-stone-500">
        <span className="font-semibold text-stone-700">{level}</span> · {hint}
      </p>
    </div>
  );
}
