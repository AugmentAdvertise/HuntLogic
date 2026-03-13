// =============================================================================
// Notifications API — In-app notification management
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// =============================================================================
// GET /api/v1/notifications — List user notifications
// =============================================================================

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const unreadOnly = url.searchParams.get("unread") === "true";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const conditions = [eq(notifications.userId, session.user.id)];
  if (unreadOnly) {
    conditions.push(eq(notifications.read, false));
  }

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, session.user.id),
          eq(notifications.read, false)
        )
      ),
  ]);

  return NextResponse.json({
    notifications: items,
    unreadCount: countResult[0]?.count ?? 0,
    total: items.length,
  });
}

// =============================================================================
// POST /api/v1/notifications — Mark as read / mark all read
// =============================================================================

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, notificationId } = body as {
    action: "mark_read" | "mark_all_read" | "dismiss";
    notificationId?: string;
  };

  const now = new Date();

  if (action === "mark_all_read") {
    const result = await db
      .update(notifications)
      .set({ read: true, readAt: now })
      .where(
        and(
          eq(notifications.userId, session.user.id),
          eq(notifications.read, false)
        )
      )
      .returning({ id: notifications.id });

    return NextResponse.json({
      success: true,
      markedRead: result.length,
    });
  }

  if (!notificationId) {
    return NextResponse.json(
      { error: "notificationId required" },
      { status: 400 }
    );
  }

  if (action === "mark_read") {
    await db
      .update(notifications)
      .set({ read: true, readAt: now })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, session.user.id)
        )
      );
    return NextResponse.json({ success: true });
  }

  if (action === "dismiss") {
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, session.user.id)
        )
      );
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
