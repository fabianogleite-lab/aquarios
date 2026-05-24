-- S12 Base Engine Tables
-- Execute this in Supabase SQL Editor

-- 1. XP Log Table (tracks all XP-earning actions)
CREATE TABLE IF NOT EXISTS xp_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  xp_earned int NOT NULL,
  module text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_log_user_id ON xp_log(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_log_created_at ON xp_log(created_at);

-- 2. Badges Table (unlocked achievements)
CREATE TABLE IF NOT EXISTS badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_key text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);

-- 3. User Tokens Table (in-app currency)
CREATE TABLE IF NOT EXISTS user_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token_type text NOT NULL,
  amount int DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_expires_at ON user_tokens(expires_at);

-- 4. Purchases Table (transaction history)
CREATE TABLE IF NOT EXISTS purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id text NOT NULL,
  amount_cents int,
  status text DEFAULT 'pending',
  payment_method text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);

-- Enable RLS on all tables
ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users see only their own data
CREATE POLICY "xp_log_own_data" ON xp_log
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "badges_own_data" ON badges
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "user_tokens_own_data" ON user_tokens
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "purchases_own_data" ON purchases
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for RLS filtering
CREATE INDEX IF NOT EXISTS idx_xp_log_user_id_created ON xp_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_badges_user_id_key ON badges(user_id, badge_key);
