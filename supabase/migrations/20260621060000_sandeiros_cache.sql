-- F1 SandeirOS — núcleo do cache (tabela global compartilhada)
-- Consolida a definição única de cache_semantico (P0.2). Cache é GLOBAL:
-- leitura liberada a todos; escrita só pelo backend (service_role / definer).
-- fallout_log + funções de fallout NÃO entram aqui (são F3).

CREATE EXTENSION IF NOT EXISTS vector;     -- pgvector (embeddings)
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE IF NOT EXISTS public.cache_semantico (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hash_prompt        TEXT UNIQUE NOT NULL,        -- sha256(normalizado + '|' + idioma)
    prompt_original    TEXT NOT NULL,
    prompt_normalizado TEXT NOT NULL,
    idioma             TEXT NOT NULL DEFAULT 'pt',  -- pt|en|es (trilíngue)
    categoria          TEXT,
    funcao             TEXT,
    embedding_prompt   vector(384),                 -- NULL até ligar fastembed (medir RAM antes)
    resposta_cacheada  JSONB NOT NULL,
    tokens_input       INT DEFAULT 0,
    tokens_output      INT DEFAULT 0,
    fonte_original     TEXT,                         -- CACHE|LLAMA|PLAYBOOK|CLAUDE
    qualidade_score    NUMERIC(3,2) DEFAULT 0.50,    -- CLAUDE=1.0 > CACHE=0.9 > LLAMA=0.75 > PLAYBOOK=0.6
    hits               INT DEFAULT 1,
    ultimo_hit         TIMESTAMPTZ DEFAULT NOW(),
    criado_por         TEXT DEFAULT 'system',
    expires_at         TIMESTAMPTZ,                  -- NULL = não expira (seed). TTL p/ gerados.
    ts                 TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cache_hash      ON public.cache_semantico (hash_prompt);
CREATE INDEX IF NOT EXISTS idx_cache_qualidade ON public.cache_semantico (qualidade_score DESC, hits DESC);
-- ivfflat só DEPOIS de existir linha com embedding (criar quando fastembed entrar):
-- CREATE INDEX idx_cache_emb ON public.cache_semantico USING ivfflat (embedding_prompt vector_cosine_ops);

-- Normalização determinística (espelha a do Python: lowercase, sem acento, sem pontuação)
CREATE OR REPLACE FUNCTION public.normalizar_prompt(p TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT regexp_replace(lower(unaccent(p)), '[^a-z0-9\s]', '', 'g');
$$;

-- RLS: cache é compartilhado → leitura a todos; escrita só service_role (sem policy de write)
ALTER TABLE public.cache_semantico ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cache_leitura_todos ON public.cache_semantico;
CREATE POLICY cache_leitura_todos ON public.cache_semantico FOR SELECT USING (true);

COMMENT ON TABLE public.cache_semantico IS 'F1 SandeirOS: cache global de respostas (custo-zero). Leitura pública, escrita backend.';
