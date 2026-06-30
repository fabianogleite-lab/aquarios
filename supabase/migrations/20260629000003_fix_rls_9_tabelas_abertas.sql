-- Fix de segurança 29/Jun: 9 das 12 tabelas classificadas como "travar" em 21/Jun
-- continuavam respondendo GET anônimo (RLS policy criada, mas GRANT a `anon` nunca
-- revogado -> Postgres deixa passar mesmo com RLS habilitado, se não houver REVOKE).
-- Verificado por probe real (curl com anon key) antes E depois desta migration.

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'aquarios_constitution',
    'aquarios_decisions',
    'kb_foundation',
    'roadmap_phase_log',
    'personas_cultural_map',
    'ecumenic_references',
    'archetype_polarity',
    'aquarios_divergencias',
    'aquarios_eixo_distribution'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE SELECT ON public.%I FROM anon', t);
    -- mantém leitura pra authenticated/service_role (decisão de 21/Jun, não revista aqui)
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated, service_role', t);
  END LOOP;
END $$;
