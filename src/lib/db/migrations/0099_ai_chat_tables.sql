-- AI Chat & Knowledge Chunks tables
-- Requires pgvector extension for embedding similarity search

-- Step 1: Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Knowledge chunks for RAG
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,           -- 'regulation' | 'unit_data' | 'species'
  source_id TEXT NOT NULL,             -- e.g. 'ut-elk-2024', 'unit-68'
  state TEXT,
  species TEXT,
  unit_id TEXT,
  content TEXT NOT NULL,
  embedding vector(1024),              -- Voyage embed dimension
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx
  ON knowledge_chunks
  USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS knowledge_chunks_source_type_idx
  ON knowledge_chunks (source_type);

CREATE INDEX IF NOT EXISTS knowledge_chunks_state_idx
  ON knowledge_chunks (state);

-- Step 3: AI chat sessions
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  unit_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_chat_sessions_user_id_idx
  ON ai_chat_sessions (user_id);

-- Step 4: AI chat messages
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,                  -- 'user' | 'assistant'
  content TEXT NOT NULL,
  citations JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_chat_messages_session_id_idx
  ON ai_chat_messages (session_id);
