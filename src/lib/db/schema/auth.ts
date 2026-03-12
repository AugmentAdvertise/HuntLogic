// =============================================================================
// Auth Schema — OAuth accounts + verification tokens for Auth.js
// =============================================================================

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  unique,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// =============================================================================
// AUTH ACCOUNTS — OAuth provider links (Google, Apple, Email)
// =============================================================================

export const authAccounts = pgTable(
  "auth_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    provider: text("provider").notNull(), // 'google', 'apple', 'email'
    providerAccountId: text("provider_account_id").notNull(),
    type: text("type").notNull(), // 'oauth', 'email', 'oidc'
    access_token: text("access_token"),
    refresh_token: text("refresh_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("auth_accounts_provider_unique").on(
      table.provider,
      table.providerAccountId
    ),
    index("auth_accounts_user_id_idx").on(table.userId),
  ]
);

// =============================================================================
// VERIFICATION TOKENS — Magic link email verification
// =============================================================================

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ]
);

// =============================================================================
// RELATIONS
// =============================================================================

export const authAccountsRelations = relations(authAccounts, ({ one }) => ({
  user: one(users, {
    fields: [authAccounts.userId],
    references: [users.id],
  }),
}));
