import type { ActionPlanDay } from "@/lib/types";

const DAY_ACCENTS = [
  "bg-field-700",
  "bg-field-600",
  "bg-field-500",
  "bg-harvest-500",
  "bg-harvest-600",
  "bg-field-800",
  "bg-field-900",
];

export default function ActionPlanTimeline({ plan }: { plan: ActionPlanDay[] }) {
  return (
    <ol className="relative ml-2 border-l-2 border-field-200 pl-0 space-y-0" aria-label="7-day action plan">
      {plan.map((d, i) => (
        <li key={d.day} className="relative pl-10 pb-5 last:pb-0">
          <span
            className={`absolute left-0 top-0 -translate-x-1/2 grid place-items-center w-7 h-7 rounded-full text-white text-xs font-bold ${DAY_ACCENTS[i % DAY_ACCENTS.length]}`}
            aria-hidden
          >
            {d.day}
          </span>
          <div className="ks-card p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-field-600">Day {d.day}</p>
            <p className="text-sm font-semibold text-stone-900 mt-0.5">{d.title}</p>
            <p className="text-sm text-stone-600 mt-1 leading-relaxed">{d.task}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
