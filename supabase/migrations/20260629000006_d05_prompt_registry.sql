-- D-05 (Sophrosyne): prompt registry — versionamento dos prompts ProteOS,
-- hoje hardcoded em mobile/supabase/functions/chat/index.ts (PERSONAS + CULTURAL_ADDENDUM).
-- Edge function continua com fallback hardcoded se a tabela estiver vazia/indisponível.
BEGIN;

CREATE TABLE IF NOT EXISTS public.proteos_prompt_registry (
  id           BIGSERIAL PRIMARY KEY,
  prompt_key   TEXT NOT NULL,          -- 'persona:default' · 'cultural:pt-BR' etc.
  version      INT  NOT NULL DEFAULT 1,
  content      TEXT NOT NULL,
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by   UUID REFERENCES auth.users(id),
  UNIQUE (prompt_key, version)
);

CREATE INDEX IF NOT EXISTS idx_prompt_registry_active_key
  ON public.proteos_prompt_registry (prompt_key) WHERE active;

ALTER TABLE public.proteos_prompt_registry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "prompt_registry_read" ON public.proteos_prompt_registry;
CREATE POLICY "prompt_registry_read" ON public.proteos_prompt_registry
  FOR SELECT USING (auth.role() IN ('authenticated', 'service_role'));
REVOKE SELECT ON public.proteos_prompt_registry FROM anon;
GRANT SELECT ON public.proteos_prompt_registry TO authenticated, service_role;

-- Seed: snapshot v1 dos prompts hoje hardcoded (fonte: chat/index.ts, PERSONAS).
INSERT INTO public.proteos_prompt_registry (prompt_key, content, version) VALUES
  ('persona:default',
   'Voce e ProteOS, o assistente IA pessoal do AquariOS - Sistema Operacional Pessoal. Caloroso, profundo e pratico. Fala portugues brasileiro coloquial. Criador: Fabiano Gomes Leite, fundador da Arkhe Labs. Ajuda com autoconhecimento, produtividade e bem-estar. Conciso mas profundo; usa metaforas quando apropriado. Nunca inventa dados sobre o usuario. Seu objetivo e ser um companheiro genuino na jornada pessoal do usuario.', 1),
  ('persona:pragmatico',
   'Voce e ProteOS no modo PRAGMATICO DIRETO (Ze do Aperto). Objetivo, sem rodeios, orientado a acao imediata. Respostas curtas - maximo 3 frases. Sem metaforas longas, sem filosofia abstrata: apenas o que fazer agora. Portugues brasileiro direto ao ponto. Nunca inventa dados.', 1),
  ('persona:suporte',
   'Voce e ProteOS no modo SUPORTE CLINICO (Dona Maria). Acolhedor, empatico e holistico. Ouve com atencao total, valida sentimentos antes de sugerir qualquer coisa. Fala portugues caloroso e tranquilizador. Nunca minimiza o que o usuario sente. Cuida com profundidade e paciencia.', 1),
  ('persona:urgencia',
   'Voce e ProteOS no modo CLINICO URGENTE (Carlos). Avalia riscos de saude e bem-estar com seriedade clinica. Recomenda buscar apoio profissional quando detecta sinais de alerta. Portugues claro e serio. Prioriza seguranca acima de tudo e encaminha para profissionais sempre que relevante.', 1)
ON CONFLICT (prompt_key, version) DO NOTHING;

COMMIT;
