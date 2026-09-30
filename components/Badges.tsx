import type { RiskLevel } from "@/lib/types";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "demo" | "good" | "warn" | "bad" | "info";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-stone-100 text-stone-700 border-stone-200",
    demo: "bg-amber-50 text-amber-800 border-amber-200",
    good: "bg-field-50 text-field-700 border-field-200",
    warn: "bg-amber-50 text-amber-800 border-amber-200",
    bad: "bg-red-50 text-red-700 border-red-200",
    info: "bg-sky-50 text-sky-800 border-sky-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function RepresentativeBadge() {
  return <Badge tone="demo">Representative prototype data</Badge>;
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const tone = level === "Low" ? "good" : level === "Medium" ? "warn" : "bad";
  return <Badge tone={tone}>{level} risk</Badge>;
}

export function riskTone(level: RiskLevel): string {
  return level === "Low"
    ? "text-field-700"
    : level === "Medium"
      ? "text-amber-700"
      : "text-red-700";
}
