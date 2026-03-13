// =============================================================================
// Feedback Engine — Learn from user recommendation interactions
//
// When a user saves or dismisses a recommendation, adjust their preference
// weights so future recommendations better match their actual behavior.
// =============================================================================

import { db } from "@/lib/db";
import { recommendations, hunterPreferences, states, species } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

import { FEEDBACK_CONFIG } from "./config";

const LOG_PREFIX = "[feedback]";

// =============================================================================
// Types
// =============================================================================

interface FeedbackSignal {
  userId: string;
  recommendationId: string;
  action: "save" | "dismiss" | "like" | "dislike";
}

interface FeedbackResult {
  success: boolean;
  action: string;
  adjustments: number;
}

// =============================================================================
// processRecommendationFeedback
// =============================================================================

/**
 * Process a user's feedback on a recommendation and adjust preferences.
 *
 * Positive signals (save, like) reinforce the traits of the recommendation.
 * Negative signals (dismiss, dislike) dampen them. Reinforcement is asymmetric:
 * saves carry a stronger delta than dismissals, because a save is a deliberate
 * act of interest while a dismiss may just mean "not right now."
 */
export async function processRecommendationFeedback(
  signal: FeedbackSignal
): Promise<FeedbackResult> {
  console.log(
    `${LOG_PREFIX} Processing ${signal.action} for recommendation ${signal.recommendationId}`
  );

  // ------------------------------------------------------------------
  // 1. Fetch the recommendation with joined state/species data
  // ------------------------------------------------------------------
  const rows = await db
    .select({
      id: recommendations.id,
      recType: recommendations.recType,
      orientation: recommendations.orientation,
      costEstimate: recommendations.costEstimate,
      stateCode: states.code,
      speciesSlug: species.slug,
    })
    .from(recommendations)
    .innerJoin(states, eq(recommendations.stateId, states.id))
    .innerJoin(species, eq(recommendations.speciesId, species.id))
    .where(
      and(
        eq(recommendations.id, signal.recommendationId),
        eq(recommendations.userId, signal.userId)
      )
    )
    .limit(1);

  const rec = rows[0];

  if (!rec) {
    console.warn(
      `${LOG_PREFIX} Recommendation ${signal.recommendationId} not found for user ${signal.userId}`
    );
    return { success: false, action: signal.action, adjustments: 0 };
  }

  // ------------------------------------------------------------------
  // 2. Update the recommendation status and feedback column
  // ------------------------------------------------------------------
  const newStatus =
    signal.action === "save" || signal.action === "like" ? "saved" : "dismissed";

  const newFeedback =
    signal.action === "like"
      ? "like"
      : signal.action === "dislike"
        ? "dislike"
        : signal.action === "save"
          ? "save"
          : null;

  await db
    .update(recommendations)
    .set({
      status: newStatus,
      userFeedback: newFeedback,
      updatedAt: new Date(),
    })
    .where(eq(recommendations.id, signal.recommendationId));

  // ------------------------------------------------------------------
  // 3. Extract behavioral signals and update preferences
  // ------------------------------------------------------------------
  const isPositive = signal.action === "save" || signal.action === "like";
  let adjustments = 0;

  // Signal 1: Species preference reinforcement
  if (rec.speciesSlug) {
    await adjustPreference(
      signal.userId,
      "species_interest",
      rec.speciesSlug,
      isPositive ? FEEDBACK_CONFIG.speciesSaveBoost : FEEDBACK_CONFIG.speciesDismissPenalty
    );
    adjustments++;
  }

  // Signal 2: State preference reinforcement
  if (rec.stateCode) {
    await adjustPreference(
      signal.userId,
      "state_interest",
      rec.stateCode,
      isPositive ? FEEDBACK_CONFIG.stateSaveBoost : FEEDBACK_CONFIG.stateDismissPenalty
    );
    adjustments++;
  }

  // Signal 3: Orientation reinforcement (trophy vs opportunity vs meat, etc.)
  if (rec.orientation) {
    await adjustPreference(
      signal.userId,
      "hunt_orientation",
      `${rec.orientation}_affinity`,
      isPositive ? FEEDBACK_CONFIG.orientationSaveBoost : FEEDBACK_CONFIG.orientationDismissPenalty
    );
    adjustments++;
  }

  // Signal 4: Cost tolerance signal
  const costEstimate = rec.costEstimate as Record<string, number> | null;
  if (costEstimate?.total) {
    const costTier =
      costEstimate.total < 1500
        ? "budget"
        : costEstimate.total < 4000
          ? "moderate"
          : "premium";

    await adjustPreference(
      signal.userId,
      "budget",
      `${costTier}_affinity`,
      isPositive ? FEEDBACK_CONFIG.budgetSaveBoost : FEEDBACK_CONFIG.budgetDismissPenalty
    );
    adjustments++;
  }

  // Signal 5: Draw difficulty / timeline tolerance
  if (rec.recType === "build_points") {
    await adjustPreference(
      signal.userId,
      "timeline",
      "long_term_affinity",
      isPositive ? FEEDBACK_CONFIG.timelineSaveBoost : FEEDBACK_CONFIG.timelineDismissPenalty
    );
    adjustments++;
  } else if (rec.recType === "otc_opportunity") {
    await adjustPreference(
      signal.userId,
      "timeline",
      "immediate_affinity",
      isPositive ? FEEDBACK_CONFIG.timelineSaveBoost : FEEDBACK_CONFIG.timelineDismissPenalty
    );
    adjustments++;
  }

  console.log(
    `${LOG_PREFIX} Processed ${signal.action} feedback for ${rec.stateCode}/${rec.speciesSlug} (${adjustments} adjustments)`
  );

  return { success: true, action: signal.action, adjustments };
}

// =============================================================================
// adjustPreference
// =============================================================================

/**
 * Adjust a behavioral preference value by a delta.
 * Creates the preference if it doesn't exist. Values are clamped to [-1, 1].
 *
 * Uses the unique index on (userId, category, key) via upsert so this is
 * safe under concurrent writes.
 */
async function adjustPreference(
  userId: string,
  category: string,
  key: string,
  delta: number
): Promise<void> {
  const now = new Date();

  // Try to find existing preference to compute new value
  const existing = await db
    .select({
      id: hunterPreferences.id,
      value: hunterPreferences.value,
      source: hunterPreferences.source,
    })
    .from(hunterPreferences)
    .where(
      and(
        eq(hunterPreferences.userId, userId),
        eq(hunterPreferences.category, category),
        eq(hunterPreferences.key, key)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const current = existing[0]!;

    // Never overwrite user-stated preferences — only adjust behavioral ones
    if (current.source === "user") {
      return;
    }

    const currentValue =
      typeof current.value === "number" ? current.value : 0.5;
    const newValue = Math.max(FEEDBACK_CONFIG.minValue, Math.min(FEEDBACK_CONFIG.maxValue, currentValue + delta));

    await db
      .update(hunterPreferences)
      .set({
        value: newValue,
        updatedAt: now,
      })
      .where(eq(hunterPreferences.id, current.id));
  } else {
    // Create new behavioral preference with a neutral-ish baseline + delta
    const initialValue = Math.max(FEEDBACK_CONFIG.minValue, Math.min(FEEDBACK_CONFIG.maxValue, FEEDBACK_CONFIG.initialBaseline + delta));

    await db.insert(hunterPreferences).values({
      userId,
      category,
      key,
      value: initialValue,
      confidence: FEEDBACK_CONFIG.initialConfidence, // low confidence — single signal
      source: "behavioral",
      createdAt: now,
      updatedAt: now,
    });
  }
}

// =============================================================================
// getBehavioralSummary
// =============================================================================

/**
 * Get behavioral preference summary for a user (for debugging/transparency).
 */
export async function getBehavioralSummary(userId: string) {
  const behavioralPrefs = await db
    .select({
      category: hunterPreferences.category,
      key: hunterPreferences.key,
      value: hunterPreferences.value,
      confidence: hunterPreferences.confidence,
      updatedAt: hunterPreferences.updatedAt,
    })
    .from(hunterPreferences)
    .where(
      and(
        eq(hunterPreferences.userId, userId),
        eq(hunterPreferences.source, "behavioral")
      )
    );

  return behavioralPrefs.map((p) => ({
    category: p.category,
    key: p.key,
    value: p.value,
    confidence: p.confidence,
    updatedAt: p.updatedAt.toISOString(),
  }));
}
