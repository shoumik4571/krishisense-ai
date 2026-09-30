import type { ValidatedAnalysis } from "./gemini";

/**
 * Deterministic demo fallback used when GEMINI_API_KEY is missing or the
 * Gemini call fails. Clearly labelled as a demo so the stage demo never
 * breaks. Does NOT claim to be a model diagnosis.
 */
export function demoFallbackAnalysis(crop: string, growthStage: string): ValidatedAnalysis {
  return {
    issue: `Possible early leaf-rust-like symptoms on ${crop} — AI assessment (demo fallback, not a diagnosis)`,
    confidence: 0.62,
    confidenceLabel: "Medium",
    indicators: [
      "Small orange-brown pustule-like spots visible on leaf surface",
      "Mild yellowing (chlorosis) around some spots",
      "Symptoms appear scattered rather than uniform across the leaf",
      "Lower canopy appears slightly more affected in the image",
    ],
    riskLevel: "Medium",
    contextualFactors: [
      `${growthStage} stage canopy is dense, holding morning humidity that favours foliar issues`,
      "Representative weather shows warm days with humid mornings — conducive to rust-like spread",
      "Representative soil moisture is moderate; stressed patches can be more vulnerable",
      "Image quality is limited — field-level inspection is needed to confirm",
    ],
    nextActions: [
      "Inspect the affected area on foot, checking lower leaves first",
      "Mark affected patches and monitor whether spots spread over 2–3 days",
      "Avoid overhead irrigation for now to reduce leaf wetness",
      "Photograph the same leaves daily for comparison",
      "Consult your local Krishi Vigyan Kendra or agri extension officer before any treatment",
    ],
    disclaimer:
      "This is an AI assessment for guidance only, generated in offline demo mode without live model analysis. It is not a definitive diagnosis and prescribes no chemical treatment. Please consult a qualified local agricultural expert or Krishi Vigyan Kendra for treatment decisions. Weather and soil context used were representative prototype data, not live measurements.",
    scores: {
      health: 68,
      diseaseRisk: 55,
      waterStress: 38,
      weatherRisk: 47,
    },
    actionPlan: [
      { day: 1, title: "Inspect affected area", task: "Walk the field and examine lower leaves of nearby plants; mark affected patches with a stick or flag." },
      { day: 2, title: "Monitor spread", task: "Re-check marked patches. Note whether spots increased, stayed the same, or dried out." },
      { day: 3, title: "Reduce leaf wetness", task: "Prefer morning irrigation at the base; avoid wetting leaves in the evening." },
      { day: 4, title: "Reassess crop condition", task: "Compare new photos with Day 1. Check for fresh spots on new leaves." },
      { day: 5, title: "Seek local expert advice", task: "Share photos and observations with your local agri extension officer or KVK." },
      { day: 6, title: "Review field hygiene", task: "Remove heavily affected fallen leaves from the plot edge; keep tools clean." },
      { day: 7, title: "Upload follow-up image", task: "Capture a fresh close-up of the same leaves and run a new analysis to track change." },
    ],
  };
}
