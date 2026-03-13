// =============================================================================
// Cost Lookup — Dynamic cost data from database
//
// Loads tag, license, and point costs from the states table config JSONB.
// Falls back to reasonable defaults if config data is missing.
// =============================================================================

import { db } from "@/lib/db";
import { states } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { COST_CONFIG } from "./config";

const LOG_PREFIX = "[cost-lookup]";

interface StateCosts {
  tagCost: number;
  licenseCost: number;
  pointCost: number;
}

// Cache costs in memory for the duration of a request
let costCache: Map<string, StateCosts> | null = null;

/**
 * Load cost data for all states from the database config JSONB.
 * Caches results for the duration of the process.
 */
export async function loadStateCosts(): Promise<Map<string, StateCosts>> {
  if (costCache) return costCache;

  const allStates = await db
    .select({ code: states.code, config: states.config })
    .from(states)
    .where(eq(states.enabled, true));

  const costs = new Map<string, StateCosts>();

  for (const state of allStates) {
    const cfg = state.config as Record<string, unknown> | null;
    costs.set(state.code, {
      tagCost: typeof cfg?.tagCost === "number" ? cfg.tagCost : COST_CONFIG.defaultTagCost,
      licenseCost: typeof cfg?.licenseCost === "number" ? cfg.licenseCost : COST_CONFIG.defaultLicenseCost,
      pointCost: typeof cfg?.pointCost === "number" ? cfg.pointCost : COST_CONFIG.defaultPointCost,
    });
  }

  costCache = costs;
  console.log(`${LOG_PREFIX} Loaded costs for ${costs.size} states`);
  return costs;
}

/**
 * Get costs for a specific state. Returns defaults if not found.
 */
export async function getStateCosts(stateCode: string): Promise<StateCosts> {
  const costs = await loadStateCosts();
  return costs.get(stateCode) ?? {
    tagCost: COST_CONFIG.defaultTagCost,
    licenseCost: COST_CONFIG.defaultLicenseCost,
    pointCost: COST_CONFIG.defaultPointCost,
  };
}

/**
 * Clear the cost cache (useful after DB updates).
 */
export function clearCostCache(): void {
  costCache = null;
}
