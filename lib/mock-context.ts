import type { RepresentativeContextSnapshot } from "./types";

/**
 * REPRESENTATIVE / PROTOTYPE DATA — NOT live satellite, weather-station, or
 * soil-lab data. Values below are plausible placeholders for the hackathon
 * demo so the AI has farm context to reason over. Every consumer must surface
 * the `note` alongside these values.
 */
const PROTOTYPE_NOTE =
  "Representative prototype data for demo purposes — not live satellite, weather-station, or soil-lab data.";

export function getRepresentativeContext(
  location: string,
  crop: string,
  growthStage: string,
): RepresentativeContextSnapshot {
  const loc = location.toLowerCase();
  const isNorthPlains =
    loc.includes("meerut") ||
    loc.includes("uttar pradesh") ||
    loc.includes("punjab") ||
    loc.includes("haryana");

  return {
    weather: {
      "Condition (representative)": isNorthPlains
        ? "Partly cloudy, warm days"
        : "Warm with scattered clouds",
      "Temperature (representative)": isNorthPlains
        ? "28°C day / 16°C night"
        : "30°C day / 20°C night",
      "Humidity (representative)": "55–65% (morning higher)",
      "Rainfall, last 7 days (representative)": "8–12 mm, uneven",
      "Wind (representative)": "10–14 km/h, NW",
      "7-day outlook (representative)":
        "Light showers possible mid-week; otherwise dry and warm",
    },
    soil: {
      "Soil type (representative)": isNorthPlains
        ? "Alluvial loam, typical of western UP plains"
        : "Loam (representative)",
      "pH (representative)": "7.0–7.4 (neutral to mildly alkaline)",
      "Moisture (representative)": "Moderate — topsoil drying between irrigations",
      "Organic matter (representative)": "Low–medium (~0.5%)",
      "NPK status (representative)":
        "Nitrogen medium, Phosphorus medium, Potassium adequate",
    },
    cropInfo: {
      Crop: crop,
      "Growth stage": growthStage,
      "Stage note (representative)":
        growthStage === "Vegetative"
          ? "Active tillering/leaf expansion — canopy closing, high nutrient and water demand"
          : `${growthStage} stage — monitor stress closely`,
      "Sowing window (representative)":
        crop.toLowerCase() === "wheat"
          ? "Late Oct – late Nov (rabi season, north India)"
          : "Season-typical window (representative)",
      "Common regional pressures (representative)":
        crop.toLowerCase() === "wheat"
          ? "Leaf rust, yellow rust, aphids, terminal heat if sown late"
          : "Leaf spots, sucking pests, moisture stress",
    },
    note: PROTOTYPE_NOTE,
  };
}
