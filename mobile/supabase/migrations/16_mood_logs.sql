-- ============================================================
-- SLICE 1: Check-in de Humor — tabela mood_logs
-- Data: 04/06/2026
-- Alimenta o iVi Mental e o contexto do ProteOS.
-- ============================================================

create table if not exists public.mood_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  mood        smallint not null check (mood between 1 and 10),
  energy      smallint check (energy between 1 and 10),
  intention   text,
  note        text,
  created_at  timestamptz not null default now()
);

alter table public.mood_logs enable row level security;

-- RLS owner-only (cada usuario so ve/edita o proprio humor)
do $$ begin
  if not exists (select 1 from pg_policies where tablename='mood_logs' and policyname='mood_owner_select') then
    create policy "mood_owner_select" on public.mood_logs for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='mood_logs' and policyname='mood_owner_insert') then
    create policy "mood_owner_insert" on public.mood_logs for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='mood_logs' and policyname='mood_owner_update') then
    create policy "mood_owner_update" on public.mood_logs for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='mood_logs' and policyname='mood_owner_delete') then
    create policy "mood_owner_delete" on public.mood_logs for delete using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists mood_logs_user_created on public.mood_logs (user_id, created_at desc);

-- ============================================================
-- FIM — 16 mood_logs
-- ============================================================
