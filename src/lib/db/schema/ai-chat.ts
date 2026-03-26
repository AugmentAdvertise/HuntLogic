import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

// ========================
// AI CHAT SESSIONS
// ========================

export const aiChatSessions = pgTable(
  "ai_chat_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    unitId: text("unit_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("ai_chat_sessions_user_id_idx").on(table.userId),
  ]
);

// ========================
// AI CHAT MESSAGES
// ========================

export const aiChatMessages = pgTable(
  "ai_chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => aiChatSessions.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // 'user' | 'assistant'
    content: text("content").notNull(),
    citations: jsonb("citations"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("ai_chat_messages_session_id_idx").on(table.sessionId),
  ]
);

// ========================
// RELATIONS
// ========================

export const aiChatSessionsRelations = relations(
  aiChatSessions,
  ({ many }) => ({
    messages: many(aiChatMessages),
  })
);

export const aiChatMessagesRelations = relations(
  aiChatMessages,
  ({ one }) => ({
    session: one(aiChatSessions, {
      fields: [aiChatMessages.sessionId],
      references: [aiChatSessions.id],
    }),
  })
);
