# 🚀 HANDOFF — SandeirOS em Produção (MVP1 AquariOS)

**Data**: 22/Jun/2026 · **Status**: ✅ APROVADO pelo fundador — entra em produção fase a fase (F1 primeiro).

> Ponto de entrada para produção. Detalhamento completo (diagrama dos 5 agentes, bugs, decisões 8.x) em [`ESCOPO_CONSOLIDADO_SANDEIROS_MVP1.md`](ESCOPO_CONSOLIDADO_SANDEIROS_MVP1.md).

---

## 0. Em uma frase

SandeirOS = **camada interna do ProteOS** que resolve ~99% das interações **sem tocar no Anthropic**, via cascata N1 cache → N2 Llama local → N3 playbook → N4 Claude (só 1% crítico), com o **Motor de Humanização (4 camadas HL)** por cima. Todo o material de origem (gerado por outra AI) foi mapeado na stack **real** do AquariOS.

---

## 1. Mapa de fontes processadas

✅ = consolidado · 🔁 = duplicata (sem ação) · ⏸️ = fora de escopo/pendente.

| Fonte | Veredito | Onde caiu |
|---|---|---|
| `Pseudo codigo` · `codigo` · `Heuristica` · `Descritivo` · `Arvore` | ✅ | §3 bugs + §4 árvore + §5 pseudocódigo/descritivo |
| `lITRATURA.txt` (escopo Motor de Humanização) | ✅ | §9 + contagens dos 472 nós HL confirmadas |
| `PROMPT PARA CACHE.txt` (200KB) | ✅ **achado-chave** | §10.3 → `seed_cache_800.sql` (~800 respostas REAIS prontas) |
| `cache- Ferramentas gerais mais.txt` (130KB) | 🔁 + ⏸️ | §10.4 (extras do produto de origem, sem dono) |
| `infraestrutura.txt` | ✅ | rate-limit por plano (F3) + LGPD delete (F6) |
| `Supabase SandeirOS.txt` / `Sandeiros completo.txt` | — | **vazios (0 bytes)** |
| `Sandeiros VPS nativa` + `docker-compose.prod.yml` | 🔁 | §4 `deploy/` + decisão 8.4 (multi-cloud) |
| `SendeirOS-dashboard` + pacote frontend Next.js | 🔁 | §8.3 console de produtividade revivido |
| `llama.txt` + "papel do Llama" + "10 servidores multi-região" | ✅ | §6.1 (bootstrap c/ Llama + heartbeat + cache compartilhado grátis) |
| Pacote billing/auth terceiros (re-colado 2×) | 🔁 | superado por 8.1 (Supabase Auth) e 8.5 (MP+Shopify) |
| Pacote "Fallout" (SQL) | ✅ **novo** | §12 (avisos com tom + cache que aprende) |
| `trends_2026.json` | ⏸️ | §9.1 → backlog Comunidades |
| "33 eixos agro" + agregador de notícias + numeração "Camada 5/6/7" | ⏸️ | §9.2 → **sem dono, pendente** (NÃO é extensão do SandeirOS) |
| ZIPs `4 camadas` / `cache universal` / `tudo 100 itens` | ✅ + ⏸️ | nós HL (✅) + motor editorial/agro (⏸️) |

### Decisões do fundador registradas
1. "Tudo junto e paralelo, **relógio suíço**" → arquitetura dos 5 agentes (§2).
2. "Corrigir os bugs + **custo muito baixo**" → §3 + §6.
3. Frontend **revivido** (console de produtividade) → 8.3.
4. Hosting: **Alibaba/GCP/AWS** → 8.4 multi-cloud.
5. Pagamentos: **Mercado Pago + Shopify**; **Paytime → MVP2**; Stripe fora → 8.5.
6. "**Fazer tudo**" do gap → rate-limit (F3) + LGPD delete (F6).
7. Bootstrap das ~280 perguntas reais → **esperar GPU**.
8. Dataset → **mesclar os 2** + **linguagem interpretativa + conversores completos** → 10.1/10.2 + F5.
9. **Aprovado + sigilo** (22/Jun): Motor de Humanização usa **codinomes neutros** nos docs; a origem fica privada (ver §6).
10. **MVP1 COMPLETO** (22/Jun): escopo máximo — entra TUDO (agente autônomo F9 + ~60 funções F8 + trilíngue PT/EN/ES + ferramentas F7 + editorial/agro→Comunidades F10 + integrações parqueadas F11). Coerência com custo-quase-zero via "cache-wrapper universal" + GPU do fundador como coração generativo. Detalhe em ESCOPO §13. Sobe em ondas (Onda 1 = F1-F4 já entrega valor; F7-F11 em paralelo).

---

## 2. Inventário de dados PRONTOS

| Asset | Conteúdo | Custo |
|---|---|---|
| `seed_cache_800.sql` | ~800 prompts **com resposta real escrita** | **R$ 0** — INSERT direto |
| `hl1_intervalo_300.json` | 300 nós Camada 1 (7001-7300) | R$ 0 |
| `hl2_triade_80.json` | 80 nós Camada 2 (8001-8080) | R$ 0 |
| `hl3_equilibrio_70.json` | 70 nós Camada 3 (9001-9070) | R$ 0 |
| `hl4_reframe_22.json` | 22 nós Camada 4 (10001-10022) | R$ 0 |
| `swot/*.json` | ~20 setores determinísticos | R$ 0 |
| `demandas_top_1000.json` | permutações sintéticas | R$ 0 (playbook) |
| `todos_prompts.json` | ~280 perguntas reais (sem resposta) | ⚠️ lote remanescente espera GPU |

**Total Motor de Humanização = 472 nós.**

---

## 3. PENDÊNCIAS (priorizada)

### 🔴 P0 — bloqueiam o início do código
| # | Pendência | Quem |
|---|---|---|
| P0.1 | ✅ Aprovação do pacote — **FEITO 22/Jun** | Fundador |
| P0.2 | Consolidar `cache_semantico` numa só definição (a de §8.1 + a do Fallout §12) num único `CREATE TABLE` | Eu, em F1 |

### 🟡 P1 — preparação de dados (parte do F1)
| # | Pendência |
|---|---|
| P1.1 | Carregar `seed_cache_800.sql` primeiro |
| P1.2 | **Diff** `todos_prompts.json` × `seed_cache_800` → remover o já coberto |
| P1.3 | Lote remanescente → **só com RTX 4060 online** (Llama) |
| P1.4 | Revisar `funcao` do lote remanescente — **com o fundador**, antes do F3 |

### 🔵 P2 — resolvidas em 22/Jun (escopo máximo)
| # | Decisão |
|---|---|
| P2.1 | ✅ Motor editorial + 33 eixos agro → **incorporado a Comunidades** (F10, feed por dimensão iVi) |
| P2.2 | ✅ `trends_2026.json` → entra junto no F10 (Comunidades) |
| P2.3 | ✅ Extras (operador navegador, API pública, etc.) → **incluídos** (F11) |
| P2.4 | ✅ Rascunhos `ANALISE_*`/`PLANO_*` — **deletados 22/Jun** |
| P2.5 | Provedor de e-mail p/ Fallout → default **Brevo** (já configurado) |

### 🟣 P3 — escolhas de fornecedor (config, não bloqueiam arquitetura — sigo c/ defaults; ESCOPO §13.6)
| Ferramenta | Default que vou assumir |
|---|---|
| ImageGen / VideoGen | RTX 4060 do fundador (SDXL + NVENC) — custo-zero |
| WebSearch | Brave/Serper (barato, cacheado) |
| CodeExecutor | Docker isolado na VM |
| DocGen | python-pptx / reportlab / weasyprint (local) |
| Operador navegador | Playwright self-host |
| CRM | HubSpot + RD Station |

⚠️ **Tensão sinalizada**: escopo máximo + custo-quase-zero só se sustentam via "cache-wrapper universal" + GPU do fundador como coração generativo (ESCOPO §13.1-13.2). WebSearch/CRM são os únicos custos externos reais (cacheados + gated por plano).

---

## 4. SEQUÊNCIA DE PRODUÇÃO — F1 a F6

### F1 — Núcleo do cache (fundação)
- **Árvore**: `backend/sandeiros/semantic_cache.py` · `supabase/migrations/7X_sandeiros_cache.sql` · `bootstrap.py` · `data/seed_cache_800.sql`
- **Pseudocódigo**: `cache.get` (hash exato → pgvector `<=>` quando fastembed ligar) · `cache.set` · `bootstrap.popular_cache` (§6.1)
- **Descritivo**: cria `cache_semantico` (Supabase+pgvector, RLS), carrega os 800 prontos, popula o resto. Embeddings **fastembed/ONNX** (não torch — 8.2). Começa hash-exato (zero risco RAM).
- **Pronto quando**: `/sandeiros/responder` devolve HIT em <50ms, 0 tokens.
- **Risco**: Baixo. Depende de P0.2 + P1.1–P1.3.

### F2 — Motor de Humanização (4 camadas HL)
- **Árvore**: `backend/sandeiros/humanizador.py` + `data/hl{1,2,3,4}_*.json` · wire em `proteos.tsx`
- **Pseudocódigo**: `camada1_intervalo` → `camada2_triade` (eixo fraco = `min()` histórico) → `camada3_equilibrio` → `camada4_reframe` (só se insatisfação ≥2, turnos do **usuário** — fix#3/#4)
- **Descritivo**: aplica as 4 camadas **em sequência** sobre a resposta bruta. C4 é reenquadramento, nunca previsão. Liga atrás de feature flag.
- **Pronto quando**: mesma resposta bruta sai humanizada e muda de tom conforme histórico.
- **Risco**: Baixo (feature flag).

### F3 — Roteador + gates + Fallout
- **Árvore**: `backend/sandeiros/router.py` · `supabase/migrations/7X_sandeiros_fallout.sql`
- **Pseudocódigo**: cascata N1→N4 (§5) com `CerberOS.rate_limit_ok`/`validar_intencao`, `PanaceIA.get_plano` · `registrar_fallout` + `aprimorar_cache` (§12)
- **Descritivo**: orquestrador real. Rate-limit por plano protege o N4. Fallout dá avisos humanizados e faz o cache melhorar com o tempo.
- **Pronto quando**: acima do limite → 429 amigável; fonte melhor sobrescreve cache.
- **Risco**: Médio. Depende de P1.4.

### F4 — Worker Llama local (RTX 4060)
- **Árvore**: `backend/sandeiros/llama_local.py` + `/sandeiros/worker/heartbeat`
- **Pseudocódigo**: heartbeat 30s com `tunnel_url`, TTL 60s; expira → N2 degrada p/ N3 (§6.1)
- **Descritivo**: GPU do fundador serve Llama 3 8B (Ollama) como N2. Opcional por design.
- **Pronto quando**: GPU online = fonte `LLAMA_LOCAL`; offline = playbook sem erro.
- **Risco**: Baixo.

### F5 — Conversor universal completo
- **Árvore**: `interpretador.py` · `conversor/cpu_ops.py` · `conversor/gpu_ops.py`
- **Pseudocódigo**: `interpretar(texto)` PT-BR→AST → CPU ops (qualquer nuvem) ou GPU ops (vídeo, worker F4)
- **Descritivo**: custo-zero estendido a mídia. Vídeo sem worker → fila/erro educado.
- **Pronto quando**: upload + instrução PT-BR devolve artefato convertido.
- **Risco**: Médio.

### F6 — LGPD delete
- **Árvore**: `DELETE /sandeiros/usuario`
- **Pseudocódigo**: apaga cache + memória (HygeiOS) + artefatos (S3) do `user_id`, respeitando RLS
- **Descritivo**: fecha o ciclo LGPD (migration 69, RLS).
- **Pronto quando**: remove 100% dos dados do usuário, auditável.
- **Risco**: Baixo.

### Fases adicionais — MVP1 COMPLETO (decisão 22/Jun · detalhe ESCOPO §13)
- **F7 — Camada de ferramentas (adapters)**: WebSearch, DocGen, CodeExecutor, ImageGen (SDXL na RTX), VideoGen (RTX) — todas cacheadas, provider plugável. Risco alto (deps externas, contidas por adapter+cache).
- **F8 — As ~60 funções completas** mapeadas às ferramentas (determinísticas + dado-vivo + mídia + CRM).
- **F9 — Agente autônomo**: planejador ReAct + síntese de entregáveis (PDF+PPT+site), casca sobre o motor (cada subtarefa cai na mesma cascata custo-zero).
- **F10 — Motor editorial + 33 eixos agro → Comunidades** (feed por dimensão iVi). Dono agora = Comunidades.
- **F11 — Integrações**: Mail, Slack, operador de navegador, API pública, plano de equipe.
- **X — i18n PT/EN/ES**: transversal a F1/F2/F8/F10.

**Ainda fora do MVP1**: billing SaaS standalone (MP/Shopify cobrem).

---

## 5. Próximo passo

Aprovação dada → começo por **F1** seguindo exatamente esta árvore, salvando código fase por fase (cada uma verificável antes da próxima). P2.1–P2.3/P2.5 podem vir depois.

---

## 6. ⚠️ Nota de sigilo (interno)

O **Motor de Humanização (HL)** usa **codinomes técnicos neutros** em todos os docs do repo (Intervalo / Tríade / Equilíbrio / Reenquadramento). A origem da heurística é **privada** e fica só fora do repo. Nenhum doc commitável revela a fonte. As features espirituais abertas do app (EcumenicOS) são produto público separado e servem de cobertura natural — não confundir com o motor interno.
