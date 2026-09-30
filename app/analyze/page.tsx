"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ActionPlanTimeline from "@/components/ActionPlanTimeline";
import AnalysisResultCard from "@/components/AnalysisResultCard";
import { RepresentativeBadge } from "@/components/Badges";
import { ANALYSIS_COMPLETE_EVENT } from "@/components/Navbar";
import {
  loadFarmLocal,
  persistAnalysisRemote,
  saveAnalysisLocal,
  uploadImageRemote,
} from "@/lib/db";
import type {
  AnalysisResult,
  CropAnalysis,
  FarmProfile,
  RepresentativeContextSnapshot,
} from "@/lib/types";

type Status = "idle" | "analyzing" | "done" | "error";

function compressToDataUrl(file: File, maxDim = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unavailable");
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image file."));
    };
    img.src = url;
  });
}

export default function AnalyzePage() {
  const router = useRouter();
  const [farm] = useState<FarmProfile | null>(() => {
    if (typeof window === "undefined") return null;
    return loadFarmLocal();
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [mockCtx, setMockCtx] = useState<RepresentativeContextSnapshot | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [usedDemoImage, setUsedDemoImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (farm !== null) return;
    const t = setTimeout(() => router.replace("/"), 0);
    return () => clearTimeout(t);
  }, [farm, router]);

  const setFile = useCallback(async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG or PNG).");
      return;
    }
    setError(null);
    try {
      const dataUrl = await compressToDataUrl(file);
      setPreview(dataUrl);
      setUsedDemoImage(false);
    } catch {
      setError("Could not read that image. Try another file or the demo image.");
    }
  }, []);

  async function useDemoImage() {
    setError(null);
    try {
      const res = await fetch("/demo/wheat-leaf.png");
      if (!res.ok) throw new Error("demo fetch failed");
      const blob = await res.blob();
      const dataUrl = await compressToDataUrl(new File([blob], "wheat-leaf.png", { type: "image/png" }));
      setPreview(dataUrl);
      setUsedDemoImage(true);
    } catch {
      setError("Demo image could not be loaded. Please upload a photo instead.");
    }
  }

  async function handleAnalyze() {
    if (!farm || !preview || status === "analyzing") return;
    setStatus("analyzing");
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: preview, farm }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Analysis failed. Please try again.");

      setResult(json.result as AnalysisResult);
      setMockCtx(json.mockContextUsed as RepresentativeContextSnapshot);
      setDemoMode(Boolean(json.demoMode));
      setStatus("done");
      window.dispatchEvent(
        new CustomEvent(ANALYSIS_COMPLETE_EVENT, { detail: { demoMode: Boolean(json.demoMode) } }),
      );

      const analysis: CropAnalysis = {
        id: `analysis-${Date.now()}`,
        farmId: farm.id,
        imageUrl: preview,
        result: json.result as AnalysisResult,
        mockContextUsed: json.mockContextUsed as RepresentativeContextSnapshot,
        demoMode: Boolean(json.demoMode),
        createdAt: new Date().toISOString(),
      };
      saveAnalysisLocal(analysis);
      // Best-effort cloud backup — never blocks the demo.
      uploadImageRemote(farm.id, analysis.id, preview)
        .then((url) => {
          if (url) analysis.imageUrl = url;
          return persistAnalysisRemote(analysis);
        })
        .catch(() => {});
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    }
  }

  if (!farm) {
    return (
      <div className="ks-card p-10 text-center">
        <p className="text-sm text-stone-500">Loading farm profile…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Crop health analysis</h1>
          <p className="mt-1 text-sm text-stone-500">
            {farm.crop} · {farm.growthStage} · {farm.location} · {farm.farmSizeAcres} acres
          </p>
        </div>
        <Link href="/" className="text-sm font-medium text-field-700 hover:underline">
          ← Edit farm profile
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload panel */}
        <section className="ks-card p-5 sm:p-6" aria-labelledby="upload-heading">
          <h2 id="upload-heading" className="text-base font-bold text-stone-900">Upload a crop / leaf photo</h2>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); void setFile(e.dataTransfer.files?.[0] ?? null); }}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
            role="button"
            tabIndex={0}
            aria-label="Upload crop image — click or drag and drop"
            className={`mt-4 grid place-items-center rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden ${
              dragOver ? "border-field-500 bg-field-50" : "border-stone-300 bg-stone-50 hover:border-field-400"
            } ${preview ? "min-h-[220px]" : "min-h-[260px]"}`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void setFile(e.target.files?.[0] ?? null)}
            />
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Uploaded crop preview" className="max-h-[380px] w-full object-contain bg-stone-900/5" />
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="text-4xl" aria-hidden>🌾</p>
                <p className="mt-2 text-sm font-semibold text-stone-700">Drag & drop a leaf photo, or click to browse</p>
                <p className="mt-1 text-xs text-stone-500">JPG or PNG · compressed in-browser before upload</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={useDemoImage}
              className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100"
            >
              Use demo image
            </button>
            {preview && (
              <button
                type="button"
                onClick={() => { setPreview(null); setUsedDemoImage(false); setResult(null); setStatus("idle"); }}
                className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100"
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!preview || status === "analyzing"}
              className="rounded-lg bg-field-700 hover:bg-field-800 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white"
            >
              {status === "analyzing" ? "Analyzing with Gemini…" : "Analyze crop"}
            </button>
          </div>
          {usedDemoImage && (
            <p className="mt-2 text-xs text-stone-500">Using bundled demo image (<code>public/demo/wheat-leaf.png</code>).</p>
          )}

          {status === "analyzing" && (
            <div className="mt-4 rounded-xl border border-field-200 bg-field-50 p-4" role="status" aria-live="polite">
              <div className="flex items-center gap-3">
                <span className="inline-block w-5 h-5 rounded-full border-2 border-field-300 border-t-field-700 animate-spin" aria-hidden />
                <p className="text-sm text-field-800 font-medium">Gemini 2.5 Flash is examining the image and farm context…</p>
              </div>
            </div>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5" role="alert">
              {error}
            </p>
          )}
          <p className="mt-3 text-xs text-stone-500">
            Analysis combines your photo with <RepresentativeBadge /> weather + soil context.
          </p>
        </section>

        {/* Result panel */}
        <section aria-labelledby="result-heading" aria-live="polite">
          <h2 id="result-heading" className="sr-only">Analysis result</h2>
          {!result && status !== "analyzing" && (
            <div className="ks-card p-8 text-center h-full grid place-items-center min-h-[300px]">
              <div>
                <p className="text-4xl" aria-hidden>🔍</p>
                <p className="mt-3 text-sm font-semibold text-stone-700">No analysis yet</p>
                <p className="mt-1 text-sm text-stone-500 max-w-xs mx-auto">
                  Upload a photo (or use the demo image) and press “Analyze crop” to get the AI assessment and 7-day plan.
                </p>
              </div>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              {demoMode && (
                <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Served in demo mode (Gemini unavailable or returned an error). Output is illustrative — treat it as a placeholder assessment.
                </p>
              )}
              <AnalysisResultCard result={result} />
            </div>
          )}
        </section>
      </div>

      {/* 7-day plan — same Gemini response, no second call */}
      {result && mockCtx && (
        <section className="ks-card p-5 sm:p-6" aria-labelledby="plan-heading">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="plan-heading" className="text-base font-bold text-stone-900">7-day monitoring & action plan</h2>
            <RepresentativeBadge />
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Generated with the analysis above — no extra AI call. Day 7 ends with a follow-up photo.
          </p>
          <div className="mt-5 max-w-2xl">
            <ActionPlanTimeline plan={result.actionPlan} />
          </div>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              href="/dashboard"
              className="rounded-lg bg-field-700 hover:bg-field-800 px-5 py-2.5 text-sm font-semibold text-white"
            >
              View farm dashboard →
            </Link>
            <Link
              href="/regional"
              className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100"
            >
              Regional intelligence
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
