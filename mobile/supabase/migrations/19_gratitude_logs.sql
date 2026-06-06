-- ============================================================
-- SLICE 2: Gratidão — tabela gratitude_logs
-- Data: 04/06/2026
-- Alimenta o iVi Espiritual e o contexto do ProteOS.
-- ============================================================

create table if not exists public.gratitude_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  items       text[] not null default '{}',
  note        text,
  created_at  timestamptz not null default now()
);

alter table public.gratitude_logs enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='gratitude_logs' and policyname='grat_owner_select') then
    create policy "grat_owner_select" on public.gratitude_logs for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='gratitude_logs' and policyname='grat_owner_insert') then
    create policy "grat_owner_insert" on public.gratitude_logs for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='gratitude_logs' and policyname='grat_owner_update') then
    create policy "grat_owner_update" on public.gratitude_logs for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='gratitude_logs' and policyname='grat_owner_delete') then
    create policy "grat_owner_delete" on public.gratitude_logs for delete using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists gratitude_logs_user_created on public.gratitude_logs (user_id, created_at desc);

-- ============================================================
-- FIM — 17 gratitude_logs
-- ============================================================
