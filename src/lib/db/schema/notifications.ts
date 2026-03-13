import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// ========================
// NOTIFICATIONS (in-app + email tracking)
// ========================

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'deadline_reminder' | 'draw_result' | 'point_creep' | 'strategy_update' | 'welcome' | 'system'
    channel: text("channel").notNull().default("in_app"), // 'in_app' | 'email' | 'push'
    title: text("title").notNull(),
    body: text("body").notNull(),
    actionUrl: text("action_url"), // deep link within app
    read: boolean("read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),
    metadata: jsonb("metadata").notNull().default({}), // stateCode, speciesSlug, deadlineId, etc.
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_user_read_idx").on(table.userId, table.read),
    index("notifications_type_idx").on(table.type),
    index("notifications_created_at_idx").on(table.createdAt),
  ]
);

// ========================
// NOTIFICATION PREFERENCES (per-user settings)
// ========================

export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    emailEnabled: boolean("email_enabled").notNull().default(true),
    pushEnabled: boolean("push_enabled").notNull().default(true),
    deadlineReminders: boolean("deadline_reminders").notNull().default(true),
    drawResults: boolean("draw_results").notNull().default(true),
    strategyUpdates: boolean("strategy_updates").notNull().default(true),
    pointCreepAlerts: boolean("point_creep_alerts").notNull().default(true),
    quietHoursStart: text("quiet_hours_start"), // "22:00"
    quietHoursEnd: text("quiet_hours_end"), // "07:00"
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("notification_prefs_user_id_idx").on(table.userId),
  ]
);

// ========================
// RELATIONS
// ========================

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const notificationPreferencesRelations = relations(
  notificationPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationPreferences.userId],
      references: [users.id],
    }),
  })
);
