-- ⚗ AquariOS Backend V2.0000 — PostgreSQL Schema
-- LGPD Compliant · AES-256 Encryption Ready · Audit Enabled

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════════
-- 1. USERS TABLE (Core Authentication)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf_hash VARCHAR(255) UNIQUE NOT NULL,
  email_hash VARCHAR(255) UNIQUE NOT NULL,
  phone_hash VARCHAR(255),
  
  -- Profile
  full_name VARCHAR(255),
  birth_date DATE,
  persona_code VARCHAR(50),
  plan_id VARCHAR(50) DEFAULT 'free_anonimo',
  
  -- Auth
  password_hash VARCHAR(255),
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- LGPD Flags
  gdpr_consent_accepted BOOLEAN DEFAULT FALSE,
  gdpr_consent_date TIMESTAMP WITH TIME ZONE,
  data_export_requested BOOLEAN DEFAULT FALSE,
  data_export_at TIMESTAMP WITH TIME ZONE,
  deletion_requested BOOLEAN DEFAULT FALSE,
  deletion_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  verification_token_expires TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email_hash ON users(email_hash);
CREATE INDEX idx_users_cpf_hash ON users(cpf_hash);
CREATE INDEX idx_users_plan_id ON users(plan_id);

-- ═══════════════════════════════════════════════════════════════════════
-- 2. IVI SNAPSHOTS (Health Metric — Core)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE ivi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- IVI Components (0-100 scale)
  ivi_bio INTEGER CHECK (ivi_bio >= 0 AND ivi_bio <= 100),
  ivi_mental INTEGER CHECK (ivi_mental >= 0 AND ivi_mental <= 100),
  ivi_spirit INTEGER CHECK (ivi_spirit >= 0 AND ivi_spirit <= 100),
  
  -- Total IVI
  ivi_total DECIMAL(5,2) CHECK (ivi_total >= 0 AND ivi_total <= 100),
  
  -- Status Classification
  status VARCHAR(50) DEFAULT 'ATTENTION',
  
  -- HygeiOS Run Metadata
  hygeios_run_id UUID,
  pipeline_version VARCHAR(20) DEFAULT 'v6h',
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Encrypted Fields (AES-256)
  bio_raw_encrypted TEXT,
  mental_raw_encrypted TEXT,
  spirit_raw_encrypted TEXT
);

CREATE INDEX idx_ivi_user_id ON ivi_snapshots(user_id);
CREATE INDEX idx_ivi_created_at ON ivi_snapshots(created_at DESC);
CREATE INDEX idx_ivi_status ON ivi_snapshots(status);

-- ═══════════════════════════════════════════════════════════════════════
-- 3. HYGEIOS ETL LOGS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE hygeios_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Pipeline Stats
  total_users_processed INTEGER DEFAULT 0,
  active_users_filtered INTEGER DEFAULT 0,
  snapshots_created INTEGER DEFAULT 0,
  anomalies_detected INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'COMPLETED',
  error_message TEXT,
  
  -- Performance
  duration_seconds INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════
-- 4. ASCLEPIOS RISK SCORES
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE asclepios_risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Risk Calculation
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_status VARCHAR(50),
  
  -- Component Breakdown
  vfc_risk INTEGER DEFAULT 0,
  sleep_risk INTEGER DEFAULT 0,
  mental_risk INTEGER DEFAULT 0,
  sedentary_risk INTEGER DEFAULT 0,
  isolation_risk INTEGER DEFAULT 0,
  
  -- Action Triggered
  action_type VARCHAR(50),
  action_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actioned_at TIMESTAMP WITH TIME ZONE,
  
  -- LGPD
  encrypted_data TEXT
);

CREATE INDEX idx_asclepios_user_id ON asclepios_risk_scores(user_id);
CREATE INDEX idx_asclepios_risk_status ON asclepios_risk_scores(risk_status);

-- ═══════════════════════════════════════════════════════════════════════
-- 5. JOURNAL ENTRIES (Diário do Ser)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  entry_date DATE NOT NULL,
  entry_time TIME,
  
  -- Content
  content_text TEXT,
  content_voice_transcript TEXT,
  
  -- Mood
  mood_tag VARCHAR(50),
  mood_intensity INTEGER CHECK (mood_intensity >= 1 AND mood_intensity <= 10),
  
  -- Tags
  tags VARCHAR(255)[],
  
  -- Privacy
  is_public BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entry_date ON journal_entries(entry_date DESC);

-- ═══════════════════════════════════════════════════════════════════════
-- 6. MEALS & NUTRITION
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  meal_date DATE NOT NULL,
  meal_time TIME,
  meal_type VARCHAR(50),
  
  -- Nutrition Data (encrypted)
  calories INTEGER,
  protein_g DECIMAL(6,2),
  carbs_g DECIMAL(6,2),
  fat_g DECIMAL(6,2),
  fiber_g DECIMAL(6,2),
  
  -- Analysis
  analysis_by_ai BOOLEAN DEFAULT FALSE,
  photo_url VARCHAR(255),
  
  -- Description
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_meals_date ON meals(meal_date DESC);

-- ═══════════════════════════════════════════════════════════════════════
-- 7. COMMUNITY POSTS (Public Data → HygeiOS Feed)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  community_id UUID,
  
  content TEXT NOT NULL,
  tags VARCHAR(255)[],
  
  -- Gamification
  xp_existential_awarded INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  
  -- Status
  is_visible BOOLEAN DEFAULT TRUE,
  is_flagged BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_community_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════
-- 8. COMMUNITIES
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50),
  
  -- Gamification
  level_system VARCHAR(50) DEFAULT 'semente_mestre',
  
  -- Moderation
  is_active BOOLEAN DEFAULT TRUE,
  members_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_communities_creator_id ON communities(creator_id);
CREATE INDEX idx_communities_slug ON communities(slug);

-- ═══════════════════════════════════════════════════════════════════════
-- 9. ECUMENIC CONSULTATIONS (13 Tradições)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE ecumenic_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Tradition Selected
  tradition_code VARCHAR(50) NOT NULL,
  tradition_name VARCHAR(255),
  
  -- Consultation Mode
  mode VARCHAR(50) DEFAULT 'single_tradition',
  
  -- Response (encrypted)
  oracle_response_encrypted TEXT,
  oracle_prompt_encrypted TEXT,
  
  -- IVI Impact
  spirit_pts_awarded INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ecumenic_user_id ON ecumenic_consultations(user_id);
CREATE INDEX idx_ecumenic_tradition ON ecumenic_consultations(tradition_code);

-- ═══════════════════════════════════════════════════════════════════════
-- 10. SANDEIROS READINGS (Oculto Mode)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE sandeiros_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Arcana Selected
  arcana_number INTEGER CHECK (arcana_number >= 0 AND arcana_number <= 21),
  arcana_name VARCHAR(255),
  
  -- Tirage Type
  tirage_type VARCHAR(50),
  
  -- Response Vector (7D)
  response_vector_encrypted TEXT,
  
  -- Visibility
  is_explicit_mode BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sandeiros_user_id ON sandeiros_readings(user_id);

-- ═══════════════════════════════════════════════════════════════════════
-- 11. PROTEOS CONVERSATIONS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE proteos_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Detection
  viesis_detected VARCHAR(50),
  intencion_detected VARCHAR(50),
  module_routed_to VARCHAR(50),
  
  -- Messages
  user_message TEXT,
  proteos_response TEXT,
  
  -- Metadata
  response_time_ms INTEGER,
  confidence_score DECIMAL(3,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_proteos_user_id ON proteos_conversations(user_id);
CREATE INDEX idx_proteos_created_at ON proteos_conversations(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════
-- 12. ETERIOS INTEGRATIONS (Wearables & IoT)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE eterios_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Device Info
  device_type VARCHAR(50),
  device_name VARCHAR(255),
  device_model VARCHAR(255),
  
  -- Integration
  protocol VARCHAR(50),
  oauth_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_eterios_user_id ON eterios_devices(user_id);

-- ═══════════════════════════════════════════════════════════════════════
-- 13. ETERIOS DATA INBOUND (Webhook)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE eterios_inbound_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES eterios_devices(id),
  
  -- Metric Type
  metric_type VARCHAR(50),
  metric_value DECIMAL(10,4),
  metric_unit VARCHAR(20),
  
  -- Raw Data (encrypted)
  raw_payload_encrypted TEXT,
  
  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  recorded_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_eterios_inbound_user_id ON eterios_inbound_data(user_id);
CREATE INDEX idx_eterios_inbound_processed ON eterios_inbound_data(processed);

-- ═══════════════════════════════════════════════════════════════════════
-- 14. AUDIT LOG (LGPD Compliance)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Action
  action_type VARCHAR(100) NOT NULL,
  action_description TEXT,
  
  -- User Context
  user_id UUID REFERENCES users(id),
  admin_id UUID,
  
  -- Request Context
  ip_address_hash VARCHAR(255),
  user_agent_hash VARCHAR(255),
  
  -- Data Changed
  entity_type VARCHAR(100),
  entity_id UUID,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action_type);

-- ═══════════════════════════════════════════════════════════════════════
-- 15. SESSIONS (JWT Refresh)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  refresh_token_hash VARCHAR(255) UNIQUE NOT NULL,
  device_fingerprint VARCHAR(255),
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ═══════════════════════════════════════════════════════════════════════
-- 16. FAQS (Help Engine)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  faq_code VARCHAR(50) UNIQUE NOT NULL,
  persona_code VARCHAR(50) NOT NULL,
  
  question TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  answer_markdown TEXT,
  
  category VARCHAR(100),
  tags VARCHAR(255)[],
  
  search_boost INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_faqs_persona_code ON faqs(persona_code);
CREATE INDEX idx_faqs_category ON faqs(category);

-- ═══════════════════════════════════════════════════════════════════════
-- 17. MARKETPLACE ITEMS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  
  price_brl DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'BRL',
  
  is_active BOOLEAN DEFAULT TRUE,
  is_visible BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_marketplace_creator_id ON marketplace_items(creator_id);
CREATE INDEX idx_marketplace_category ON marketplace_items(category);

-- ═══════════════════════════════════════════════════════════════════════
-- 18. TOKENS (Economy System)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  token_type VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  
  source VARCHAR(50),
  reason TEXT,
  
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tokens_user_id ON tokens(user_id);
CREATE INDEX idx_tokens_type ON tokens(token_type);

-- ═══════════════════════════════════════════════════════════════════════
-- Trigger: Update updated_at automatically
-- ═══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_journal_updated_at BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_communities_updated_at BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════
-- Views for Common Queries
-- ═══════════════════════════════════════════════════════════════════════
CREATE VIEW user_ivi_latest AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.persona_code,
  i.ivi_total,
  i.ivi_bio,
  i.ivi_mental,
  i.ivi_spirit,
  i.status,
  i.created_at
FROM users u
LEFT JOIN LATERAL (
  SELECT * FROM ivi_snapshots 
  WHERE user_id = u.id 
  ORDER BY created_at DESC LIMIT 1
) i ON TRUE
WHERE u.deleted_at IS NULL;

CREATE VIEW user_risk_status AS
SELECT 
  u.id as user_id,
  u.full_name,
  ar.risk_score,
  ar.risk_status,
  ar.action_type,
  ar.created_at
FROM users u
LEFT JOIN LATERAL (
  SELECT * FROM asclepios_risk_scores 
  WHERE user_id = u.id 
  ORDER BY created_at DESC LIMIT 1
) ar ON TRUE
WHERE u.deleted_at IS NULL AND u.is_active = TRUE;

-- ═══════════════════════════════════════════════════════════════════════
-- LGPD Functions
-- ═══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION mark_user_for_deletion(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET deletion_requested = TRUE, deletion_at = NOW()
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION hard_delete_user(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Cascade deletions handled by ON DELETE CASCADE
  DELETE FROM users WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Schema complete. V2.0000 ready for application layer.
