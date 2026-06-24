# 📋 ESCOPO PARA APROVAÇÃO — MVP1: Infra + AlexandriOS + Reestruturação + Sites + Testes
**Data:** 22/Jun/2026 · **Status:** 🔴 AGUARDANDO APROVAÇÃO — nada executado ainda.

> Pedido do fundador: "faça um escopo de todo conteúdo que eu acabei de escrever para aprovação"
> (motivo declarado: eu esqueci os servidores na etapa anterior). Este doc captura **tudo** que
> foi pedido, dividido em 5 frentes (WS) + decisões abertas. Regra: Escopo → Aprovação → Execução.

---

## WS1 — Análise de Hardware + Runbook de escalabilidade dos 10 servidores
**O quê:** mapa COMPLETO da capacidade (disco/RAM/CPU/GPU) de **todos os servidores do projeto** +
estratégia de escala: acionar **um servidor por vez** conforme o espaço/recurso vira gargalo, até
adquirir um **plano configurável** (escalável sob demanda).

**Os 10 servidores (minha enumeração — CONFIRMAR/CORRIGIR):**
| # | Nó | Papel | Estado | Acionar quando |
|---|---|---|---|---|
| 1 | **SIRIOS** (Avell A70, RTX 4060 8GB, 32GB RAM, C: 199GB livre) | Dev local + N2 Llama | ✅ ativo | já em uso (dev) |
| 2 | **Oracle VM SP** (aquarios-server-1, 137.131.158.242, E2.1.Micro ~500MB) | FastAPI primário (HygeiOS v2) | 🔴 offline agora | religar = P0 |
| 3 | **Oracle Ashburn** (A1.Flex 4 OCPU/24GB, retry automático) | Failover/escala futura | ⏳ bloqueado por capacidade | quando A1 liberar |
| 4 | **Azure Container App** (aquarios-hygeios-api, 0.5 vCPU/1GiB) | MVP1 backend novo | 🟡 deploy em correção | já (em andamento) |
| 5 | **Azure Container Registry** (aquariosacr, Basic) | Imagem Docker | ✅ ok | já |
| 6 | **Azure stack CEL** (2×P6 64GB p/ CerberOS+GaiOS+HygeiOS Agent, TF em `infra/azure/`, login celgestora@hotmail) | Defesa/governança | ⏳ TF não aplicado | fase fronteira |
| 7 | **Supabase** (agebsmjsjrmazbozphnh, free tier) | Postgres+pgvector | ✅ ativo | upgrade quando DB encher |
| 8 | **GCP Cloud Run** (southamerica-east1, planejado Fase 9) | Failover/scale serverless | ⏳ não provisionado | gargalo Oracle |
| 9 | **Alibaba Cloud** (ap-southeast-1 / cn-shanghai, Fase 9) | PanaceIA/Ásia | ⏳ não provisionado | expansão Ásia |
| 10 | **GitHub Pages** (fabianogleite-lab/aquarios /docs + odontolarplus /docs) | Hospedagem dos sites | ✅ ativo | — (estático) |

**Serviços auxiliares (não-compute, citar mas não contam como "servidor"):** Brevo SMTP, ImprovMX,
ElevenLabs, AWS (acesso existe per `EXPLICIT_PERMISSIONS`, ocioso).

**Entregável:** `INFRA_HARDWARE_MAP.md` expandido (já iniciado nesta sessão) com: tabela acima +
disco/uso real de cada nó acessível + **árvore de decisão de escala** ("se disco X% → acionar nó N")
+ critério pra migrar pro plano configurável.

**🔴 Lição registrada (causa do "esquecimento"):** vou tratar a lista de servidores como
**checklist fixo** — toda etapa de infra confere os 10, não a memória do momento.

---

## WS2 — AlexandriOS (ajuda) + nomenclatura canônica + doc único enxuto do MVP
**O quê:** construir a ajuda conversacional com conteúdo para **3 públicos, em paralelo**:
1. **Administrador** (operar/deployar/monitorar o MVP1)
2. **Usuário** (usar o app AquariOS — módulos, iVi, voz)
3. **Integrador** (Skin B — Tool Bus, Shopify, webhooks)

**+ Nomenclatura canônica:** definir nomes oficiais de **arquivos e pastas** (acabar com a
proliferação de HANDOFF_*/ESCOPO_*/STATUS_* soltos na raiz) e consolidar num **único arquivo
enxuto** = a fonte de verdade operacional do MVP1 (o que está no ar, como rodar, como pedir ajuda).
Distinto do `AQUARIOS_LIVRO.md` (bíblia do produto); este é o **manual de operação do MVP1**.

**Entregáveis:**
- Tabela `alexandrios_kb` no Supabase (migration `20260622000005_alexandrios_kb.sql`) — ver
  `HANDOFF_ALEXANDRIOS.md` (já escrito nesta sessão).
- Conteúdo dos 3 públicos (admin/user/integrador) — KB + páginas de ajuda (template
  `docs/engenharia.html`, regras `feedback_sites_pro_template`: nunca expor IP/DRE/schema).
- Endpoint `GET /alexandrios/search` wired no `main.py` (fallback local pro `faqs.json`).
- **`MVP1.md`** (nome canônico proposto) — o doc único enxuto.

**⚠️ Conflito de ordem a resolver:** `HANDOFF_MVP1.md` trava AlexandriOS como **Item 5, por último**
(depois do Item 4 SLOs). O fundador agora pede AlexandriOS **em paralelo** com a análise de infra.
→ Proponho: fazer AlexandriOS **agora em paralelo** (não bloqueia nada) e tratar a regra "por último"
como superada por esta decisão. CONFIRMAR.

---

## WS3 — Reestruturação do repositório: mvp0 (arquivo) + mvp1 (operacional)
**O quê:** mover **todo o conteúdo atual** para uma pasta `mvp0/`, **compactá-la** como documento
histórico + backup + **documentação de autoria** (registro datado de IP). Iniciar `mvp1/` só com o
necessário pro AquariOS funcionar bem.

**🚨 RISCOS / restrições que tornam isto delicado (precisa de desenho cuidadoso):**
- **GitHub Pages serve de `/docs` na `main`.** Se `docs/` for pra dentro de `mvp0/`, **os sites
  saem do ar.** Como os 3 sites devem CONTINUAR publicados (WS4), `docs/` **NÃO** entra no archive
  compactado — fica vivo (na raiz ou movido pra `mvp1/docs` com reconfiguração do Pages).
- **`mobile/` = 5.9 GB.** Compactar isso num zip de "autoria" gera arquivo gigante. Decidir se o
  fonte do app entra no archive ou se só o histórico de docs/decisões é arquivado.
- **Imports/paths:** `main.py` importa `backend.*`; migrations em `supabase/migrations`; mover essas
  pastas quebra o build Azure e a VM. Se o código operacional vai pra `mvp1/`, todos os paths e o
  `Dockerfile`/`.dockerignore` precisam ser reescritos juntos.
- **Git:** usar `git mv` (preserva histórico) vs copiar. Compactar = `.zip`/`.tar.gz` versionado ou
  fora do git (LFS/externo)?

**Proposta de interpretação (CONFIRMAR):**
- `mvp0/` = **arquivo morto** = todos os `.md` de handoff/escopo/status/sessão + docs antigos +
  decisões → compactado em `mvp0/MVP0_ARQUIVO_AUTORIA_22JUN2026.zip` (registro de autoria datado).
- `mvp1/` = **operacional vivo** = `backend/`, `supabase/`, `main.py`, `requirements.txt`,
  `Dockerfile`, o doc único `MVP1.md`, e referência aos sites.
- **Fica fora do mexe-mexe (continua na raiz, vivo):** `docs/` (Pages), `mobile/` (app),
  `.gitignore`, infra ativa.
- Tudo isso num **branch** (`reestruturacao/mvp0-mvp1`), testado, antes de tocar a `main`.

---

## WS4 — Os 3 sites (projetos de usuário): mapear + publicar
**O quê:** os 3 sites continuam como **projetos de usuário** (distintos do core AquariOS). Mapear e
publicar tudo em seguida.

**Quais 3 (CONFIRMAR):** minha leitura = **EscambOS** (`docs/escambos/`) + **heYskY**
(`docs/heysky/`) + **OdontolarPlus** (repo separado `fabianogleite-lab/odontolarplus`). O AquariOS
(`docs/index.html` em podiumtec) é o MVP1 core, não conta como "projeto de usuário".

**Entregável:** mapa de cada site (repo, domínio, pasta-fonte, estado HTTPS, pendências) + publicar
(commit+push `docs/`→main, conforme `feedback_publish_site_on_content`).

---

## WS5 — "Dar vida ao MVP1": testar TODAS as ferramentas
**O quê:** testar tudo ponta-a-ponta.

**Plano de testes (entregável = relatório PASS/FAIL):**
- `/health`, `/`, `/admin/settings`
- `/sandeiros/responder` — HIT (cache) / MISS / N2 Llama local (`usar_llama_local=true`, já testado em SIRIOS)
- `/hygeios/insights/me`, `/hygeios/h1/run`
- `/skin-b/tools/executar` (email/whatsapp 1-toque)
- `/shopify/webhooks/order`
- `/alexandrios/search` (após WS2)
- Sites (WS4): cada URL no ar + HTTPS ok
- App mobile: smoke test do que dá pra rodar sem device

---

## Sequenciamento proposto (com paralelismo que o fundador pediu)
```
AGORA (paralelo):
  ├─ [bg] Build Azure terminando → deploy + SUPABASE_SERVICE_ROLE_KEY + /health   (já em curso)
  ├─ WS1  Mapa dos 10 servidores + runbook de escala
  └─ WS2  AlexandriOS (admin/user/integrador) + nomenclatura + MVP1.md

DEPOIS de WS1+WS2 prontos e Azure no ar:
  ├─ WS4  Mapear + publicar os 3 sites
  └─ WS3  Reestruturação mvp0/mvp1 (em branch, é a parte arriscada — por último)

FECHO:
  └─ WS5  Testar tudo (relatório PASS/FAIL) → "MVP1 vivo"
```

## Já feito nesta sessão (não perder)
- `.dockerignore` criado; `Dockerfile` 3.13→3.11 (fix psycopg2). ✅ **Build `cq5` SUCEDEU** —
  imagem `aquariosacr.azurecr.io/aquarios:latest` está no ACR. Falta deploy no Container App +
  **`SUPABASE_SERVICE_ROLE_KEY`** (você precisa me passar — só a anon key está no `mobile/.env`).
- **N2 Llama local**: Ollama + llama3:8b em SIRIOS; `backend/sandeiros/n2_llama.py` + flag opt-in
  `usar_llama_local` (testado ponta-a-ponta; produção inalterada por padrão).
- `INFRA_HARDWARE_MAP.md` e `HANDOFF_ALEXANDRIOS.md` iniciados.

## 🔢 Decisões abertas (originais — respondidas na v2 abaixo)
1. ~~Os 10 servidores~~ → respondido (WS1 v2). 2. ~~Os 3 sites~~ → "incluir todos" (WS4 v2).
3. ~~Reestruturação~~ → **rever desenho antes** (WS3 v2). 4. ~~Ordem AlexandriOS~~ → paralelo agora ✅.

---
---

# 🔁 REVISÃO v2 — respostas do fundador (22/Jun) — ESCOPO ATUALIZADO

## WS1 v2 — Infra (✅ parte já construída nesta sessão)
- ✅ **Links de contratação FREE diretos** por provedor → `INFRA_HARDWARE_MAP.md` §1b.
- ✅ **1 servidor por país** (latência + **LGPD**/residência) + girar free tiers (1 nó por vez,
  cancelar antes de cobrar, até plano configurável) → §1c + memória `project_infra_per_country_lgpd`.
- ✅ **Arquivo de memória diária de datas de encerramento** → `INFRA_FREE_TIER_EXPIRY.md`
  (revisar todo dia; posso ligar um `/schedule` diário se você quiser).
- ✅ Tabela dos **10 nós** vira **checklist fixo** (não confio na memória do momento).

## WS2 v2 — AlexandriOS + Console/Dashboard (REGRA NOVA permanente)
- **Ajuda em 3 públicos:** admin · usuário · integrador.
- **"?" em cada fase/tela** + tooltips + **caixas de ajuda por todo o código**; testar
  **links quebrados** e **falta de ancoragem (anchors)**.
- **A ajuda explica TODO o código** (admin E usuário) — porque "o fundador não será o admin pra
  sempre" → transferência de conhecimento / onboarding de futuros operadores.
- **Nomenclatura canônica** de arquivos/pastas + **1 doc enxuto** (`MVP1.md`) = fonte de verdade
  operacional. ⚠️ depende do desenho da reestruturação (WS3) — fica gated nisso.
- 🛠️ **REGRA PERMANENTE (memória `feedback_config_first_console`):** sempre que houver **>2 opções
  → expor como config no CONSOLE DO ADMIN**, decidível por **tempo × usuário × região**. Tudo
  configurável (entender o mercado, agilidade). **Manifesto Ágil = processo permanente.**
- **Console admin + dashboard + backoffice altamente customizado** prontos pra teste
  (`docs/backoffice.html`). **Área de config + dashboard do USUÁRIO** prontos pra teste
  (`mobile/app/(app)/settings.tsx`).

## WS3 v2 — Reestruturação: 🔴 NÃO aprovada, DESENHO PARA SUA REVISÃO
Você pediu pra rever o desenho antes. Proposta detalhada:

**Princípio:** congelar a jornada como `mvp0/` (histórico + backup + **autoria** datada) e abrir
`mvp1/` só com o operacional. **Sem quebrar nada vivo.**

| Item | Vai pra `mvp0/` (arquivo) | Fica VIVO (não move) | Vira `mvp1/` (operacional) |
|---|---|---|---|
| `.md` de sessão/handoff/escopo/status antigos | ✅ → compactar | | |
| `docs/` (sites GitHub Pages) | ❌ (sites cairiam) | ✅ raiz | (ou reconfig Pages) |
| `mobile/` (app, 5.9GB) | ❌ (zip gigante) | ✅ raiz | |
| `backend/` `supabase/` `main.py` `Dockerfile` | cópia de referência | | ✅ |
| `business-agent/` `backend/tools/` (APIs prontas) | | | ✅ |

**Mecânica proposta (pra você aprovar/ajustar):**
1. Tudo num **branch** `reestruturacao/mvp0-mvp1` — `main` intacta até validar.
2. `git mv` (preserva histórico) p/ mover `.md` antigos → `mvp0/`.
3. Compactar `mvp0/` → `mvp0/MVP0_ARQUIVO_AUTORIA_22JUN2026.zip` (registro de autoria datado).
4. Reescrever paths/`.dockerignore` se o código operacional for pra `mvp1/`.
5. Rebuild Azure + smoke test ANTES de merge na `main`.

**Perguntas do desenho (suas):** (a) o **fonte do `mobile/`** entra no zip de autoria ou só o
histórico de docs? (b) `git mv` preservando histórico, certo? (c) zip versionado no repo ou
guardado fora (é grande)? (d) o operacional realmente migra p/ `mvp1/` (reescrevo todos os paths)
ou `mvp1/` começa só com `MVP1.md` + symlinks/refs e o código fica onde está?

## WS4 v2 — Sites: INCLUIR TODOS + wearable/white-label + APIs prontas → PRODUÇÃO
- **Incluir todos os sites** (não só 3). Mapear cada um (repo, domínio, pasta, HTTPS, pendências).
- **Recuperar contexto wearable + white-label** (documentado em `mobile/docs/WHITE_PAPER.md`,
  `mobile/config/modules/panaceia.json`, `modules-registry.ts`, `EXPANSION_PLAN_13_COUNTRIES.md`)
  → **já criar código pra entrar em teste**.
- **Consolidar o "repositório de APIs prontas"** que você trouxe = `backend/tools/`
  (email/messaging adapters) + `business-agent/` (campaign, lead_capture, meta_auth, routing,
  voice_proxy, whatsapp_voice_bridge, cerber_shield) → configurar e **HTML no ar pra testar**.
- **Tudo que for serviço-cliente ("os destacados") → PRODUÇÃO.** ⬅️ CONFIRMAR quais são os destacados.

## WS5 v2 — Testar tudo ("dar vida ao MVP1")
- Endpoints (lista original) + `/alexandrios/search`.
- **App mobile: instalar por DOWNLOAD como um usuário faria** (não só rodar local) + smoke test.
- **Console admin + dashboard + backoffice** + **área/dashboard do usuário** — testar.
- Sites: cada URL no ar + HTTPS + **links quebrados / anchors**.
- Relatório **PASS/FAIL**.

## ▶️ O que estou executando JÁ (aprovado, paralelo)
- **WS1**: ✅ links free + expiry tracker + 10-nós (feito acima).
- **WS2 fundação AlexandriOS**: migration `alexandrios_kb` + script de migração + endpoint
  `/alexandrios/search` + wire no `main.py` (independe da nomenclatura — começo agora).
- **Deploy Azure**: imagem pronta; **preciso da `SUPABASE_SERVICE_ROLE_KEY`** pra finalizar.

## ⏸️ Gated na sua resposta
- **WS3 reestruturação** (desenho acima — go/ajustar).
- **WS2 nomenclatura canônica + MVP1.md** (depende do WS3).
- **WS4 "destacados" → produção** (quais sites/serviços?).
