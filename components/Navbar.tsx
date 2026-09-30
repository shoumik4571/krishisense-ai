"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadAnalysesLocal } from "@/lib/db";
import { isFirebaseConfigured } from "@/lib/firebase";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analyze", label: "Analyze" },
  { href: "/regional", label: "Regional Intelligence" },
];

export const ANALYSIS_COMPLETE_EVENT = "krishisense:analysis-complete";

/** Last saved analysis outcome, if any (null when no analysis exists yet). */
function readLatestDemoMode(): boolean | null {
  if (typeof window === "undefined") return null;
  const latest = loadAnalysesLocal()[0];
  return latest ? latest.demoMode : null;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mode] = useState<"cloud" | "local">(() =>
    isFirebaseConfigured() ? "cloud" : "local",
  );
  const [open, setOpen] = useState(false);
  const [aiDemoMode, setAiDemoMode] = useState<boolean | null>(() => readLatestDemoMode());

  useEffect(() => {
    const handler = (e: Event) => {
      setAiDemoMode((e as CustomEvent<{ demoMode: boolean }>).detail.demoMode);
    };
    window.addEventListener(ANALYSIS_COMPLETE_EVENT, handler);
    return () => window.removeEventListener(ANALYSIS_COMPLETE_EVENT, handler);
  }, []);

  // On the Analyze page, the badge reflects live AI status once an analysis
  // exists; every other page keeps the Firebase sync badge.
  const showAiBadge = pathname === "/analyze" && aiDemoMode !== null;

  return (
    <header className="sticky top-0 z-40 border-b border-field-200/70 bg-white/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="KrishiSense AI home">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-field-700 text-white font-bold text-lg" aria-hidden>
            कृ
          </span>
          <span className="leading-tight">
            <span className="block font-bold text-field-900 text-[15px] tracking-tight">KrishiSense AI</span>
            <span className="block text-[11px] text-stone-500">Agricultural Intelligence</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-6" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "bg-field-100 text-field-800"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {showAiBadge ? (
            <span
              title={aiDemoMode ? "Last analysis ran in local demo mode" : "Last analysis used live AI"}
              className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                aiDemoMode
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-field-50 text-field-700 border-field-200"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${aiDemoMode ? "bg-amber-500" : "bg-field-500"}`} />
              {aiDemoMode ? "Local demo mode" : "Live AI analysis"}
            </span>
          ) : (
          <span
            title={mode === "cloud" ? "Firebase persistence enabled" : "Running in local demo mode — Firebase not configured"}
            className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              mode === "cloud"
                ? "bg-field-50 text-field-700 border-field-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${mode === "cloud" ? "bg-field-500" : "bg-amber-500"}`} />
            {mode === "cloud" ? "Cloud sync on" : "Local demo mode"}
          </span>
          )}
          <button
            className="md:hidden p-2 rounded-lg border border-stone-200 text-stone-700"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden border-t border-stone-100 bg-white px-4 py-2" aria-label="Mobile">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                pathname === l.href ? "bg-field-100 text-field-800" : "text-stone-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
