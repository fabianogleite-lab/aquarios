# ⚙️ ESCOPO CONSOLIDADO — SandeirOS dentro do MVP1 AquariOS
### "Relógio Suíço": 5 agentes em paralelo, custo quase-zero ao usuário

**Data**: 21-22/Jun/2026 · **Decisão do fundador**: tudo junto e harmônico · **Status**: APROVADO — entra em produção fase a fase (F1 primeiro)

> Mapeado 100% na stack **que já existe** (Supabase, Oracle VM, app Expo). Ponto de entrada para produção: `HANDOFF_SANDEIROS_PRODUCAO.md`.

---

## 1. A descoberta-chave

O material de origem (gerado por outra AI, codinome interno "motor de produtividade") **já tem nome e lugar** na arquitetura: é o **SandeirOS = camada interna do ProteOS** (AQUARIOS_LIVRO.md). Não é produto separado, não é stack nova. É o **motor de custo-zero** que faltava plugar.

A versão de origem trouxe a stack errada (Clerk/Stripe/Fly/Next) porque não conhecia o AquariOS. A correção é **mapear cada peça na stack real** — nada se duplica.

| Peça da versão de origem | ❌ Descarta | ✅ Já existe no AquariOS |
|---|---|---|
| Clerk (auth) | sim | Supabase Auth (JWT) |
| Postgres schema-por-user + RLS | sim | Supabase RLS por `user_id` (migrations 17/18/23) |
| Billing terceiro (Stripe) | sim | TokenGate + meios já ligados |
| Host fixo 10 regiões (Fly.io) | sim | Oracle VM FastAPI (`api.podiumtec.com.br` live) + multi-cloud |
| Dashboard Next.js | sim (renomeado) | vira console web de produtividade (§8.3) |
| R2/Minio | sim | Storage S3-compatível (HygeiOS) |
| **cache_semantico** | **NÃO** | → entra como engine do SandeirOS |
| **playbooks** | **NÃO** | → entra como engine do SandeirOS |
| **Motor de Humanização (4 camadas)** | **NÃO** | → entra no ProteOS (camada interna) |
| **integração Llama** | **NÃO** | → worker local opcional (RTX 4060 do fundador) |

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
   ║  + Motor de Humanização (4 camadas HL)              ║
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
| 1 | `_embedding()` = `np.random` → cache semântico morto | Trocar por **`fastembed` (ONNX) + pgvector no Supabase** (cosine sai do Python da VM e vai pro Postgres). Ver 8.2. |
| 2 | `funcao` indefinida no ramo Llama | Definir `funcao` **sempre**, antes do branch. |
| 3 | `_insatisfacao()` lê respostas do agente, não do usuário | Guardar turnos do USUÁRIO separados; contar marcadores neles. |
| 4 | 4 camadas achatadas + `random.choice` na escolha de eixo | Restaurar pipeline em camadas reais; eixo fraco = `min()` do histórico real (HygeiOS). |
| 5 | `worker.py` conversor = stub | Conversor universal **volta integral ao escopo** (F5) — ver §10.2. |

---

## 4. Árvore Atualizada (stack AquariOS real)

```
aquarios-v2-complete/
├─ backend/  (Oracle VM — FastAPI já live em api.podiumtec.com.br)
│  └─ sandeiros/                         🔵 NOVO MÓDULO (engine ProteOS)
│     ├─ __init__.py
│     ├─ semantic_cache.py    🟢 sha256 + embeddings REAIS (fix#1) + TTL
│     ├─ playbooks.py         🟡 SWOT/slides/sympy/viagem/copy
│     ├─ humanizador.py       🔵 Motor de Humanização: 4 camadas HL (fix#3,#4)
│     ├─ llama_local.py       🔵 classe LlamaLocal (worker RTX4060 opcional)
│     ├─ router.py            🔵 cascata N1→N2→N3→N4 (fix#2)
│     ├─ interpretador.py     🔵 LinguagemInterpretativa PT-BR→AST
│     │                            (detecta intenção: pergunta normal OU conversão de mídia)
│     ├─ conversor/           🔵 conversor universal COMPLETO (§10.2)
│     │     ├─ cpu_ops.py     ffmpeg(audio)/imagemagick/inkscape/libreoffice/pandoc/sox
│     │     │                 → roda em QUALQUER nuvem (multi-cloud 8.4), custo zero
│     │     └─ gpu_ops.py     ffmpeg NVENC (vídeo) → roteia pro MESMO worker RTX4060
│     │                       que serve o Llama (heartbeat 6.1, fallback se offline)
│     ├─ bootstrap.py         🔵 pré-popula cache (roda 1x) — ver §11
│     └─ data/
│        ├─ seed_cache_800.sql         🟢 8 blocos, ~800 prompts COM RESPOSTA REAL
│        │                              já escrita (zero custo, sem Llama/Claude) — §10.3
│        ├─ prompts_unificados.json    🔵 resto (objetivo+função, sem resposta) — precisa Llama/§11
│        ├─ swot/*.json                🟢 20 setores
│        ├─ hl1_intervalo_300.json     🟢 Camada 1 — 300 nós (IDs 7001-7300)
│        ├─ hl2_triade_80.json         🟢 Camada 2 — 80 nós (8001-8080)
│        ├─ hl3_equilibrio_70.json     🟢 Camada 3 — 70 nós (9001-9070)
│        ├─ hl4_reframe_22.json        🟢 Camada 4 — 22 nós (10001-10022)
│        └─ gatilhos / mercados / snippets.json
│
├─ supabase/migrations/
│  ├─ 7X_sandeiros_cache.sql           🔵 tabela cache_semantico (+qualidade_score, hits) + RLS
│  └─ 7X_sandeiros_fallout.sql         🔵 tabela fallout_log + funções
│                                          registrar_fallout() / aprimorar_cache() — ver §12
│
├─ mobile/  (Expo/RN — app existente = face bem-estar)
│  └─ src/modules/ProteOS/
│     └─ proteos.tsx                    🟡 chama /sandeiros/responder
│
├─ frontend/  (Next.js — console web de produtividade)  ✅ REVIVIDO
│  └─ chat + "computador do agente" (cascata custo ao vivo) + entregáveis
│
└─ deploy/                              ✅ REVIVIDO (portável, Traefik+SSL)
   └─ Dockerfile + docker-compose.prod.yml → Alibaba / GCP / AWS (multi-cloud)
```

### Remapeado (não descartado — corrigido 21/Jun)
| Item | Destino MVP1 |
|---|---|
| 🔄 Clerk | Supabase Auth (compartilhado mobile+web) |
| ⏸️ Billing terceiro (Stripe) | fora do MVP1 (MP + Shopify cobrem) |
| 🔵 Mercado Pago | NOVO — trilho LATAM (Pix/boleto/cartão) |
| 🔵 Checkout Shopify | NOVO — cartão global já ligado |
| ⏸️ Paytime | MVP2 (Pix/split BR) |
| 🟡 Storage | S3-compatível (R2 / AWS S3 / Alibaba OSS / GCS) |
| ✅ Minio | dropa (só dev) |
| 🔵 conversor COMPLETO | escopo expandido: volta integral ao MVP1 (não só doc-lite). CPU ops (doc/imagem/áudio) custo-zero em qualquer nuvem; GPU ops (vídeo) reusa o worker RTX4060 do Llama. Ver §10.2 e F5. |
| ⚙️ Oracle micro | fica só com HygeiOS (não cabe o resto → multi-cloud) |

**Integração com agentes existentes:**
- `semantic_cache.py` grava em **Supabase** (tabela `cache_semantico`, RLS) — não SQLite isolado.
- `humanizador.py` usa **HygeiOS** para histórico real (fix#3,#4) — não memória em RAM.
- `router.py` consulta **CerberOS** para rate-limit/validador antes do N4 (Claude).
- Fallback N4 respeita **PanaceIA** (plano define se pode chamar Claude).

---

## 5. Pseudocódigo com descritivo — CORRIGIDO

**Descritivo:** o ProteOS recebe a pergunta e delega ao SandeirOS. O SandeirOS tenta 3 fontes custo-zero antes de tocar no Claude. A resposta bruta passa pelo Motor de Humanização (4 camadas). Os outros agentes entram como serviços (memória, defesa, cobrança).

```
FUNÇÃO ProteOS.responder(pergunta, user):
    # CerberOS antes de tudo
    SE NÃO CerberOS.rate_limit_ok(user): RETORNA erro_429
    plano ← PanaceIA.get_plano(user)
    historico ← HygeiOS.buscar_turnos_usuario(user, n=5)     # fix#3: turnos do USUÁRIO

    categoria ← cache.detectar_categoria(pergunta)
    funcao    ← cache.detectar_funcao(pergunta)              # fix#2: SEMPRE definido

    # ── SandeirOS: cascata custo-zero ──
    # N1 CACHE (0 tokens) — embedding REAL fastembed/ONNX (fix#1)
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

    # ── Motor de Humanização: 4 camadas HL em sequência (fix#4) ──
    r ← humanizador.camada1_intervalo(bruto, pergunta)      # modo PROSPECTIVO|RETROSPECTIVO
    r ← humanizador.camada2_triade(r, historico)            # 3 eixos: eixo_fraco=min(historico real)
    r ← humanizador.camada3_equilibrio(r)                   # filtra absolutismos
    SE humanizador.insatisfacao(historico) ≥ 2:             # fix#3: conta nos turnos do USUÁRIO
        r ← humanizador.camada4_reframe(r)                  # reenquadramento (não previsão)
    r ← CerberOS.validador_etico(r)                         # bloqueia harm

    HygeiOS.salvar(user, pergunta, r, fonte)                # memória + data lake
    RETORNA {output: r, fonte, custo_tokens: (fonte=="ANTHROPIC" ? n : 0)}
```

**Descritivo das 4 camadas HL** (nomes técnicos; lógica interna detalhada na referência privada de design):
- **C1 — Diagnóstico de Intervalo Temporal**: classifica se a pergunta é PROSPECTIVA (orientada a futuro/antecipação) ou RETROSPECTIVA (orientada a passado/revisão) e escolhe o nó de resposta adequado. Base: `hl1_intervalo_300.json`.
- **C2 — Contexto Triádico**: situa a ação em 3 eixos (pessoal / relacional / coletivo); sugere ação concreta no eixo mais fraco do histórico real. Base: `hl2_triade_80.json`.
- **C3 — Filtro de Equilíbrio Linguístico**: passa o texto por 7 regras de balanceamento que removem absolutismos ("deve" → "pode testar"). Base: `hl3_equilibrio_70.json`.
- **C4 — Reenquadramento por Gatilho**: só dispara se insatisfação ≥2; injeta uma pergunta-espelho que quebra loop racional (reframe, nunca previsão). Base: `hl4_reframe_22.json`.

---

## 6. Economia real — entrega "custo muito baixo"

| Camada | % tráfego | Custo/interação | Tokens Anthropic |
|---|---|---|---|
| N1 Cache | 95% | R$ 0 | 0 |
| N2 Llama RTX4060 | 4% | ~R$ 0,0002 (luz) | 0 |
| N3 Playbook | <1% | R$ 0 | 0 |
| **N4 Claude** | **~1%** | variável | **só aqui** |

**Resultado:** ~99% das interações **não tocam no Anthropic**. O custo por usuário cai para fração de centavo — exatamente o "custo muito baixo" pedido. O Claude vira **artilharia de precisão** (1% crítico), não o motor principal.

### 6.1 Bootstrap inteligente + worker RTX 4060

**Bootstrap mais inteligente (refina F1, não cria fase nova):**
```
FUNÇÃO bootstrap.popular_cache(demandas):
    PARA cada item EM demandas:
        SE llama.is_available():                    # RTX 4060 online
            resposta ← llama.gerar(item.objetivo)    # resposta REAL, não esqueleto
        SENÃO:
            resposta ← playbook.executar(item.funcao, item.params)  # fallback determinístico
        cache.set(item, resposta)                    # grava no Supabase (pgvector)
```
Llama gera resposta de qualidade quando disponível; playbook só cobre o que falta. Mesma fase, sem mudar prazo.

**Registro do worker RTX 4060 (detalha F4):**
```
# No notebook do fundador, a cada 30s:
heartbeat() → POST /sandeiros/worker/heartbeat {user_id, tunnel_url}
            → router.py guarda tunnel_url com TTL 60s
            → SE expirar (GPU desligada) → N2 cai automaticamente pra N3 (playbook)
```

**Cache compartilhado "de graça":** como o cache é Supabase+pgvector (decisão 8.1), qualquer instância — Alibaba, GCP ou AWS, qualquer região — lê o mesmo cache automaticamente. Zero infra nova (dispensa o Redis centralizado por região que a origem propunha).

**🔴 Não entra — específicos do host fixo (Fly.io) supersedidos:** `fly.toml`, region-codes, tabela de custo, `fly scale count`. Decisão 8.4 já travou multi-cloud container-first. O padrão (geo-distribuição + auto-stop) é válido; a implementação específica, não.

---

## 7. Plano de adesão ao MVP1 — **MVP1 COMPLETO** (decisão 22/Jun)

> 🎯 **Decisão do fundador (22/Jun):** o MVP1 é o **produto completo**, não um mínimo. Entra TUDO: agente autônomo + as ~60 funções + trilíngue (PT/EN/ES) + motor editorial/agro alimentando Comunidades + integrações parqueadas. Sequenciado em **frentes paralelas** (não gates rígidos), shippável por onda. Princípio que mantém o custo-quase-zero: ver §13.

| Fase | Entrega | Onda | Risco |
|---|---|---|---|
| **F1** | `semantic_cache.py` + migration + bootstrap — **seed trilíngue PT/EN/ES** | 1 | Baixo |
| **F2** | `humanizador.py` 4 camadas HL (nós PT/EN/ES) + wire `proteos.tsx` | 1 | Baixo |
| **F3** | `router.py` cascata N1→N4 + CerberOS/PanaceIA gates + rate-limit + Fallout (§12) | 1 | Médio |
| **F4** | `llama_local.py` worker RTX4060 + heartbeat (TTL 60s) | 1 | Baixo |
| **F5** | Conversor universal: `interpretador.py` + `cpu_ops.py` + `gpu_ops.py` | 2 | Médio |
| **F6** | Endpoint LGPD delete (`DELETE /sandeiros/usuario`) | 4 | Baixo |
| **F7** | **Camada de ferramentas (adapters)**: WebSearch, DocGen, CodeExecutor, ImageGen, VideoGen — todas cacheadas, providers plugáveis (§13) | 2 | **Alto** (deps externas) |
| **F8** | **As ~60 funções completas** mapeadas às ferramentas (determinísticas + dado-vivo + mídia + CRM) | 2-3 | Médio |
| **F9** | **Agente autônomo**: planejador ReAct + síntese de entregáveis (PDF+PPT+site) — usa F7/F8 | 3 | **Alto** |
| **F10** | **Motor editorial + 33 eixos agro → Comunidades** (feed por dimensão iVi) | 4 | Médio |
| **F11** | **Integrações parqueadas**: Mail, Slack, operador de navegador, API pública, plano de equipe | 4 | Alto |
| **X** | i18n PT/EN/ES — **transversal** a F1/F2/F8/F10 | todas | Médio |

Detalhe das fases novas (F7-F11), árvore estendida e reconciliação de custo: **§13**.

---

## 8. Decisões TÉCNICAS travadas

### 8.1 Cache → **Supabase + pgvector** ✅
- Busca por similaridade roda **dentro do Postgres** (operador `<=>`), não na VM.
- A VM gera só **1 vetor por miss** — não segura os 1000 nem faz cosine em Python (bug #1).
- Fonte de verdade + RLS + backup automático.

### 8.2 Embeddings → **`fastembed` (ONNX), não sentence-transformers** ✅
- ⚠️ **Restrição real**: VM Oracle = E2.1.Micro (~500MB RAM, 238MB em uso). `sentence-transformers`+PyTorch (~400MB) **causaria OOM**.
- `fastembed` (BAAI/bge-small, ONNX, ~150MB pico, sem torch) cabe na micro VM.
- **Degradação graciosa**: F1 começa **hash-exato** (zero risco de RAM); liga fastembed após medir folga. `sentence-transformers` só quando A1.Flex (24GB) entrar.

### 8.3 Frontend → **console web de produtividade** ✅ (REVIVIDO)
- Não duplica o app mobile — é a **face produtividade** (as 1000 demandas) ao lado da face bem-estar (mobile).
- Painel duplo: chat + "computador do agente" mostrando a cascata de custo ao vivo (cache HIT → 0 tokens).
- Mesmo motor SandeirOS por baixo; auth = Supabase (compartilhado).

### 8.4 Hosting → **container-first multi-cloud** ✅
- Não trava em 1 host. Docker portável (`docker-compose.prod.yml` + Traefik+SSL) pronto p/ **Alibaba / GCP / AWS** (todos disponíveis/ociosos).
- Storage = API **S3-compatível** (R2 / AWS S3 / Alibaba OSS / GCS — agnóstico).
- VM Oracle micro fica **só com o HygeiOS atual**.

### 8.5 Pagamentos MVP1 → **Mercado Pago + Checkout Shopify** ✅
- **Mercado Pago** = trilho LATAM (Pix, boleto, cartão, parcelado → BR/PE/VE/AR/MX).
- **Checkout Shopify** = cartão global, já ligado.
- **Paytime → MVP2** (Pix/split BR). Stripe só se Onda 2+ exigir.

---

## 9. Achados FORA do SandeirOS (não forçar encaixe)

### 9.1 `trends_2026.json` (100 sinais geopolíticos) → **Comunidades**
Tem lugar como widget `GeopoliticsAlert` em Comunidades — não precisa do motor SandeirOS, é leitura direta de tabela. Ação: backlog de Comunidades, não do SandeirOS.

### 9.2 Motor editorial/notícias + "33 eixos agro" — sem dono no AquariOS
Conteúdo de `sistema_cache_universal_100_itens.zip` + `tudo_100_itens_cache.zip`:
- É um **motor editorial/agregador de notícias** (estilo portal jornalístico de terceiros) + um **motor de monitoramento de commodities** ("33 eixos agro v2.4": cada eixo com fonte oficial CEPEA/B3/CONAB/USDA/ANP/BACEN, métrica-chave e gatilho de alerta binário, pipeline diário 07:00 BRT).
- Mesma filosofia custo-zero (busca 1x, serve N), mas domínio é **conteúdo jornalístico / monitoramento de mercado**, não as demandas de produtividade do SandeirOS.
- **Não existe vertical de notícias/monitoramento documentada no AquariOS.** Não force-fit em EscambOS, AsclepiOS ou outro módulo — é achado novo, **sem dono**.
- ⚠️ A AI de origem tentou numerar o agro como "Camada 5/6/7" do motor — **mistura indevida**: domínios diferentes. Se aprovado um dia, entra como **produto separado**, não como extensão do SandeirOS.

**Pendente de decisão do fundador (P2.1):** explorar (alimentar Comunidades por dimensão iVi?), teste descartável, ou produto à parte? Não decidir sozinho.

---

## 10. Consolidação 22/Jun — dataset + escopo do conversor

### 10.1 `todos_prompts.json` (~280 perguntas reais) — vira `prompts_unificados.json`
**Mesclar** com `demandas_top_1000.json` (sintético). As perguntas reais (ansiedade, dívida, MEI, viagem, comparativos) batem com o público do ProteOS.

**⚠️ Problema de qualidade**: a maioria foi mapeada pra `funcao: GeradorTextoPublicitario` (que só gera copy AIDA/PAS). Ex: *"Ansiedade crise parar 5 minutos técnica"* → geraria um anúncio. É a base de mapeamento `funcao` que está genérica demais — corrigir antes do F3 (com o fundador).

### 10.2 Conversor universal — escopo expandido
O conversor **completo** entra no MVP1 (F5), mesma filosofia custo-perto-de-zero:
- `interpretador.py` (`LinguagemInterpretativa`) — parser PT-BR→AST ("transforma em gif 1080p 30fps" → `{output:gif, fps:30, w:1080}`), reaproveitado p/ texto e mídia.
- **CPU ops** (ffmpeg-áudio, imagemagick, inkscape, libreoffice, pandoc, sox) → qualquer nuvem, custo zero.
- **GPU ops** (ffmpeg NVENC, vídeo) → mesmo worker RTX4060 do Llama (offline → fila/erro educado).

### 10.3 `seed_cache_800.sql`: ~800 prompts JÁ COM RESPOSTA REAL
Fonte: `PROMPT PARA CACHE.txt` (200KB). Não é só objetivo+função — é **SQL pronto** (`INSERT INTO cache_semantico ... resposta_cacheada`), resposta completa já escrita, `qualidade_score=0.75`. **8 blocos, ~800 prompts**: PF finanças/carreira, PJ abertura, saúde física/mental, viagem, pequeno negócio, comparativos de bens, gerais.

**Confirmado**: a pergunta *"Ansiedade crise parar 5 minutos técnica"* (mal mapeada em §10.1) **já tem resposta real e completa aqui** (técnica de regulação emocional). Pra este universo (~800), **não precisa GPU nem Llama/Claude** — carrega direto na migration.

**Consequência**: reduz o problema de §10.1 — o risco do playbook genérico só vale pro que sobrar de `todos_prompts.json` depois de tirar o já coberto. Ver §11.

### 10.4 Extras do produto de origem — fora de escopo, sem dono
A lista de "recursos extras" do produto de origem cita **operador de navegador, wide research, e-mail integrado, integração Slack, API pública, plano de equipe** — nenhum tem função no AquariOS hoje. Por [[feedback_remap_not_discard]], registrados como **fora do MVP1, sem dono** (não "descartado").

---

## 11. Handoff imediato (ação antes do F1 rodar)

🚨 **Antes de popular o cache:**

1. **Carregar primeiro `seed_cache_800.sql`** (§10.3) — zero custo, resposta real já escrita. É o grosso do bootstrap.
2. **Diff**: comparar `todos_prompts.json` (~280) contra os ~800 do SQL por texto normalizado. O que já tem resposta, descarta. O que **sobrar** é o lote real sem resposta pronta.
3. **Só esse lote remanescente espera GPU/Llama.** NÃO rodar com a RTX 4060 offline — playbook geraria respostas sem sentido. Decisão do fundador: esperar GPU, não usar Claude nem playbook genérico pra este lote.
4. As permutações sintéticas (`demandas_top_1000.json`) **podem** popular via playbook normalmente.
5. Revisar a tabela `funcao` do que sobrar (passo 2) — mapear **com o fundador** antes do `router.py` (F3).

---

## 12. Camada Fallout — avisos com tom adaptativo + aprendizado contínuo

Sistema de **mensagens humanizadas** sobre eventos do próprio motor (rate limit, GPU offline, qualidade do modelo, cache aprimorado, sugestão de upgrade, erro de conversão), com 4 tons (`neutro`/`amigavel`/`tecnico`/`urgente`) por evento — e **cache que melhora com o tempo**: cada nova resposta só sobrescreve a cacheada se tiver `qualidade_score` maior (GPT4=1.0 > CACHE=0.9 > RTX4060=0.75 > GPT3.5=0.7).

**Onde entra (árvore §4):**
- `fallout_log` (tabela nova, RLS por user_id) — grava aviso/erro/aprendizado com o texto que o frontend mostra.
- `registrar_fallout(user_id, evento)` — decide mensagem e tom por evento (ex: `gpu_offline` → tom técnico).
- `aprimorar_cache(...)` — chamada após toda geração; atualiza `cache_semantico` só se a nova resposta for de fonte melhor.
- `user_fallout_dashboard` (view) — últimos 7 dias de avisos, pro painel de transparência do console (§8.3).

**Integração:**
- Usa a MESMA tabela `cache_semantico` de §8.1 — não cria segunda. Ao codar, consolidar as 2 definições num único `CREATE TABLE`.
- `gpu_offline` é o MESMO heartbeat/TTL 60s de §6.1 — só adiciona a mensagem humanizada.
- Entra no **F3** (router + rate-limit) — eventos `rate_limit_atingido`/`upgrade_sugerido` dependem do rate-limit por plano.

---

## 13. MVP1 COMPLETO — escopo máximo coerente (decisão 22/Jun)

O fundador decidiu: MVP1 = produto completo (agente autônomo + ~60 funções + trilíngue + editorial/agro em Comunidades + integrações). Esta seção mostra como isso cabe **sem quebrar o custo-quase-zero**.

### 13.1 Princípio unificador — "Cache-wrapper universal"
TODA capacidade (texto, imagem, vídeo, web, código, agente) passa pelo **mesmo N1 cache** (Supabase+pgvector). A 1ª chamada de cada coisa nova custa; as repetições são grátis. O custo-quase-zero vale **em regime** (95% hit), não na estreia de cada item. Operações caras ficam atrás do **plano (PanaceIA)**.

### 13.2 Roteamento de custo (o que mantém barato)
| Capacidade | Onde roda | Custo |
|---|---|---|
| Texto (Llama 3 8B) | RTX 4060 do fundador (N2) | ~zero (luz) |
| **Imagem (SDXL)** | **mesma RTX 4060** | ~zero |
| **Vídeo (gen + NVENC)** | **mesma RTX 4060** (fila) | ~zero |
| Código (sandbox) | Docker isolado na VM | zero |
| Docs (pptx/pdf/epub) | libs locais (VM) | zero |
| Conversão de mídia | CPU qualquer nuvem / GPU p/ vídeo | zero |
| **WebSearch** | API externa barata (cacheada) | baixo, gated por plano |
| **CRM** | conectores externos | baixo, gated por plano |
| Claude (N4) | Anthropic | só 1% crítico |

> A GPU do fundador vira o **coração generativo** (texto+imagem+vídeo). Só web e CRM dependem de API paga — e mesmo essas são cacheadas. Assim "tudo incluído" continua ~zero em regime.

### 13.3 Árvore estendida (acrescenta à §4)
```
backend/sandeiros/
├─ agente/                    🔵 F9 — autonomia
│  ├─ planejador.py           quebra objetivo → subtarefas (ReAct)
│  ├─ executor_react.py       loop pensar→agir→observar→validar
│  └─ sintetizador.py         junta artefatos → entregável único (zip/site)
├─ ferramentas/               🔵 F7 — adapters (provider plugável, SAÍDA CACHEADA)
│  ├─ web_search.py           interface → provider externo (config)
│  ├─ doc_gen.py              pptx/pdf/epub (libs locais)
│  ├─ code_exec.py            sandbox Docker isolado
│  ├─ image_gen.py            SDXL na RTX 4060 (worker)
│  ├─ video_gen.py            gen + NVENC na RTX 4060 (fila)
│  └─ crm/                    conectores (HubSpot/Pipedrive/RD…)
├─ funcoes/                   🔵 F8 — as ~60, mapeadas às ferramentas
│  └─ (grupos 1-7 do catálogo, cada uma chama cache→ferramenta)
└─ data/
   └─ i18n/{pt,en,es}/        🔵 X — seed_cache + nós HL por idioma

backend/comunidades/
└─ editorial/                 🔵 F10 — motor editorial + 33 eixos → feed iVi
   ├─ fetchers/               fontes oficiais (cacheado 1x/dia)
   ├─ gatilhos.py             alertas binários (33 eixos)
   └─ feed_ivi.py             casa notícia↔dimensão iVi (Físico/Mental/Espiritual/Social)

backend/integracoes/         🔵 F11 — parqueado→incluído
├─ mail.py · slack.py · navegador_op.py · api_publica/ · team_plan.py
```

### 13.4 Pseudocódigo do agente (F9 — wrap sobre o motor)
```
FUNÇÃO agente.executar(objetivo, user):
    plano ← PanaceIA.get_plano(user)
    # cache de TAREFA inteira primeiro (cache-wrapper universal)
    SE (pronto ← cache.get(objetivo)): RETORNA pronto          # repetição = grátis
    subtarefas ← planejador.quebrar(objetivo)                  # ReAct
    artefatos ← []
    PARA cada t EM subtarefas:
        # cada subtarefa passa pela MESMA cascata N1→N4 + ferramentas (cacheadas)
        r ← router.resolver(t, user, plano)                    # cache→Llama→playbook→ferramenta→Claude
        artefatos.adicionar(r)
    entrega ← sintetizador.juntar(artefatos, objetivo)         # PDF+PPT+site → zip
    cache.set(objetivo, entrega)                               # próxima vez: grátis
    RETORNA entrega
```
**Descritivo:** o agente é uma casca sobre o motor já aprovado. Não inventa caminho novo de custo — cada subtarefa cai na MESMA cascata custo-zero, e o resultado da tarefa inteira é cacheado. Operações caras (imagem/vídeo/web) são gated por `plano`.

### 13.5 Editorial/agro DENTRO de Comunidades (F10)
Decisão do fundador: incorporar para Comunidades ter um **modelo real**. O motor editorial + 33 eixos agro vira a **fonte de conteúdo de Comunidades**, casado por **dimensão iVi**: cada notícia/sinal é roteada para Físico / Mental / Espiritual / Social. Custo-zero (fetch 1x/dia, serve N). Não é mais "sem dono" — dono = **Comunidades**.

### 13.6 ⚠️ Decisões de fornecedor (deferidas — não bloqueiam a árvore; abstraídas por adapter)
Cada ferramenta externa fica atrás de uma interface; só preciso da escolha antes de **ligar** cada uma. Defaults recomendados (mantêm custo baixo):

| Ferramenta | Default recomendado | Alternativa |
|---|---|---|
| ImageGen | **SDXL na RTX 4060** (custo-zero) | API (Replicate/Fal) se GPU ocupada |
| VideoGen | **RTX 4060 + NVENC** (fila) | API se vídeo longo |
| WebSearch | **Brave/Serper** (barato, cacheado) | Tavily |
| CodeExecutor | **Docker isolado na VM** | E2B (sandbox cloud) |
| DocGen | **python-pptx / reportlab / weasyprint** (local) | API (Gamma) p/ slides bonitos |
| Operador navegador | **Playwright** (self-host) | computer-use API |
| CRM | **HubSpot + RD Station** (BR) | Pipedrive |
| Mail / Slack | **Brevo / Slack API** | — |

**Estas escolhas são config, não arquitetura** — sigo com os defaults salvo objeção sua.

### 13.7 Honestidade sobre prazo/risco
Com escopo máximo, MVP1 deixa de ser pequeno — é o produto inteiro em ondas. O que **sobe primeiro** (Onda 1: F1-F4) já entrega valor real e barato (motor cache + humanização) e pode ir ao ar enquanto F7-F11 são construídos em paralelo. Os riscos altos concentram-se em F7 (ferramentas externas) e F9 (agente) — por isso ficam atrás de adapters e cache, contidos.
