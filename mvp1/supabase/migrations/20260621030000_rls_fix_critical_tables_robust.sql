-- ============================================================
-- RLS Fix: versão robusta para tabelas sensíveis críticas
-- DROP all existing policies e recreate com segurança
-- ============================================================

BEGIN;

-- ============================================================
-- 1. arkhe_holding — CRÍTICO: CPF fundador (service_role only)
-- ============================================================
ALTER TABLE public.arkhe_holding ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_only" ON public.arkhe_holding;
CREATE POLICY "arkhe_service_role_only"
  ON public.arkhe_holding
  FOR SELECT
  USING (auth.role() = 'service_role');

-- ============================================================
-- 2. intellectual_property_registry — CRÍTICO: arquitetura completa (service_role only)
-- ============================================================
ALTER TABLE public.intellectual_property_registry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_only" ON public.intellectual_property_registry;
CREATE POLICY "ip_service_role_only"
  ON public.intellectual_property_registry
  FOR SELECT
  USING (auth.role() = 'service_role');

-- ============================================================
-- 3. aquarios_architecture — estratégia holding (authenticated + service_role)
-- ============================================================
ALTER TABLE public.aquarios_architecture ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_only_read" ON public.aquarios_architecture;
CREATE POLICY "arch_auth_read"
  ON public.aquarios_architecture
  FOR SELECT
  USING (auth.role() IN ('authenticated', 'service_role'));

-- ============================================================
-- 4. aquarios_decisions — decisões internas (authenticated + service_role)
-- ============================================================
ALTER TABLE public.aquarios_decisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_only_read" ON public.aquarios_decisions;
CREATE POLICY "decisions_auth_read"
  ON public.aquarios_decisions
  FOR SELECT
  USING (auth.role() IN ('authenticated', 'service_role'));

-- ============================================================
-- 5. aquarios_divergencias — conflitos (authenticated + service_role)
-- ============================================================
ALTER TABLE public.aquarios_divergencias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_only_read" ON public.aquarios_divergencias;
CREATE POLICY "divergencias_auth_read"
  ON public.aquarios_divergencias
  FOR SELECT
  USING (auth.role() IN ('authenticated', 'service_role'));

-- ============================================================
-- 6. aquarios_eixo_distribution — roadmap (authenticated + service_role)
-- ============================================================
ALTER TABLE public.aquarios_eixo_distribution ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_only_read" ON public.aquarios_eixo_distribution;
CREATE POLICY "eixo_auth_read"
  ON public.aquarios_eixo_distribution
  FOR SELECT
  USING (auth.role() IN ('authenticated', 'service_role'));

-- ============================================================
-- 7. kb_foundation — referencias filosoficas (authenticated + service_role)
-- ============================================================
ALTER TABLE public.kb_foundation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_only_read" ON public.kb_foundation;
CREATE POLICY "kb_auth_read"
  ON public.kb_foundation
  FOR SELECT
  USING (auth.role() IN ('authenticated', 'service_role'));

-- ============================================================
-- 8. personas_cultural_map — mapa cultural (authenticated + service_role)
-- ============================================================
ALTER TABLE public.personas_cultural_map ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_only_read" ON public.personas_cultural_map;
CREATE POLICY "personas_cultural_auth_read"
  ON public.personas_cultural_map
  FOR SELECT
  USING (auth.role() IN ('authenticated', 'service_role'));

-- ============================================================
-- 9. roadmap_phase_log — timeline (authenticated + service_role)
-- ============================================================
ALTER TABLE public.roadmap_phase_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_only_read" ON public.roadmap_phase_log;
CREATE POLICY "roadmap_auth_read"
  ON public.roadmap_phase_log
  FOR SELECT
  USING (auth.role() IN ('authenticated', 'service_role'));

-- ============================================================
-- 10. ecumenic_references — refs filosoficas (authenticated + service_role)
-- ============================================================
ALTER TABLE public.ecumenic_references ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_only_read" ON public.ecumenic_references;
CREATE POLICY "ecumenic_ref_auth_read"
  ON public.ecumenic_references
  FOR SELECT
  USING (auth.role() IN ('authenticated', 'service_role'));

-- ============================================================
-- 11. archetype_polarity — design (authenticated + service_role)
-- ============================================================
ALTER TABLE public.archetype_polarity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_only_read" ON public.archetype_polarity;
CREATE POLICY "archetype_auth_read"
  ON public.archetype_polarity
  FOR SELECT
  USING (auth.role() IN ('authenticated', 'service_role'));

-- ============================================================
-- 12. aquarios_constitution — pilar 2 + leis (com filtro is_public)
-- ============================================================
ALTER TABLE public.aquarios_constitution ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_only_read" ON public.aquarios_constitution;
-- Regra: linhas com is_public=true legíveis por todos; outras por service_role só
CREATE POLICY "constitution_public_rows"
  ON public.aquarios_constitution
  FOR SELECT
  USING (is_public IS TRUE OR auth.role() = 'service_role');

COMMIT;
