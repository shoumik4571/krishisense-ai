"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RepresentativeBadge, RiskBadge } from "@/components/Badges";
import { RiskCard, ScoreRing } from "@/components/ScoreRing";
import {
  loadAnalysesLocal,
  loadFarmLocal,
  loadRecentAnalysesRemote,
} from "@/lib/db";
import type { CropAnalysis, FarmProfile } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [farm] = useState<FarmProfile | null>(() =>
    typeof window === "undefined" ? null : loadFarmLocal(),
  );
  const [analyses, setAnalyses] = useState<CropAnalysis[]>(() =>
    typeof window === "undefined" ? [] : loadAnalysesLocal(),
  );

  useEffect(() => {
    if (farm !== null) return;
    const t = setTimeout(() => router.replace("/"), 0);
    return () => clearTimeout(t);
  }, [farm, router]);

  useEffect(() => {
    if (!farm) return;
    // Opportunistic cloud refresh — local data renders first.
    loadRecentAnalysesRemote().then((remote) => {
      if (remote && remote.length > 0) setAnalyses(remote);
    }).catch(() => {});
  }, [farm]);

  if (!farm) {
    return (
      <div className="ks-card p-10 text-center">
        <p className="text-sm text-stone-500">Loading dashboard…</p>
      </div>
    );
  }

  const latest = analyses[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Farm intelligence dashboard</h1>
          <p className="mt-1 text-sm text-stone-500">
            {farm.crop} · {farm.growthStage} stage · {farm.location} · {farm.farmSizeAcres} acres
          </p>
        </div>
        <Link
          href="/analyze"
          className="rounded-lg bg-field-700 hover:bg-field-800 px-4 py-2.5 text-sm font-semibold text-white"
        >
          {latest ? "Analyze again" : "Analyze crop →"}
        </Link>
      </div>

      {!latest ? (
        <div className="ks-card p-10 text-center">
          <p className="text-4xl" aria-hidden>🌱</p>
          <h2 className="mt-3 text-lg font-bold text-stone-900">No crop analysis yet</h2>
          <p className="mt-1 text-sm text-stone-500 max-w-md mx-auto">
            Upload a crop photo to generate your first AI assessment, 7-day plan, and farm health scores.
          </p>
          <Link
            href="/analyze"
            className="mt-5 inline-block rounded-lg bg-field-700 hover:bg-field-800 px-6 py-3 text-sm font-semibold text-white"
          >
            Start crop analysis
          </Link>
        </div>
      ) : (
        <>
          {/* Health + context row */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="ks-card p-5 lg:col-span-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-stone-800">Farm health score</h2>
                <RepresentativeBadge />
              </div>
              <div className="mt-3">
                <ScoreRing value={latest.result.scores.health} label="Overall health" sub="Composite of disease, water & weather signals" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <RiskBadge level={latest.result.riskLevel} />
                <span className="text-xs text-stone-500">
                  Confidence {Math.round(latest.result.confidence * 100)}% ({latest.result.confidenceLabel})
                </span>
              </div>
            </div>
            <div className="ks-card p-5 lg:col-span-2">
              <h2 className="text-sm font-bold text-stone-800">Latest AI recommendation</h2>
              <p className="mt-2 text-[15px] font-semibold text-stone-900 leading-snug">{latest.result.issue}</p>
              <ul className="mt-2.5 space-y-1 text-sm text-stone-600 list-disc pl-5">
                {latest.result.nextActions.slice(0, 3).map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-stone-500">
                Analysed {new Date(latest.createdAt).toLocaleString("en-IN")}
                {latest.demoMode ? " · demo mode" : " · Gemini 2.5 Flash"}
              </p>
            </div>
          </div>

          {/* Risk cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RiskCard title="Disease risk" value={latest.result.scores.diseaseRisk} hint="Foliar-disease pressure" invert />
            <RiskCard title="Water stress" value={latest.result.scores.waterStress} hint="Soil-moisture stress" invert />
            <RiskCard title="Weather risk" value={latest.result.scores.weatherRisk} hint="7-day outlook exposure" invert />
            <div className="ks-card p-4">
              <p className="text-sm font-semibold text-stone-700">Current crop</p>
              <p className="mt-1 text-xl font-bold text-stone-900">{farm.crop}</p>
              <p className="mt-1 text-xs text-stone-500">{farm.location}</p>
              <p className="mt-1 text-xs text-stone-500">{farm.growthStage} · {farm.farmSizeAcres} acres</p>
            </div>
          </div>

          {/* Recent analysis */}
          <section className="ks-card p-5 sm:p-6" aria-labelledby="recent-heading">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="recent-heading" className="text-base font-bold text-stone-900">Recent analysis</h2>
              <RepresentativeBadge />
            </div>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={latest.imageUrl}
                alt="Latest analysed crop"
                className="rounded-xl border border-stone-200 w-full max-h-64 object-contain bg-stone-50"
              />
              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-stone-900">{latest.result.issue}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
                  AI assessment — not a definitive diagnosis
                </p>
                <h3 className="mt-3 text-sm font-bold text-stone-800">Observed indicators</h3>
                <ul className="mt-1 space-y-1 text-sm text-stone-600 list-disc pl-5">
                  {latest.result.indicators.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                  {latest.result.disclaimer}
                </div>
              </div>
            </div>
            {analyses.length > 1 && (
              <div className="mt-5 border-t border-stone-100 pt-4">
                <h3 className="text-sm font-bold text-stone-800">History</h3>
                <ul className="mt-2 space-y-2">
                  {analyses.slice(1, 5).map((a) => (
                    <li key={a.id} className="text-sm text-stone-600">
                      <span className="font-medium text-stone-800">{new Date(a.createdAt).toLocaleString("en-IN")}</span>
                      {" — "}{a.result.issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
