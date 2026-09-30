import type { RiskLevel } from "./types";

/**
 * REPRESENTATIVE PROTOTYPE DATA — not official government data and not real
 * current conditions. Demonstrates how KrishiSense could scale to a
 * state-level interoperable view.
 */
export interface RegionDistrict {
  name: string;
  risk: RiskLevel;
  note: string;
}

export interface RegionInfo {
  state: string;
  overallRisk: RiskLevel;
  diseaseRisk: number;
  waterStress: number;
  weatherRisk: number;
  summary: string;
  advisory: string;
  districts: RegionDistrict[];
}

export const PROTOTYPE_BANNER =
  "Representative prototype data — not official government data.";

export const REGIONS: RegionInfo[] = [
  {
    state: "Punjab",
    overallRisk: "Low",
    diseaseRisk: 22,
    waterStress: 30,
    weatherRisk: 18,
    summary:
      "Canopy conditions broadly favourable. Representative signals show low foliar-disease pressure across major wheat belts.",
    advisory:
      "Continue routine scouting; maintain irrigation schedule. No immediate intervention indicated by representative signals.",
    districts: [
      { name: "Ludhiana", risk: "Low", note: "Healthy canopy, adequate moisture" },
      { name: "Amritsar", risk: "Low", note: "Low pest reports (representative)" },
      { name: "Bathinda", risk: "Medium", note: "Early water-stress patches in sandy blocks" },
    ],
  },
  {
    state: "Haryana",
    overallRisk: "Medium",
    diseaseRisk: 45,
    waterStress: 52,
    weatherRisk: 35,
    summary:
      "Mixed signals: moderate foliar-disease risk in canal-irrigated blocks and emerging moisture stress in rainfed pockets.",
    advisory:
      "Increase scouting frequency to twice weekly; prioritise fields showing yellowing margins.",
    districts: [
      { name: "Karnal", risk: "Medium", note: "Moderate rust-conducive humidity" },
      { name: "Hisar", risk: "Medium", note: "Moisture stress in peripheral blocks" },
      { name: "Rohtak", risk: "Low", note: "Stable conditions" },
    ],
  },
  {
    state: "Uttar Pradesh",
    overallRisk: "High",
    diseaseRisk: 72,
    waterStress: 58,
    weatherRisk: 61,
    summary:
      "Elevated composite risk: representative humidity and temperature windows favour leaf-rust development; uneven rainfall raises weather risk.",
    advisory:
      "Inspect wheat fields immediately, especially lower canopy. Consult local agri experts before any treatment decision.",
    districts: [
      { name: "Meerut", risk: "High", note: "Rust-conducive humidity, dense canopy" },
      { name: "Lucknow", risk: "Medium", note: "Moderate pressure, watch low-lying plots" },
      { name: "Agra", risk: "Medium", note: "Moisture stress + mild disease signals" },
    ],
  },
  {
    state: "Rajasthan",
    overallRisk: "Low",
    diseaseRisk: 18,
    waterStress: 48,
    weatherRisk: 25,
    summary:
      "Disease pressure low in representative data; water management remains the main watch-item in arid blocks.",
    advisory:
      "Protect soil moisture with mulching; routine scouting sufficient for disease.",
    districts: [
      { name: "Jaipur", risk: "Low", note: "Stable, dry canopy unfavourable to rust" },
      { name: "Sri Ganganagar", risk: "Medium", note: "Irrigation-dependent blocks need watching" },
      { name: "Udaipur", risk: "Low", note: "Favourable conditions" },
    ],
  },
  {
    state: "Maharashtra",
    overallRisk: "Medium",
    diseaseRisk: 50,
    waterStress: 62,
    weatherRisk: 44,
    summary:
      "Moderate risk driven mainly by water stress in rainfed belts; scattered leaf-spot signals in representative data.",
    advisory:
      "Prioritise moisture conservation; scout for leaf spots after any rain event.",
    districts: [
      { name: "Nashik", risk: "Medium", note: "Leaf-spot watch after showers" },
      { name: "Nagpur", risk: "Medium", note: "Heat + moisture stress" },
      { name: "Pune", risk: "Low", note: "Stable conditions" },
    ],
  },
];
