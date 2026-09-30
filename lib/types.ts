/** Shared TypeScript types for KrishiSense AI (hackathon MVP). */

export type GrowthStage =
  | "Germination"
  | "Tillering"
  | "Vegetative"
  | "Flowering"
  | "Grain Filling"
  | "Maturity"
  | "Harvest";

export type RiskLevel = "Low" | "Medium" | "High";

export interface FarmProfile {
  id: string;
  location: string;
  crop: string;
  farmSizeAcres: number;
  growthStage: GrowthStage;
  createdAt: string;
}

export interface AnalysisScores {
  /** 0–100, higher = healthier / lower risk as labelled per-card */
  health: number;
  diseaseRisk: number;
  waterStress: number;
  weatherRisk: number;
}

export interface ActionPlanDay {
  day: number;
  title: string;
  task: string;
}

export interface AnalysisResult {
  issue: string;
  /** 0–1 model confidence */
  confidence: number;
  confidenceLabel: "Low" | "Medium" | "High";
  indicators: string[];
  riskLevel: RiskLevel;
  contextualFactors: string[];
  nextActions: string[];
  disclaimer: string;
  scores: AnalysisScores;
  actionPlan: ActionPlanDay[];
}

export interface CropAnalysis {
  id: string;
  farmId: string;
  imageUrl: string;
  result: AnalysisResult;
  /** Snapshot of the representative context sent to the model. */
  mockContextUsed: RepresentativeContextSnapshot;
  demoMode: boolean;
  createdAt: string;
}

export interface RepresentativeContextSnapshot {
  weather: Record<string, string>;
  soil: Record<string, string>;
  cropInfo: Record<string, string>;
  note: string;
}

export interface AnalyzeRequestBody {
  imageDataUrl: string;
  farm: FarmProfile;
}
