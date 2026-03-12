// =============================================================================
// Deadline Cron — Daily deadline scanning and notification generation
// =============================================================================
// Schedule: 0 6 * * * (every day at 6:00 AM UTC)
// Vercel Cron Function — triggered by Vercel scheduler
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deadlines, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// =============================================================================
// GET /api/cron/deadlines — Scan upcoming deadlines
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
    const reminderWindows = [
      { days: 1, label: "tomorrow" },
      { days: 3, label: "in 3 days" },
      { days: 7, label: "in 1 week" },
      { days: 14, label: "in 2 weeks" },
      { days: 30, label: "in 1 month" },
    ];

    let totalNotifications = 0;
    const summary: Array<{ window: string; count: number }> = [];

    // Count active (onboarded) users once
    const activeUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.onboardingComplete, true));

    const activeUserCount = Number(activeUsersResult[0]?.count ?? 0);

    for (const window of reminderWindows) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + window.days);

      // Format as YYYY-MM-DD for date column comparison
      const targetDateStr = targetDate.toISOString().split("T")[0];

      // Find deadlines that fall on this target date
      const upcomingDeadlines = await db
        .select()
        .from(deadlines)
        .where(eq(deadlines.deadlineDate, targetDateStr!));

      if (upcomingDeadlines.length > 0) {
        const notificationCount = upcomingDeadlines.length * activeUserCount;

        totalNotifications += notificationCount;
        summary.push({
          window: window.label,
          count: upcomingDeadlines.length,
        });

        console.log(
          `[cron/deadlines] ${upcomingDeadlines.length} deadlines ${window.label} — ${notificationCount} notifications queued`
        );
      }
    }

    console.log(
      `[cron/deadlines] Scan complete: ${totalNotifications} total notifications generated`
    );

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      activeUsers: activeUserCount,
      totalNotifications,
      summary,
    });
  } catch (error) {
    console.error("[cron/deadlines] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Deadline scan failed" },
      { status: 500 }
    );
  }
}
