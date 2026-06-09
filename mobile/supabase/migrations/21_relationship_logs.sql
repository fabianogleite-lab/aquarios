-- ============================================================
-- SLICE 3B: Relacionamentos — tabela relationship_logs  (alimenta iVi Social)
-- ============================================================
create table if not exists public.relationship_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  person      text,
  kind        text,                       -- familia | amigo | parceiro | colega | outro
  quality     smallint check (quality between 1 and 10),
  note        text,
  created_at  timestamptz not null default now()
);
alter table public.relationship_logs enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='relationship_logs' and policyname='rel_owner_select') then
    create policy "rel_owner_select" on public.relationship_logs for select using (auth.uid() = user_id); end if;
  if not exists (select 1 from pg_policies where tablename='relationship_logs' and policyname='rel_owner_insert') then
    create policy "rel_owner_insert" on public.relationship_logs for insert with check (auth.uid() = user_id); end if;
  if not exists (select 1 from pg_policies where tablename='relationship_logs' and policyname='rel_owner_delete') then
    create policy "rel_owner_delete" on public.relationship_logs for delete using (auth.uid() = user_id); end if;
end $$;
create index if not exists relationship_logs_user_created on public.relationship_logs (user_id, created_at desc);
