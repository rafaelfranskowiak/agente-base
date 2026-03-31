CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  whatsapp_id TEXT,
  jid TEXT,
  lid TEXT,
  name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  contact_id TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_msgs_tenant_contact ON conversation_messages(tenant_id, contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_msgs_embedding ON conversation_messages USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS conversation_summaries (
  tenant_id UUID,
  contact_id TEXT,
  summary TEXT NOT NULL DEFAULT '',
  is_bot_paused BOOLEAN DEFAULT FALSE,
  bot_paused_at TIMESTAMPTZ,
  UNIQUE(tenant_id, contact_id)
);

CREATE TABLE IF NOT EXISTS tool_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  contact_id TEXT,
  tool_name TEXT NOT NULL,
  tool_args JSONB,
  tool_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
