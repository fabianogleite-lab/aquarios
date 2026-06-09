-- ============================================================
-- FIX SEGURANÇA · RLS de ESCRITA em public.aquarios_modules
-- Migration 17 · Data: 05/06/2026
--
-- VULNERABILIDADE (descoberta no painel "Módulos" do backoffice —
-- docs/backoffice.html, funções setModuloStatus / ativarTodos):
--   A tabela aquarios_modules tinha RLS habilitado, porém a ÚNICA
--   policy de escrita era (migration 10, linha 39):
--       FOR ALL WITH CHECK (auth.role() = 'service_role')
--   — SEM cláusula USING e SEM TO (logo aplicada a PUBLIC, incl. anon).
--   Escrever a restrição apenas no WITH CHECK de um FOR ALL é frágil:
--   não limita quais linhas o UPDATE/DELETE pode atingir e, somado aos
--   GRANTs que o Supabase concede por padrão a anon/authenticated,
--   permitiu PATCH via REST usando SÓ a publishable key
--   (sb_publishable_...) — SEM login admin. Qualquer pessoa com a chave
--   pública (embutida no HTML servido em docs/backoffice.html) podia
--   ativar/desativar/renomear todos os módulos.
--
-- SOBRE A PUBLISHABLE KEY: expor sb_publishable_* é OK por design — é
--   uma chave PÚBLICA (anon). O problema real NÃO é a chave, e sim a
--   ausência de RLS de escrita. A chave permanece pública; esta
--   migration fecha o buraco no lado do banco.
--
-- CORREÇÃO (defesa em profundidade — RLS + GRANTs):
--   1. RLS permanece habilitado.
--   2. SELECT público/anon mantido (app e site leem o catálogo/status).
--   3. INSERT/UPDATE/DELETE restritos a ADMIN via is_aquarios_admin()
--      — critério OFICIAL do projeto (decisão D-17): linha ativa em
--      public.aquarios_admin_grants. Mesmo mecanismo do gate adm_ai
--      (admin.tsx · 5 toques) e do padrão de RLS das migrations 06/07/16.
--   4. REVOKE de INSERT/UPDATE/DELETE do role anon (camada de GRANT,
--      abaixo da RLS) — fecha o vetor mesmo que uma policy futura erre.
--   5. Bootstrap do grant do fundador para o BACKOFFICE continuar
--      funcionando para o operador logado (requisito 4).
--
-- BACKOFFICE (docs/backoffice.html): faz login via Supabase Auth e usa o
--   access_token como Bearer. Com o grant abaixo, o operador LOGADO
--   escreve normalmente. SEM login (Bearer = publishable key) a escrita
--   passa a ser NEGADA — comportamento já tratado na UI do painel
--   ("⚠ alterado localmente — faça login admin para salvar"). Nenhuma
--   alteração no HTML é necessária para a correção.
--
-- Idempotente: pode ser reaplicada com segurança.
-- ============================================================


-- ------------------------------------------------------------
-- PARTE 1 · helper is_aquarios_admin() — fonte única do critério admin
--
-- SECURITY DEFINER: a tabela aquarios_admin_grants tem RLS "service_role
-- only", então um EXISTS direto numa policy retornaria sempre FALSE para
-- um usuário autenticado comum. O helper roda como owner e contorna a RLS
-- da tabela de grants — sem expor a tabela ao usuário.
-- STABLE: uma avaliação por query. search_path fixo: hardening de SECDEF.
-- auth.uid() lê o JWT da REQUISIÇÃO (o caller), não o owner. Para anon
-- (sem JWT de usuário) auth.uid() é NULL → retorna FALSE.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_aquarios_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.aquarios_admin_grants g
     WHERE g.user_id = auth.uid()
       AND g.revoked_at IS NULL
  );
$$;

REVOKE ALL     ON FUNCTION public.is_aquarios_admin() FROM public;
GRANT  EXECUTE ON FUNCTION public.is_aquarios_admin() TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.is_aquarios_admin() IS
  'TRUE se auth.uid() possui grant ATIVO em aquarios_admin_grants (critério admin do projeto · D-17). SECURITY DEFINER para contornar a RLS service_role-only da tabela de grants.';


-- ------------------------------------------------------------
-- PARTE 2 · RLS — recriar policies de aquarios_modules em estado limpo
-- ------------------------------------------------------------
ALTER TABLE public.aquarios_modules ENABLE ROW LEVEL SECURITY;

-- Remove as policies antigas (a frágil FOR ALL e a de leitura) e quaisquer
-- nomes que este próprio script possa ter criado em execuções anteriores.
DROP POLICY IF EXISTS "Service role manages modules"  ON public.aquarios_modules;
DROP POLICY IF EXISTS "Anyone can read modules"       ON public.aquarios_modules;
DROP POLICY IF EXISTS "modules_public_select"         ON public.aquarios_modules;
DROP POLICY IF EXISTS "modules_admin_insert"          ON public.aquarios_modules;
DROP POLICY IF EXISTS "modules_admin_update"          ON public.aquarios_modules;
DROP POLICY IF EXISTS "modules_admin_delete"          ON public.aquarios_modules;
DROP POLICY IF EXISTS "modules_service_role_all"      ON public.aquarios_modules;

-- LEITURA: pública. App, site e anon leem o catálogo e o status dos módulos.
CREATE POLICY "modules_public_select"
  ON public.aquarios_modules
  FOR SELECT
  USING (true);

-- ESCRITA: SOMENTE admin (authenticated com grant ativo). TO authenticated
-- exclui anon estruturalmente; is_aquarios_admin() exige o grant.
CREATE POLICY "modules_admin_insert"
  ON public.aquarios_modules
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_aquarios_admin());

CREATE POLICY "modules_admin_update"
  ON public.aquarios_modules
  FOR UPDATE
  TO authenticated
  USING (public.is_aquarios_admin())          -- quais linhas pode atingir
  WITH CHECK (public.is_aquarios_admin());     -- valida a linha resultante

CREATE POLICY "modules_admin_delete"
  ON public.aquarios_modules
  FOR DELETE
  TO authenticated
  USING (public.is_aquarios_admin());

-- service_role: gestão total (edge functions, Supabase CLI/SQL editor).
-- Explícito por clareza — service_role já tem BYPASSRLS no Supabase.
CREATE POLICY "modules_service_role_all"
  ON public.aquarios_modules
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ------------------------------------------------------------
-- PARTE 3 · GRANTs (camada de privilégio, ABAIXO da RLS — defesa extra)
-- O Supabase costuma conceder ALL a anon/authenticated por padrão; é isso
-- que permitiu o UPDATE anon chegar até a RLS. Aqui anon perde a escrita
-- no nível de privilégio: PATCH anon passa a falhar com "permission denied"
-- antes mesmo da RLS. authenticated mantém escrita, mas a RLS acima só
-- deixa passar admin.
-- ------------------------------------------------------------
REVOKE INSERT, UPDATE, DELETE         ON public.aquarios_modules FROM anon;
GRANT  SELECT                         ON public.aquarios_modules TO anon;
GRANT  SELECT, INSERT, UPDATE, DELETE ON public.aquarios_modules TO authenticated;


-- ------------------------------------------------------------
-- PARTE 4 · Bootstrap do grant do fundador (requisito 4: backoffice
-- continua funcionando para o operador logado).
--
-- NÃO define passphrase aqui de propósito: a passphrase do gate adm_ai é
-- definida OFFLINE (ver HUMAN_TASKS_PARALLEL_WALKTHROUGH.md · Tarefa 2) —
-- nunca via automação. A policy de escrita exige apenas grant ATIVO, então
-- o operador logado já consegue persistir módulos imediatamente.
-- Idempotente: ON CONFLICT DO NOTHING (não reativa um grant revogado).
-- ------------------------------------------------------------
DO $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid
    FROM auth.users
   WHERE lower(email) = lower('fabianogleite@gmail.com')
   LIMIT 1;

  IF v_uid IS NULL THEN
    RAISE NOTICE '[mig17] Conta fabianogleite@gmail.com ainda nao existe em auth.users. Crie/confirme a conta e rode o bootstrap de aquarios_admin_grants (ver HUMAN_TASKS_PARALLEL_WALKTHROUGH.md, Tarefa 2). Sem grant ativo, o backoffice nao persiste a escrita de modulos.';
  ELSE
    INSERT INTO public.aquarios_admin_grants
      (user_id, granted_by, pre_condition_met, pre_condition_proof, notes)
    VALUES
      (v_uid, 'migration_17_bootstrap', true,
       '{"founder": true, "bootstrap_date": "2026-06-05"}'::jsonb,
       'Founder bootstrap · operador backoffice (migration 17)')
    ON CONFLICT (user_id) DO NOTHING;
    RAISE NOTICE '[mig17] Grant admin garantido para o fundador (uid=%).', v_uid;
  END IF;
END $$;


-- ============================================================
-- VERIFICAÇÃO (rodar manualmente após aplicar):
--
--   -- 1) Policies ativas (esperado: 1x SELECT público + 3x admin + service_role)
--   SELECT policyname, cmd, roles, qual, with_check
--     FROM pg_policies
--    WHERE schemaname = 'public' AND tablename = 'aquarios_modules'
--    ORDER BY cmd, policyname;
--
--   -- 2) anon NÃO escreve (deve falhar / afetar 0 linhas):
--   --   curl -X PATCH "$SB_URL/rest/v1/aquarios_modules?slug=eq.proteos" \
--   --     -H "apikey: $PUBLISHABLE" -H "Authorization: Bearer $PUBLISHABLE" \
--   --     -H "Content-Type: application/json" -d '{"status":"locked"}'
--   --   -> 401/403 "permission denied" (REVOKE) — antes retornava OK.
--
--   -- 3) fundador LOGADO escreve (Bearer = access_token) -> persiste.
--
--   -- 4) grant existe:
--   SELECT user_id, granted_by, revoked_at FROM public.aquarios_admin_grants;
-- ============================================================
-- FIM — 17 aquarios_modules RLS
-- ============================================================
