-- ============================================================
-- Fix: Remover documentação de admin gate de FAQ pública
-- RAZÃO: Item 10 de alexandrios_kb documenta mecanismo
-- de acesso ao gate admin oculto ("Configurações → toque 5x...").
-- Não deve estar em FAQ pública — expõe vetor de ataque.
-- ============================================================

BEGIN;

-- Deletar item 10 que documenta admin gate
DELETE FROM public.alexandrios_kb
WHERE slug = 'admin-access'
  AND question = 'Como acesso área admin?'
  AND answer ILIKE '%5x em "Arkhe Labs"%';

-- Aplicar RLS à tabela (já deveria estar, mas garante idempotência)
ALTER TABLE public.alexandrios_kb ENABLE ROW LEVEL SECURITY;

-- Policy: FAQs públicas estão disponíveis para todos (legítimo onboarding)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename='alexandrios_kb' AND policyname='public_select'
  ) THEN
    CREATE POLICY "public_select" ON public.alexandrios_kb
      FOR SELECT USING (true);
  END IF;
END $$;

-- Nota: Se houver future item de admin/troubleshooting que deva ser oculto,
-- criar tabela separada admin_docs (RLS service_role_only) e mover lá.

COMMIT;
