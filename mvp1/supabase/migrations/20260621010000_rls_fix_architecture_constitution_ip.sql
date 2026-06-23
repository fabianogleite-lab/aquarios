-- ============================================================
-- Fix RLS: 12 tabelas de arquitetura/IP/sensível — aplicar
-- policies authenticated-only ou service_role (bloquear anon)
-- SECURITY_AUDIT_REPORT.md A7 — tabelas com conteudo sensivel
-- que nunca deveria estar acessivel sem autenticacao.
-- Confirmado 21/Jun via probe: 21 tabelas retornam dados publicos,
-- 12 delas com conteudo de IP/decisoes/arquitetura interna.
-- ============================================================

-- 1. aquarios_architecture — mapa de camadas, holding, entidades
alter table public.aquarios_architecture enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='aquarios_architecture' and policyname='auth_only_read') then
    create policy "auth_only_read" on public.aquarios_architecture for select using (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  end if;
end $$;

-- 2. aquarios_constitution — regras/pilares/filosofia interna
alter table public.aquarios_constitution enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='aquarios_constitution' and policyname='auth_only_read') then
    create policy "auth_only_read" on public.aquarios_constitution for select using (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  end if;
end $$;

-- 3. aquarios_decisions — decisoes de negocio, planejamento
alter table public.aquarios_decisions enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='aquarios_decisions' and policyname='auth_only_read') then
    create policy "auth_only_read" on public.aquarios_decisions for select using (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  end if;
end $$;

-- 4. aquarios_divergencias — divergencias audit/planejamento
alter table public.aquarios_divergencias enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='aquarios_divergencias' and policyname='auth_only_read') then
    create policy "auth_only_read" on public.aquarios_divergencias for select using (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  end if;
end $$;

-- 5. aquarios_eixo_distribution — mapa de eixos/features internas
alter table public.aquarios_eixo_distribution enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='aquarios_eixo_distribution' and policyname='auth_only_read') then
    create policy "auth_only_read" on public.aquarios_eixo_distribution for select using (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  end if;
end $$;

-- 6. archetype_polarity — correlacoes entre arquetipos (design interno)
alter table public.archetype_polarity enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='archetype_polarity' and policyname='auth_only_read') then
    create policy "auth_only_read" on public.archetype_polarity for select using (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  end if;
end $$;

-- 7. arkhe_holding — CRITICO: CPF do fundador, info legal proprietaria
alter table public.arkhe_holding enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='arkhe_holding' and policyname='service_role_only') then
    create policy "service_role_only" on public.arkhe_holding for select using (auth.role() = 'service_role');
  end if;
end $$;

-- 8. ecumenic_references — contexto filosofico/religioso (design interno)
alter table public.ecumenic_references enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='ecumenic_references' and policyname='auth_only_read') then
    create policy "auth_only_read" on public.ecumenic_references for select using (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  end if;
end $$;

-- 9. intellectual_property_registry — CRITICO: registro formal de IP/arquitetura
alter table public.intellectual_property_registry enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='intellectual_property_registry' and policyname='service_role_only') then
    create policy "service_role_only" on public.intellectual_property_registry for select using (auth.role() = 'service_role');
  end if;
end $$;

-- 10. kb_foundation — fundacoes filosoficas (design/contexto)
alter table public.kb_foundation enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='kb_foundation' and policyname='auth_only_read') then
    create policy "auth_only_read" on public.kb_foundation for select using (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  end if;
end $$;

-- 11. personas_cultural_map — mapa cultural sensivel (religiao, contexto)
alter table public.personas_cultural_map enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='personas_cultural_map' and policyname='auth_only_read') then
    create policy "auth_only_read" on public.personas_cultural_map for select using (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  end if;
end $$;

-- 12. roadmap_phase_log — planejamento/timeline sensivel
alter table public.roadmap_phase_log enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='roadmap_phase_log' and policyname='auth_only_read') then
    create policy "auth_only_read" on public.roadmap_phase_log for select using (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  end if;
end $$;

-- Nota: 9 tabelas mantidas públicas (alexandria_kb, aquarios_modules,
-- evolution_levels, panaceia_offering_categories, panaceia_offerings,
-- panaceia_pack_manual_definition, plans, personas, persona_management)
-- — sao legitimamente onboarding/catalogo publico. Nao tocadas aqui.
