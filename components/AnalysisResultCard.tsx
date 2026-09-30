import type { AnalysisResult } from "@/lib/types";
import { RepresentativeBadge, RiskBadge } from "./Badges";

function pct(conf: number): string {
  return `${Math.round(conf * 100)}%`;
}

export default function AnalysisResultCard({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-4">
      <div className="ks-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <RiskBadge level={result.riskLevel} />
          <span className="text-xs text-stone-500">
            AI confidence: <span className="font-semibold text-stone-800">{pct(result.confidence)} ({result.confidenceLabel})</span>
          </span>
          <span className="ml-auto"><RepresentativeBadge /></span>
        </div>
        <h3 className="mt-3 text-lg font-bold text-stone-900 leading-snug">{result.issue}</h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-stone-400">AI assessment — not a definitive diagnosis</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="ks-card p-5">
          <h4 className="text-sm font-bold text-stone-800">Observed visual indicators</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-stone-600 list-disc pl-5">
            {result.indicators.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="ks-card p-5">
          <h4 className="text-sm font-bold text-stone-800">Contextual factors</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-stone-600 list-disc pl-5">
            {result.contextualFactors.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ks-card p-5 border-l-4 !border-l-field-600">
        <h4 className="text-sm font-bold text-stone-800">Recommended next actions</h4>
        <ol className="mt-2 space-y-1.5 text-sm text-stone-700 list-decimal pl-5">
          {result.nextActions.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900" role="note">
        <p className="font-bold">Advisory notice</p>
        <p className="mt-1">{result.disclaimer}</p>
      </div>
    </div>
  );
}
