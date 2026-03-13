import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notificationPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prefs = await db.query.notificationPreferences.findFirst({
    where: eq(notificationPreferences.userId, session.user.id),
  });

  // Return defaults if no preferences set
  return NextResponse.json({
    preferences: prefs || {
      emailEnabled: true,
      pushEnabled: true,
      deadlineReminders: true,
      drawResults: true,
      strategyUpdates: true,
      pointCreepAlerts: true,
      quietHoursStart: null,
      quietHoursEnd: null,
    },
  });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    emailEnabled,
    pushEnabled,
    deadlineReminders,
    drawResults,
    strategyUpdates,
    pointCreepAlerts,
    quietHoursStart,
    quietHoursEnd,
  } = body;

  const values = {
    userId: session.user.id,
    ...(emailEnabled !== undefined && { emailEnabled }),
    ...(pushEnabled !== undefined && { pushEnabled }),
    ...(deadlineReminders !== undefined && { deadlineReminders }),
    ...(drawResults !== undefined && { drawResults }),
    ...(strategyUpdates !== undefined && { strategyUpdates }),
    ...(pointCreepAlerts !== undefined && { pointCreepAlerts }),
    ...(quietHoursStart !== undefined && { quietHoursStart }),
    ...(quietHoursEnd !== undefined && { quietHoursEnd }),
    updatedAt: new Date(),
  };

  await db
    .insert(notificationPreferences)
    .values(values)
    .onConflictDoUpdate({
      target: notificationPreferences.userId,
      set: values,
    });

  return NextResponse.json({ success: true });
}
