"use client";

import { useState } from "react";
import { Badge } from "@/components/Badges";
import { PROTOTYPE_BANNER, REGIONS, type RegionInfo } from "@/lib/regional-data";
import type { RiskLevel } from "@/lib/types";

function riskStyles(level: RiskLevel): string {
  return level === "Low"
    ? "bg-field-100 text-field-800 border-field-200"
    : level === "Medium"
      ? "bg-amber-100 text-amber-900 border-amber-200"
      : "bg-red-100 text-red-800 border-red-200";
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="font-medium text-stone-600">{label}</span>
        <span className="font-bold text-stone-800 tabular-nums">{value}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-stone-100 overflow-hidden" aria-hidden>
        <div
          className={`h-full rounded-full ${value < 34 ? "bg-field-500" : value < 67 ? "bg-harvest-500" : "bg-red-500"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function RegionalPage() {
  const [selected, setSelected] = useState<RegionInfo>(REGIONS[2]); // UP default — matches demo farm

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Regional agricultural intelligence</h1>
        <p className="mt-1 text-sm text-stone-500 max-w-2xl">
          A prototype view of how KrishiSense could scale into an interoperable state-level network —
          states sharing risk signals and advisories for climate-resilient farming.
        </p>
        <p className="mt-3 inline-block text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2" role="note">
          {PROTOTYPE_BANNER} Values below are illustrative and do not represent real current conditions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Region list */}
        <div className="lg:col-span-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-1" role="listbox" aria-label="States">
          {REGIONS.map((r) => (
            <button
              key={r.state}
              role="option"
              aria-selected={selected.state === r.state}
              onClick={() => setSelected(r)}
              className={`text-left ks-card p-4 transition-shadow hover:shadow-md ${
                selected.state === r.state ? "ring-2 ring-field-500" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-stone-900">{r.state}</p>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${riskStyles(r.overallRisk)}`}>
                  {r.overallRisk}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <Meter label="Disease" value={r.diseaseRisk} />
                <Meter label="Water stress" value={r.waterStress} />
                <Meter label="Weather" value={r.weatherRisk} />
              </div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <section className="ks-card p-5 sm:p-6 lg:col-span-3" aria-labelledby="region-detail-heading" aria-live="polite">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="region-detail-heading" className="text-lg font-bold text-stone-900">{selected.state}</h2>
            <Badge tone={selected.overallRisk === "Low" ? "good" : selected.overallRisk === "Medium" ? "warn" : "bad"}>
              Overall: {selected.overallRisk} risk
            </Badge>
            <Badge tone="demo">Prototype data</Badge>
          </div>
          <p className="mt-3 text-sm text-stone-600 leading-relaxed">{selected.summary}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { l: "Disease risk", v: selected.diseaseRisk },
              { l: "Water stress", v: selected.waterStress },
              { l: "Weather risk", v: selected.weatherRisk },
            ].map((m) => (
              <div key={m.l} className="rounded-xl bg-stone-50 border border-stone-200 p-3">
                <p className="text-xs font-medium text-stone-500">{m.l}</p>
                <p className="text-2xl font-bold text-stone-900 tabular-nums">{m.v}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-field-200 bg-field-50 p-4">
            <p className="text-sm font-bold text-field-800">Advisory (representative)</p>
            <p className="mt-1 text-sm text-field-900 leading-relaxed">{selected.advisory}</p>
          </div>

          <h3 className="mt-5 text-sm font-bold text-stone-800">Districts (representative)</h3>
          <ul className="mt-2 divide-y divide-stone-100">
            {selected.districts.map((d) => (
              <li key={d.name} className="py-2.5 flex items-center gap-3">
                <span className="font-medium text-sm text-stone-800 w-32 shrink-0">{d.name}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${riskStyles(d.risk)}`}>
                  {d.risk}
                </span>
                <span className="text-xs text-stone-500">{d.note}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
