-- ============================================================
-- FIX SEGURANÇA · RLS de LEITURA — fechamento de vazamentos de READ
-- Migration 23 · Data: 06/06/2026
-- Follow-up das migrations 17 (aquarios_modules) e 18 (escrita em massa).
--
-- ESCOPO: SOMENTE LEITURA. Esta migration NÃO altera nenhuma policy/grant
--   de escrita — o endurecimento de INSERT/UPDATE/DELETE já foi feito nas
--   migrations 17 e 18 (vide FORA DE ESCOPO na 18, linhas ~74-77, que
--   deliberadamente adiou ESTE vazamento de leitura para "migration própria
--   para não misturar escopos"). Esta é essa migration.
--
-- NUMERAÇÃO: 22_arcana_draws.sql é a última migration de feature; 23 está
--   livre. Identificadores internos não dependem do número do arquivo — se
--   23 colidir num push paralelo, renomeie o arquivo para qualquer nº único
--   > 22; o conteúdo é idempotente.
--
-- ─────────────────────────────────────────────────────────────
-- VULNERABILIDADE (classe READ — distinta da classe WRITE das mig 17/18):
--
--   Duas tabelas de referência têm policy de leitura larga demais
--   ("Anyone can read ... FOR SELECT USING (true)"), expondo ao papel anon
--   (e a authenticated) dados marcados como OCULTOS por invariante de
--   produto ("7 leis herméticas NUNCA expostas ao usuário";
--   "oracle_modern / oracle_label NUNCA expostos como label").
--
--   (A) public.aquarios_constitution  (mig 10, linha 84)
--       Policy "Anyone can read constitution" FOR SELECT USING (true)
--       IGNORA a coluna is_public. As 10 linhas do pilar 'sandeiros'
--       (is_public=false: O Quarto Caminho, A Voz do Silêncio, Bardo Thodol
--       + as 7 Leis Herméticas do Caibalion) ficam legíveis por anon.
--
--   (B) public.ecumenic_traditions    (mig 08, linhas 14-15, 38-39)
--       Policy "Anyone can read traditions" FOR SELECT USING (true) +
--       GRANT SELECT de tabela inteira => as colunas oracle_modern /
--       oracle_label (documentadas como "campo oculto: nunca exposto ao
--       usuário") voltam em qualquer SELECT anon.
--
-- EVIDÊNCIA (sonda REST em produção · projeto agebsmjsjrmazbozphnh ·
-- 06/06/2026 · usando SÓ a publishable key sb_publishable_… = anon):
--   • GET /rest/v1/aquarios_constitution?select=id
--       -> HTTP 206 · Content-Range 0-0/20   (anon vê as 20 linhas; deveria
--          ver só as 10 públicas do pilar psicologia_social)
--   • GET /rest/v1/aquarios_constitution?select=pillar,title,hermetic_law,is_public&pillar=eq.sandeiros
--       -> HTTP 200 · retorna as linhas sandeiros com is_public=false e
--          hermetic_law preenchido  (VAZAMENTO confirmado)
--   • GET /rest/v1/ecumenic_traditions?select=slug,oracle_modern,oracle_label
--       -> HTTP 200 · retorna oracle_modern/oracle_label  (VAZAMENTO confirmado)
--
-- NÃO HÁ CONSUMIDOR no app/edge que dependa do dado oculto:
--   • grep mobile/ por '.from("aquarios_constitution"|"ecumenic_traditions")'
--     => 0 ocorrências em runtime (só docs/*.md e data/divergencias.ts).
--   • A edge function chat (supabase/functions/chat/index.ts) embute as
--     strings de "Oracle" como CONSTANTES no código — NÃO lê
--     ecumenic_traditions. Logo ocultar oracle_* não quebra a IA.
--   • HygeiOS/SandeirOS, quando lerem a constituição, o farão server-side
--     via service_role, que tem BYPASSRLS — esta migration não os afeta.
--   Conclusão: ambos os fixes são seguros (nenhuma leitura legítima quebra).
--
-- ─────────────────────────────────────────────────────────────
-- CORREÇÃO:
--   (A) aquarios_constitution — fix de NÍVEL DE LINHA (row-level):
--       troca a USING (true) por USING (is_public IS TRUE). As linhas
--       ocultas (is_public=false/NULL) passam a ser service_role-only.
--       (`IS TRUE` é fail-closed: NULL nunca vaza.)
--
--   (B) ecumenic_traditions — fix de NÍVEL DE COLUNA (column-safe), pois o
--       segredo aqui é POR-COLUNA (todas as linhas são públicas; só
--       oracle_modern/oracle_label são ocultas). Duas camadas:
--         1. GRANT de coluna: REVOKE SELECT da tabela inteira de
--            anon/authenticated e GRANT SELECT apenas das colunas seguras
--            (id, slug, name, icon, active, created_at). É o LIMITE real:
--            mesmo pedindo a coluna explicitamente (select=oracle_modern),
--            anon recebe 403 "permission denied for column".
--         2. VIEW pública ecumenic_traditions_public (security_invoker) com
--            só as colunas seguras — superfície segura para `select=*`
--            (um GET cru na tabela base agora erra para anon porque o '*'
--            toca colunas revogadas; a view é o caminho recomendado/ergonômico).
--       Só service_role (server-side) continua lendo oracle_*.
--
-- Idempotente: DROP POLICY IF EXISTS + recreate; REVOKE/GRANT convergem;
--   DROP VIEW IF EXISTS + CREATE. Pode ser reaplicada com segurança.
-- ============================================================

BEGIN;

-- ============================================================
-- (A) public.aquarios_constitution — SELECT só de linhas is_public
-- ============================================================
ALTER TABLE public.aquarios_constitution ENABLE ROW LEVEL SECURITY;

-- Remove TODAS as policies de leitura conhecidas (de qualquer migration que
-- tenha rodado: 10 original, 18 rlsw_*, ou re-run desta). NÃO toca a policy
-- de escrita (service_role) — fora de escopo (mig 18).
DROP POLICY IF EXISTS "Anyone can read constitution" ON public.aquarios_constitution;  -- mig 10
DROP POLICY IF EXISTS "rlsw_public_select"           ON public.aquarios_constitution;  -- mig 18
DROP POLICY IF EXISTS "constitution_public_select"   ON public.aquarios_constitution;  -- self (re-run)

-- LEITURA: pública APENAS para linhas marcadas is_public. As linhas ocultas
-- do pilar 'sandeiros' (is_public=false) deixam de existir para anon/auth.
-- service_role (BYPASSRLS) continua lendo tudo — HygeiOS/SandeirOS intactos.
CREATE POLICY "constitution_public_select"
  ON public.aquarios_constitution
  FOR SELECT
  USING (is_public IS TRUE);

-- Mantém o GRANT de SELECT (Supabase já concede por padrão; explícito p/
-- auto-suficiência). A linha-a-linha quem decide agora é a RLS acima.
GRANT SELECT ON public.aquarios_constitution TO anon, authenticated;


-- ============================================================
-- (B) public.ecumenic_traditions — esconder oracle_modern / oracle_label
-- ============================================================
ALTER TABLE public.ecumenic_traditions ENABLE ROW LEVEL SECURITY;

-- RLS de leitura: todas as linhas seguem públicas (o segredo é por-COLUNA,
-- não por-linha). Recria limpo; NÃO toca a policy de escrita (service_role).
DROP POLICY IF EXISTS "Anyone can read traditions" ON public.ecumenic_traditions;  -- mig 08
DROP POLICY IF EXISTS "rlsw_public_select"         ON public.ecumenic_traditions;  -- mig 18
DROP POLICY IF EXISTS "traditions_public_select"   ON public.ecumenic_traditions;  -- self (re-run)

CREATE POLICY "traditions_public_select"
  ON public.ecumenic_traditions
  FOR SELECT
  USING (true);

-- CAMADA 1 (limite real) — privilégio de COLUNA:
-- tira o SELECT de tabela inteira e devolve só as colunas seguras.
-- Depois disto: select=slug,name,icon -> OK · select=oracle_modern -> 403.
REVOKE SELECT ON public.ecumenic_traditions FROM anon, authenticated;
GRANT  SELECT (id, slug, name, icon, active, created_at)
  ON public.ecumenic_traditions TO anon, authenticated;

-- CAMADA 2 (ergonomia) — VIEW pública só com colunas seguras.
-- `select=*` na tabela base agora erra p/ anon (o '*' toca colunas
-- revogadas); esta view é a superfície recomendada para leitura pública.
-- security_invoker=true (PG15+; projeto é PG17): respeita a RLS da base e os
-- grants de coluna do chamador — nunca expõe oracle_* (não está no SELECT).
DROP VIEW IF EXISTS public.ecumenic_traditions_public;
CREATE VIEW public.ecumenic_traditions_public
  WITH (security_invoker = true) AS
  SELECT id, slug, name, icon, active, created_at
    FROM public.ecumenic_traditions;

GRANT SELECT ON public.ecumenic_traditions_public TO anon, authenticated;

COMMENT ON VIEW public.ecumenic_traditions_public IS
  'Superfície pública de ecumenic_traditions SEM as colunas ocultas oracle_modern/oracle_label (mig 23). Use esta view para leitura anon/authenticated; a tabela base só devolve as colunas seguras e nega select=*.';


-- ============================================================
-- VERIFICAÇÃO automática (roda dentro do push; só emite NOTICE/WARNING)
-- ============================================================
DO $verify$
DECLARE
  v_const_using   text;
  v_anon_cols     text;
  v_oracle_grant  text;
BEGIN
  -- (A) a policy de leitura da constituição deve filtrar por is_public
  SELECT qual INTO v_const_using
    FROM pg_policies
   WHERE schemaname='public' AND tablename='aquarios_constitution' AND cmd='SELECT';
  IF v_const_using IS NULL OR v_const_using NOT ILIKE '%is_public%' THEN
    RAISE WARNING '[mig23] aquarios_constitution: policy SELECT NAO filtra is_public (qual=%)', v_const_using;
  ELSE
    RAISE NOTICE  '[mig23] OK aquarios_constitution: SELECT restrito a is_public (qual=%)', v_const_using;
  END IF;

  -- (B) anon NÃO pode ter SELECT nas colunas ocultas oracle_*
  SELECT string_agg(g.column_name, ', ') INTO v_oracle_grant
    FROM information_schema.column_privileges g
   WHERE g.table_schema='public' AND g.table_name='ecumenic_traditions'
     AND g.grantee IN ('anon','authenticated') AND g.privilege_type='SELECT'
     AND g.column_name IN ('oracle_modern','oracle_label');
  IF v_oracle_grant IS NOT NULL THEN
    RAISE WARNING '[mig23] ecumenic_traditions: anon/auth AINDA tem SELECT em coluna oculta: %', v_oracle_grant;
  ELSE
    RAISE NOTICE  '[mig23] OK ecumenic_traditions: anon/auth SEM SELECT em oracle_modern/oracle_label.';
  END IF;

  -- (B) ...mas DEVE manter SELECT nas colunas seguras
  SELECT string_agg(DISTINCT g.column_name, ', ') INTO v_anon_cols
    FROM information_schema.column_privileges g
   WHERE g.table_schema='public' AND g.table_name='ecumenic_traditions'
     AND g.grantee='anon' AND g.privilege_type='SELECT'
     AND g.column_name IN ('slug','name','icon');
  RAISE NOTICE '[mig23] ecumenic_traditions: colunas seguras legíveis por anon = %', COALESCE(v_anon_cols,'(nenhuma!)');
END;
$verify$;


-- ============================================================
-- PARTE FINAL · log de auditoria da execução (consistente com mig 18)
-- ============================================================
DO $audit$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
              WHERE table_schema='public' AND table_name='audit_logs') THEN
    INSERT INTO public.audit_logs (event_type, resource, metadata)
    VALUES (
      'migration.executed',
      '23_rls_read_hardening',
      jsonb_build_object(
        'class',        'READ leak fix (follow-up das mig 17/18)',
        'constitution', 'SELECT restrito a is_public IS TRUE (linhas sandeiros ocultas)',
        'ecumenic',     'oracle_modern/oracle_label revogadas de anon/auth + view ecumenic_traditions_public',
        'writes',       'NAO tocadas (mig 17/18)',
        'executed_at',  now()
      )
    );
  END IF;
END;
$audit$;

COMMIT;

-- ============================================================
-- VERIFICAÇÃO MANUAL (sonda REST com a publishable key, após `db push`):
--
--   SB_URL="https://agebsmjsjrmazbozphnh.supabase.co"
--   KEY="sb_publishable_…"   # = anon (mobile/.env · EXPO_PUBLIC_SUPABASE_ANON_KEY)
--
--   # (A) constituição: anon deve ver só 10 linhas (psicologia_social), não 20
--   curl -s -D - -o /dev/null -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
--     -H "Prefer: count=exact" -H "Range: 0-0" \
--     "$SB_URL/rest/v1/aquarios_constitution?select=id"
--   #   -> Content-Range: 0-9/10   (antes: 0-0/20)
--   curl -s "$SB_URL/rest/v1/aquarios_constitution?select=title&pillar=eq.sandeiros" \
--     -H "apikey: $KEY" -H "Authorization: Bearer $KEY"
--   #   -> []   (antes: 10 linhas herméticas)
--
--   # (B) ecumenic: coluna oculta deve dar 403; colunas seguras e a view, OK
--   curl -s "$SB_URL/rest/v1/ecumenic_traditions?select=slug,oracle_modern" \
--     -H "apikey: $KEY" -H "Authorization: Bearer $KEY"
--   #   -> 403 "permission denied for column oracle_modern"  (antes: 200 + dados)
--   curl -s "$SB_URL/rest/v1/ecumenic_traditions_public?select=*&limit=2" \
--     -H "apikey: $KEY" -H "Authorization: Bearer $KEY"
--   #   -> 200 · [{id,slug,name,icon,active,created_at}, …]  (sem oracle_*)
--
--   # service_role (server-side) continua lendo tudo — HygeiOS/SandeirOS OK.
-- ============================================================
-- FIM — 23_rls_read_hardening.sql
-- ============================================================
