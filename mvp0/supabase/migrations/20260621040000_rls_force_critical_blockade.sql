-- ============================================================
-- FORÇA RLS: remover TODAS as policies permissivas de anon
-- e criar APENAS policies restritivas (service_role ou auth)
-- ============================================================

BEGIN;

-- ============================================================
-- 1. arkhe_holding — ZERO acesso anon
-- ============================================================
ALTER TABLE public.arkhe_holding FORCE ROW LEVEL SECURITY;
-- Remove TODAS as políticas conhecidas
REVOKE ALL ON public.arkhe_holding FROM anon;
REVOKE ALL ON public.arkhe_holding FROM authenticated;

-- Recriar: ONLY service_role pode ler
GRANT SELECT ON public.arkhe_holding TO service_role;

-- Recriar policies limpas
DROP POLICY IF EXISTS "Anyone can read arkhe" ON public.arkhe_holding;
DROP POLICY IF EXISTS "arkhe_service_role_only" ON public.arkhe_holding;
DROP POLICY IF EXISTS "service_role_only" ON public.arkhe_holding;

CREATE POLICY "arkhe_sr_only" ON public.arkhe_holding
  FOR SELECT TO service_role USING (true);

-- ============================================================
-- 2. intellectual_property_registry — ZERO acesso anon
-- ============================================================
ALTER TABLE public.intellectual_property_registry FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.intellectual_property_registry FROM anon;
REVOKE ALL ON public.intellectual_property_registry FROM authenticated;
GRANT SELECT ON public.intellectual_property_registry TO service_role;

DROP POLICY IF EXISTS "Anyone can read ip_registry" ON public.intellectual_property_registry;
DROP POLICY IF EXISTS "ip_service_role_only" ON public.intellectual_property_registry;
DROP POLICY IF EXISTS "service_role_only" ON public.intellectual_property_registry;

CREATE POLICY "ip_sr_only" ON public.intellectual_property_registry
  FOR SELECT TO service_role USING (true);

COMMIT;
