-- Notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'in_app',
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "action_url" TEXT,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "read_at" TIMESTAMPTZ,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications" ("user_id");
CREATE INDEX IF NOT EXISTS "notifications_user_read_idx" ON "notifications" ("user_id", "read");
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications" ("type");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications" ("created_at");

-- Notification preferences table
CREATE TABLE IF NOT EXISTS "notification_preferences" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "email_enabled" BOOLEAN NOT NULL DEFAULT true,
  "push_enabled" BOOLEAN NOT NULL DEFAULT true,
  "deadline_reminders" BOOLEAN NOT NULL DEFAULT true,
  "draw_results" BOOLEAN NOT NULL DEFAULT true,
  "strategy_updates" BOOLEAN NOT NULL DEFAULT true,
  "point_creep_alerts" BOOLEAN NOT NULL DEFAULT true,
  "quiet_hours_start" TEXT,
  "quiet_hours_end" TEXT,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "notification_prefs_user_id_idx" ON "notification_preferences" ("user_id");
