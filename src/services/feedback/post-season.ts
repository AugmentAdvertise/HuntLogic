// =============================================================================
// Post-Season Feedback Service
//
// After a hunt season ends, collect feedback from users and feed it back into
// the recommendation engine to improve future suggestions.
// =============================================================================

import { db } from "@/lib/db";
import {
  harvestHistory,
  seasons,
  recommendations,
  states,
  species,
} from "@/lib/db/schema";
import { eq, and, isNotNull, sql } from "drizzle-orm";
import { processRecommendationFeedback } from "@/services/intelligence/feedback-engine";
import { createNotification } from "@/services/notifications";

const LOG_PREFIX = "[post-season]";

// =============================================================================
// Types
// =============================================================================

export interface HarvestFeedback {
  userId: string;
  stateCode: string;
  speciesSlug: string;
  unitCode?: string;
  year: number;
  success: boolean;
  weaponType?: string;
  trophyScore?: number;
  daysHunted?: number;
  satisfaction?: number; // 1-5
  wouldHuntAgain?: boolean;
  notes?: string;
  recommendationId?: string;
}

export interface HarvestFeedbackResult {
  harvestId: string;
  feedbackProcessed: boolean;
}

// =============================================================================
// submitHarvestFeedback
// =============================================================================

export async function submitHarvestFeedback(
  feedback: HarvestFeedback
): Promise<HarvestFeedbackResult> {
  console.log(
    `${LOG_PREFIX} Processing harvest feedback for ${feedback.stateCode}/${feedback.speciesSlug}`
  );

  // Resolve state and species IDs
  const stateRow = await db.query.states.findFirst({
    where: eq(states.code, feedback.stateCode),
    columns: { id: true },
  });

  const speciesRow = await db.query.species.findFirst({
    where: eq(species.slug, feedback.speciesSlug),
    columns: { id: true },
  });

  if (!stateRow || !speciesRow) {
    throw new Error(
      `Invalid state code "${feedback.stateCode}" or species slug "${feedback.speciesSlug}"`
    );
  }

  // Insert harvest record
  const [harvest] = await db
    .insert(harvestHistory)
    .values({
      userId: feedback.userId,
      stateId: stateRow.id,
      speciesId: speciesRow.id,
      year: feedback.year,
      success: feedback.success,
      weaponType: feedback.weaponType,
      trophyScore: feedback.trophyScore?.toString(),
      notes: feedback.notes,
    })
    .returning({ id: harvestHistory.id });

  if (!harvest) {
    throw new Error("Failed to insert harvest record");
  }

  let feedbackProcessed = false;

  // If linked to a recommendation, process feedback through the engine
  if (feedback.recommendationId) {
    const action = feedback.success ? "like" : "dislike";
    await processRecommendationFeedback({
      userId: feedback.userId,
      recommendationId: feedback.recommendationId,
      action,
    });
    feedbackProcessed = true;
  }

  // Process behavioral signals regardless of recommendation link
  await processBehavioralSignals(feedback);

  console.log(
    `${LOG_PREFIX} Harvest recorded: ${harvest.id}, feedback processed: ${feedbackProcessed}`
  );

  return { harvestId: harvest.id, feedbackProcessed };
}

// =============================================================================
// processBehavioralSignals
// =============================================================================

async function processBehavioralSignals(
  feedback: HarvestFeedback
): Promise<void> {
  // Import adjustPreference-like behavior via the feedback engine
  // We create a synthetic recommendation feedback signal based on harvest outcome
  const { hunterPreferences } = await import("@/lib/db/schema");
  const { and: andOp, eq: eqOp } = await import("drizzle-orm");

  const now = new Date();

  // Signal: Unit satisfaction
  if (feedback.wouldHuntAgain !== undefined) {
    const unitKey = `${feedback.stateCode}_${feedback.unitCode ?? "general"}`;
    const value = feedback.wouldHuntAgain ? 0.8 : 0.2;

    await db
      .insert(hunterPreferences)
      .values({
        userId: feedback.userId,
        category: "unit_satisfaction",
        key: unitKey,
        value,
        confidence: 0.8,
        source: "behavioral",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          hunterPreferences.userId,
          hunterPreferences.category,
          hunterPreferences.key,
        ],
        set: { value, updatedAt: now },
      });
  }

  // Signal: Satisfaction rating as species affinity
  if (feedback.satisfaction !== undefined) {
    const normalizedSatisfaction = (feedback.satisfaction - 1) / 4; // 0-1 scale
    const existing = await db
      .select({ value: hunterPreferences.value, source: hunterPreferences.source })
      .from(hunterPreferences)
      .where(
        andOp(
          eqOp(hunterPreferences.userId, feedback.userId),
          eqOp(hunterPreferences.category, "species_interest"),
          eqOp(hunterPreferences.key, feedback.speciesSlug)
        )
      )
      .limit(1);

    if (!existing.length || existing[0]?.source !== "user") {
      await db
        .insert(hunterPreferences)
        .values({
          userId: feedback.userId,
          category: "species_interest",
          key: feedback.speciesSlug,
          value: normalizedSatisfaction,
          confidence: 0.7,
          source: "behavioral",
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [
            hunterPreferences.userId,
            hunterPreferences.category,
            hunterPreferences.key,
          ],
          set: { value: normalizedSatisfaction, updatedAt: now },
        });
    }
  }
}

// =============================================================================
// scanEndedSeasons — Called by cron to find recently ended seasons
// =============================================================================

export async function scanEndedSeasons(): Promise<number> {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const todayStr = now.toISOString().split("T")[0];
  const weekAgoStr = oneWeekAgo.toISOString().split("T")[0];

  console.log(
    `${LOG_PREFIX} Scanning for seasons ended between ${weekAgoStr} and ${todayStr}`
  );

  // Find seasons that ended in the last 7 days
  const endedSeasons = await db
    .select({
      stateId: seasons.stateId,
      speciesId: seasons.speciesId,
      stateCode: states.code,
      speciesSlug: species.slug,
      speciesName: species.commonName,
      stateName: states.name,
    })
    .from(seasons)
    .innerJoin(states, eq(seasons.stateId, states.id))
    .innerJoin(species, eq(seasons.speciesId, species.id))
    .where(
      and(
        isNotNull(seasons.endDate),
        sql`${seasons.endDate} >= ${weekAgoStr}`,
        sql`${seasons.endDate} <= ${todayStr}`
      )
    );

  if (endedSeasons.length === 0) {
    console.log(`${LOG_PREFIX} No recently ended seasons found`);
    return 0;
  }

  console.log(
    `${LOG_PREFIX} Found ${endedSeasons.length} recently ended seasons`
  );

  let notificationsSent = 0;

  // For each ended season, find users who had recommendations for that state/species
  for (const season of endedSeasons) {
    const usersWithRecs = await db
      .select({
        userId: recommendations.userId,
      })
      .from(recommendations)
      .where(
        and(
          eq(recommendations.stateId, season.stateId),
          eq(recommendations.speciesId, season.speciesId)
        )
      )
      .groupBy(recommendations.userId);

    for (const { userId } of usersWithRecs) {
      await createNotification({
        userId,
        type: "strategy_update",
        title: `How did your ${season.stateName} ${season.speciesName} season go?`,
        body: "Your season just ended. Tell us how it went so we can improve your future recommendations.",
        actionUrl: `/profile/harvest?state=${season.stateCode}&species=${season.speciesSlug}&year=${now.getFullYear()}`,
      });
      notificationsSent++;
    }
  }

  console.log(`${LOG_PREFIX} Sent ${notificationsSent} post-season notifications`);
  return notificationsSent;
}
