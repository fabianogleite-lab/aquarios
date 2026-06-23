# SandeirOS — backend (módulo do ProteOS)

Motor custo-zero do ProteOS. **Esta pasta é a fonte de verdade do código** — o backend
roda na VM Oracle (FastAPI); o envio para a VM é **passo manual separado** (sem git na VM).

## Estado atual
**F1 — núcleo do cache (pronto e verificado):**
- `semantic_cache.py` — cache global hash-exato. `hash_prompt()` é o **ponto único de
  verdade** do hash (seed e runtime usam o mesmo). Sem embeddings ainda (ver §8.2 do ESCOPO).
- `responder.py` — lógica do /responder (N1 cache; MISS → cascata pendente do F3), sem FastAPI.
- `api.py` — router FastAPI: `POST /sandeiros/responder` + `GET /sandeiros/health`.
- `bootstrap.py` — ordem de carga (só passos sem GPU; resto é TODO).
- `data/extract_seed.py` — gera `data/seed_cache_800.sql` da fonte privada (recalcula
  hash/normalizado, valida JSON, **pula registros corrompidos**).
- `data/seed_cache_800.sql` — **404 respostas reais** (validado: 404/404 HIT + JSON ok).
- migration: `../../supabase/migrations/20260621060000_sandeiros_cache.sql`.

**F2 — Motor de Humanização (presente, opcional, degrada sem dados):**
- `humanizador.py` — 4 camadas (codinomes neutros). Carrega `data/hl*_*.json` (privados,
  **gitignored**, não versionados). Ausentes → cada camada degrada sem quebrar.
- `data/README_HL.md` — schema dos nós + como colocar a data privada na VM.

**N2 — Llama local (dev-only, opt-in):**
- `n2_llama.py` — chama Ollama local (`OLLAMA_URL`, default `http://localhost:11434`;
  `OLLAMA_MODEL`, default `llama3:8b`). Só roda se `usar_llama_local=True` no
  `/sandeiros/responder` — desligado por padrão, produção (Oracle/Azure) não tem Ollama
  acessível e nunca aciona isto. Hoje só faz sentido em GPU local (ver `INFRA_HARDWARE_MAP.md`
  na raiz — nó SIRIOS). Degrada pra `MISS` normal se Ollama não responder.

**NÃO está aqui ainda (F3+):** N3 playbook, N4 Claude, fallout, agente autônomo, ferramentas, conversor.

## Deploy do banco (precisa de credencial — não automatizado)
```bash
# 1) (re)gerar o seed da fonte privada, se necessário (local)
python backend/sandeiros/data/extract_seed.py

# 2) aplicar a tabela
psql "$DATABASE_URL" -f supabase/migrations/20260621060000_sandeiros_cache.sql

# 3) carregar o seed
psql "$DATABASE_URL" -f backend/sandeiros/data/seed_cache_800.sql

# 4) conferir  -> espera 404
psql "$DATABASE_URL" -c "select count(*) from public.cache_semantico;"
```

## Endpoint + wire-in na VM
1. Copiar o módulo para a VM (sem git na VM):
   ```bash
   scp -i <chave> -r backend/sandeiros opc@137.131.158.242:~/app/   # ajuste ao layout do main.py
   ```
2. Garantir a credencial no ambiente do serviço (systemd/.env da VM):
   `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (service_role).
3. No `main.py` do FastAPI, duas linhas:
   ```python
   from sandeiros.api import router as sandeiros_router
   app.include_router(sandeiros_router)
   ```
4. Conferir: `GET /sandeiros/health` → `{"cache_credenciado": true}` e
   `POST /sandeiros/responder {"prompt": "SWOT Nubank"}` → `fonte: "CACHE"`.

Sem `SUPABASE_*` no ambiente, o endpoint responde **503** claro (não derruba o app).

## Uso (programático)
```python
from sandeiros import SemanticCache
cache = SemanticCache(supabase_client)
hit = cache.get("como sair das dividas metodo bola de neve")   # {output, fonte:'CACHE', custo_tokens:0} | None
```

## Sigilo
A camada de cache não toca conteúdo sensível. O F2 usa **codinomes neutros** — nunca
escrever nomes de fontes reais em arquivo do repo. `data/seed_cache_800.sql` é **gerado**
(não commitar a fonte `PROMPT PARA CACHE.txt`); `data/hl*_*.json` são privados (gitignored).
