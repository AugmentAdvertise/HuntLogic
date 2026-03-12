// =============================================================================
// ROI Calculator — Return on Investment Analysis
//
// Calculates the value proposition for each hunt recommendation, including
// total cost, expected value, and honest assessment of point investments.
// Explicitly avoids the sunk cost fallacy.
// =============================================================================

import type { HunterProfile } from "@/services/profile/types";
import type { ScoredHunt, ROIAnalysis, CostComparison } from "./types";

const LOG_PREFIX = "[roi]";

// =============================================================================
// Cost Estimation
// =============================================================================

/**
 * Calculate the total point investment to date for a state/species.
 */
function calculatePointInvestment(
  profile: HunterProfile,
  stateId: string,
  speciesId: string
): number {
  const holding = profile.pointHoldings.find(
    (p) => p.stateId === stateId && p.speciesId === speciesId
  );

  if (!holding) return 0;

  const points = holding.points;
  const yearStarted = holding.yearStarted;

  // Estimate annual point cost by state
  const POINT_COSTS: Record<string, number> = {
    CO: 40,
    WY: 50,
    MT: 50,
    AZ: 15,
    UT: 10,
    NV: 10,
    OR: 8,
  };

  const annualCost = POINT_COSTS[holding.stateCode] ?? 20;

  // If we know when they started, calculate actual investment
  if (yearStarted) {
    const yearsInvested = new Date().getFullYear() - yearStarted;
    return yearsInvested * annualCost;
  }

  // Otherwise estimate from point count (1 point per year assumption)
  return points * annualCost;
}

// =============================================================================
// ROI Analysis
// =============================================================================

/**
 * Calculate ROI analysis for a single hunt recommendation.
 */
export function calculateROI(
  hunt: ScoredHunt,
  profile: HunterProfile
): ROIAnalysis {
  console.log(
    `${LOG_PREFIX} calculateROI: ${hunt.stateCode}/${hunt.speciesSlug}/${hunt.unitCode ?? "state"}`
  );

  const totalCost = hunt.estimatedCost;
  const pointInvestment = calculatePointInvestment(
    profile,
    hunt.stateId,
    hunt.speciesId
  );

  // Draw probability
  const drawProbability =
    hunt.hasOtc || hunt.tagType === "otc"
      ? 1.0
      : hunt.latestDrawRate ?? hunt.factors.draw_odds_score;

  // Expected success rate
  const successRate = hunt.latestSuccessRate ?? hunt.factors.success_rate_score;

  // Cost per opportunity: how much does each "chance" cost?
  const costPerOpportunity =
    drawProbability > 0
      ? Math.round(totalCost.total / drawProbability)
      : totalCost.total * 10; // If no draw data, assume very expensive per-chance

  // ROI score: composite of cost-efficiency, probability, and quality
  const expectedValue = drawProbability * successRate;
  const costRatio = totalCost.total > 0 ? expectedValue / (totalCost.total / 5000) : 0;
  const roiScore = Math.min(1.0, Math.max(0, costRatio));

  // Sunk cost analysis — be honest
  let sunkCostNote: string;
  if (pointInvestment > 0) {
    sunkCostNote =
      `You've already invested ~$${pointInvestment.toLocaleString()} in points for this state/species. ` +
      `That money is spent regardless of what you do next. Your decision should be based on ` +
      `the FUTURE cost and probability, not the past investment.`;
  } else {
    sunkCostNote = "No prior point investment — you're starting fresh with this opportunity.";
  }

  // Comparison note
  let comparisonNote: string;
  if (totalCost.total < 1500) {
    comparisonNote =
      "This is a budget-friendly option. For the same money, you might cover a local OTC hunt plus gear.";
  } else if (totalCost.total < 3000) {
    comparisonNote =
      "Moderate investment. Comparable to many western OTC hunts with travel costs included.";
  } else if (totalCost.total < 6000) {
    comparisonNote =
      "Significant investment. For the same budget, you could do 2-3 closer/cheaper hunts.";
  } else {
    comparisonNote =
      "Premium investment. Make sure this hunt aligns with your top priorities — you could fund multiple other hunts for this amount.";
  }

  // Overall recommendation
  let recommendation: ROIAnalysis["recommendation"];
  if (roiScore >= 0.7 && drawProbability >= 0.3) {
    recommendation = "strong_buy";
  } else if (roiScore >= 0.5 || (drawProbability >= 0.5 && totalCost.total < 3000)) {
    recommendation = "buy";
  } else if (roiScore >= 0.3 || hunt.recType === "build_points") {
    recommendation = "hold";
  } else if (roiScore >= 0.15) {
    recommendation = "consider_exit";
  } else {
    recommendation = "exit";
  }

  // Override: if this is an OTC with decent success rate, it's always at least a "buy"
  if (
    (hunt.hasOtc || hunt.tagType === "otc") &&
    successRate > 0.2 &&
    totalCost.total < getBudget(profile) * 0.8
  ) {
    if (recommendation === "hold" || recommendation === "consider_exit" || recommendation === "exit") {
      recommendation = "buy";
    }
  }

  return {
    totalEstimatedCost: totalCost,
    expectedDrawProbability: Math.round(drawProbability * 1000) / 1000,
    expectedSuccessRate: Math.round(successRate * 1000) / 1000,
    costPerOpportunity: Math.round(costPerOpportunity),
    pointInvestmentToDate: pointInvestment,
    sunkCostNote,
    roiScore: Math.round(roiScore * 1000) / 1000,
    comparisonNote,
    recommendation,
  };
}

/**
 * Compare costs between multiple hunts side by side.
 */
export function compareCosts(hunts: ScoredHunt[]): CostComparison[] {
  const comparisons: CostComparison[] = [];

  for (let i = 0; i < hunts.length; i++) {
    for (let j = i + 1; j < hunts.length; j++) {
      const a = hunts[i]!;
      const b = hunts[j]!;

      const costDiff = a.estimatedCost.total - b.estimatedCost.total;
      const valueDiff = a.compositeScore - b.compositeScore;

      let betterValue: "a" | "b" | "equal";
      let explanation: string;

      // Calculate value-per-dollar for each
      const aVPD = a.compositeScore / Math.max(1, a.estimatedCost.total);
      const bVPD = b.compositeScore / Math.max(1, b.estimatedCost.total);

      if (Math.abs(aVPD - bVPD) < 0.00001) {
        betterValue = "equal";
        explanation = `${a.stateCode} ${a.speciesName} and ${b.stateCode} ${b.speciesName} offer comparable value per dollar.`;
      } else if (aVPD > bVPD) {
        betterValue = "a";
        explanation =
          `${a.stateCode} ${a.speciesName} ($${a.estimatedCost.total.toLocaleString()}) ` +
          `offers better value per dollar than ${b.stateCode} ${b.speciesName} ` +
          `($${b.estimatedCost.total.toLocaleString()}).`;
      } else {
        betterValue = "b";
        explanation =
          `${b.stateCode} ${b.speciesName} ($${b.estimatedCost.total.toLocaleString()}) ` +
          `offers better value per dollar than ${a.stateCode} ${a.speciesName} ` +
          `($${a.estimatedCost.total.toLocaleString()}).`;
      }

      comparisons.push({
        huntA: a,
        huntB: b,
        costDifference: costDiff,
        valueDifference: valueDiff,
        betterValue,
        explanation,
      });
    }
  }

  return comparisons;
}

// =============================================================================
// Helpers
// =============================================================================

function getBudget(profile: HunterProfile): number {
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
