/**
 * KrishiSense AI — server-side Gemini integration (gemini-3.8-flash primary).
 *
 * IMPORTANT: this module must only be imported from server-side code
 * (Route Handlers / Server Components). GEMINI_API_KEY must never reach
 * the browser, and must never be logged.
 */
import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

export const GEMINI_MODEL = "gemini-3.8-flash";
// Fallback model — verified live on 2026-09-30 via an actual generateContent
// call with this project's key (HTTP 200). gemini-2.5-flash and
// gemini-2.5-flash-lite both return 404 ("no longer available to new users").
export const GEMINI_FALLBACK_MODEL = "gemini-flash-lite-latest";

export const AnalysisResultSchema = z.object({
  issue: z.string().min(10),
  confidence: z.number().min(0).max(1),
  confidenceLabel: z.enum(["Low", "Medium", "High"]),
  indicators: z.array(z.string()).min(2).max(8),
  riskLevel: z.enum(["Low", "Medium", "High"]),
  contextualFactors: z.array(z.string()).min(1).max(6),
  nextActions: z.array(z.string()).min(2).max(8),
  disclaimer: z.string().min(10),
  scores: z.object({
    health: z.number().min(0).max(100),
    diseaseRisk: z.number().min(0).max(100),
    waterStress: z.number().min(0).max(100),
    weatherRisk: z.number().min(0).max(100),
  }),
  actionPlan: z
    .array(
      z.object({
        day: z.number().int().min(1).max(7),
        title: z.string().min(3),
        task: z.string().min(10),
      }),
    )
    .length(7),
});

export type ValidatedAnalysis = z.infer<typeof AnalysisResultSchema>;

/**
 * Retry policy for transient Gemini errors.
 * - Retries HTTP 429 (rate limited) and 503 (model overloaded) only.
 * - Permanent errors (400, 401, 403, 404, …) are never retried and never
 *   trigger the fallback model.
 * - Primary delays: ~1s, ~2s (~4s cap), max 3 attempts total.
 * - If the primary is still failing retryably after all attempts, ONE
 *   single attempt is made with GEMINI_FALLBACK_MODEL.
 */
const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [1000, 2000, 4000];
const RETRYABLE_STATUS = new Set([429, 503]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Extract an HTTP status code from SDK / fetch errors without logging secrets. */
function getErrorStatus(err: unknown): number | null {
  if (typeof err !== "object" || err === null) return null;
  const status = (err as { status?: unknown }).status;
  if (typeof status === "number" && Number.isInteger(status)) return status;
  const code = (err as { code?: unknown }).code;
  if (typeof code === "number" && Number.isInteger(code)) return code;
  const message = (err as { message?: unknown }).message;
  if (typeof message === "string") {
    const m = /\b(400|401|403|404|408|429|500|502|503|504)\b/.exec(message);
    if (m) return Number(m[1]);
  }
  return null;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    issue: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    confidenceLabel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
    indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
    riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
    contextualFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
    nextActions: { type: Type.ARRAY, items: { type: Type.STRING } },
    disclaimer: { type: Type.STRING },
    scores: {
      type: Type.OBJECT,
      properties: {
        health: { type: Type.NUMBER },
        diseaseRisk: { type: Type.NUMBER },
        waterStress: { type: Type.NUMBER },
        weatherRisk: { type: Type.NUMBER },
      },
      required: ["health", "diseaseRisk", "waterStress", "weatherRisk"],
    },
    actionPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          title: { type: Type.STRING },
          task: { type: Type.STRING },
        },
        required: ["day", "title", "task"],
      },
    },
  },
  required: [
    "issue",
    "confidence",
    "confidenceLabel",
    "indicators",
    "riskLevel",
    "contextualFactors",
    "nextActions",
    "disclaimer",
    "scores",
    "actionPlan",
  ],
};

export function buildPrompt(args: {
  crop: string;
  growthStage: string;
  location: string;
  farmSizeAcres: number;
  weather: Record<string, string>;
  soil: Record<string, string>;
  cropInfo: Record<string, string>;
}): string {
  const { crop, growthStage, location, farmSizeAcres, weather, soil, cropInfo } =
    args;
  const fmt = (o: Record<string, string>) =>
    Object.entries(o)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n");
  return [
    "You are KrishiSense AI, an agricultural decision-support assistant for small and marginal farmers in India.",
    "Analyse the attached crop/leaf image together with the farm context below.",
    "",
    `Crop: ${crop}`,
    `Growth stage: ${growthStage}`,
    `Location: ${location}`,
    `Farm size: ${farmSizeAcres} acres`,
    "",
    "REPRESENTATIVE WEATHER CONTEXT (prototype demo data, NOT live observations):",
    fmt(weather),
    "",
    "REPRESENTATIVE SOIL CONTEXT (prototype demo data, NOT lab measurements):",
    fmt(soil),
    "",
    "CROP CONTEXT:",
    fmt(cropInfo),
    "",
    "SAFETY AND ACCURACY RULES (must follow):",
    "1. Present the finding as an AI assessment with uncertainty — never a definitive diagnosis.",
    "2. NEVER recommend specific pesticide/chemical names, brands, or dosages.",
    "3. Do not invent scientific certainty; express confidence honestly via the confidence score and label.",
    "4. Use simple, farmer-friendly language.",
    '5. The disclaimer must advise consulting a qualified local agricultural expert / Krishi Vigyan Kendra for treatment decisions, and must state the weather/soil context used was representative prototype data, not live measurements.',
    "6. Provide exactly 7 action-plan days (Day 1 = inspect affected area, Day 7 = upload a follow-up image).",
    "7. Respond with JSON ONLY, matching the provided schema. No markdown, no extra text.",
    "8. Respect the farmer-provided crop growth stage. Do not replace or contradict it with a different growth stage. You may describe more specific characteristics within that stage, but the supplied stage is authoritative.",
  ].join("\n");
}

export interface AnalysisInput {
  imageBase64: string;
  mimeType: string;
  crop: string;
  growthStage: string;
  location: string;
  farmSizeAcres: number;
  weather: Record<string, string>;
  soil: Record<string, string>;
  cropInfo: Record<string, string>;
}

/**
 * One generateContent attempt against the given model. Prompt, image
 * payload, response schema, and decoding are identical for primary and
 * fallback — only the model name differs.
 */
async function requestModelText(
  ai: GoogleGenAI,
  model: string,
  args: AnalysisInput,
): Promise<string> {
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: args.mimeType,
              data: args.imageBase64,
            },
          },
          { text: buildPrompt(args) },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: RESPONSE_SCHEMA,
      temperature: 0.4,
      maxOutputTokens: 4096,
    },
  });
  const text = response.text?.trim() ?? "";
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

/** Successful analysis plus the name of the model that generated it. */
export interface AnalysisOutcome {
  result: ValidatedAnalysis;
  model: string;
}

export async function analyzeWithGemini(
  args: AnalysisInput,
): Promise<AnalysisOutcome> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const ai = new GoogleGenAI({ apiKey });

  let text: string | null = null;
  let servingModel = GEMINI_MODEL;

  // Primary model with retry/backoff on 429 + 503.
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      text = await requestModelText(ai, GEMINI_MODEL, args);
      break;
    } catch (err) {
      const status = getErrorStatus(err);
      const retryable = status !== null && RETRYABLE_STATUS.has(status);
      // Permanent errors fail immediately and never trigger the fallback.
      if (!retryable) throw err;
      if (attempt >= MAX_ATTEMPTS) break;
      await sleep(RETRY_DELAYS_MS[attempt - 1] ?? 4000);
    }
  }

  if (text === null) {
    // Primary exhausted on retryable errors — one fallback attempt.
    // Any fallback failure propagates to the route's demo fallback.
    text = await requestModelText(ai, GEMINI_FALLBACK_MODEL, args);
    servingModel = GEMINI_FALLBACK_MODEL;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Strip accidental code fences if the model wrapped the JSON.
    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    parsed = JSON.parse(cleaned);
  }
  return { result: AnalysisResultSchema.parse(parsed), model: servingModel };
}
