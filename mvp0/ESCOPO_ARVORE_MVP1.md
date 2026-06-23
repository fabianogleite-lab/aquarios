# 🌳 ESCOPO SIMPLIFICADO (ÁRVORE) — MVP1 · para APROVAÇÃO FINAL
**22/Jun/2026** · 🔴 **não executado** — aprovar antes. Detalhe completo: `ESCOPO_DETALHADO_MVP1.md`.

```
MVP1 (motor único / 2 peles · custo-quase-zero · config-first)
│
├── WS1 · INFRA (10 servidores)
│   ├── checklist dos 10 nós + login/recuperação + capacidade + macro-árvore ......... ✅ feito
│   ├── links de signup FREE diretos ............................................... ✅ feito
│   ├── 1 servidor por país (latência + LGPD) + rotação de free tiers .............. ✅ feito
│   ├── rastreador diário de datas (INFRA_FREE_TIER_EXPIRY.md) ..................... ✅ feito (datas ⬜)
│   └── runbook de escala (acionar 1 nó por vez → plano configurável) .............. ⏳
│
├── WS2 · ALEXANDRIOS (ajuda — explica TODO o código; admin não será você p/ sempre)
│   ├── fundação: tabela + /alexandrios/search + migrate_faqs ...................... ✅ feito
│   ├── conteúdo 3 públicos: usuário · admin · integrador .......................... ⏳
│   ├── "?" em cada fase/tela + caixas de ajuda por todo o código .................. ⏳
│   └── nomenclatura canônica + MVP1.md (doc único) ............... ⏳ [ÚLTIMA sessão, com mvp1]
│
├── WS2b · CONSOLES config-first (>2 opções → toggle por tempo/usuário/região)
│   ├── admin: dashboard + backoffice customizado (docs/backoffice.html) ........... ⏳
│   └── usuário: área de config + dashboard (settings.tsx) ......................... ⏳
│
├── WS3 · REESTRUTURAÇÃO mvp0/mvp1  (plano de ação abaixo ↓)
│   ├── [próxima sessão] ORGANIZAR: classificar relevante × sem-relevância ......... ⏳
│   ├── dual-write: gravar nos dois (mvp0 baseline + mvp1 ativo) ................... ⏳
│   ├── [ÚLTIMA sessão] criar pasta mvp1 com o MVP1.md ............................. ⏳
│   ├── cópia da pasta mvp1 no Azure (blob backup) ................................. ⏳
│   └── compactar: mvp0 só quando não consultar + mvp1 só quando nascer o mvp2 ..... 🔒 futuro
│
├── WS4 · SITES + APIs prontas + wearable/white-label → TUDO em PRODUÇÃO
│   ├── mapear+publicar todos os sites (AquariOS·heYskY·EscambOS·investidores·OdontolarPlus) ⏳
│   ├── APIs prontas: backend/tools/ + business-agent/ → configurar + HTML no ar ... ⏳
│   └── wearable + white-label: recuperar contexto → código de teste .............. ⏳
│
└── WS5 · TESTAR TUDO → relatório PASS/FAIL
    ├── endpoints (6 módulos) + /alexandrios .................................... ⏳
    ├── app mobile: instalar por DOWNLOAD como usuário real (APK) ............... ⏳
    ├── consoles admin+usuário (toggles config-first) .......................... ⏳
    └── sites: URLs no ar + HTTPS + links quebrados / âncoras .................. ⏳

GATED: deploy Azure + migração FAQs = precisa SUPABASE_SERVICE_ROLE_KEY.
```

---

## 📁 WS3 — PLANO DE AÇÃO (executável numa próxima sessão)
**Esta fase só ORGANIZA** (classifica/move o que não tem relevância atual; lista o relevante).
**NÃO cria a pasta mvp1** — isso fica pra última sessão, montada em torno do `MVP1.md`.

### Passo a passo (próxima sessão de execução):
1. Criar branch `reestruturacao/mvp0-mvp1` (main intacta).
2. Criar `mvp0/` e **mover** (via `git mv`, preserva histórico) os arquivos **SEM relevância atual**.
3. **Listar** (não mover ainda) os arquivos **COM relevância presente/futura** → entram no `mvp1/` na última sessão.
4. `docs/` e `mobile/` **ficam vivos na raiz** (não quebrar Pages/app).
5. Commit no branch. **Nada na main até a última sessão validar.**

### Classificação proposta (1ª passada — confirmar/ajustar):
**→ `mvp0/` (sem relevância atual — histórico/autoria):**
- Sessões/handoffs datados antigos: `HANDOFF_16JUN…`, `HANDOFF_17JUN…`, `HANDOFF_FINAL_S34…`, `HANDOFF_LINEAR_MVP1_GLOBAL`, `HANDOFF_S34_20JUN…`, `HANDOFF_SDK_BUILD…`, `SESSION_22_FINAL`, `SESSION_CLOSURE…`, `NEXT_SESSION_*`, `S17_SESSION_REMINDER`, `FOR_PLAYSTORE_SESSION_REMINDER`.
- Status/roadmaps velhos: `STATUS_FINAL_UNIFICADO_06JUN`/`27MAY`, `COMPLETE_ROADMAP_TO_PLAYSTORE`, `DASHBOARD.md`.
- Registros pontuais: `REGISTRO_ATRASO_META…`, `REGISTRO_PONTO_DE_VIRADA…`.
- Relatórios fechados: `RELATORIO_META…`, `RELATORIO_SEO_*`, `SEO_IMPLEMENTATION_GUIDE`, `SECURITY_AUDIT_REPORT`, `SECURITY_FIXES_APPLIED`, `AUDITORIA_21_TABELAS_PUBLICAS`.
- Estudos/estratégia datados: `ESTRATEGIA_EVOLUCAO…S32`, `ESTUDO_IPO_V2…S32`, `POTENCIAL_FINANCEIRO…`, `HEROS_JOURNEY…`, `HUMAN_TASKS_PARALLEL…`, `MAPA_AQUARIOS_x_15…`.
- Escopos superados: `ESCOPO_MVP1_REESTRUTURACAO_22JUN`, `HANDOFF_MVP1` (substituído pelo detalhado).
- Pastas: `S16_DECISIONS/`, `agencia/`, maior parte de `marketing-global/`.

**→ `mvp1/` (relevância presente/futura — operacional + escopo vivo):**
- Operacional: `backend/`, `supabase/`, `main.py`, `Dockerfile`, `.dockerignore`, `requirements.txt`, scripts `DEPLOY_*`/`WATCH_*` (corrigir bug do WATCH).
- APIs prontas: `business-agent/`, `backend/tools/`, `escambos/core/`.
- Infra/legal: `infra/`, `legal/`, `tests/`, `scripts/`.
- Escopo vivo: `ESCOPO_DETALHADO_MVP1`, `ESCOPO_ARVORE_MVP1` (este), `INFRA_HARDWARE_MAP`, `INFRA_FREE_TIER_EXPIRY`, `HANDOFF_SANDEIROS_PRODUCAO`, `HANDOFF_HYGEIOS_AGENTE`, `HANDOFF_ALEXANDRIOS`, `ESCOPO_CONSOLIDADO_SANDEIROS_MVP1`, `F1_KICKOFF`, `COUNTRY_MATRIX`, `ROADMAP_MVP_13_PAISES`, `EXPANSION_PLAN_13_COUNTRIES`, `DEPLOY_FINAL_CHECKLIST`, `README.md`.
- **Vivos na raiz (referência no mvp1, não movidos):** `docs/`, `mobile/`.

**Cópia no Azure:** após criar `mvp1/` (última sessão) → subir a pasta pra um **Azure Blob Storage**
(container `mvp1-backup`, conta na assinatura CEL) como backup versionado.

---

## 🗓️ RECOMENDAÇÃO DE SESSÕES (token-eficiente · mvp1 = última)
**Recomendo 3 sessões.** Tudo dentro de cada uma roda em paralelo onde dá (chamadas em lote +
builds/deploys em background). O trabalho de decisão já foi feito AGORA (este escopo) → as sessões
de execução gastam token **fazendo**, não decidindo.

```
SESSÃO 1 · "Organizar + Vivo" (paralelo)
   ├── WS3 ORGANIZAR: branch + mover sem-relevância → mvp0 + listar relevantes
   ├── Deploy Azure (background; precisa da SUPABASE_SERVICE_ROLE_KEY) + migração FAQs
   └── WS1 runbook de escala + completar datas/credenciais do checklist

SESSÃO 2 · "Produção + Ajuda + Testes" (paralelo)
   ├── WS4 todos os sites + APIs prontas + wearable/white-label → produção
   ├── WS2 AlexandriOS conteúdo (3 públicos) + "?" + caixas de ajuda
   ├── WS2b consoles admin + usuário (config-first)
   └── WS5 testar tudo (inclui instalar APK por download) → relatório PASS/FAIL

SESSÃO 3 (ÚLTIMA) · "Criar mvp1"
   ├── nomenclatura canônica + MVP1.md (doc único enxuto)
   ├── criar pasta mvp1 (dual-write mvp0+mvp1) com os relevantes listados
   ├── cópia do mvp1 no Azure Blob
   └── merge na main (após smoke test verde)
```
> Dá pra fundir Sessão 1+2 se você topar uma sessão mais longa, mas separadas **economizam token**
> (contexto menor por sessão) e isolam risco. Posso também deixar o deploy/builds em **background**
> pra você não pagar espera.

---

## ✅ APROVAÇÃO
Responder às perguntas **não** aprovou nada. Para eu começar (na próxima sessão), preciso de:
1. **"Aprovo a árvore / executa"** (com ajustes, se houver).
2. Confirmar o **dual-write** (só na montagem? ou toda gravação futura?).
3. **SUPABASE_SERVICE_ROLE_KEY** (pro deploy, quando a Sessão 1 rodar).
