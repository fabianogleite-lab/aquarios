-- ============================================================
-- FIX SEGURANÇA · RLS de ESCRITA — endurecimento em massa
-- Migration 18 · Data: 05/06/2026
-- Follow-up da migration 17 (que fechou só public.aquarios_modules)
--
-- NOTA DE NUMERAÇÃO: o trabalho paralelo de features renumerou suas
--   migrations para 19–22 (gratitude/hydration/relationship/arcana),
--   deixando 17 e 18 para as migrations de SEGURANÇA
--   (17_aquarios_modules_rls + esta = 18). A numeração de features esteve
--   em fluxo nesta sessão; se 18 colidir de novo, lembre: esta migration
--   só toca tabelas das migrations 07–13, então qualquer número ÚNICO >= 14
--   serve. Os identificadores internos (rlsw_*) NÃO dependem do número do
--   arquivo — basta renomear o arquivo.
--
-- VULNERABILIDADE (mesma classe da migration 17):
--   Dezenas de tabelas em `public` usam o padrão FRÁGIL introduzido nas
--   migrations 07, 08, 10, 11 e 12:
--       CREATE POLICY "..." ON public.<t>
--         FOR ALL WITH CHECK (auth.role() = 'service_role');
--   — SEM cláusula USING e SEM cláusula TO. Sem TO, a policy aplica-se a
--   PUBLIC (inclui anon). Sem USING, ela não restringe QUAIS linhas um
--   UPDATE/DELETE pode atingir. Somado aos GRANTs que o Supabase concede
--   por padrão a anon/authenticated, isso abre escrita anônima — o mesmo
--   bug corrigido em aquarios_modules.
--
-- EVIDÊNCIA (sonda REST em produção, 05/06/2026, usando SÓ a publishable
-- key sb_publishable_… — projeto agebsmjsjrmazbozphnh):
--   • INSERT anon  -> HTTP 401 code 42501 "new row violates row-level
--     security policy" (NÃO "permission denied for table") => prova que
--     anon POSSUI o GRANT de INSERT; só a RLS o barra.
--   • UPDATE anon (coluna real + filtro de 0 linhas) -> HTTP 204 => anon
--     POSSUI o GRANT de UPDATE (statement executou; 0 linhas atingidas).
--   • DELETE anon (filtro de 0 linhas)              -> HTTP 204 => anon
--     POSSUI o GRANT de DELETE.
--   Todas as sondas usaram filtro contraditório (id=eq.X & id=neq.X) =>
--   0 linhas afetadas (Content-Range: */0) — NÃO destrutivas.
--   • aquarios_modules ainda aceitou escrita anon => a migration 17 ainda
--     NÃO está em produção. PRÉ-REQUISITO: aplicar 11–17 antes desta
--     (um `supabase db push` aplica todas em ordem).
--
-- CORREÇÃO (defesa em profundidade — RLS + GRANTs), por tabela:
--   1. RLS permanece/é habilitado.
--   2. Remove TODAS as policies atuais da tabela (a frágil FOR ALL e a de
--      leitura) e recria um conjunto explícito e role-scoped.
--   3. ESCRITA (INSERT/UPDATE/DELETE): SOMENTE service_role. Estas tabelas
--      são escritas por edge functions e por funções SECURITY DEFINER
--      (log_audit_event, hygeios_log_content_audit, panaceia_deliver_tokens,
--      aquarios_record_decision, aquarios_validate_admin_access) — todas
--      rodam como owner e CONTORNAM a RLS, logo nada quebra. O backoffice
--      (docs/backoffice.html) só escreve aquarios_modules (já tratado na
--      mig 17); nenhuma tabela aqui precisa de escrita por admin humano,
--      então is_aquarios_admin() não é usado nesta migration.
--   4. LEITURA: decidida POR TABELA, preservando o comportamento atual:
--        - public : catálogo/referência lido pelo app/site (mantém o mesmo
--                   predicado de hoje, ex.: active=true, is_canonical=true).
--        - owner  : dado de usuário — só o dono lê (auth.uid() = user_id),
--                   restrito a authenticated (anon estruturalmente fora).
--        - none   : tabela de uso interno (config PII, sinais, logs de
--                   pagamento) — SEM policy de SELECT (RLS nega leitura a
--                   anon/authenticated; confirmado na sonda: 0 linhas).
--   5. GRANT layer: REVOKE INSERT/UPDATE/DELETE de anon — fecha o vetor
--      ABAIXO da RLS (PATCH/DELETE/POST anon passa a falhar com
--      "permission denied for table" ANTES de chegar à RLS).
--      authenticated mantém o GRANT, mas a RLS acima só deixa passar
--      service_role — mesma postura da migration 17.
--
-- FORA DE ESCOPO (intencional):
--   • aquarios_modules            -> já corrigida pela migration 17.
--   • aquarios_admin_grants e aquarios_arcana_catalog -> usam a variante
--     COM USING (FOR ALL USING (service_role) WITH CHECK (service_role)),
--     que não é explorável para escrita anon; e são lidas via SECURITY
--     DEFINER. Deixadas como estão.
--   • performance_metrics         -> não tem a FOR ALL frágil; o INSERT
--     anônimo de telemetria é intencional (user_id IS NULL).
--   • Leitura "larga demais" de aquarios_constitution (expõe linhas
--     is_public=false) é um vazamento de LEITURA, classe diferente —
--     tratar em migration própria para não misturar escopos.
--
-- Idempotente: dropa-e-recria policies; REVOKE/GRANT convergem; o helper
-- vive em pg_temp e some no fim da sessão. Pode ser reaplicada.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- PARTE 1 · helper pg_temp.rlsw_harden() — aplica o mesmo padrão a 1 tabela
--
-- p_read_mode: 'public' | 'owner' | 'none'
-- p_read_using: predicado SQL do SELECT público (só usado em 'public').
--   ATENÇÃO: injetado como SQL literal — são CONSTANTES confiáveis escritas
--   neste arquivo (nunca entrada de usuário). %I cuida do nome da tabela.
-- Guarda de existência: pula tabelas ausentes (estado parcial de migrations)
-- com NOTICE, em vez de abortar.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION pg_temp.rlsw_harden(
  p_table       text,
  p_read_mode   text,
  p_read_using  text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
AS $fn$
DECLARE
  r record;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = p_table
  ) THEN
    RAISE NOTICE '[rls-harden] SKIP %  (tabela ausente — aplique as migrations anteriores antes)', p_table;
    RETURN;
  END IF;

  -- 1) RLS habilitado
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', p_table);

  -- 2) limpa TODAS as policies atuais (remove a frágil FOR ALL e a de leitura)
  FOR r IN
    SELECT policyname
      FROM pg_policies
     WHERE schemaname = 'public' AND tablename = p_table
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, p_table);
  END LOOP;

  -- 3) ESCRITA: somente service_role (edge functions / SECURITY DEFINER).
  --    Explícito por clareza — service_role já tem BYPASSRLS no Supabase.
  EXECUTE format(
    'CREATE POLICY "rlsw_service_role_all" ON public.%I '
    'FOR ALL TO service_role USING (true) WITH CHECK (true)',
    p_table);

  -- 4) LEITURA conforme decisão por tabela
  IF p_read_mode = 'public' THEN
    EXECUTE format(
      'CREATE POLICY "rlsw_public_select" ON public.%I FOR SELECT USING (%s)',
      p_table, COALESCE(p_read_using, 'true'));
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', p_table);

  ELSIF p_read_mode = 'owner' THEN
    EXECUTE format(
      'CREATE POLICY "rlsw_owner_select" ON public.%I '
      'FOR SELECT TO authenticated USING (auth.uid() = user_id)',
      p_table);

  ELSIF p_read_mode = 'none' THEN
    NULL;  -- uso interno: sem SELECT (RLS nega leitura a anon/authenticated)

  ELSE
    RAISE EXCEPTION '[rls-harden] read_mode invalido para %: %', p_table, p_read_mode;
  END IF;

  -- 5) GRANT layer: anon perde escrita (defesa abaixo da RLS).
  --    authenticated mantém o GRANT; a RLS acima (só service_role) o barra.
  EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON public.%I FROM anon', p_table);

  RAISE NOTICE '[rls-harden] OK  %  (read=%)', p_table, p_read_mode;
END;
$fn$;


-- ------------------------------------------------------------
-- PARTE 2 · MANIFESTO — fonte única da lista de alvos e da decisão de leitura
-- (tabela temporária; some no fim da sessão. Reusada na verificação.)
-- ------------------------------------------------------------
CREATE TEMP TABLE _rlsw_targets (
  table_name   text PRIMARY KEY,
  read_mode    text NOT NULL,    -- 'public' | 'owner' | 'none'
  read_using   text,             -- predicado p/ 'public'
  origin       text              -- migration de origem (rastreabilidade)
) ON COMMIT DROP;

INSERT INTO _rlsw_targets (table_name, read_mode, read_using, origin) VALUES
  -- ---- OWNER (dado de usuário; só o dono lê) ----
  ('audit_logs',                       'owner',  NULL,                  '07'),
  ('content_audit_log',                'owner',  NULL,                  '10'),
  ('user_violations',                  'owner',  NULL,                  '10'),
  ('user_archetype_journey',           'owner',  NULL,                  '10'),
  ('telemetry_vitality_logs',          'owner',  NULL,                  '12'),
  ('stripe_customers',                 'owner',  NULL,                  '11'),
  ('panaceia_transactions',            'owner',  NULL,                  '11'),
  ('panaceia_subscriptions',           'owner',  NULL,                  '11'),

  -- ---- PUBLIC (catálogo/referência lido pelo app/site) ----
  --      predicado preservado EXATAMENTE como hoje
  ('aquarios_constitution',            'public', 'true',                '10'),
  ('persona_management',               'public', 'true',                '10'),
  ('archetype_balance',                'public', 'true',                '10'),
  ('archetype_polarity',               'public', 'true',                '10'),
  ('panaceia_offerings',               'public', 'active = true',       '10'),
  ('arkhe_holding',                    'public', 'true',                '12'),
  ('aquarios_architecture',            'public', 'true',                '12'),
  ('intellectual_property_registry',   'public', 'true',                '12'),
  ('evolution_levels',                 'public', 'true',                '12'),
  ('alexandrios_kb',                   'public', 'is_canonical = true', '12'),
  ('kb_foundation',                    'public', 'is_active = true',    '12'),
  ('personas_cultural_map',            'public', 'true',                '12'),
  ('personas',                         'public', 'is_active = true',    '12'),
  ('panaceia_pack_manual_definition',  'public', 'true',                '12'),
  ('panaceia_offering_categories',     'public', 'true',                '12'),
  ('plans',                            'public', 'true',                '12'),
  ('roadmap_phase_log',                'public', 'true',                '12'),
  ('aquarios_divergencias',            'public', 'true',                '12'),
  ('aquarios_decisions',               'public', 'true',                '12'),
  ('aquarios_eixo_distribution',       'public', 'true',                '12'),
  ('ecumenic_traditions',              'public', 'true',                '08'),
  ('ecumenic_references',              'public', 'true',                '08'),
  ('panaceia_token_packages',          'public', 'active = true',       '11'),

  -- ---- NONE (uso interno; sem leitura p/ anon/authenticated) ----
  ('pii_patterns',                     'none',   NULL,                  '10'),
  ('hygeios_cerberos_signals',         'none',   NULL,                  '10'),
  ('persona_user_interactions',        'none',   NULL,                  '10'),
  ('hermetic_balance_log',             'none',   NULL,                  '10'),
  ('stripe_webhook_log',               'none',   NULL,                  '11'),
  ('hygeios_payment_audit',            'none',   NULL,                  '11');


-- ------------------------------------------------------------
-- PARTE 3 · aplica o endurecimento a cada alvo do manifesto
-- ------------------------------------------------------------
DO $apply$
DECLARE
  t record;
BEGIN
  FOR t IN SELECT * FROM _rlsw_targets ORDER BY read_mode, table_name LOOP
    PERFORM pg_temp.rlsw_harden(t.table_name, t.read_mode, t.read_using);
  END LOOP;
END;
$apply$;


-- ------------------------------------------------------------
-- PARTE 4 · VERIFICAÇÃO automática — anon não pode mais escrever
-- Usa information_schema.role_table_grants (mesma fonte pedida no escopo).
-- ------------------------------------------------------------
DO $verify$
DECLARE
  v_bad text;
BEGIN
  SELECT string_agg(DISTINCT g.table_name || '.' || g.privilege_type, ', ')
    INTO v_bad
    FROM information_schema.role_table_grants g
    JOIN _rlsw_targets t ON t.table_name = g.table_name
   WHERE g.grantee      = 'anon'
     AND g.table_schema = 'public'
     AND g.privilege_type IN ('INSERT', 'UPDATE', 'DELETE');

  IF v_bad IS NOT NULL THEN
    RAISE WARNING '[rls-harden] ATENCAO: anon ainda tem GRANT de escrita em: %', v_bad;
  ELSE
    RAISE NOTICE  '[rls-harden] OK: anon SEM INSERT/UPDATE/DELETE em nenhuma tabela alvo.';
  END IF;
END;
$verify$;


-- ------------------------------------------------------------
-- PARTE 5 · log de auditoria da execução
-- ------------------------------------------------------------
DO $audit$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
              WHERE table_schema='public' AND table_name='audit_logs') THEN
    INSERT INTO public.audit_logs (event_type, resource, metadata)
    VALUES (
      'migration.executed',
      '18_rls_write_hardening',
      jsonb_build_object(
        'tables_targeted', (SELECT count(*) FROM _rlsw_targets),
        'pattern_fixed',   'FOR ALL WITH CHECK (auth.role()=service_role) sem USING/TO',
        'layers',          'RLS (service_role-only writes) + REVOKE anon DML',
        'executed_at',     now()
      )
    );
  END IF;
END;
$audit$;

COMMIT;

-- ============================================================
-- VERIFICAÇÃO MANUAL (rodar após aplicar):
--
--   -- 1) Nenhuma policy frágil deve sobrar (esperado: 0 linhas).
--   --    Procura FOR ALL aplicada a {public,anon} com service_role só no WITH CHECK.
--   SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
--     FROM pg_policies
--    WHERE schemaname = 'public'
--      AND cmd = 'ALL'
--      AND ('public' = ANY(roles) OR 'anon' = ANY(roles))
--      AND with_check ILIKE '%service_role%'
--    ORDER BY tablename;
--
--   -- 2) anon NÃO deve ter INSERT/UPDATE/DELETE nas tabelas alvo (esperado: 0).
--   SELECT table_name, privilege_type
--     FROM information_schema.role_table_grants
--    WHERE grantee = 'anon' AND table_schema = 'public'
--      AND privilege_type IN ('INSERT','UPDATE','DELETE')
--      AND table_name IN (
--        'audit_logs','content_audit_log','user_violations','user_archetype_journey',
--        'telemetry_vitality_logs','stripe_customers','panaceia_transactions',
--        'panaceia_subscriptions','aquarios_constitution','persona_management',
--        'archetype_balance','archetype_polarity','panaceia_offerings','arkhe_holding',
--        'aquarios_architecture','intellectual_property_registry','evolution_levels',
--        'alexandrios_kb','kb_foundation','personas_cultural_map','personas',
--        'panaceia_pack_manual_definition','panaceia_offering_categories','plans',
--        'roadmap_phase_log','aquarios_divergencias','aquarios_decisions',
--        'aquarios_eixo_distribution','ecumenic_traditions','ecumenic_references',
--        'panaceia_token_packages','pii_patterns','hygeios_cerberos_signals',
--        'persona_user_interactions','hermetic_balance_log','stripe_webhook_log',
--        'hygeios_payment_audit')
--    ORDER BY table_name, privilege_type;
--
--   -- 3) Sonda REST (deve passar a falhar com 401/403 "permission denied"):
--   --   curl -X PATCH "$SB_URL/rest/v1/aquarios_constitution?id=eq.0&id=neq.0" \
--   --     -H "apikey: $PUBLISHABLE" -H "Authorization: Bearer $PUBLISHABLE" \
--   --     -H "Content-Type: application/json" -d '{"title":"x"}'
--   --   -> antes: 204 (grant presente) · depois: 401/403 permission denied.
-- ============================================================
-- FIM — 18_rls_write_hardening.sql · ~37 tabelas endurecidas
-- ============================================================
