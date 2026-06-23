# 🛠️ F1 KICKOFF — Núcleo do Cache (executar em sessão nova)

**Pré-requisito**: escopo APROVADO (22/Jun). Este doc é o spec turnkey do F1 — o primeiro código real. Resolve a P0.2 (tabela consolidada) e dá tudo pronto pra implementar + verificar.

---

## 0. Ler primeiro (nesta ordem, para não desperdiçar contexto)
1. `HANDOFF_SANDEIROS_PRODUCAO.md` — visão + pendências + ondas.
2. `ESCOPO_CONSOLIDADO_SANDEIROS_MVP1.md` §4 (árvore), §5 (pseudocódigo), §8.1/8.2 (cache+embeddings), §11 (ordem de carga), §13 (escopo completo).
3. 🔒 **Sigilo**: ler a regra na memória antes de escrever qualquer arquivo — codinomes neutros, nunca os nomes reais. (F1 é só cache, naturalmente limpo, mas vale pro resto.)

**Não tocar**: nada de `agente/`, `ferramentas/`, `humanizador.py` ainda — isso é F2+. F1 é SÓ o cache.

---

## 1. Escopo do F1 (e só ele)
| Entrega | Arquivo |
|---|---|
| Migration da tabela de cache (consolidada — P0.2) | `supabase/migrations/7X_sandeiros_cache.sql` |
| Classe de cache (get/set + normalização) | `backend/sandeiros/semantic_cache.py` |
| Bootstrap (carga inicial) | `backend/sandeiros/bootstrap.py` |
| Dado pronto | `backend/sandeiros/data/seed_cache_800.sql` (extrair de `Desktop/Literatura/PROMPT PARA CACHE.txt`) |
| Endpoint mínimo | `GET/POST /sandeiros/responder` devolvendo HIT/MISS (sem humanização ainda) |

**Critério de pronto**: um prompt do seed retorna do cache em <50ms, `fonte="CACHE"`, `custo_tokens=0`.

---

## 2. P0.2 RESOLVIDO — `cache_semantico` consolidada (uma só definição)
> Unifica a descrição de §8.1 + a do Fallout §12 num único `CREATE TABLE`. **O cache é GLOBAL/compartilhado** (não é dado privado por usuário — é a base de conhecimento que economiza token pra todos). Logo: **leitura liberada a todos**, escrita só pelo backend.

```sql
-- 7X_sandeiros_cache.sql
CREATE EXTENSION IF NOT EXISTS vector;     -- pgvector
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE IF NOT EXISTS public.cache_semantico (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hash_prompt       TEXT UNIQUE NOT NULL,        -- sha256(normalizado + idioma)
    prompt_original   TEXT NOT NULL,
    prompt_normalizado TEXT NOT NULL,
    idioma            TEXT NOT NULL DEFAULT 'pt',  -- pt|en|es (trilíngue — decisão 22/Jun)
    categoria         TEXT,
    funcao            TEXT,
    embedding_prompt  vector(384),                 -- NULL até ligar fastembed (8.2)
    resposta_cacheada JSONB NOT NULL,
    tokens_input      INT DEFAULT 0,
    tokens_output     INT DEFAULT 0,
    fonte_original    TEXT,                         -- CACHE|LLAMA|PLAYBOOK|CLAUDE  (NÃO GPT)
    qualidade_score   NUMERIC(3,2) DEFAULT 0.50,    -- CLAUDE=1.0 > CACHE=0.9 > LLAMA=0.75 > PLAYBOOK=0.6
    hits              INT DEFAULT 1,
    ultimo_hit        TIMESTAMPTZ DEFAULT NOW(),
    criado_por        TEXT DEFAULT 'system',
    expires_at        TIMESTAMPTZ,                  -- NULL = não expira (seed). TTL aplicado a gerados.
    ts                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cache_hash      ON public.cache_semantico (hash_prompt);
CREATE INDEX IF NOT EXISTS idx_cache_qualidade ON public.cache_semantico (qualidade_score DESC, hits DESC);
-- ivfflat só quando houver linhas com embedding (criar depois de ligar fastembed):
-- CREATE INDEX idx_cache_emb ON public.cache_semantico USING ivfflat (embedding_prompt vector_cosine_ops);

-- Normalização determinística (lowercase, sem acento, sem pontuação)
CREATE OR REPLACE FUNCTION public.normalizar_prompt(p TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT lower(regexp_replace(unaccent(p), '[^a-z0-9\s]', '', 'g'));
$$;

-- RLS: cache é compartilhado → leitura a todos; escrita só service_role
ALTER TABLE public.cache_semantico ENABLE ROW LEVEL SECURITY;
CREATE POLICY cache_leitura_todos ON public.cache_semantico FOR SELECT USING (true);
-- (sem policy de INSERT/UPDATE → só service_role/definer escreve)
```

> ⚠️ A tabela `fallout_log` e as funções `registrar_fallout`/`aprimorar_cache` são **F3**, não F1. Não criar agora.

---

## 3. `semantic_cache.py` — assinaturas + descritivo
```
classe SemanticCache:
    __init__(supabase_client)

    _hash(prompt, idioma) -> str
        # sha256( normalizar_prompt(prompt) + '|' + idioma )

    get(prompt, idioma='pt', categoria=None) -> dict | None
        # F1: SÓ hash-exato (zero risco de RAM — decisão 8.2).
        # SELECT resposta_cacheada, fonte_original FROM cache_semantico WHERE hash_prompt=$1
        # se achou: UPDATE hits=hits+1, ultimo_hit=now(); retorna {output, fonte:'CACHE', custo_tokens:0}
        # FASE 2 do F1 (depois de medir folga de RAM): busca pgvector <=> com fastembed.

    set(prompt, idioma, categoria, funcao, resposta, fonte, qualidade) -> None
        # INSERT ... ON CONFLICT (hash_prompt) DO UPDATE
        #   só sobrescreve resposta se EXCLUDED.qualidade_score > atual (lógica do §12, mas o
        #   UPSERT já pode viver aqui; o registrar_fallout fica pro F3)
```
**Descritivo**: F1 entrega cache hash-exato puro (sem embeddings) — zero risco de OOM na VM micro. Embedding/pgvector é um *segundo passo dentro do F1*, ligado só depois de medir a folga de RAM com `fastembed` (bge-small ONNX, ~150MB). Nunca `sentence-transformers`/torch (OOM — §8.2).

---

## 4. `bootstrap.py` — ordem de carga (do §11)
```
1. Aplicar a migration (tabela).
2. Carregar seed_cache_800.sql  → ~800 respostas REAIS, idioma='pt', custo R$0, criado_por='system', expires_at=NULL.
3. (trilíngue) gerar EN/ES do seed: traduzir as respostas — fazer via Llama quando a RTX estiver online; senão deixar só PT no F1 e completar EN/ES depois.
4. Diff: todos_prompts.json (~280) × seed já carregado (por prompt_normalizado). Remover o já coberto.
5. demandas_top_1000.json (permutações) → popular via playbook (determinístico, sem risco).
6. Lote remanescente do passo 4 → SÓ com a RTX 4060 online (Llama gera resposta real). NÃO rodar com GPU offline.
```
> Extrair `seed_cache_800.sql` de `C:\Users\DWOS\Desktop\Literatura\PROMPT PARA CACHE.txt` (8 blocos INSERT). **Não commitar PDFs nem JSON com texto integral de fonte** (sigilo + direitos).

---

## 5. Verificação (como saber que o F1 está pronto)
1. `select count(*) from cache_semantico;` → ~800+ linhas.
2. `POST /sandeiros/responder {"prompt":"como sair das dividas metodo bola de neve"}` → retorna resposta real, `fonte:"CACHE"`, `custo_tokens:0`, <50ms.
3. Prompt inexistente → MISS limpo (sem erro), pronto pro F2/F3 plugarem Llama/playbook.
4. RLS: cliente anon consegue SELECT (cache é público), mas NÃO consegue INSERT.
5. RAM da VM após carga: `free -m` — confirmar folga antes de ligar fastembed.

---

## 6. Sigilo — checklist antes de qualquer commit
- [ ] Nenhum nome de fonte real em arquivo do repo — só codinomes neutros (F1 é só cache, naturalmente limpo).
- [ ] Não commitar PDFs/JSONs brutos de `Desktop/Literatura`.
- [ ] `git status` antes de commitar — conferir que só os arquivos do F1 entram.
- [ ] Histórico Git ainda exposto (incidente conhecido) — **não relacionado ao F1**; tratar separado com OK do fundador.

---

## 7. Prompt para colar na sessão nova
> "Vamos implementar o F1 do SandeirOS. Leia `F1_KICKOFF.md` na raiz e execute: migration `cache_semantico` consolidada, `semantic_cache.py` (get/set hash-exato), `bootstrap.py`, extrair e carregar `seed_cache_800.sql` de Desktop/Literatura/PROMPT PARA CACHE.txt, e o endpoint `/sandeiros/responder`. Respeite o sigilo (codinomes). Verifique pelos critérios da §5 antes de declarar pronto. Não fazer F2+ (humanização/agente/ferramentas) nem mexer no histórico Git."
