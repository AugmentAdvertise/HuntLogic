// =============================================================================
// Strategy Optimizer — Stage 3 of the Recommendation Pipeline
//
// Portfolio-level thinking: don't just rank individual hunts, build a balanced
// strategy that considers diversification, timeline balance, budget allocation,
// point strategy, risk, and schedule conflicts.
// =============================================================================

import type { HunterProfile } from "@/services/profile/types";
import type {
  ScoredHunt,
  StrategyPlan,
  StrategyRecommendation,
  PointStrategyItem,
  BudgetAllocation,
} from "./types";

const LOG_PREFIX = "[intelligence]";

// =============================================================================
// Configuration
// =============================================================================

/** Max recommendations per time horizon */
const MAX_NEAR_TERM = 5;
const MAX_MID_TERM = 5;
const MAX_LONG_TERM = 5;

/** Minimum diversity — try to include at least this many distinct states/species */
const MIN_DISTINCT_STATES = 2;
const MIN_DISTINCT_SPECIES = 2;

// =============================================================================
// Helpers
// =============================================================================

function getProfileBudget(profile: HunterProfile): number {
  const budgetPref = profile.preferences.find(
    (p) => p.category === "budget" && p.key === "annual_budget"
  );
  if (!budgetPref) return 5000;

  if (typeof budgetPref.value === "number") return budgetPref.value;
  if (typeof budgetPref.value === "string") {
    switch (budgetPref.value) {
      case "under_1000":
        return 1000;
      case "1000_3000":
        return 2000;
      case "3000_5000":
        return 4000;
      case "5000_10000":
        return 7500;
      case "over_10000":
        return 15000;
      default: {
        const parsed = parseInt(budgetPref.value, 10);
        return isNaN(parsed) ? 5000 : parsed;
      }
    }
  }
  return 5000;
}

function dateRangesOverlap(
  aStart: string | null,
  aEnd: string | null,
  bStart: string | null,
  bEnd: string | null
): boolean {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  return aStart <= bEnd && bStart <= aEnd;
}

function toStrategyRec(
  hunt: ScoredHunt,
  priority: "high" | "medium" | "low"
): StrategyRecommendation {
  let actionRequired = "Review and consider applying";
  if (hunt.recType === "apply_now") {
    actionRequired = "Submit application before deadline";
  } else if (hunt.recType === "otc_opportunity") {
    actionRequired = "Purchase tag when available";
  } else if (hunt.recType === "build_points") {
    actionRequired = "Buy preference/bonus point this year";
  } else if (hunt.recType === "watch") {
    actionRequired = "Monitor draw odds and point creep";
  }

  return {
    hunt,
    rationale: "", // filled later by explanation generator
    priority,
    actionRequired,
    deadline: null, // filled later from deadlines data
    estimatedCost: hunt.estimatedCost,
    confidence: hunt.confidence,
  };
}

// =============================================================================
// Diversification
// =============================================================================

/**
 * Diversify the selected hunts to avoid putting all eggs in one basket.
 * Returns a reordered/filtered list that balances states and species.
 */
function diversify(hunts: ScoredHunt[], maxItems: number): ScoredHunt[] {
  if (hunts.length <= maxItems) return hunts;

  const selected: ScoredHunt[] = [];
  const statesSeen = new Set<string>();
  const speciesSeen = new Set<string>();

  // Pass 1: ensure minimum distinct states and species from top-scored hunts
  for (const hunt of hunts) {
    if (selected.length >= maxItems) break;

    const isNewState = !statesSeen.has(hunt.stateId);
    const isNewSpecies = !speciesSeen.has(hunt.speciesId);

    if (
      (isNewState && statesSeen.size < MIN_DISTINCT_STATES) ||
      (isNewSpecies && speciesSeen.size < MIN_DISTINCT_SPECIES)
    ) {
      selected.push(hunt);
      statesSeen.add(hunt.stateId);
      speciesSeen.add(hunt.speciesId);
    }
  }

  // Pass 2: fill remaining slots with highest-scoring hunts not yet selected
  const selectedIds = new Set(selected.map((h) => `${h.stateId}:${h.speciesId}:${h.huntUnitId}`));
  for (const hunt of hunts) {
    if (selected.length >= maxItems) break;
    const key = `${hunt.stateId}:${hunt.speciesId}:${hunt.huntUnitId}`;
    if (!selectedIds.has(key)) {
      selected.push(hunt);
      selectedIds.add(key);
    }
  }

  return selected;
}

// =============================================================================
// Conflict Detection
// =============================================================================

interface SeasonConflict {
  huntA: ScoredHunt;
  huntB: ScoredHunt;
  message: string;
}

function detectConflicts(hunts: ScoredHunt[]): SeasonConflict[] {
  const conflicts: SeasonConflict[] = [];

  for (let i = 0; i < hunts.length; i++) {
    for (let j = i + 1; j < hunts.length; j++) {
      const a = hunts[i]!;
      const b = hunts[j]!;

      if (
        dateRangesOverlap(a.seasonStart, a.seasonEnd, b.seasonStart, b.seasonEnd)
      ) {
        conflicts.push({
          huntA: a,
          huntB: b,
          message:
            `Season conflict: ${a.stateCode} ${a.speciesName} (${a.unitCode ?? "state"}) ` +
            `overlaps with ${b.stateCode} ${b.speciesName} (${b.unitCode ?? "state"})`,
        });
      }
    }
  }

  return conflicts;
}

// =============================================================================
// Budget Allocation
// =============================================================================

function allocateBudget(
  totalBudget: number,
  nearTerm: ScoredHunt[],
  midTerm: ScoredHunt[],
  longTerm: ScoredHunt[]
): BudgetAllocation {
  const nearTermCost = nearTerm.reduce((s, h) => s + h.estimatedCost.total, 0);
  const midTermCost = midTerm.reduce((s, h) => s + h.estimatedCost.total, 0);
  const longTermCost = longTerm.reduce((s, h) => s + h.estimatedCost.total, 0);
  const totalPlanned = nearTermCost + midTermCost + longTermCost;

  // If total planned exceeds budget, scale down proportionally
  const scaleFactor = totalPlanned > totalBudget ? totalBudget / totalPlanned : 1;

  const allocations: { category: string; amount: number; description: string }[] = [];

  if (nearTermCost > 0) {
    allocations.push({
      category: "Near-Term Hunts (This Year)",
      amount: Math.round(nearTermCost * scaleFactor),
      description: `${nearTerm.length} hunt${nearTerm.length > 1 ? "s" : ""} — tags, licenses, travel`,
    });
  }

  if (midTermCost > 0) {
    allocations.push({
      category: "Mid-Term Applications (2-4 Years)",
      amount: Math.round(midTermCost * scaleFactor),
      description: `${midTerm.length} point-building and draw application${midTerm.length > 1 ? "s" : ""}`,
    });
  }

  if (longTermCost > 0) {
    allocations.push({
      category: "Long-Term Investments (5+ Years)",
      amount: Math.round(longTermCost * scaleFactor),
      description: `${longTerm.length} long-term point accumulation strategy`,
    });
  }

  const allocated = allocations.reduce((s, a) => s + a.amount, 0);

  // Reserve some for emergencies / leftover tags
  const unallocated = Math.max(0, totalBudget - allocated);
  if (unallocated > 100) {
    allocations.push({
      category: "Contingency / Leftover Tags",
      amount: unallocated,
      description: "Reserve for unexpected opportunities, leftover tags, or gear",
    });
  }

  return {
    totalBudget,
    allocations,
    unallocated: Math.max(0, totalBudget - allocations.reduce((s, a) => s + a.amount, 0)),
  };
}

// =============================================================================
// Point Strategy Generation
// =============================================================================

function generatePointStrategy(
  profile: HunterProfile,
  allHunts: ScoredHunt[]
): PointStrategyItem[] {
  const items: PointStrategyItem[] = [];

  for (const holding of profile.pointHoldings) {
    // Find the best matching scored hunt for this state/species
    const matchingHunt = allHunts.find(
      (h) => h.stateId === holding.stateId && h.speciesId === holding.speciesId
    );

    let recommendation: PointStrategyItem["recommendation"] = "hold";
    let rationale = "";
    let annualCost = 0;
    let projectedYearsToTag: number | null = null;

    const points = holding.points;
    const minPoints = matchingHunt?.latestMinPoints ?? null;

    // Estimate annual point cost
    const stateCode = holding.stateCode;
    const POINT_COSTS: Record<string, number> = {
      CO: 40, WY: 50, MT: 50, AZ: 15, UT: 10, NV: 10, OR: 8,
    };
    annualCost = POINT_COSTS[stateCode] ?? 20;

    if (minPoints !== null) {
      const deficit = minPoints - points;

      if (deficit <= 0) {
        recommendation = "apply_now";
        rationale = `You have ${points} points, which meets or exceeds the ${minPoints} point minimum. Apply as a first choice this year.`;
        projectedYearsToTag = 0;
      } else if (deficit <= 2) {
        recommendation = "build_points";
        rationale = `You're ${deficit} point${deficit > 1 ? "s" : ""} away from the minimum (${minPoints}). Continue building — you could be drawable in ${deficit} year${deficit > 1 ? "s" : ""}.`;
        projectedYearsToTag = deficit;
      } else if (deficit <= 5) {
        recommendation = "build_points";
        rationale = `You need ${deficit} more points to reach the minimum of ${minPoints}. This is a ${deficit}-year investment. Continue if this is a priority species for you.`;
        projectedYearsToTag = deficit;
      } else if (deficit <= 10) {
        recommendation = "hold";
        rationale = `You're ${deficit} points short of the ${minPoints} minimum. That's a ${deficit}+ year commitment at ~$${annualCost}/yr ($${deficit * annualCost} total). Consider whether the long wait is worth it.`;
        projectedYearsToTag = deficit;
      } else {
        recommendation = "consider_exit";
        rationale = `You'd need ${deficit} more years of point purchases ($${deficit * annualCost}) to reach the ${minPoints} point minimum. That's a significant time and cost commitment. Consider redirecting to a more attainable opportunity.`;
        projectedYearsToTag = deficit;
      }
    } else {
      // No min points data — check for general draw availability
      if (matchingHunt?.hasDraw) {
        recommendation = "hold";
        rationale = `We don't have enough draw data to make a specific recommendation for ${holding.speciesName} in ${holding.stateName}. Monitor draw results as new data becomes available.`;
      } else {
        recommendation = "hold";
        rationale = `Limited data available for this state/species combination. Continue holding points while we gather more information.`;
      }
    }

    items.push({
      stateId: holding.stateId,
      stateCode: holding.stateCode,
      stateName: holding.stateName,
      speciesId: holding.speciesId,
      speciesName: holding.speciesName,
      currentPoints: points,
      pointType: holding.pointType,
      recommendation,
      rationale,
      forecast: null, // filled later by forecast engine
      annualCost,
      projectedYearsToTag,
    });
  }

  return items;
}

// =============================================================================
// Main Strategy Optimizer
// =============================================================================

/**
 * Take scored hunts and build a balanced, portfolio-level strategy.
 */
export async function optimizeStrategy(
  scoredHunts: ScoredHunt[],
  profile: HunterProfile
): Promise<StrategyPlan> {
  console.log(
    `${LOG_PREFIX} optimizeStrategy: building strategy from ${scoredHunts.length} scored hunts`
  );

  const budget = getProfileBudget(profile);
  const warnings: string[] = [];

  // ---- 1. Split by timeline category ----
  const thisYear = scoredHunts.filter((h) => h.timelineCategory === "this_year");
  const midRange = scoredHunts.filter((h) => h.timelineCategory === "1-3_years");
  const longRange = scoredHunts.filter(
    (h) => h.timelineCategory === "3-5_years" || h.timelineCategory === "5+_years"
  );

  // ---- 2. Diversify within each tier ----
  const nearTermPicks = diversify(thisYear, MAX_NEAR_TERM);
  const midTermPicks = diversify(midRange, MAX_MID_TERM);
  const longTermPicks = diversify(longRange, MAX_LONG_TERM);

  // ---- 3. Budget check ----
  const totalNearTermCost = nearTermPicks.reduce((s, h) => s + h.estimatedCost.total, 0);
  const totalMidTermCost = midTermPicks.reduce((s, h) => s + h.estimatedCost.total, 0);
  const totalLongTermCost = longTermPicks.reduce((s, h) => s + h.estimatedCost.total, 0);
  const totalEstimatedCost = totalNearTermCost + totalMidTermCost + totalLongTermCost;

  if (totalNearTermCost > budget * 1.2) {
    warnings.push(
      `Near-term hunt costs ($${totalNearTermCost.toLocaleString()}) exceed your annual budget ` +
        `($${budget.toLocaleString()}) by ${Math.round(((totalNearTermCost / budget) - 1) * 100)}%. ` +
        `Consider prioritizing fewer hunts this year.`
    );
  }

  if (totalEstimatedCost > budget * 2) {
    warnings.push(
      `Total strategy cost ($${totalEstimatedCost.toLocaleString()}) significantly exceeds your ` +
        `annual budget. This plan spans multiple years — budget allocation shows annual breakdown.`
    );
  }

  // ---- 4. Conflict detection ----
  const nearTermConflicts = detectConflicts(nearTermPicks);
  for (const conflict of nearTermConflicts) {
    warnings.push(conflict.message);
  }

  // ---- 5. Risk balancing ----
  // Check if all near-term picks are low-probability
  const allLowOdds = nearTermPicks.every(
    (h) => h.factors.draw_odds_score < 0.3 && h.recType !== "otc_opportunity"
  );
  if (allLowOdds && nearTermPicks.length > 0) {
    warnings.push(
      "All near-term recommendations have low draw odds. Consider adding an OTC or high-odds opportunity as a backup plan."
    );
  }

  // ---- 6. Generate point strategy ----
  const pointStrategy = generatePointStrategy(profile, scoredHunts);

  // ---- 7. Budget allocation ----
  const budgetAllocation = allocateBudget(
    budget,
    nearTermPicks,
    midTermPicks,
    longTermPicks
  );

  // ---- 8. Build strategy recommendations ----
  const nearTerm = nearTermPicks.map((h) =>
    toStrategyRec(h, h.compositeScore > 0.6 ? "high" : "medium")
  );
  const midTerm = midTermPicks.map((h) =>
    toStrategyRec(h, h.compositeScore > 0.5 ? "medium" : "low")
  );
  const longTerm = longTermPicks.map((h) =>
    toStrategyRec(h, "low")
  );

  console.log(
    `${LOG_PREFIX} optimizeStrategy: near=${nearTerm.length} mid=${midTerm.length} ` +
      `long=${longTerm.length} warnings=${warnings.length}`
  );

  return {
    nearTerm,
    midTerm,
    longTerm,
    pointStrategy,
    budgetAllocation,
    totalEstimatedCost,
    warnings,
  };
}
