# ✅ Conferência + Deploy — SandeirOS F1/F2

**Estado (21/Jun, pós-conferência):** F1 **conferido, corrigido e verificado**; endpoint
escrito e testado. **Nada commitado, nada deployado.** Deploy do banco **adiado** (falta
credencial de banco nesta máquina — só há anon key/URL no `mobile/.env`).

## 🔍 O que a conferência achou e corrigiu (21/Jun)
- 🔴 **Seed estava morto:** os `hash_prompt` eram placeholders ('a1b2c3'…'ge100'), **0/391 HIT** —
  o cache carregaria e nunca devolveria nada. **Corrigido:** `extract_seed.py` reescrito
  (ancora no `}'::jsonb`, pula registros corrompidos, valida JSON, **recalcula** hash/normalizado
  com o hash do runtime). `hash_prompt()` virou ponto único de verdade em `semantic_cache.py`.
- 🔴 **Seed quebraria o psql:** aspas não-escapadas no JSON + 1 registro truncado na fonte
  (`vi045`) + comentários de seção vazando pro VALUES. **Corrigido** pelo extractor robusto.
- 🟡 **`normalizar_prompt` SQL** apagava maiúsculas (`lower()` por fora). **Corrigido** na migration.
- ✅ **Resultado:** `seed_cache_800.sql` = **404 registros**, validado **404/404 HIT + JSON ok**,
  carregável. 12/416 da fonte descartados (corrompidos) — recuperáveis depois se quiser.

## O que está pronto (working tree, não commitado)
**F1 — cache + endpoint:**
- `supabase/migrations/20260621060000_sandeiros_cache.sql` — tabela `cache_semantico` (RLS leitura pública).
- `backend/sandeiros/semantic_cache.py` — get/set + `hash_prompt()` (verdade única do hash).
- `backend/sandeiros/responder.py` + `api.py` — `POST /sandeiros/responder` + `GET /sandeiros/health`
  (testados: HIT / MISS / vazio / 503-sem-credencial; FastAPI TestClient verde).
- `backend/sandeiros/data/extract_seed.py` + `seed_cache_800.sql` (404 reais, custo R$0).

**F2 — Motor de Humanização (HL):**
- `backend/sandeiros/humanizador.py` — 4 camadas, degrada sem dados, codinomes neutros.
- `.gitignore` blinda `hl{1,2,3,4}_*.json`; `data/README_HL.md` documenta o schema.

## ▶️ Deploy quando houver credencial de banco
```bash
psql "$DATABASE_URL" -f supabase/migrations/20260621060000_sandeiros_cache.sql   # tabela
psql "$DATABASE_URL" -f backend/sandeiros/data/seed_cache_800.sql                # seed (404)
psql "$DATABASE_URL" -c "select count(*) from public.cache_semantico;"           # espera 404
```
Depois: `scp -r backend/sandeiros` p/ a VM Oracle, setar `SUPABASE_URL`+`SUPABASE_SERVICE_ROLE_KEY`
no ambiente do serviço, e no `main.py`:
```python
from sandeiros.api import router as sandeiros_router
app.include_router(sandeiros_router)
```
Conferir: `GET /sandeiros/health` → `cache_credenciado: true`.

## Deploy F2 (quando ativar humanização)
1. Colocar os 4 `hl*_*.json` (data privada) em `backend/sandeiros/data/` na VM — fora do Git.
2. Chamar com `{"humanizar": true}` (ou no fluxo do ProteOS, após obter o bruto).
3. Sem os JSONs, roda sem o enriquecimento (degrada, não quebra).

## Ainda aberto
- **Commit:** F1/F2 ainda **não commitados** (repo público — sigilo conferido limpo; seed
  não-sensível; `hl*.json` gitignored). Aguardando seu OK pra commitar.
- **Histórico Git** ainda expõe termos antigos em commits passados — decidir reescrever com seu OK.
- F3 (router cascata + rate-limit + Fallout), F4 (Llama), F5 (conversor), F6 (LGPD), F7-F11.
- Planos PanaceIA (Free/Pro/GPU) a definir antes do F3.
