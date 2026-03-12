// =============================================================================
// Data Refresh Cron — Weekly ingestion pipeline trigger
// =============================================================================
// Schedule: 0 3 * * 1 (every Monday at 3:00 AM UTC)
// Vercel Cron Function — triggered by Vercel scheduler
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dataSources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Cadence to days mapping
const CADENCE_DAYS: Record<string, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  annual: 365,
};

// =============================================================================
// GET /api/cron/data-refresh — Trigger data source refresh
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();

    // Find all enabled data sources
    const enabledSources = await db
      .select()
      .from(dataSources)
      .where(eq(dataSources.enabled, true));

    // Filter sources due for refresh based on their cadence
    const sourcesToRefresh = enabledSources.filter((source) => {
      if (source.refreshCadence === "manual") return false;
      if (!source.lastFetched) return true; // Never fetched

      const lastFetch = new Date(source.lastFetched);
      const intervalDays = CADENCE_DAYS[source.refreshCadence] ?? 7;
      const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
      return now.getTime() - lastFetch.getTime() >= intervalMs;
    });

    // Queue each source for refresh
    const queued: Array<{ id: string; name: string; type: string }> = [];

    for (const source of sourcesToRefresh) {
      // Mark as pending refresh
      await db
        .update(dataSources)
        .set({
          status: "pending",
          updatedAt: now,
        })
        .where(eq(dataSources.id, source.id));

      queued.push({
        id: source.id,
        name: source.name,
        type: source.sourceType,
      });

      console.log(
        `[cron/data-refresh] Queued: ${source.name} (${source.sourceType})`
      );
    }

    console.log(
      `[cron/data-refresh] Refresh complete: ${queued.length} sources queued for ingestion`
    );

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      totalSources: enabledSources.length,
      sourcesQueued: queued.length,
      queued,
    });
  } catch (error) {
    console.error("[cron/data-refresh] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Data refresh failed" },
      { status: 500 }
    );
  }
}
