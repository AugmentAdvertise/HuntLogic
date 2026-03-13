// =============================================================================
// Notification Cron — Send pending email notifications
// =============================================================================
// Schedule: 0 7 * * * (every day at 7:00 AM UTC)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Count unread notifications per user (for daily digest)
    const unreadCounts = await db
      .select({
        userId: notifications.userId,
        count: sql<number>`count(*)::int`,
      })
      .from(notifications)
      .where(eq(notifications.read, false))
      .groupBy(notifications.userId);

    console.log(`[cron/notifications] ${unreadCounts.length} users with unread notifications`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      usersWithUnread: unreadCounts.length,
    });
  } catch (error) {
    console.error("[cron/notifications] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
