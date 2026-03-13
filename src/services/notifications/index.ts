// =============================================================================
// Notification Service — Create and send notifications
// =============================================================================

import { db } from "@/lib/db";
import { notifications, notificationPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface CreateNotificationInput {
  userId: string;
  type: "deadline_reminder" | "draw_result" | "point_creep" | "strategy_update" | "welcome" | "system";
  title: string;
  body: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export async function createNotification(input: CreateNotificationInput) {
  // Check user preferences
  const prefs = await db.query.notificationPreferences.findFirst({
    where: eq(notificationPreferences.userId, input.userId),
  });

  // Check if notification type is enabled
  if (prefs) {
    if (input.type === "deadline_reminder" && !prefs.deadlineReminders) return null;
    if (input.type === "draw_result" && !prefs.drawResults) return null;
    if (input.type === "strategy_update" && !prefs.strategyUpdates) return null;
    if (input.type === "point_creep" && !prefs.pointCreepAlerts) return null;
  }

  // Create in-app notification
  const [notification] = await db
    .insert(notifications)
    .values({
      userId: input.userId,
      type: input.type,
      channel: "in_app",
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl,
      metadata: input.metadata ?? {},
    })
    .returning();

  // Send email if enabled
  if (!prefs || prefs.emailEnabled) {
    await sendEmailNotification(input).catch((err) => {
      console.warn("[notifications] Email send failed:", err);
    });
  }

  return notification;
}

export async function createBulkNotifications(
  userIds: string[],
  notification: Omit<CreateNotificationInput, "userId">
) {
  const results = [];
  for (const userId of userIds) {
    const result = await createNotification({ ...notification, userId });
    if (result) results.push(result);
  }
  return results;
}

async function sendEmailNotification(input: CreateNotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const fromEmail = process.env.EMAIL_FROM ?? "HuntLogic <noreply@huntlogic.com>";

  // Get user email
  const user = await db.query.users.findFirst({
    where: eq((await import("@/lib/db/schema")).users.id, input.userId),
    columns: { email: true, displayName: true },
  });

  if (!user?.email) return;

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: fromEmail,
    to: user.email,
    subject: input.title,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1A3C2A, #2A5C40); padding: 24px; border-radius: 12px 12px 0 0;">
          <h2 style="color: #F5F5F0; margin: 0; font-size: 18px;">HuntLogic</h2>
        </div>
        <div style="background: #ffffff; padding: 24px; border: 1px solid #E0DDD5; border-top: none; border-radius: 0 0 12px 12px;">
          <h3 style="color: #2D1F0E; margin: 0 0 12px 0;">${input.title}</h3>
          <p style="color: #6B7B6E; line-height: 1.6; margin: 0 0 20px 0;">${input.body}</p>
          ${input.actionUrl ? `<a href="https://huntlogic.vercel.app${input.actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #C4651A, #D4A03C); color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Details</a>` : ""}
        </div>
        <p style="color: #9CA89E; font-size: 12px; text-align: center; margin-top: 16px;">
          You're receiving this because you have notifications enabled in HuntLogic.
          <a href="https://huntlogic.vercel.app/settings" style="color: #6B7B6E;">Manage preferences</a>
        </p>
      </div>
    `,
  });
}
