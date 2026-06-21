# ⚙️ ESCOPO CONSOLIDADO — SandeirOS dentro do MVP1 AquariOS
### "Relógio Suíço": 5 agentes em paralelo, custo quase-zero ao usuário

**Data**: 21/Jun/2026 · **Decisão do fundador**: tudo junto e harmônico · **Status**: BLUEPRINT (sem código real — aguarda aprovação da árvore)

> Supersede as suposições de integração de `ANALISE_LITERATURA_MVP1.md` e `PLANO_INTEGRACAO_LITERATURA_MVP1.md` (que assumiam stack nova). Aqui tudo é mapeado na stack **que já existe**.

---

## 1. A descoberta-chave

O "SendeirOS" da pasta Literatura **já tem nome e lugar** na sua arquitetura: é o **SandeirOS = camada interna do ProteOS** (AQUARIOS_LIVRO.md). Não é produto separado, não é stack nova. É o **motor de custo-zero** que faltava plugar.

A versão nova (outra AI) trouxe a stack errada (Clerk/Stripe/Fly/Next) porque não conhecia o AquariOS. A correção é **mapear cada peça na stack real** — nada se duplica.

| Peça da versão nova | ❌ Descarta | ✅ Já existe no AquariOS |
|---|---|---|
| Clerk (auth) | sim | Supabase Auth (JWT) |
| Postgres schema-por-user + RLS | sim | Supabase RLS por `user_id` (migrations 17/18/23) |
| Stripe billing | sim | TokenGate + Paytime (webhook live) |
| Fly.io 10 regiões | sim | Oracle VM FastAPI (`api.podiumtec.com.br` live) |
| Next.js dashboard | sim | App Expo/RN (`proteos.tsx`) |
| R2/Minio | sim | Supabase Storage / S3 data lake (HygeiOS) |
| **cache_semantico** | **NÃO** | → entra como engine do SandeirOS |
| **playbooks** | **NÃO** | → entra como engine do SandeirOS |
| **agent_esoterico (4 camadas)** | **NÃO** | → entra no ProteOS Espiritual |
| **llama_integration** | **NÃO** | → worker local opcional (RTX 4060 do fundador) |

---

## 2. Os 5 agentes como relógio suíço

```
            ┌─────────────────────── USUÁRIO (app Expo) ───────────────────────┐
            ↓                                                                    ↑
   ╔════════════════╗   pergunta            resposta humanizada    ╔════════════════╗
   ║  ProteOS       ║◄───────────────┐    ┌──────────────────────►║  ProteOS       ║
   ║ Agent.Interface║                │    │                        ║ (entrega)      ║
   ╚═══════╤════════╝                │    │                        ╚════════════════╝
           │ orquestra               │    │
           ▼                         │    │
   ╔════════════════════════════════════════════════════╗
   ║  SandeirOS  (camada interna — MOTOR CUSTO-ZERO)     ║
   ║  N1 cache semântico → 0 tokens, <50ms  (95%)        ║
   ║  N2 Llama local RTX4060 → 0 token externo (4%)      ║
   ║  N3 playbook determinístico → 0 tokens (fallback)   ║
   ║  N4 Claude/Anthropic → SÓ 1% crítico               ║
   ║  + humanização 4 camadas (Voz/Bardo/QC/Tarot)       ║
   ╚══╤═══════════════════╤═══════════════════╤══════════╝
      │                   │                   │
      ▼                   ▼                   ▼
 ╔═════════╗        ╔═══════════╗       ╔═══════════╗
 ║ HygeiOS ║        ║ CerberOS  ║       ║ PanaceIA  ║
 ║Agent.Data║       ║Agent.Core ║       ║Agent.Corp ║
 ║ memória  ║       ║rate limit ║       ║ planos/   ║
 ║ embeddings║      ║validador  ║       ║ Paytime   ║
 ║ data lake║       ║ético+RLS  ║       ║ TokenGate ║
 ╚═════════╝        ╚═══════════╝       ╚═══════════╝
```

**Harmonia:** ProteOS conversa, SandeirOS economiza, HygeiOS lembra, CerberOS protege, PanaceIA cobra. Cada um faz UMA coisa; o usuário só vê o ProteOS.

---

## 3. Bugs corrigidos (no pseudocódigo — antes de virar código)

| # | Bug original | Correção aplicada |
|---|---|---|
| 1 | `_embedding()` = `np.random` → cache semântico morto | Trocar por `sentence-transformers all-MiniLM-L6-v2` (local, ~80MB, grátis). Pré-computar embeddings no bootstrap. |
| 2 | `funcao` indefinida no ramo Llama | Definir `funcao` **sempre**, antes do branch. |
| 3 | `_insatisfacao()` lê respostas do agente, não do usuário | Guardar turnos do USUÁRIO separados; contar marcadores neles. |
| 4 | 4 camadas achatadas + `random.choice` nas 3 linhas | Restaurar pipeline em camadas reais; linha fraca = `min()` do histórico real (HygeiOS). |
| 5 | `worker.py` conversor = stub | OK — conversor universal FORA do MVP1 (fase 2). Documentado. |

---

## 4. Árvore Atualizada (stack AquariOS real)

```
aquarios-v2-complete/
├─ backend/  (Oracle VM — FastAPI já live em api.podiumtec.com.br)
│  └─ sandeiros/                         🔵 NOVO MÓDULO (engine ProteOS)
│     ├─ __init__.py
│     ├─ semantic_cache.py    🟢 sha256 + embeddings REAIS (fix#1) + TTL
│     ├─ playbooks.py         🟡 SWOT/slides/sympy/viagem/copy
│     ├─ esoterico.py         🔵 4 camadas Voz/Bardo/QC/Tarot (fix#3,#4)
│     ├─ llama_local.py       🔵 classe LlamaLocal (worker RTX4060 opcional)
│     ├─ router.py            🔵 cascata N1→N2→N3→N4 (fix#2)
│     ├─ bootstrap.py         🔵 pré-popula cache (roda 1x)
│     └─ data/
│        ├─ demandas_top_1000.json     ⚫ (Literatura)
│        ├─ swot/*.json                🟢 20 setores
│        ├─ voz_bardo_unificado.json   🟢 90 nós
│        ├─ quarto_caminho_80_nos.json 🟢
│        ├─ tarot_cabala_22.json       🟢 22 arcanos
│        └─ gatilhos / mercados / snippets.json
│
├─ supabase/migrations/
│  └─ 7X_sandeiros_cache.sql           🔵 tabela cache_semantico + RLS
│
├─ mobile/  (Expo/RN — app existente)
│  └─ src/modules/ProteOS/
│     └─ proteos.tsx                    🟡 chama /sandeiros/responder
│
└─ (DESCARTADOS da versão nova: frontend Next, Clerk, Stripe, Fly, Minio, conversor)
```

**Integração com agentes existentes:**
- `semantic_cache.py` grava em **Supabase** (tabela `cache_semantico`, RLS) — não SQLite isolado.
- `esoterico.py` usa **HygeiOS** para histórico real (fix#3,#4) — não memória em RAM.
- `router.py` consulta **CerberOS** para rate-limit/validador antes do N4 (Claude).
- Fallback N4 respeita **PanaceIA** (plano define se pode chamar Claude).

---

## 5. Pseudocódigo com descritivo — CORRIGIDO

**Descritivo:** o ProteOS recebe a pergunta e delega ao SandeirOS. O SandeirOS tenta 3 fontes custo-zero antes de tocar no Claude. A resposta bruta passa pelas 4 camadas de humanização. Os outros agentes entram como serviços (memória, defesa, cobrança).

```
FUNÇÃO ProteOS.responder(pergunta, user):
    # CerberOS antes de tudo
    SE NÃO CerberOS.rate_limit_ok(user): RETORNA erro_429
    plano ← PanaceIA.get_plano(user)
    historico ← HygeiOS.buscar_turnos_usuario(user, n=5)     # fix#3: turnos do USUÁRIO

    categoria ← cache.detectar_categoria(pergunta)
    funcao    ← cache.detectar_funcao(pergunta)              # fix#2: SEMPRE definido

    # ── SandeirOS: cascata custo-zero ──
    # N1 CACHE (0 tokens) — embedding REAL all-MiniLM (fix#1)
    SE (bruto ← cache.get(pergunta, categoria)):  fonte ← "CACHE"
    SENÃO SE llama.is_available() E plano.gpu:               # N2 Llama local
        bruto ← llama.gerar(pergunta) ; fonte ← "LLAMA_LOCAL"
    SENÃO SE playbook.cobre(funcao):                         # N3 determinístico
        bruto ← playbook.executar(funcao, params) ; fonte ← "PLAYBOOK"
    SENÃO SE plano.permite_claude:                           # N4 SÓ 1% crítico
        SE CerberOS.validar_intencao(pergunta):
            bruto ← Claude.gerar(pergunta) ; fonte ← "ANTHROPIC"
    SENÃO: bruto ← "sem cobertura — adicione ao playbook"

    SE fonte ≠ "CACHE": cache.set(pergunta, categoria, funcao, bruto)  # fix#2

    # ── Humanização: 4 camadas REAIS em sequência (fix#4) ──
    r ← esoterico.camada1_voz_bardo(bruto, pergunta)        # modo VOZ|BARDO
    r ← esoterico.camada2_quarto_caminho(r, historico)      # 3 linhas: linha_fraca=min(historico real)
    r ← esoterico.camada3_sete_leis(r)                      # filtra absolutismos
    SE esoterico.insatisfacao(historico) ≥ 2:               # fix#3: conta nos turnos do USUÁRIO
        r ← esoterico.camada4_tarot(r)                      # reframe (não previsão)
    r ← CerberOS.validador_etico(r)                         # bloqueia harm

    HygeiOS.salvar(user, pergunta, r, fonte)                # memória + data lake
    RETORNA {output: r, fonte, custo_tokens: (fonte=="ANTHROPIC" ? n : 0)}
```

---

## 6. Economia real — entrega "custo muito baixo"

| Camada | % tráfego | Custo/interação | Tokens Anthropic |
|---|---|---|---|
| N1 Cache | 95% | R$ 0 | 0 |
| N2 Llama RTX4060 | 4% | ~R$ 0,0002 (luz) | 0 |
| N3 Playbook | <1% | R$ 0 | 0 |
| **N4 Claude** | **~1%** | variável | **só aqui** |

**Resultado:** ~99% das interações **não tocam no Anthropic**. O custo por usuário cai para fração de centavo — exatamente o "custo muito baixo" pedido. O Claude vira **artilharia de precisão** (1% crítico), não o motor principal.

---

## 7. Plano de adesão ao MVP1 (faseado, sem quebrar o que existe)

| Fase | Entrega | Toca em | Risco |
|---|---|---|---|
| **F1** | `semantic_cache.py` + migration Supabase + bootstrap 1000 demandas | Oracle + Supabase | Baixo (tabela nova) |
| **F2** | `esoterico.py` 4 camadas + wire no `proteos.tsx` | ProteOS mobile | Baixo (feature flag) |
| **F3** | `router.py` cascata N1→N4 + CerberOS/PanaceIA gates | backend | Médio (integra 3 agentes) |
| **F4** | `llama_local.py` worker RTX4060 (opcional) | GPU fundador | Baixo (degrada p/ N3 se offline) |
| **—** | Conversor universal, billing SaaS standalone | — | **FORA do MVP1** |

---

## 8. Decisões TÉCNICAS travadas (21/Jun)

✅ Tudo junto, harmônico, custo-zero, dentro do AquariOS.

### 8.1 Cache → **Supabase + pgvector** ✅
- Busca por similaridade roda **dentro do Postgres** (operador `<=>`), não na VM.
- A VM gera só **1 vetor por miss** — não segura os 1000 nem faz cosine em Python (isso era o bug #1).
- Fonte de verdade + RLS + backup automático.

### 8.2 Embeddings → **`fastembed` (ONNX), não sentence-transformers** ✅
- ⚠️ **Restrição real**: VM Oracle = E2.1.Micro (~500MB RAM, 238MB em uso). `sentence-transformers`+PyTorch (~400MB residente) **causaria OOM**.
- `fastembed` (BAAI/bge-small, ONNX, ~150MB pico, sem torch) cabe na micro VM.
- **Degradação graciosa**: F1 começa **hash-exato** (zero risco de RAM); liga fastembed após medir folga. `sentence-transformers` só quando A1.Flex (24GB) entrar.

### Atualização do bug #1
> ~~`sentence-transformers all-MiniLM`~~ → **`fastembed` (ONNX) + pgvector no Supabase**. Cosine sai do Python (VM) e vai pro Postgres.

Decisões travadas → próximo passo é **F1 código real** seguindo esta árvore.
