// =============================================================================
// Intelligence Service — Barrel Export
// =============================================================================

// Types
export type {
  HuntCandidate,
  ScoredHunt,
  ScoringWeights,
  ScoringFactors,
  RecommendationOutput,
  PlaybookData,
  PlaybookSection,
  StrategyRecommendation,
  StrategyPlan,
  PointStrategyItem,
  BudgetAllocation,
  ROIAnalysis,
  CostComparison,
  ForecastData,
  DrawOddsForecast,
  PointValueAssessment,
  CostEstimate,
  TimelineEstimate,
  ConfidenceLevel,
} from "./types";

export { DEFAULT_WEIGHTS, ORIENTATION_WEIGHTS } from "./types";

// Candidate Generator (Stage 1)
export { generateCandidates, estimateDriveHours } from "./candidate-generator";

// Scoring Engine (Stage 2)
export {
  scoreCandidate,
  scoreCandidates,
  resolveWeights,
  scoreDrawOdds,
  scoreTrophyQuality,
  scoreSuccessRate,
  scoreCostEfficiency,
  scoreAccess,
  scoreForecast,
  scorePersonalFit,
  scoreTimelineFit,
} from "./scoring-engine";

// Strategy Optimizer (Stage 3)
export { optimizeStrategy } from "./strategy-optimizer";

// Explanation Generator (Stage 4)
export {
  generateExplanation,
  generatePlaybookSummary,
  generateStrategyRationale,
} from "./explanation-generator";

// ROI Calculator
export { calculateROI, compareCosts } from "./roi-calculator";

// Forecast Engine
export {
  forecastPointCreep,
  forecastDrawOdds,
  assessPointValue,
  linearRegression,
} from "./forecast-engine";

// Playbook Generator (Pipeline Orchestrator)
export {
  generatePlaybook,
  refreshPlaybook,
  getPlaybook,
} from "./playbook-generator";
