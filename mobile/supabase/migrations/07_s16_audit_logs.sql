-- S16: Audit Logs — tabela central de eventos de segurança
-- Edge functions usam role de serviço para INSERT
-- Usuários só leem seus próprios logs

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type   TEXT        NOT NULL,   -- 'auth.login', 'data.create', 'security.rate_limit', etc.
  resource     TEXT        NOT NULL,   -- 'diario_entries', 'chat_messages', 'engine', etc.
  resource_id  TEXT,
  metadata     JSONB       DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id    ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Helper chamável por edge functions (SECURITY DEFINER roda como owner, bypassa RLS)
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id    UUID,
  p_event_type TEXT,
  p_resource   TEXT,
  p_resource_id TEXT  DEFAULT NULL,
  p_metadata   JSONB  DEFAULT '{}'
) RETURNS void AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, event_type, resource, resource_id, metadata)
  VALUES (p_user_id, p_event_type, p_resource, p_resource_id, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
