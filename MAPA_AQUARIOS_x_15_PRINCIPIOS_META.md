# MAPA — AquariOS × 15 Princípios Não-Negociáveis (Meta AI Agents / PodiumTec)
### Presença real por item e subitem · base para transferência ao AQUARIOS_LIVRO.md

> **Estado do código (verificado 15/Jun/2026):** a implementação do Business Agent vive
> commitada no commit **`c034fcb`** (branch `chore/s33-hygeios-agent-checkpoint`, local +
> remoto) — `main.py`, `compliance.py`, `brand_guardian.py`, `db.py`, `dashboard.sql`,
> `widget/`, `tests/`. O branch `main` (HEAD `3728fda`) **não** contém esses arquivos; só
> `routing.py` + `metactl.py` (untracked, 15/Jun) sobraram no disco. Onde este mapa cita
> código do agente, a fonte é `c034fcb`. *Citações de app mobile e migrations seguem o
> repo normal.*

**Legenda de presença:**
- ✅ **Tem, em código** — implementado e verificado no repo.
- 🟢 **Forte** — coberto e maduro (às vezes excede o princípio).
- 🟡 **Parcial** — existe base, mas raso ou só design/spec.
- 🔀 **Difere** — AquariOS resolve, mas por mecanismo diferente do modelo.
- ❌ **Lacuna** — não implementado.

---

## P1 · GLOBALIZAÇÃO 🌍 — "fala a língua do cliente" → **🟢 / 🔀**
| Subitem | Presença | Onde |
|---|---|---|
| Multi-idioma nativo | 🟢 | `routing.py` (13 países: DDI→ISO2→idioma/locale/moeda/onda/RTL) + `mobile/lib/proteos-cultural-voice.ts` (14 vozes culturais) + `COUNTRY_MATRIX.md` |
| Detecção automática | 🔀 | Por **DDI/E.164** (`country_from_phone`, instantâneo), não por NLP da mensagem. `usePersonaDetection.ts` no app |
| pt-BR primário (não tradução) | 🔀 | Atingido via **Claude multilíngue + camada de voz cultural**, NÃO por modelo treinado em corpus BR. UI i18n só tem 3 locales (pt/en/es) — voz cultural cobre 14, interface não |
| Localização profunda (moeda, fuso, CPF/CNPJ/CEP, feriados) | 🟡 | `routing.py` traz locale/moeda por país; **validação CPF/CNPJ/CEP e feriados não confirmados em código** |

**Veredito:** forte na resolução país/idioma/canal; mecanismo difere (Claude, não modelo BR-nativo); lacuna em validadores BR e i18n de UI além de 3 locales.

---

## P2 · ESCALABILIDADE 📈 — "10→10.000 sem mudar código" → **🔀 / ❌ (ponto mais fraco)**
| Subitem | Presença | Onde |
|---|---|---|
| Serverless-first | ❌ | AquariOS roda **VM Oracle única** (E2.1.Micro, ~238MB/498MB) + `uvicorn`/systemd — não serverless |
| Auto-scaling 1→1200 | ❌ | Sem auto-scale. A1.Flex bloqueada por capacidade Oracle; Fase 9 (GCP Cloud Run failover) **planejada, não feita** |
| Concorrência | 🟡 | `main.py` é `async` + `BackgroundTasks` (ACK<20s, processa fora do request) — escala *dentro* da VM, não horizontalmente |

**Veredito:** divergência estrutural e a maior lacuna vs. o modelo. AquariOS é VM-bound (vertical), não serverless. **Ação:** retomar Fase 9 quando A1.Flex/estabilidade destravar.

---

## P3 · INOVAÇÃO 💡 — "o mais novo que funciona" → **🔀**
| Subitem | Presença | Onde |
|---|---|---|
| LLM | 🔀 | **Claude (Anthropic direct)**, não Llama 4 self-hosted + Muse Spark. E no agente está **STUB**: `main.py::ia_gerar_resposta` é template fixo com `TODO: plugar ProteOS` |
| Multimodal | 🟡 | App tem visão (`food-vision` edge fn) + voz (ElevenLabs STT/TTS); não unificado no agente |
| RAG / embeddings PT | 🟡 | AlexandriOS (`services/alexandrios.ts`) + `alexandrios_kb` **planejado** (migration 12); pgvector não confirmado |
| Fine-tuning (LoRA) | ❌ | Não usa; tom de marca vem de prompt + `brand_guardian` |

**Veredito:** AquariOS é Claude-first (gerenciado), não Llama self-hosted. O wiring LLM↔agente é o gargalo (stub).

---

## P4 · LGPD FORTE 🇧🇷🔒 — 5 compromissos → **🟢 (área mais madura) com ❌ pontual**
| Compromisso | Presença | Onde |
|---|---|---|
| 1. Consentimento explícito granular | ✅ | `main.py::/widget/optin` grava só os tipos marcados (`B_bemestar`/`C_marketing`); `compliance.py::check_optin` exige checkbox + não-revogado · `legal/CONSENTIMENTO_OPTIN.md` |
| 2. Anonimização **antes** do LLM | ❌ | **Não implementado.** `ia_gerar_resposta` recebe payload sem máscara de PII. Há a regra "nunca enviar bem-estar à Meta" (`PRIVACIDADE §6`) mas o mascaramento-pré-LLM do princípio não existe em código |
| 3. Direito ao esquecimento <24h | ✅ | `main.py::/delete-data` (verifica `signed_request` Meta) + `/delete-status` + `delete_requests` + `confirmation_code` · `legal/POLITICA_DE_EXCLUSAO_DE_DADOS.md` |
| 4. Armazenamento no Brasil | 🔀 | Oracle = SP ✅; **Supabase região a confirmar**. E o plano **tri-cloud (Oracle/AWS/Alibaba)** contradiz o "zero replicação internacional" do princípio |
| 5. Zero compartilhamento (nem com Meta) | 🟢 | Postura documentada: `PRIVACIDADE §6` — só eventos lifestyle vão à Meta, nunca dado de bem-estar |

**Veredito:** consentimento + exclusão + governança documental (6 docs em `legal/`) são fortes. **Lacuna crítica:** anonimização-pré-LLM (#2). Residência de dados (#4) precisa decisão (BR-only × tri-cloud).

---

## P5 · CÓDIGO PYTHON 🐍 — "aberto, auditável, seu" → **🟢 / 🔀**
| Stack do modelo | AquariOS | Presença |
|---|---|---|
| FastAPI | FastAPI (`main.py`) | ✅ |
| SDK Meta oficial | `httpx` cru → Graph API v21.0 | 🔀 |
| Celery + Redis | `BackgroundTasks` (sem fila persistente) | 🔀 (ver P15) |
| PostgreSQL + pgvector | Supabase (Postgres) ✅ · pgvector ⚠️ não confirmado | 🟡 |
| Docker + Cloud Run | `uvicorn` + systemd na VM Oracle | 🔀 |
| Aberto/auditável | Repo público, código legível | ✅ |

**Veredito:** Python/FastAPI/Postgres sim e auditável; difere no resto (sem Docker/CloudRun/Celery).

---

## P6 · PRIVACIDADE POR DESIGN → **🟢 com ❌ pontual**
| Subitem | Presença | Onde |
|---|---|---|
| Dados first-party | ✅ | CRM próprio (Supabase, migration 30) |
| Criptografia E2E | ✅ | AES-256-GCM (`mobile/lib/crypto.ts`, migration 06) |
| Nunca treinar com dado do cliente | 🟢 | Claude API (sem treino) + postura documentada |
| Processamento em memória (nunca disco) | ❌ | `main.py` grava `business_agent_logs` com **payload completo** no DB |
| Logs só com hashes | ❌ | Logs guardam payload bruto (debug), não hashes. *(GaiOS migration 31 = trilha WORM hash-encadeada, mas é auditoria, não "log só hash")* |

**Veredito:** crypto + no-train + first-party fortes; "memória nunca disco" e "logs só hash" **não batem** com o código atual.

---

## P7 · PERFORMANCE ⚡ (<2s) → **🟡**
| Subitem | Presença | Onde |
|---|---|---|
| ACK rápido | ✅ | Webhook ACK <20s (`BackgroundTasks`) |
| Medição de latência | ✅ | `latencia_ms` gravado em `mensagens` |
| Streaming de tokens | 🟡 | No app ProteOS (a confirmar); não no agente |
| Cache semântico | ❌ | Ausente |
| Warm-up | 🔀 | VM sempre ligada (systemd) — quente por construção |
| CDN | 🟡 | GitHub Pages serve os sites/assets |

---

## P8 · EXPERIÊNCIA CONVERSACIONAL NATIVA → **🟢 com ⚠️**
| Subitem | Presença | Onde |
|---|---|---|
| Contexto de 30 dias | 🔀 | `enriquecer_contexto` usa janela de **24h** (`conversas_24h`), não 30 dias; histórico persiste em `conversas`/`mensagens` |
| Lembra preferências | 🟡 | Tabela `clientes` (migration 30); enriquecimento ainda raso |
| Handoff sem perder histórico | ✅ | `pedir_aprovacao_slack` (HumanLayer) leva nome/país/risco |
| Tom de marca | ✅ | Voz cultural ProteOS + `brand_guardian` |

---

## P9 · INTEGRAÇÃO ECOSSISTEMA META → **🟢 (design) / ⚠️ (wiring)**
| Canal | Presença | Onde |
|---|---|---|
| WhatsApp | ✅ | `routing.py` + `main.py` + `db.find_or_create_cliente(wa_id)` |
| Instagram | 🟡 | `routing.py::detect_channel/extract_id` cobre IG; **`main.py` ainda é mono-canal (WA)** — a própria `routing.py` nota: `main.py` deve passar a importar dela |
| Messenger | 🟡 | idem IG (`db` tem coluna `messenger_id`) |
| Threads | ❌ | Não coberto |
| Contexto unificado | ✅ | `conversas` por cliente+canal |

**Veredito:** design multicanal pronto em `routing.py` + `db` (3 colunas); falta o wiring no `main.py` e Threads.

---

## P10 · BRAND SAFETY 🛡️ → **🟢 (excede o modelo)**
| Subitem | Presença | Onde |
|---|---|---|
| Pré-processamento | 🟡 | Filtro de entrada não explícito |
| Guardrails de conteúdo | ✅ | `brand_guardian.py`: claims de saúde banidos + `SOFTEN` + salvaguardas culturais por país (`TH`/`IR`/`NG`) + **RTL gate** |
| Pós-processamento | ✅ | `brand_guardian` roda no outbound; corrige ou bloqueia |
| Escalation por confiança | 🔀 | `score < 85` → aprovação Slack (modelo sugere <70) |
| Alinhamento cultural | 🟢 | **Alinhado ao EcumenicOS** — NÃO bane "espiritual" (dimensão do iVi). Diferencial sobre o modelo genérico |

**Veredito:** este princípio é literalmente um arquivo do AquariOS (`brand_guardian.py`) e vai além (camada cultural/EcumenicOS).

---

## P11 · MENSURAÇÃO 📊 → **🟡 / ❌**
| Subitem | Presença | Onde |
|---|---|---|
| Pixel Meta + Conversions API server-side | ❌ | Não implementado |
| Eventos (lead_qualified, purchase_intent, human_handoff) | 🔀 | Existem como estado interno (Slack/`aprovacoes_slack`), não como eventos Meta |
| Atribuição cross-platform | 🟡 | `widget_interactions` captura `utm_source/medium/campaign` |
| ROI por conversa | 🟡 | `dashboard.sql` (views internas) + `latencia_ms` |

**Veredito:** captura UTM + dashboard interno; **Pixel/CAPI server-side ausente** — lacuna real para atribuição de mídia paga.

---

## P12 · SEGURANÇA 🔐 → **🟢 (excede no dado) com ⚠️ no agente**
| Subitem | Presença | Onde |
|---|---|---|
| Verificação de webhook | ✅✅ | `verify_meta_signature` (HMAC X-Hub-Signature-256) + verify token + `signed_request` no delete |
| OAuth 2.0 | 🔀 | Bearer token Meta; app usa JWT Supabase |
| Rate limiting | ❌ | Não no `main.py` (possível no nginx) |
| Proteção prompt injection | ❌ | Não explícita |
| WAF / DDoS | 🟡 | nginx + Oracle |
| **Camada de dados (excede)** | 🟢 | **CerberOS 7 camadas** + RLS deny-by-default (migration 30) + RLS hardening (17/18/23) + audit_logs (07) + **GaiOS WORM hash-chain** (migration 31) |

**Veredito:** assinatura de webhook e segurança de dados são fortes e **excedem** o modelo; faltam rate-limit e anti-prompt-injection no agente.

---

## P13 · TRANSPARÊNCIA 👁️ → **🟢**
| Subitem | Presença | Onde |
|---|---|---|
| Sempre se identifica como IA | ✅✅ | `routing.py::WELCOME` + `main.py` ("Você está conversando com o ProteOS, IA… não médico") · `legal/AI_DISCLOSURE.md` |
| Explica limitações | ✅ | "não médico" explícito |
| Logs auditáveis | ✅ | `business_agent_logs` + `audit_logs` + trilha WORM (migration 31) |
| Dashboard de decisões | 🟡 | `dashboard.sql` + trilha `aprovacoes_slack` |

---

## P14 · PERSONALIZAÇÃO 🎯 → **🟡**
| Subitem | Presença | Onde |
|---|---|---|
| Conecta ao CRM | ✅ | Migration 30 ("CRM Meta unified", 13 tabelas) + `clientes`/`conversas` |
| Sabe última compra / ticket / plano | 🟡 | Schema existe; `enriquecer_contexto` só traz `conversas_24h` — enriquecimento raso |
| Preferências | 🟡 | Base em `clientes`; PanaceIA/tokens poderiam alimentar |

**Veredito:** fundação de CRM existe; lógica de enriquecimento (compra/plano/ticket) ainda pendente.

---

## P15 · RESILIÊNCIA 🔄 → **🟡**
| Subitem | Presença | Onde |
|---|---|---|
| LLM cai → regras | 🔀 | `ia_gerar_resposta` hoje é template fixo (regra), mas sem detecção de "LLM down" |
| WhatsApp cai → fila | ⚠️ | `BackgroundTasks` (sem fila persistente); se o processo morre, in-flight se perde — ligado à ausência de Celery/Redis (P5) |
| Modo degradado | ❌ | Mensagem de degradação não explícita |
| Retry com backoff | ✅ | `enviar_resposta_meta`: 3x, backoff `2**tentativa` (2s/4s) |
| Erros logados | ✅ | `business_agent_logs` (pipeline.error / meta.send.failed) |

---

## ➕ ONDE O AQUARIOS VAI ALÉM DOS 15 (diferenciais não previstos no modelo)
- **Arquitetura de 5 agentes** (ProteOS/HygeiOS/CerberOS/PanaceIA/SandeirOS) — o modelo é um agente único.
- **iVi 4D** (Físico×0.35 + Mental×0.30 + Espiritual×0.20 + Social×0.15) — métrica de bem-estar própria (`calculate_ivi`).
- **EcumenicOS** — camada cultural/espiritual que *informa* o brand safety (não só censura).
- **Trilha WORM hash-encadeada** (GaiOS, migration 31) — auditoria imutável acima de "logs auditáveis".
- **Governança jurídica pronta** — 6 documentos em `legal/` (incl. DPO designado) antes de operar.
- **Rollout global em ondas** (`COUNTRY_MATRIX`, 13 países) com gate OFAC (Irã) em código (`compliance.py`).

---

## 🧭 RESUMO DE MATURIDADE
| Forte/Excede 🟢 | Parcial 🟡 / Difere 🔀 | Lacuna ❌ prioritária |
|---|---|---|
| P4 LGPD (consent/exclusão), P10 Brand Safety, P12 Segurança, P13 Transparência, P1 Globalização | P5 Python, P7 Performance, P8 Conversa, P9 Multicanal (wiring), P14 Personalização, P15 Resiliência | **P2 Escalabilidade (serverless)**, **P3 LLM (stub)**, **P11 Pixel/CAPI**, **P4#2 anonimização-pré-LLM**, **P6 logs-só-hash** |

**As 5 lacunas que mais pesam para um lançamento real:**
1. **Wiring do LLM** (P3) — `ia_gerar_resposta` é stub; plugar ProteOS/Claude.
2. **Anonimização de PII antes do LLM** (P4#2) — exigência LGPD do próprio princípio.
3. **Escalabilidade** (P2) — VM única; retomar Fase 9 (Cloud Run failover).
4. **Mensuração Meta** (P11) — Pixel + Conversions API server-side para atribuição.
5. **Multicanal no `main.py`** (P9) — importar de `routing.py`, sair do mono-WhatsApp.

---

## 📖 NOTA DE TRANSFERÊNCIA AO LIVRO
Sugestão de encaixe no `AQUARIOS_LIVRO.md`: como subseção do **PanaceIA/Meta** (o agente é
ferramenta MKT do ProteOS via Meta). Os diferenciais "➕ Além dos 15" reforçam o capítulo de
arquitetura (5 agentes + iVi + CerberOS). Antes de transferir, decidir os 2 pontos de
política que o mapa expôs: **(a)** residência de dados BR-only × tri-cloud (P4#4); **(b)**
"logs só hash / memória nunca disco" (P6) — é meta a perseguir ou ajustar o texto do
princípio à realidade do produto.
