-- ============================================================
-- SLICE 3C: Jornada (SandeirOS) — tabela arcana_draws  (registro simbólico)
-- ============================================================
create table if not exists public.arcana_draws (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  arcano_num   smallint not null check (arcano_num between 0 and 21),
  arcano_name  text not null,
  reflection   text,
  created_at   timestamptz not null default now()
);
alter table public.arcana_draws enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='arcana_draws' and policyname='arc_owner_select') then
    create policy "arc_owner_select" on public.arcana_draws for select using (auth.uid() = user_id); end if;
  if not exists (select 1 from pg_policies where tablename='arcana_draws' and policyname='arc_owner_insert') then
    create policy "arc_owner_insert" on public.arcana_draws for insert with check (auth.uid() = user_id); end if;
  if not exists (select 1 from pg_policies where tablename='arcana_draws' and policyname='arc_owner_delete') then
    create policy "arc_owner_delete" on public.arcana_draws for delete using (auth.uid() = user_id); end if;
end $$;
create index if not exists arcana_draws_user_created on public.arcana_draws (user_id, created_at desc);
