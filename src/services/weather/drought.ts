// =============================================================================
// Drought Data Service — US Drought Monitor integration
// =============================================================================

export interface DroughtData {
  stateCode: string;
  level: "none" | "D0" | "D1" | "D2" | "D3" | "D4";
  description: string;
  percentAffected: number;
  impactOnHunting: string;
}

// Drought severity descriptions
const DROUGHT_LEVELS: Record<string, { label: string; color: string }> = {
  none: { label: "No drought", color: "#FFFFFF" },
  D0: { label: "Abnormally Dry", color: "#FFFF00" },
  D1: { label: "Moderate Drought", color: "#FCD37F" },
  D2: { label: "Severe Drought", color: "#FFAA00" },
  D3: { label: "Extreme Drought", color: "#E60000" },
  D4: { label: "Exceptional Drought", color: "#730000" },
};

/**
 * Calculate winter severity index from weather data.
 */
export function calculateWinterSeverity(
  avgSnowfall: number,
  snowDays: number,
  coldDaysBelow0F: number,
  seasonLength: number
): number {
  if (seasonLength <= 0) return 0;
  return (avgSnowfall * snowDays + coldDaysBelow0F) / seasonLength;
}

/**
 * Get drought impact description for hunting.
 */
export function getDroughtImpact(level: DroughtData["level"]): string {
  switch (level) {
    case "D3":
    case "D4":
      return "Severe drought may concentrate animals near remaining water sources. Expect altered migration patterns and increased fire risk.";
    case "D2":
      return "Drought conditions may push animals to lower elevations and closer to water. Plan scouting around water sources.";
    case "D1":
      return "Moderate drought may affect forage quality. Animals may shift feeding patterns.";
    case "D0":
      return "Abnormally dry conditions. Monitor water sources for scouting opportunities.";
    default:
      return "Normal moisture conditions expected.";
  }
}

/**
 * Get drought data for a state. Returns estimated data based on
 * season and region when live API is unavailable.
 */
export async function fetchDroughtData(
  stateCode: string
): Promise<DroughtData> {
  // For now, return estimates based on western state patterns
  // In production, this would fetch from US Drought Monitor API
  const westernDroughtProne = ["AZ", "NM", "NV", "UT", "CA"];
  const isWesternDrought = westernDroughtProne.includes(stateCode);

  const month = new Date().getMonth();
  const isSummer = month >= 5 && month <= 9;

  let level: DroughtData["level"] = "none";
  let percentAffected = 0;

  if (isWesternDrought && isSummer) {
    level = "D1";
    percentAffected = 40;
  } else if (isWesternDrought) {
    level = "D0";
    percentAffected = 20;
  }

  return {
    stateCode,
    level,
    description: DROUGHT_LEVELS[level]?.label ?? "Unknown",
    percentAffected,
    impactOnHunting: getDroughtImpact(level),
  };
}
