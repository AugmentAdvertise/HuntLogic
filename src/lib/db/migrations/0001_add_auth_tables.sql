-- =============================================================================
-- Migration 0001: Auth Tables for Auth.js
-- =============================================================================
-- Adds OAuth account linking and email verification token tables.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Auth accounts (OAuth provider links — Google, Apple, Email)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  type TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS idx_auth_accounts_user_id ON auth_accounts(user_id);

-- ---------------------------------------------------------------------------
-- Verification tokens (magic link email verification)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);
