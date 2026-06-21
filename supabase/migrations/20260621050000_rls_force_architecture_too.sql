-- ============================================================
-- Fechar aquarios_architecture também (estratégia holding)
-- ============================================================

BEGIN;

ALTER TABLE public.aquarios_architecture FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.aquarios_architecture FROM anon;
GRANT SELECT ON public.aquarios_architecture TO service_role;

DROP POLICY IF EXISTS "arch_auth_read" ON public.aquarios_architecture;
DROP POLICY IF EXISTS "auth_only_read" ON public.aquarios_architecture;
DROP POLICY IF EXISTS "Anyone can read architecture" ON public.aquarios_architecture;

CREATE POLICY "arch_sr_only" ON public.aquarios_architecture
  FOR SELECT TO service_role USING (true);

COMMIT;
