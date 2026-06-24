# 📐 ESCOPO DETALHADO — MVP1 (infra · AlexandriOS · consoles · reestruturação · sites · testes)
**Data:** 22/Jun/2026 · **Status:** 🔴 **AGUARDANDO APROVAÇÃO EXPLÍCITA** — nada executado.

> ⚠️ **Responder às perguntas NÃO aprovou este escopo** (pedido expresso do fundador; já causou
> problema antes — ver `feedback_no_action_without_scope`). Só executo após um **"aprovo / executa"**
> explícito. Consolida e supersede os rascunhos `ESCOPO_MVP1_REESTRUTURACAO_22JUN.md`,
> `HANDOFF_ALEXANDRIOS.md`, `INFRA_HARDWARE_MAP.md` (estes viram referência).

## Regras transversais (valem em TODAS as frentes)
- 🛠️ **Config-first** (`feedback_config_first_console`): toda vez que houver **>2 opções**, NÃO
  escolho — viro **config no console do admin**, decidível por **tempo × usuário × região**. Tudo
  configurável. **Manifesto Ágil = processo permanente.**
- 🔒 **Sigilo** (`feedback_humanizer_sigilo`): só codinomes neutros; nunca fontes/autores reais no repo.
- 🚫 **Páginas públicas** (`feedback_sites_pro_template`): nunca expor IP/DRE/SAFE/schema.
- 📦 **Build**: qualquer empacotamento usa `.dockerignore`/ignore explícito (lição de hoje).

---

# WS1 — Infra: mapa dos 10 servidores + escala + free tiers
**Objetivo:** visão real de capacidade + estratégia de escala barata (girar free tiers) rumo a um
plano configurável. **1 servidor por país** (latência + LGPD).

### 1.1 Inventário-checklist dos 10 nós (conferir SEMPRE)
SIRIOS (Avell RTX4060, dev/N2 Llama) · Oracle SP (137.131.158.242, offline) · Oracle Ashburn
(A1.Flex) · Azure Container App · Azure ACR · Azure stack CEL (2×P6) · Supabase · GCP Cloud Run ·
Alibaba · GitHub Pages. → `INFRA_HARDWARE_MAP.md` §1.
### 1.2 Links de contratação FREE diretos → `INFRA_HARDWARE_MAP.md` §1b. ✅ feito
### 1.3 Estratégia 1-por-país + LGPD + rotação → §1c + memória `project_infra_per_country_lgpd`. ✅ feito
### 1.4 Rastreador diário de datas de encerramento → `INFRA_FREE_TIER_EXPIRY.md`. ✅ feito
- **Pendência:** preencher datas reais de criação das contas (eu não tenho acesso).
- **Oferta:** `/schedule` diário que abre o rastreador e avisa prazos < 7 dias (Azure ~12/Jul).
### 1.5 Runbook de escala (a detalhar): "se disco/RAM/req do nó N > X% → acionar nó N+1" + critério
  pra migrar ao plano configurável. **Entregável:** seção nova no `INFRA_HARDWARE_MAP.md`.
**Aceite WS1:** os 10 nós mapeados, links free clicáveis, rastreador com datas reais, runbook escrito.

---

# WS2 — AlexandriOS (ajuda) — 3 públicos + ajuda contextual + doc único
**Objetivo:** ajuda conversacional que **explica TODO o código** para **usuário, admin e
integrador** — porque "o fundador não será o admin para sempre" (transferência de conhecimento).

### 2.1 Fundação (independe da nomenclatura) — ✅ JÁ CONSTRUÍDO nesta sessão
- `supabase/migrations/20260622000005_alexandrios_kb.sql` (colunas `publico`, `anchor`, leitura pública).
- `backend/alexandrios/api.py` → `GET /alexandrios/search` + `/health`, wired no `main.py` (18 rotas ✓).
- `backend/alexandrios/migrate_faqs.py` → dry-run leu 35 FAQs ✓.

### 2.2 Conteúdo dos 3 públicos (a construir)
| Público | Cobre | Fonte |
|---|---|---|
| **usuario** | módulos AquariOS, iVi 4D, voz, Comunidades, Diário | faqs.json (35) + novo |
| **admin** | deploy, consoles, settings, SLOs, os 10 servidores, custo/cascata | código + INFRA + este escopo |
| **integrador** | Skin B (Tool Bus), Shopify, webhooks, APIs `backend/tools`+`business-agent` | código dos adapters |

### 2.3 Ajuda contextual na UI (a construir)
- **"?" em cada fase/tela** → usa a coluna `anchor` (ex: `proteos`, `settings`, `skin-b/tools`).
- **Caixas de ajuda + tooltips** disponíveis **por todo o código** (mobile + consoles).
- **Hiperlinks** entre tópicos; **testar links quebrados e falta de ancoragem** (parte do WS5).
- Páginas públicas de ajuda no template `docs/engenharia.html` (regras de sigilo).

### 2.4 Nomenclatura canônica + `MVP1.md` (doc único enxuto) — ⚠️ GATED no WS3
- Define nomes oficiais de arquivos/pastas (acaba a proliferação de HANDOFF_*/ESCOPO_*/STATUS_*).
- `MVP1.md` = fonte de verdade operacional (o que está no ar, como rodar, como pedir ajuda).
- Depende da estrutura mvp0/mvp1 (WS3) estar decidida.
**Aceite WS2:** `/alexandrios/search` no ar (Supabase); KB dos 3 públicos populada; "?" + caixas de
ajuda na UI; `MVP1.md` publicado; zero link quebrado/âncora faltando.

---

# WS2b — Config-first + Consoles (admin + usuário) prontos para teste
- **Console admin + dashboard + backoffice altamente customizado** (`docs/backoffice.html`) — operável
  por terceiros, com os toggles config-first (por tempo/usuário/região).
- **Área de configuração + dashboard do USUÁRIO** (`mobile/app/(app)/settings.tsx`) prontos pra teste.
- Toda feature com >2 opções vira toggle no console (auditar o código existente e elencar os toggles).
**Aceite WS2b:** admin e usuário conseguem ligar/desligar features por tempo/usuário/região no console.

---

# WS3 — Reestruturação mvp0 / mvp1  🔴 (precisa da sua confirmação do mecanismo)
**Seu modelo (como entendi):**
- **`mvp0/`** = **backup completo + autoria + histórico** (tudo, congelado). **Compactar SÓ quando
  não for mais consultado.**
- **`mvp1/`** = **cópia ativa dos arquivos relevantes/atuais** (acesso fácil; é onde se trabalha).
  **Compactar SÓ quando o mvp2 nascer** (mvp1 fica vivo e descompactado enquanto for o atual).
- **"Salvar o código duas vezes" (mvp0 E mvp1):**

> 🟦 **MINHA LEITURA — CONFIRME (ponto 1 das confirmações):** na **montagem da estrutura**, gravo
> cada arquivo relevante **simultaneamente** em `mvp0/` (baseline congelado) **e** `mvp1/` (cópia de
> trabalho). Faço de uma vez só → não preciso depois "separar o que é relevante" (é o retrabalho que
> você quer evitar). **Depois disso, `mvp0/` fica congelado** e o trabalho segue só em `mvp1/`.
> ❓ Ou você quer que **toda gravação futura** de código continue indo para os dois? (me diga qual.)

### 3.1 Restrições técnicas (por isso é a parte delicada)
- **GitHub Pages serve de `/docs` na raiz da `main`** (só aceita raiz ou `/docs`). Se `docs/` entrar
  em `mvp1/docs`, **os sites caem** — a menos que troquemos pra Pages via GitHub Actions. → proposta:
  `docs/` **fica vivo na raiz** nesta fase.
- **Build Azure/Docker** referencia `backend/`, `main.py` da raiz. Se duplicar em `mvp1/`, o
  `Dockerfile`/`.dockerignore` precisam apontar pro caminho ativo.
- **`mobile/` (5.9 GB)** tem build Expo com paths próprios — mover quebra config; e zipar é enorme.

### 3.2 Mecânica proposta (CONFIRMAR/AJUSTAR)
1. Tudo num **branch** `reestruturacao/mvp0-mvp1` — `main` intacta até validar.
2. `mvp0/` = snapshot congelado (cópia) de tudo que é documentação/decisão/código atual = **autoria datada**.
3. `mvp1/` = cópia ativa só do relevante (dual-write conforme ponto 1).
4. **Vivos na raiz nesta fase** (não quebrar): `docs/` (Pages), `mobile/` (app), build infra.
5. Compactar `mvp0/` **só quando você disser** que não precisa mais consultar (não agora).
6. Rebuild Azure + smoke test ANTES de merge na `main`.
**Aceite WS3:** estrutura mvp0/mvp1 criada em branch, sites e app intactos, build verde, merge só após seu OK.

---

# WS4 — Sites + APIs prontas + wearable/white-label → TUDO em PRODUÇÃO
**Você respondeu "tudo".** Todos os serviços-cliente vão a produção.
### 4.1 Mapear todos os sites (repo · domínio · pasta · HTTPS · pendências)
- AquariOS landing (`docs/index.html`, podiumtec) · **heYskY** (`docs/heysky/`) · **EscambOS**
  (`docs/escambos/`) · hub investidores (`docs/investidores.html`) · **OdontolarPlus** (repo
  `fabianogleite-lab/odontolarplus`) · páginas legais (privacy/terms/deletion).
### 4.2 Recuperar contexto **wearable** + **white-label** e **criar código pra testar**
- Fontes: `mobile/docs/WHITE_PAPER.md`, `mobile/config/modules/panaceia.json`,
  `mobile/config/modules-registry.ts`, `EXPANSION_PLAN_13_COUNTRIES.md`.
### 4.3 Consolidar o **repositório de APIs prontas** que você trouxe
- `backend/tools/` (email/messaging adapters) + `business-agent/` (campaign_engine, lead_capture,
  meta_auth, routing, voice_proxy, whatsapp_voice_bridge, cerber_shield) → configurar + **HTML no ar**.
### 4.4 Publicar (commit+push `docs/`→main, `feedback_publish_site_on_content`).
**Aceite WS4:** todo site mapeado e no ar com HTTPS; APIs-cliente configuradas e respondendo; wearable/white-label com demo testável.

---

# WS5 — Testar TUDO ("dar vida ao MVP1") → relatório PASS/FAIL
- **Endpoints:** `/health`, `/`, `/admin/settings`, `/sandeiros/responder` (HIT/MISS/N2 Llama),
  `/hygeios/*`, `/skin-b/*`, `/shopify/*`, `/alexandrios/search`.
- **App mobile:** **instalar por DOWNLOAD como um usuário real faria** (APK) + smoke test dos módulos.
- **Consoles:** admin (dashboard+backoffice) e usuário (config+dashboard) — testar toggles config-first.
- **Sites:** cada URL no ar + HTTPS + **links quebrados / âncoras faltando**.
- **AlexandriOS:** "?" e caixas de ajuda aparecendo nas telas certas.
**Aceite WS5:** relatório PASS/FAIL completo; itens FAIL com causa e correção.

---

# ✅ Já feito nesta sessão (preservar — não refazer)
- `.dockerignore` + `Dockerfile` 3.13→3.11 → **build `cq5` SUCEDEU** (imagem `aquarios:latest` no ACR).
- **N2 Llama local** (Ollama + llama3:8b em SIRIOS) + flag opt-in `usar_llama_local` (testado).
- Fundação **AlexandriOS** (migration + endpoint + script, wired, 18 rotas ✓).
- `INFRA_HARDWARE_MAP.md` (10 nós + links free + estratégia) + `INFRA_FREE_TIER_EXPIRY.md`.
- Memórias: `feedback_config_first_console`, `project_infra_per_country_lgpd`.

# ▶️ Sequenciamento proposto (paralelo onde dá)
```
Paralelo A (não-bloqueante):  WS1 runbook · WS2 conteúdo+UI ajuda · WS4 mapear+publicar sites
Gated em sua aprovação:       WS3 (estrutura) → destrava WS2.4 (nomenclatura + MVP1.md)
Gated em credencial:          Deploy Azure + migração FAQs (preciso da SUPABASE_SERVICE_ROLE_KEY)
Fecho:                        WS5 testar tudo → "MVP1 vivo"
```

# 🎯 Definição de "MVP1 vivo"
Backend no ar (Azure) com os 6 módulos; cache + N2 + (N4 quando ligado); consoles admin+usuário
testáveis; AlexandriOS respondendo os 3 públicos com ajuda contextual; todos os sites/serviços-cliente
em produção; app instalável por download; relatório de testes PASS.

---

# ❓ Confirmações pendentes (antes de eu executar)
1. **Dual-write mvp0/mvp1** — minha leitura (WS3 ponto 1) está certa? Só na montagem, ou pra sempre?
2. **`docs/` e `mobile/` ficam vivos na raiz** nesta fase (não entram em `mvp1/` agora, pra não
   derrubar Pages/app)? Ou você quer que eu migre Pages pra GitHub Actions e leve tudo pra `mvp1/`?
3. **`SUPABASE_SERVICE_ROLE_KEY`** — pra finalizar deploy + migração (só anon key está no `mobile/.env`).
4. **`/schedule` diário** do rastreador de free tiers — ligo?

> **Nada disto está aprovado.** Me diga **o que ajustar** e/ou um **"aprovo, executa"** — aí começo.
