-- ============================================================
-- SLICE 3A: Hidratação — tabela hydration_logs  (alimenta iVi Físico)
-- ============================================================
create table if not exists public.hydration_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  amount_ml   integer not null default 250 check (amount_ml between 1 and 5000),
  created_at  timestamptz not null default now()
);
alter table public.hydration_logs enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='hydration_logs' and policyname='hyd_owner_select') then
    create policy "hyd_owner_select" on public.hydration_logs for select using (auth.uid() = user_id); end if;
  if not exists (select 1 from pg_policies where tablename='hydration_logs' and policyname='hyd_owner_insert') then
    create policy "hyd_owner_insert" on public.hydration_logs for insert with check (auth.uid() = user_id); end if;
  if not exists (select 1 from pg_policies where tablename='hydration_logs' and policyname='hyd_owner_delete') then
    create policy "hyd_owner_delete" on public.hydration_logs for delete using (auth.uid() = user_id); end if;
end $$;
create index if not exists hydration_logs_user_created on public.hydration_logs (user_id, created_at desc);
