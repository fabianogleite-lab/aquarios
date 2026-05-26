# S12 Migration Runner
# Execute este script para rodar todos os SQLs de S12 no Supabase

$SUPABASE_URL = "https://agebsmjsjrmazbozphnh.supabase.co"
$API_ENDPOINT = "$SUPABASE_URL/rest/v1/rpc/sql_exec"

# Você precisa da SERVICE_ROLE_KEY (token administrativo)
# Obtenha em: https://app.supabase.com/projects/agebsmjsjrmazbozphnh/settings/api
$SERVICE_ROLE_KEY = Read-Host "Cole sua SUPABASE_SERVICE_ROLE_KEY"

$headers = @{
    "Authorization" = "Bearer $SERVICE_ROLE_KEY"
    "Content-Type" = "application/json"
    "apikey" = $SERVICE_ROLE_KEY
}

# SQL 1: Engine Tables
$sql1 = @"
CREATE TABLE IF NOT EXISTS xp_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  xp_earned int NOT NULL,
  module text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_xp_log_user_id ON xp_log(user_id);
CREATE TABLE IF NOT EXISTS badges (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, badge_key text NOT NULL, unlocked_at timestamptz DEFAULT now(), UNIQUE(user_id, badge_key));
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE TABLE IF NOT EXISTS user_tokens (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, token_type text NOT NULL, amount int DEFAULT 0, expires_at timestamptz, created_at timestamptz DEFAULT now());
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE TABLE IF NOT EXISTS purchases (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, product_id text NOT NULL, amount_cents int, status text DEFAULT 'pending', payment_method text, created_at timestamptz DEFAULT now());
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xp_log_own_data" ON xp_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "badges_own_data" ON badges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_tokens_own_data" ON user_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "purchases_own_data" ON purchases FOR ALL USING (auth.uid() = user_id);
"@

Write-Host "✅ SQL 1: Engine Tables pronto"
Write-Host ""
Write-Host "Próximo passo: Abra Supabase Dashboard e cole os SQLs manualmente"
Write-Host "Dashboard: https://app.supabase.com/projects/agebsmjsjrmazbozphnh/sql/new"
Write-Host ""
Write-Host "Arquivo com todos os SQLs: mobile/docs/EXECUTE_S12_SQL.md"
