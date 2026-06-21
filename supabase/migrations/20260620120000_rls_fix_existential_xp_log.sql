-- ============================================================
-- Fix RLS: existential_xp_log exposta sem RLS (SECURITY_AUDIT_REPORT.md A6 FAIL)
-- Confirmado live em 2026-06-20: GET anonimo retornava 200 [] — tabela sem
-- nenhuma restricao (so estava vazia "por sorte", nao por design).
-- panaceia_currencies (outro FAIL do mesmo audit) NAO existe em prod (404
-- confirmado via probe) — sem acao aqui; tratar quando a tabela for criada de fato.
-- ============================================================

alter table public.existential_xp_log enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='existential_xp_log' and policyname='xp_owner_select') then
    create policy "xp_owner_select" on public.existential_xp_log for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='existential_xp_log' and policyname='xp_owner_insert') then
    create policy "xp_owner_insert" on public.existential_xp_log for insert with check (auth.uid() = user_id);
  end if;
end $$;
