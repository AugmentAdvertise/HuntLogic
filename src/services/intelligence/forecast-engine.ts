// =============================================================================
// Forecast Engine — Rule-Based Forecasting (MVP)
//
// Basic forecasting for point creep, draw odds trajectories, and point value
// assessments. Uses simple linear regression and moving averages.
// Full ML models (Prophet, XGBoost) come in a later phase.
// =============================================================================

import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { drawOdds, states, species } from "@/lib/db/schema";

import type {
  ForecastData,
  DrawOddsForecast,
  PointValueAssessment,
  ConfidenceLevel,
} from "./types";

const LOG_PREFIX = "[forecast]";

// =============================================================================
// Linear Regression Helper
// =============================================================================

interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
}

/**
 * Simple linear regression: y = slope * x + intercept
 */
export function linearRegression(
  data: { x: number; y: number }[]
): RegressionResult {
  if (data.length < 2) {
    return { slope: 0, intercept: data.length === 1 ? (data[0]?.y ?? 0) : 0, r2: 0 };
  }

  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
    sumYY += point.y * point.y;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n, r2: 0 };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // R-squared (coefficient of determination)
  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  for (const point of data) {
    const predicted = slope * point.x + intercept;
    ssTot += (point.y - meanY) ** 2;
    ssRes += (point.y - predicted) ** 2;
  }

  const r2 = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);

  return { slope, intercept, r2 };
}

// =============================================================================
// Confidence Helpers
// =============================================================================

function forecastConfidence(
  dataPoints: number,
  r2: number,
  yearsOfData: number
): ConfidenceLevel {
  let score = 0;

  // More data points = more confidence
  if (dataPoints >= 8) score += 0.35;
  else if (dataPoints >= 5) score += 0.25;
  else if (dataPoints >= 3) score += 0.15;
  else score += 0.05;

  // Higher R-squared = more predictable trend
  score += r2 * 0.35;

  // More years of history = more confidence
  if (yearsOfData >= 8) score += 0.3;
  else if (yearsOfData >= 5) score += 0.2;
  else if (yearsOfData >= 3) score += 0.1;
  else score += 0.05;

  const clampedScore = Math.min(1.0, Math.max(0, score));

  let label: ConfidenceLevel["label"];
  let basis: string;

  if (clampedScore >= 0.65) {
    label = "high";
    basis = `Based on ${dataPoints} data points over ${yearsOfData} years with R²=${r2.toFixed(2)} trend fit.`;
  } else if (clampedScore >= 0.35) {
    label = "medium";
    basis = `Based on ${dataPoints} data points over ${yearsOfData} years. Trend is moderately predictable (R²=${r2.toFixed(2)}).`;
  } else {
    label = "low";
    basis = `Limited data (${dataPoints} points, ${yearsOfData} years). Forecast has significant uncertainty.`;
  }

  return { score: clampedScore, label, basis };
}

// =============================================================================
// State/Species ID Resolution
// =============================================================================

async function resolveStateId(stateCode: string): Promise<string | null> {
  const row = await db.query.states.findFirst({
    where: eq(states.code, stateCode.toUpperCase()),
  });
  return row?.id ?? null;
}

async function resolveSpeciesId(speciesSlug: string): Promise<string | null> {
  const row = await db.query.species.findFirst({
    where: eq(species.slug, speciesSlug),
  });
  return row?.id ?? null;
}

// =============================================================================
// Forecast: Point Creep
// =============================================================================

/**
 * Forecast point creep (minimum points required to draw) for a state/species/unit.
 * Uses historical draw_odds data and linear regression.
 */
export async function forecastPointCreep(
  stateIdOrCode: string,
  speciesIdOrSlug: string,
  unitId?: string
): Promise<ForecastData> {
  console.log(
    `${LOG_PREFIX} forecastPointCreep: ${stateIdOrCode}/${speciesIdOrSlug}${unitId ? `/${unitId}` : ""}`
  );

  // Resolve IDs if codes/slugs were passed
  let stateId = stateIdOrCode;
  let speciesId = speciesIdOrSlug;
  let stateCode = stateIdOrCode;
  let speciesName = speciesIdOrSlug;

  // Try to resolve as code/slug if they don't look like UUIDs
  if (!stateIdOrCode.includes("-")) {
    const resolved = await resolveStateId(stateIdOrCode);
    if (resolved) stateId = resolved;
    stateCode = stateIdOrCode.toUpperCase();
  } else {
    const stateRow = await db.query.states.findFirst({ where: eq(states.id, stateId) });
    stateCode = stateRow?.code ?? stateCode;
  }

  if (!speciesIdOrSlug.includes("-")) {
    const resolved = await resolveSpeciesId(speciesIdOrSlug);
    if (resolved) speciesId = resolved;
  } else {
    const speciesRow = await db.query.species.findFirst({ where: eq(species.id, speciesId) });
    speciesName = speciesRow?.commonName ?? speciesName;
  }

  // Query historical draw odds
  const conditions = [
    eq(drawOdds.stateId, stateId),
    eq(drawOdds.speciesId, speciesId),
  ];
  if (unitId) {
    conditions.push(eq(drawOdds.huntUnitId, unitId));
  }

  const historical = await db
    .select()
    .from(drawOdds)
    .where(and(...conditions))
    .orderBy(desc(drawOdds.year))
    .limit(15);

  // Extract min_points_drawn time series
  const pointSeries = historical
    .filter((r) => r.minPointsDrawn !== null)
    .map((r) => ({ x: r.year, y: r.minPointsDrawn! }))
    .sort((a, b) => a.x - b.x);

  const currentYear = new Date().getFullYear();

  if (pointSeries.length < 2) {
    console.log(`${LOG_PREFIX} forecastPointCreep: insufficient data (${pointSeries.length} points)`);
    return {
      stateId,
      stateCode,
      speciesId,
      speciesName,
      unitId: unitId ?? null,
      unitCode: null,
      historicalData: pointSeries.map((p) => ({ year: p.x, value: p.y })),
      trend: "stable",
      trendStrength: 0,
      projections: [],
      confidence: {
        score: 0.1,
        label: "low",
        basis: "Insufficient historical data for forecasting.",
      },
      assumptions: ["Not enough data points for trend analysis."],
    };
  }

  // Run linear regression
  const regression = linearRegression(pointSeries);
  const lastPoint = pointSeries[pointSeries.length - 1]!;
  const firstPoint = pointSeries[0]!;
  const yearsOfData = lastPoint.x - firstPoint.x;

  // Determine trend direction
  let trend: ForecastData["trend"];
  if (regression.slope > 0.15) trend = "rising";
  else if (regression.slope < -0.15) trend = "declining";
  else trend = "stable";

  // Project forward 1, 3, 5 years
  const projections = [1, 3, 5].map((yearsAhead) => {
    const targetYear = currentYear + yearsAhead;
    const projected = Math.max(0, regression.slope * targetYear + regression.intercept);

    // Confidence band widens with projection distance
    const uncertainty = (1 - regression.r2) * yearsAhead * 0.5 + yearsAhead * 0.3;
    const lowerBound = Math.max(0, projected - uncertainty);
    const upperBound = projected + uncertainty;

    return {
      year: targetYear,
      projected: Math.round(projected * 10) / 10,
      lowerBound: Math.round(lowerBound * 10) / 10,
      upperBound: Math.round(upperBound * 10) / 10,
    };
  });

  const confidence = forecastConfidence(pointSeries.length, regression.r2, yearsOfData);

  const assumptions: string[] = [
    "Assumes historical trends continue at similar rates.",
    "Does not account for potential regulation changes or tag quota adjustments.",
    `Based on ${pointSeries.length} years of draw data.`,
  ];
  if (regression.r2 < 0.5) {
    assumptions.push(
      "Low trend fit (R² < 0.5) — point requirements may be more volatile than the trend suggests."
    );
  }

  return {
    stateId,
    stateCode,
    speciesId,
    speciesName,
    unitId: unitId ?? null,
    unitCode: null,
    historicalData: pointSeries.map((p) => ({ year: p.x, value: p.y })),
    trend,
    trendStrength: regression.r2,
    projections,
    confidence,
    assumptions,
  };
}

// =============================================================================
// Forecast: Draw Odds at User's Point Level
// =============================================================================

/**
 * Forecast draw odds for a specific user's point level over 1, 3, 5 year horizons.
 */
export async function forecastDrawOdds(
  stateIdOrCode: string,
  speciesIdOrSlug: string,
  unitId: string,
  userPoints: number
): Promise<DrawOddsForecast> {
  console.log(
    `${LOG_PREFIX} forecastDrawOdds: ${stateIdOrCode}/${speciesIdOrSlug}/${unitId} @ ${userPoints} pts`
  );

  let stateId = stateIdOrCode;
  let speciesId = speciesIdOrSlug;

  if (!stateIdOrCode.includes("-")) {
    const resolved = await resolveStateId(stateIdOrCode);
    if (resolved) stateId = resolved;
  }
  if (!speciesIdOrSlug.includes("-")) {
    const resolved = await resolveSpeciesId(speciesIdOrSlug);
    if (resolved) speciesId = resolved;
  }

  // Get point creep forecast
  const creepForecast = await forecastPointCreep(stateId, speciesId, unitId);

  // Get historical draw rates
  const historical = await db
    .select()
    .from(drawOdds)
    .where(
      and(
        eq(drawOdds.stateId, stateId),
        eq(drawOdds.speciesId, speciesId),
        eq(drawOdds.huntUnitId, unitId)
      )
    )
    .orderBy(desc(drawOdds.year))
    .limit(10);

  const latestDraw = historical[0];
  const baseDrawRate = latestDraw?.drawRate ?? 0.1;
  const currentMinPoints = latestDraw?.minPointsDrawn ?? 0;

  // For each horizon, estimate probability
  const horizons = [1, 3, 5];
  const forecasts = horizons.map((years) => {
    const futurePoints = userPoints + years; // Assume buying 1 point/year
    const projection = creepForecast.projections.find((p) => p.year === new Date().getFullYear() + years);
    const projectedMinPoints = projection?.projected ?? currentMinPoints;

    let probability: number;
    if (futurePoints >= projectedMinPoints) {
      // At or above projected min — adjust base draw rate upward
      const surplus = futurePoints - projectedMinPoints;
      probability = Math.min(0.95, baseDrawRate + surplus * 0.08);
    } else {
      // Below projected min — draw odds decrease
      const deficit = projectedMinPoints - futurePoints;
      probability = Math.max(0.01, baseDrawRate * Math.exp(-deficit * 0.5));
    }

    const confidenceDecay = Math.max(0.2, 1 - years * 0.12);

    return {
      years,
      probability: Math.round(probability * 1000) / 1000,
      confidence: Math.round(confidenceDecay * creepForecast.confidence.score * 1000) / 1000,
    };
  });

  // Cumulative probability: P(draw within N years) = 1 - (1-p1)(1-p2)...(1-pN)
  const f0 = forecasts[0]!;
  const f1 = forecasts[1]!;
  const f2 = forecasts[2]!;
  const cumulative = {
    withinOneYear: f0.probability,
    withinThreeYears: 1 - (1 - f0.probability) * (1 - f1.probability),
    withinFiveYears:
      1 -
      (1 - f0.probability) *
        (1 - f1.probability) *
        (1 - f2.probability),
  };

  // Trend assessment
  let trend: DrawOddsForecast["trend"];
  if (creepForecast.trend === "declining") trend = "improving";
  else if (creepForecast.trend === "rising") trend = "worsening";
  else trend = "stable";

  let explanation: string;
  if (trend === "improving") {
    explanation =
      `Draw odds for this unit are trending favorably. Point requirements appear to be declining, ` +
      `giving you better chances over time. At ${userPoints} points, your cumulative probability of ` +
      `drawing within 5 years is approximately ${(cumulative.withinFiveYears * 100).toFixed(0)}%.`;
  } else if (trend === "worsening") {
    explanation =
      `Point creep is trending upward for this unit, meaning it's getting harder to draw. ` +
      `At ${userPoints} points and buying one per year, your 5-year cumulative draw probability is ` +
      `approximately ${(cumulative.withinFiveYears * 100).toFixed(0)}%. Consider whether the wait is worthwhile.`;
  } else {
    explanation =
      `Draw odds are relatively stable for this unit. At ${userPoints} points, your cumulative ` +
      `probability of drawing within 5 years is approximately ${(cumulative.withinFiveYears * 100).toFixed(0)}%.`;
  }

  return {
    stateId,
    speciesId,
    unitId,
    userPoints,
    yearOne: { probability: f0.probability, confidence: f0.confidence },
    yearThree: { probability: f1.probability, confidence: f1.confidence },
    yearFive: { probability: f2.probability, confidence: f2.confidence },
    cumulativeProbability: {
      withinOneYear: Math.round(cumulative.withinOneYear * 1000) / 1000,
      withinThreeYears: Math.round(cumulative.withinThreeYears * 1000) / 1000,
      withinFiveYears: Math.round(cumulative.withinFiveYears * 1000) / 1000,
    },
    trend,
    explanation,
  };
}

// =============================================================================
// Point Value Assessment
// =============================================================================

/**
 * Assess whether it's worth continuing to buy points for a state/species.
 */
export async function assessPointValue(
  stateIdOrCode: string,
  speciesIdOrSlug: string,
  currentPoints: number
): Promise<PointValueAssessment> {
  console.log(
    `${LOG_PREFIX} assessPointValue: ${stateIdOrCode}/${speciesIdOrSlug} @ ${currentPoints} pts`
  );

  let stateId = stateIdOrCode;
  let speciesId = speciesIdOrSlug;
  let stateCode = stateIdOrCode;
  let speciesName = speciesIdOrSlug;

  if (!stateIdOrCode.includes("-")) {
    const resolved = await resolveStateId(stateIdOrCode);
    if (resolved) stateId = resolved;
    stateCode = stateIdOrCode.toUpperCase();
  } else {
    const stateRow = await db.query.states.findFirst({ where: eq(states.id, stateId) });
    stateCode = stateRow?.code ?? stateCode;
  }

  if (!speciesIdOrSlug.includes("-")) {
    const resolved = await resolveSpeciesId(speciesIdOrSlug);
    if (resolved) speciesId = resolved;
  } else {
    const speciesRow = await db.query.species.findFirst({ where: eq(species.id, speciesId) });
    speciesName = speciesRow?.commonName ?? speciesName;
  }

  // Get point creep forecast
  const creepForecast = await forecastPointCreep(stateId, speciesId);

  // Estimate annual point cost
  const POINT_COSTS: Record<string, number> = {
    CO: 40, WY: 50, MT: 50, AZ: 15, UT: 10, NV: 10, OR: 8,
  };
  const annualCost = POINT_COSTS[stateCode] ?? 20;

  // Calculate estimated years to tag
  let estimatedYearsToTag: number | null = null;
  const latestProjection = creepForecast.projections[0]; // 1-year projection
  if (latestProjection && creepForecast.trend !== "stable") {
    // Use the regression to find when user's accumulating points catch the creep
    const proj0 = creepForecast.projections[0];
    const proj2 = creepForecast.projections[2];
    const slope = creepForecast.trendStrength > 0.3 && proj2 && proj0 ? proj2.projected - proj0.projected : 0;
    const annualCreep = slope / 4; // difference over 4 years
    const currentMin = latestProjection.projected;
    const deficit = currentMin - currentPoints;

    if (deficit <= 0) {
      estimatedYearsToTag = 0;
    } else {
      // Points accumulate at 1/year, creep at annualCreep/year
      const netGain = 1 - annualCreep;
      if (netGain > 0) {
        estimatedYearsToTag = Math.ceil(deficit / netGain);
      } else {
        estimatedYearsToTag = null; // Will never catch up
      }
    }
  } else if (creepForecast.historicalData.length > 0) {
    const latestHistorical = creepForecast.historicalData[creepForecast.historicalData.length - 1];
    const latestMin = latestHistorical?.value ?? 0;
    const deficit = latestMin - currentPoints;
    if (deficit <= 0) {
      estimatedYearsToTag = 0;
    } else {
      estimatedYearsToTag = deficit; // Assuming 1 point/year and stable requirements
    }
  }

  // Total future investment
  const totalFutureInvestment =
    estimatedYearsToTag !== null ? estimatedYearsToTag * annualCost : annualCost * 10;

  // Verdict
  let verdict: PointValueAssessment["verdict"];
  let verdictRationale: string;
  let alternativeUse: string;

  if (estimatedYearsToTag === null) {
    verdict = "exit";
    verdictRationale =
      "Point creep is outpacing your accumulation rate. At current trends, you may never reach the minimum threshold. Consider redirecting this investment.";
    alternativeUse = `The $${annualCost}/year you'd spend on points could fund an OTC hunt in a nearby state or upgrade your gear.`;
  } else if (estimatedYearsToTag === 0) {
    verdict = "continue";
    verdictRationale = `You're already at or above the point threshold. Apply this year!`;
    alternativeUse = "N/A — you should apply now.";
  } else if (estimatedYearsToTag <= 3 && totalFutureInvestment < 200) {
    verdict = "continue";
    verdictRationale = `Only ${estimatedYearsToTag} year${estimatedYearsToTag > 1 ? "s" : ""} and ~$${totalFutureInvestment} away. This is a strong investment — stay the course.`;
    alternativeUse = `Minimal cost — the alternative is losing your accumulated points and starting over.`;
  } else if (estimatedYearsToTag <= 5 && totalFutureInvestment < 500) {
    verdict = "continue";
    verdictRationale = `${estimatedYearsToTag} years and ~$${totalFutureInvestment} investment remaining. A solid mid-term play if this species/state is a priority.`;
    alternativeUse = `For $${totalFutureInvestment}, you could instead fund a quality OTC hunt.`;
  } else if (estimatedYearsToTag <= 8) {
    verdict = "hold";
    verdictRationale = `${estimatedYearsToTag} years is a significant commitment (~$${totalFutureInvestment} more). Continue only if this is a bucket-list hunt. Don't continue just because of past investment.`;
    alternativeUse = `$${totalFutureInvestment} over ${estimatedYearsToTag} years could fund multiple hunts in states with better draw odds.`;
  } else {
    verdict = "exit";
    verdictRationale = `${estimatedYearsToTag}+ years and $${totalFutureInvestment}+ in future costs. This is unlikely to be a good return on investment unless this is your absolute top priority.`;
    alternativeUse = `Redirect to states with OTC tags or lower point thresholds. You could hunt every year instead of waiting.`;
  }

  // Break-even: at what point level does it stop making sense?
  let breakEvenPointThreshold: number | null = null;
  if (creepForecast.projections.length > 0) {
    // If point creep is rising, there's a point where the cost of continuing
    // exceeds the value of the opportunity
    const fiveYearProjection = creepForecast.projections.find(
      (p) => p.year === new Date().getFullYear() + 5
    );
    if (fiveYearProjection) {
      breakEvenPointThreshold = Math.ceil(fiveYearProjection.upperBound);
    }
  }

  return {
    stateId,
    stateCode,
    speciesId,
    speciesName,
    currentPoints,
    estimatedYearsToTag,
    totalFutureInvestment,
    verdict,
    verdictRationale,
    alternativeUse,
    breakEvenPointThreshold,
  };
}
