-- SandeirOS — 11º arquétipo: Técnico (Bob), subagente interno de estabilização de cache.
-- Não é voz cultural de comunidade: instância única, sem timeline_posts, sem localização por país.

CREATE TABLE IF NOT EXISTS public.sandeiros_subagents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  archetype     TEXT NOT NULL,
  tasks         JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_internal   BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sandeiros_subagents ENABLE ROW LEVEL SECURITY;
-- Interno: nenhuma leitura pública. Só service_role (backend) acessa.
CREATE POLICY "service_role_only" ON public.sandeiros_subagents
  FOR ALL USING (auth.role() = 'service_role');

INSERT INTO public.sandeiros_subagents (slug, display_name, archetype, tasks)
VALUES (
  'bob',
  'Bob',
  'Técnico',
  '[
    "Sentinela de Cache: monitora cache_read vs input_no_cache no relatório de custo; alerta se uma chamada nova for adicionada sem cache_control",
    "Guardião do Prompt: garante que o bloco fixo (persona/system prompt) nunca receba dado variável que invalide o cache",
    "Operador do Cache Semântico: executa a carga do seed_cache_800 e mantém o cache_semântico do SandeirOS abastecido"
  ]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET tasks = EXCLUDED.tasks;

-- Ponte: Dele Fashola (persona comunitária, arquétipo Louco/en-NG) vira hub entre
-- os arquétipos 1-10 (comunidade) e Bob (técnico), quando uma questão da comunidade
-- precisar de intervenção técnica.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bridge_to_subagent_id UUID REFERENCES public.sandeiros_subagents(id);

UPDATE public.profiles
SET bridge_to_subagent_id = (SELECT id FROM public.sandeiros_subagents WHERE slug = 'bob')
WHERE display_name = 'Dele Fashola';
