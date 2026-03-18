// =============================================================================
// Deadline Cron — Daily deadline scanning and action generation
// =============================================================================
// Schedule: 0 6 * * * (every day at 6:00 AM UTC)
// Vercel Cron Function — triggered by Vercel scheduler
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deadlines, users, userActions } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// =============================================================================
// GET /api/cron/deadlines — Scan upcoming deadlines and generate user actions
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
      { days: 1, priority: "critical" as const },
      { days: 3, priority: "high" as const },
      { days: 7, priority: "medium" as const },
      { days: 14, priority: "low" as const },
      { days: 30, priority: "low" as const },
    ];

    let totalActionsCreated = 0;
    const summary: Array<{ window: string; deadlinesFound: number; actionsCreated: number }> = [];

    for (const window of reminderWindows) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + window.days);
      const targetDateStr = targetDate.toISOString().split("T")[0];

      // Find deadlines on this target date
      const upcomingDeadlines = await db
        .select()
        .from(deadlines)
        .where(eq(deadlines.deadlineDate, targetDateStr!));

      if (upcomingDeadlines.length === 0) continue;

      // Get all onboarded users
      const activeUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.onboardingComplete, true));

      let windowActionsCreated = 0;

      for (const deadline of upcomingDeadlines) {
        // Map deadline type to action type
        const actionType =
          deadline.deadlineType === "application" ? "apply" :
          deadline.deadlineType === "point_purchase" ? "buy_points" :
          deadline.deadlineType === "results" ? "review_strategy" :
          "apply";

        for (const user of activeUsers) {
          // Check if action already exists for this user+deadline
          const existing = await db
            .select({ id: userActions.id })
            .from(userActions)
            .where(
              and(
                eq(userActions.userId, user.id),
                eq(userActions.deadlineId, deadline.id)
              )
            )
            .limit(1);

          if (existing.length > 0) continue; // Already created

          // Create the action
          await db.insert(userActions).values({
            userId: user.id,
            deadlineId: deadline.id,
            actionType,
            title: deadline.title,
            description: deadline.description ?? `${deadline.deadlineType} deadline ${window.days === 1 ? "tomorrow" : `in ${window.days} days`}`,
            dueDate: deadline.deadlineDate,
            priority: window.priority,
            status: "pending",
            metadata: {
              stateId: deadline.stateId,
              speciesId: deadline.speciesId,
              deadlineType: deadline.deadlineType,
              reminderDaysBefore: window.days,
              url: deadline.url,
            },
          });

          // Also create a notification
          const { createNotification } = await import("@/services/notifications");
          await createNotification({
            userId: user.id,
            type: "deadline_reminder",
            title: `${deadline.title} — ${window.days === 1 ? "Tomorrow" : `${window.days} days`}`,
            body: deadline.description ?? `Don't miss the ${deadline.deadlineType} deadline${window.days === 1 ? " tomorrow" : ` in ${window.days} days`}.`,
            actionUrl: "/calendar",
            metadata: {
              stateId: deadline.stateId,
              speciesId: deadline.speciesId,
              deadlineType: deadline.deadlineType,
              deadlineDate: deadline.deadlineDate,
              daysUntil: window.days,
            },
          }).catch((err: unknown) => {
            console.warn("[cron/deadlines] Notification creation failed:", err);
          });

          windowActionsCreated++;
        }
      }

      totalActionsCreated += windowActionsCreated;
      summary.push({
        window: `${window.days} day${window.days > 1 ? "s" : ""}`,
        deadlinesFound: upcomingDeadlines.length,
        actionsCreated: windowActionsCreated,
      });

      console.log(
        `[cron/deadlines] ${window.days}d window: ${upcomingDeadlines.length} deadlines, ${windowActionsCreated} actions created`
      );
    }

    // Mark missed actions (past due date, still pending)
    const missedResult = await db
      .update(userActions)
      .set({ status: "missed", updatedAt: now })
      .where(
        and(
          eq(userActions.status, "pending"),
          sql`${userActions.dueDate}::date < ${now.toISOString().split("T")[0]}`
        )
      )
      .returning({ id: userActions.id });

    console.log(
      `[cron/deadlines] Scan complete: ${totalActionsCreated} actions created, ${missedResult.length} missed actions marked`
    );

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      totalActionsCreated,
      missedActionsMarked: missedResult.length,
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
