-- Sessão 1 (29/Jun): ecumenic_traditions é tabela real (slug, name, icon, oracle_modern,
-- oracle_label, active), não versionada em nenhuma migration anterior. RLS USING(true)
-- hoje expõe oracle_modern/oracle_label (conteúdo oculto) a qualquer anônimo.
-- Sem coluna is_public (é catálogo de 13 linhas, não linhas públicas+privadas misturadas),
-- então a regra é a mesma de ecumenic_references: só authenticated/service_role.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='ecumenic_traditions') THEN
    EXECUTE 'ALTER TABLE public.ecumenic_traditions ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "auth_only_read" ON public.ecumenic_traditions';
    EXECUTE 'DROP POLICY IF EXISTS "ecumenic_traditions_auth_read" ON public.ecumenic_traditions';
    EXECUTE 'CREATE POLICY "ecumenic_traditions_auth_read" ON public.ecumenic_traditions FOR SELECT USING (auth.role() IN (''authenticated'', ''service_role''))';
    EXECUTE 'REVOKE SELECT ON public.ecumenic_traditions FROM anon';
    EXECUTE 'GRANT SELECT ON public.ecumenic_traditions TO authenticated, service_role';
  END IF;
END $$;
