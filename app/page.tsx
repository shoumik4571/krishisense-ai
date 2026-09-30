"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loadFarmLocal, persistFarmRemote, saveFarmLocal } from "@/lib/db";
import type { FarmProfile, GrowthStage } from "@/lib/types";

const GROWTH_STAGES: GrowthStage[] = [
  "Germination",
  "Tillering",
  "Vegetative",
  "Flowering",
  "Grain Filling",
  "Maturity",
  "Harvest",
];

export default function HomePage() {
  const router = useRouter();
  const [location, setLocation] = useState("Meerut, Uttar Pradesh");
  const [crop, setCrop] = useState("Wheat");
  const [farmSize, setFarmSize] = useState("3");
  const [growthStage, setGrowthStage] = useState<GrowthStage>("Vegetative");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const size = Number(farmSize);
    if (!location.trim() || !crop.trim() || !Number.isFinite(size) || size <= 0) {
      setError("Please enter a valid location, crop, and farm size.");
      return;
    }
    setSaving(true);
    const existing = typeof window !== "undefined" ? loadFarmLocal() : null;
    const farm: FarmProfile = {
      id: existing?.id ?? `farm-${Date.now()}`,
      location: location.trim(),
      crop: crop.trim(),
      farmSizeAcres: size,
      growthStage,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    saveFarmLocal(farm);
    // Best-effort cloud persistence — never blocks navigation.
    persistFarmRemote(farm).catch(() => {});
    setSaving(false);
    router.push("/analyze");
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-field-200 bg-gradient-to-br from-field-900 via-field-800 to-field-700 text-white">
        <div className="px-6 py-10 sm:px-10 sm:py-12 max-w-3xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-field-200">
            <span className="w-6 h-px bg-field-300" aria-hidden />
            GDG Code for Communities 2.0 · Track 4
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Agricultural intelligence for every small farm.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-field-100 leading-relaxed max-w-2xl">
            KrishiSense AI combines your crop photo with representative weather, soil, and crop-stage
            context. Gemini analyses the image and returns an AI assessment, localised recommendations,
            and a practical 7-day action plan — shown on your farm intelligence dashboard.
          </p>
          <ol className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
            {["1 · Farm profile", "2 · Crop photo", "3 · AI assessment", "4 · 7-day plan"].map((s) => (
              <li key={s} className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20">{s}</li>
            ))}
          </ol>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Farm profile form */}
        <section className="ks-card p-6 sm:p-7 lg:col-span-3" aria-labelledby="farm-profile-heading">
          <h2 id="farm-profile-heading" className="text-lg font-bold text-stone-900">Create your farm profile</h2>
          <p className="mt-1 text-sm text-stone-500">
            Demo values are prefilled. Adjust them and continue to crop analysis.
          </p>
          <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="location" className="text-sm font-semibold text-stone-700">Location</label>
              <input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Meerut, Uttar Pradesh"
                className="mt-1.5 w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-field-500 focus:border-field-500"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="crop" className="text-sm font-semibold text-stone-700">Crop</label>
              <input
                id="crop"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder="Wheat"
                className="mt-1.5 w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-field-500 focus:border-field-500"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="farmsize" className="text-sm font-semibold text-stone-700">Farm size (acres)</label>
              <input
                id="farmsize"
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
                inputMode="decimal"
                placeholder="3"
                className="mt-1.5 w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-field-500 focus:border-field-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="stage" className="text-sm font-semibold text-stone-700">Growth stage</label>
              <select
                id="stage"
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value as GrowthStage)}
                className="mt-1.5 w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-field-500 focus:border-field-500"
              >
                {GROWTH_STAGES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            {error && (
              <p className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                {error}
              </p>
            )}
            <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 sm:items-center">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center items-center gap-2 rounded-xl bg-field-700 hover:bg-field-800 disabled:opacity-60 text-white font-semibold text-sm px-6 py-3 transition-colors"
              >
                {saving ? "Saving…" : "Analyze My Farm →"}
              </button>
              <p className="text-xs text-stone-500">Saved on this device; synced to cloud when Firebase is configured.</p>
            </div>
          </form>
        </section>

        {/* What you get */}
        <aside className="lg:col-span-2 space-y-4">
          {[
            { t: "Crop image analysis", d: "Upload a leaf photo. Gemini returns a structured AI assessment with confidence, visual indicators, and risk level." },
            { t: "Localised recommendations", d: "Advice grounded in your crop, stage, and representative weather + soil context — in farmer-friendly language." },
            { t: "7-day action plan", d: "A day-by-day monitoring plan, ending with a follow-up photo to track change." },
          ].map((c) => (
            <div key={c.t} className="ks-card p-5">
              <p className="text-sm font-bold text-field-800">{c.t}</p>
              <p className="mt-1 text-sm text-stone-600 leading-relaxed">{c.d}</p>
            </div>
          ))}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
            Weather and soil figures shown in this prototype are <strong>representative demo data</strong>,
            not live measurements. AI outputs are assessments — always confirm treatment decisions with a
            local agricultural expert.
          </div>
        </aside>
      </div>
    </div>
  );
}
