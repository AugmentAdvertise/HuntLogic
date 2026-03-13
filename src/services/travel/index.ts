// =============================================================================
// Travel & Logistics Service — Cost estimation and trip planning
// =============================================================================

import { db } from "@/lib/db";
import { appConfig } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// =============================================================================
// Types
// =============================================================================

export interface CostEstimate {
  flight: number;
  fuel: number;
  lodging: number;
  food: number;
  tags: number;
  total: number;
}

export interface TravelConfig {
  flightTiers: { maxMiles: number; cost: number }[];
  lodging: Record<string, number>;
  fuel: { avgPrice: number; avgMpg: number };
  food: { dailyEstimate: number };
}

// Default travel config (fallback when DB not populated)
const DEFAULT_CONFIG: TravelConfig = {
  flightTiers: [
    { maxMiles: 500, cost: 200 },
    { maxMiles: 1000, cost: 350 },
    { maxMiles: 1500, cost: 450 },
    { maxMiles: Infinity, cost: 550 },
  ],
  lodging: {
    camp: 15,
    budget: 100,
    mid: 150,
  },
  fuel: {
    avgPrice: 3.5,
    avgMpg: 20,
  },
  food: {
    dailyEstimate: 40,
  },
};

// State center coordinates for distance calculation
const STATE_COORDS: Record<string, { lat: number; lng: number }> = {
  CO: { lat: 39.0, lng: -105.5 },
  WY: { lat: 43.0, lng: -107.5 },
  MT: { lat: 47.0, lng: -109.6 },
  ID: { lat: 44.1, lng: -114.7 },
  AZ: { lat: 34.3, lng: -111.7 },
  NM: { lat: 34.5, lng: -106.0 },
  UT: { lat: 39.3, lng: -111.7 },
  NV: { lat: 39.9, lng: -116.9 },
  OR: { lat: 43.8, lng: -120.6 },
  WA: { lat: 47.4, lng: -120.7 },
  KS: { lat: 38.5, lng: -98.3 },
  TX: { lat: 31.5, lng: -99.4 },
  SD: { lat: 44.3, lng: -100.3 },
  AL: { lat: 32.3, lng: -86.9 },
  AR: { lat: 34.7, lng: -92.3 },
  CA: { lat: 36.8, lng: -119.4 },
  CT: { lat: 41.6, lng: -72.7 },
  FL: { lat: 27.8, lng: -81.8 },
  GA: { lat: 32.2, lng: -83.4 },
  IA: { lat: 41.9, lng: -93.1 },
  IL: { lat: 40.3, lng: -89.0 },
  IN: { lat: 40.3, lng: -86.1 },
  LA: { lat: 31.2, lng: -92.2 },
  MA: { lat: 42.4, lng: -71.4 },
  MD: { lat: 39.0, lng: -76.6 },
  ME: { lat: 45.3, lng: -69.4 },
  MI: { lat: 44.3, lng: -85.6 },
  MN: { lat: 46.7, lng: -94.7 },
  MO: { lat: 38.5, lng: -92.3 },
  MS: { lat: 32.7, lng: -89.7 },
  NC: { lat: 35.8, lng: -80.8 },
  ND: { lat: 47.5, lng: -100.5 },
  NE: { lat: 41.5, lng: -99.8 },
  NH: { lat: 43.2, lng: -71.6 },
  NJ: { lat: 40.1, lng: -74.4 },
  NY: { lat: 43.0, lng: -75.5 },
  OH: { lat: 40.4, lng: -82.9 },
  OK: { lat: 35.5, lng: -97.5 },
  PA: { lat: 41.2, lng: -77.2 },
  RI: { lat: 41.6, lng: -71.5 },
  SC: { lat: 33.8, lng: -81.2 },
  TN: { lat: 35.5, lng: -86.0 },
  VA: { lat: 37.4, lng: -78.2 },
  VT: { lat: 44.6, lng: -72.6 },
  WI: { lat: 43.8, lng: -88.8 },
  WV: { lat: 38.6, lng: -80.6 },
};

// =============================================================================
// estimateDistance — Haversine distance between two state centers
// =============================================================================

export function estimateDistanceMiles(
  fromState: string,
  toState: string
): number {
  const from = STATE_COORDS[fromState];
  const to = STATE_COORDS[toState];

  if (!from || !to) return 1000; // default

  const R = 3959; // Earth radius in miles
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;

  return Math.round(straightLine * 1.3); // routing factor
}

export function estimateDriveHours(
  fromState: string,
  toState: string
): number {
  const miles = estimateDistanceMiles(fromState, toState);
  return Math.round((miles / 50) * 10) / 10; // 50 mph average
}

// =============================================================================
// estimateFlightCost
// =============================================================================

export function estimateFlightCost(
  distanceMiles: number,
  config: TravelConfig = DEFAULT_CONFIG
): number {
  for (const tier of config.flightTiers) {
    if (distanceMiles <= tier.maxMiles) return tier.cost;
  }
  return config.flightTiers[config.flightTiers.length - 1]?.cost ?? 550;
}

// =============================================================================
// estimateFuelCost
// =============================================================================

export function estimateFuelCost(
  distanceMiles: number,
  config: TravelConfig = DEFAULT_CONFIG
): number {
  const gallons = distanceMiles / config.fuel.avgMpg;
  return Math.round(gallons * config.fuel.avgPrice * 2); // round trip
}

// =============================================================================
// estimateLodgingCost
// =============================================================================

export function estimateLodgingCost(
  nights: number,
  style: "camp" | "budget" | "mid" = "budget",
  config: TravelConfig = DEFAULT_CONFIG
): number {
  const perNight = config.lodging[style] ?? 100;
  return perNight * nights;
}

// =============================================================================
// loadTravelConfig from app_config
// =============================================================================

export async function loadTravelConfig(): Promise<TravelConfig> {
  try {
    const rows = await db
      .select({ key: appConfig.key, value: appConfig.value })
      .from(appConfig)
      .where(eq(appConfig.namespace, "travel"));

    if (rows.length === 0) return DEFAULT_CONFIG;

    const config = { ...DEFAULT_CONFIG };
    for (const row of rows) {
      if (row.key === "flight_tiers" && Array.isArray(row.value)) {
        config.flightTiers = row.value as TravelConfig["flightTiers"];
      }
      if (row.key === "lodging" && typeof row.value === "object") {
        config.lodging = row.value as Record<string, number>;
      }
      if (row.key === "fuel" && typeof row.value === "object") {
        config.fuel = row.value as TravelConfig["fuel"];
      }
      if (row.key === "food" && typeof row.value === "object") {
        config.food = row.value as TravelConfig["food"];
      }
    }
    return config;
  } catch {
    return DEFAULT_CONFIG;
  }
}
