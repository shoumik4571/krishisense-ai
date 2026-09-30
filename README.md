# KrishiSense AI

AI-powered agricultural intelligence and decision-support for small and marginal farmers in India.
Hackathon MVP for **GDG Code for Communities 2.0 — Track 4: Agricultural Intelligence**.

## Problem

Small and marginal farmers across India lack access to data-driven agricultural guidance.
Relying on traditional methods instead of satellite data, soil-health analytics, and climate
forecasting leads to crop failure and threatens food security. The absence of shared digital
infrastructure also blocks cross-state collaboration on climate-resilient farming.

## Solution

KrishiSense AI is an interoperable digital-agriculture network prototype that delivers
real-time, localised agro-advisories using AI:

**Farmer → farm profile → crop photo → Gemini AI assessment → localised recommendations → 7-day action plan → farm intelligence dashboard.**

## Key features

1. **Farm profile** — location, crop, farm size, growth stage (demo defaults: Meerut, UP / Wheat / 3 acres / Vegetative).
2. **Crop image analysis** — drag/drop upload or bundled demo image; Gemini 2.5 Flash returns a structured AI assessment (issue, confidence, visual indicators, risk level, contextual factors, next actions).
3. **Farm context** — photo combined with clearly-labelled *representative* weather, soil, and crop-stage context.
4. **7-day action plan** — day-by-day monitoring plan from the same Gemini response (no second call).
5. **Farm intelligence dashboard** — health score, disease / water / weather risk, current crop, latest AI recommendation, recent analyses.
6. **Regional intelligence** — prototype 5-state risk view (Punjab, Haryana, UP, Rajasthan, Maharashtra) with district drill-down.
7. **Firebase persistence** — anonymous auth + Firestore + Storage, with graceful local/demo fallback so the demo never breaks.

Safety: outputs are framed as AI assessments, never definitive diagnoses; no pesticide names or
dosages; every result advises consulting a qualified local agricultural expert / Krishi Vigyan Kendra.

## Architecture

```
Browser (Next.js App Router + Tailwind)
 ├─ /            farm profile form (local-first save)
 ├─ /analyze     upload → POST /api/analyze → result + 7-day plan
 ├─ /dashboard   health scores + risks + recent analyses
 └─ /regional    prototype state risk cards
Server
 └─ /api/analyze  builds prompt + representative context,
                  calls Gemini 2.5 Flash (multimodal, JSON schema),
                  validates with Zod, falls back to labelled demo output
Data
 ├─ localStorage  farm + analyses (always works)
 └─ Firebase      anonymous auth, Firestore (farms/analyses),
                  Storage (crop-images/) — best-effort enhancement
```

Single Next.js app, no microservices. One Gemini call per analysis.

## Google technologies used

- **Gemini 2.5 Flash** (`@google/genai` SDK, server-side only) — multimodal crop analysis, recommendations, 7-day plan.
- **Firebase** — Anonymous Authentication, Firestore, Storage (all optional with local fallback).
- **Next.js + TypeScript + Tailwind CSS** — App Router UI.

## AI workflow

1. Client compresses the image in-browser and POSTs `{ imageDataUrl, farm }` to `/api/analyze`.
2. Route builds representative weather/soil/crop context (`lib/mock-context.ts`) and a guardrailed prompt (`lib/gemini.ts`).
3. Gemini 2.5 Flash returns **JSON only** under `responseJsonSchema`; Zod validates shape.
4. Client renders the assessment + 7-day timeline, saves locally, and best-effort syncs to Firebase.
5. If `GEMINI_API_KEY` is missing or the call fails → clearly-labelled demo fallback (`lib/demo-fallback.ts`) so the demo continues.

## Representative-data disclaimer

Weather, soil, and regional figures in this MVP are **representative prototype data for demo
purposes — not live satellite, weather-station, soil-lab, or government data**. The UI marks them
with “Representative prototype data” badges and every analysis disclaimer restates this.

## Local setup

```bash
cd krishisense-ai
npm install
cp .env.local.example .env.local   # then fill in keys
npm run dev                        # http://localhost:3000
```

Demo flow: `/` (farm profile, prefilled) → **Analyze My Farm** → `/analyze` (Use demo image → Analyze crop) → result + 7-day plan → `/dashboard` → `/regional`.

The app runs fully without any keys (local demo mode with labelled fallback output).

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `GEMINI_API_KEY` | For live AI | Server-side only. Never prefixed with `NEXT_PUBLIC_`. Without it, analyses use the labelled demo fallback. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | For cloud sync | Optional. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | For cloud sync | Optional. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | For cloud sync | Optional. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | For cloud sync | Optional. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | For cloud sync | Optional. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | For cloud sync | Optional. |

No Firebase credentials or secrets are hardcoded. `GEMINI_API_KEY` is read only in `app/api/analyze/route.ts` and `lib/gemini.ts` (server imports); no client component references it.

## Future scalability (not built in this MVP)

- Google Earth Engine / satellite feeds for canopy and stress signals.
- Live weather APIs replacing representative outlook data.
- Soil-health datasets and lab integrations.
- Multilingual and voice interfaces for low-literacy access.
- State-level agricultural data interoperability (shared schemas/APIs across states).
- More crops, districts, and states; role-based access for extension officers.
