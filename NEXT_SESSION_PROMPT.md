# 🌊 NEXT SESSION KICKOFF — Copy & Paste

> **Como usar:** copie TUDO abaixo da linha `---START---` até `---END---` e cole como primeira mensagem do próximo chat Claude. Isso dá contexto completo sem precisar re-explicar.

---START---

# AquariOS · S16 v2 Kickoff + Multi-Skin Design Pipeline

**Data:** 28/05/2026 (próximo dia útil após fechamento da sessão 27/05)
**Modelo recomendado:** Claude Opus 4.7 (mantém raciocínio profundo dos commits anteriores)
**Branch ativo:** `s18-devpack-v5-decisions` (PR #7)

---

## 🎯 Contexto Resumido (não pular)

**O QUE JÁ ESTÁ EM PRODUÇÃO:**
- Supabase project `agebsmjsjrmazbozphnh` com **49 tabelas**
- **Migration 12 deployada** em 27/05 com:
  - 30 itens IP Registry (Lei 9.610 · CPF 521.363.886-49)
  - 22 arcanos · 46 eixos distribuídos nos 8 módulos
  - 17 decisões registradas (D-01 a D-37)
  - adm_ai gate 4 camadas · BYOK · 130 personas culturais ratificadas
  - 6 personas oficiais (Manual §21) · 6 planos · 7 níveis Semente→Mestre
  - IVI tridimensional (Bio×0.40 + Mental×0.35 + Spirit×0.25)
- **PR #7 aberto:** https://github.com/fabianogleite-lab/aquarios/pull/7
- 130 personas bot ativas (13 países × 10 arquétipos)

**O QUE LER PRIMEIRO (ordem obrigatória):**
1. `STATUS_FINAL_UNIFICADO_27MAY2026.md` (raiz · master doc)
2. `memory/manual_v1_0512_authority.md` (fonte autoritativa Lei 9.610)
3. `memory/devpack_v4_decisions.md` (D-01/D-09/D-10)
4. `memory/status_unificado_27may2026.md` (reconciliação A+B)
5. `mobile/docs/AUDIT_MATRIX_DEVPACK_V4.md` (25 divergências)
6. `mobile/docs/44_EIXOS_DISTRIBUTION_MAP.md` (D-09 operacionalização)

**DECISÕES JÁ TOMADAS — NÃO RE-DISCUTIR:**
- D-01 HermeOS: **híbrido** (integrador + financeiro)
- D-04 ARKHE: **holding legal** (não módulo)
- D-05 Sophrosyne: **descartado** (não existe no Manual)
- D-09 44 eixos: **distribuídos** nos 8 módulos + questionários ProteOS → 22 arcanos
- D-10 PanaceIA: **híbrido Stripe + BYOK premium**
- D-17 adm_ai: **gate 4 camadas + aquarios_admin_grants**
- Manual V1.0512 = **fonte autoritativa** (DEVPACK v4 é proposta de expansão)
- Tri-Cloud: **AWS + Oracle + 🌏 Alibaba** (free 12 meses Asia)

**TARGET PLAY STORE:** 09/09/2026 · 14 países · 13 locales · latência ≤ 200ms global

---

## 🚀 Objetivo desta sessão: S16 v2 Week 1 + Pipeline Multi-Skin

### PARTE A · S16 v2 Week 1 (May 27 - May 31)

Tasks paralelas (3 teams ou serial pelo founder):

**Task 1.1 · E2E Encryption EXPANDIDA (15h, Backend)**
- Migrations: diario_entries, nutrition_logs, chat_messages, wonder_night_logs
- PBKDF2 key derivation (100k iterations)
- AES-256-GCM em React Native + Deno Edge Functions
- Migração de dados legados + rollback plan
- Base já existe (migration 06 minimal) — expandir
- Spec completa em `S16_DECISIONS/1_E2E_ENCRYPTION_ARCHITECTURE.md`

**Task 1.2 · JIT Infrastructure Teleport (10h, DevOps)**
- Conta Teleport Cloud (Fabiano precisa abrir)
- EC2 t3.medium proxy + database proxy para supabase-prod
- RBAC: dba (prod) + developer (staging)
- Service role vault + Slack #security-alerts
- Spec em `S16_DECISIONS/3_JIT_INFRASTRUCTURE_SETUP.md`

**Task 1.3 · Crisis Communication Plan (8h, Founder)**
- Crisis Owner: Fabiano (founder único)
- Templates Twitter / press / in-app
- Slack #crisis channel + monitoring
- Mock drill #DeleteAquarios (target < 60min)
- Spec em `S16_DECISIONS/2_CRISIS_COMMUNICATION_PLAN.md`

### PARTE B · Pipeline Multi-Skin (NEW — diretiva 27/05 EOD)

> **Diretiva Fabiano (27/05 fim do dia):**
> "Assim que testar o APK no build local, vamos usar Claude Designer para deixar o app fluido esteticamente, minimalista, com disposições semelhantes às redes sociais de cada país, e por faixa etária. O usuário escolhe inicialmente a skin que achou mais intuitiva. Skins para wearables, fones de ouvido, smart speakers. Tudo na dashboard do usuário (tela de entrada). Multi-skin = personalização."

### Arquitetura Multi-Skin (3 dimensões)

```
DASHBOARD = TELA DE ENTRADA
├── Onboarding: usuário escolhe SKIN (combinação de 3 dimensões)
│
├── DIMENSÃO 1 · Skin por País / Cultura (referência rede social local)
│   ├── BR/PT  → "WhatsApp Style"     (lista vertical, bubbles, alta densidade)
│   ├── US/UK  → "Instagram Style"    (stories topo, feed central, minimalist)
│   ├── CN/HK  → "WeChat Style"       (mini-programs, tabs grid, dense)
│   ├── JP     → "LINE Style"         (stickers prominent, soft pastel)
│   ├── KR     → "KakaoTalk Style"    (chat-first, yellow+brown palette)
│   ├── IR     → "Telegram Style"     (channel-style feed, RTL ready)
│   ├── IL     → "Telegram + WhatsApp" (RTL Hebrew, formal tone)
│   ├── TH     → "LINE + Facebook"    (community focus, color-rich)
│   ├── NO/CH  → "Signal Style"       (minimalist, privacy-first, monochrome)
│   ├── NG     → "WhatsApp + voice"   (voice-first, community ubuntu)
│   ├── VE/PE  → "WhatsApp + status"  (familial, status updates prominent)
│   └── DEFAULT → "AquariOS Native"   (proprietary clean design)
│
├── DIMENSÃO 2 · Skin por Faixa Etária
│   ├── 13-25  · "Gen-Z"        (animações, gradients, dark mode, micro-interactions)
│   ├── 26-45  · "Millennial"   (balanced, info-dense, dark/light toggle)
│   ├── 46-65  · "Gen-X"        (clean, larger text, less animation)
│   └── 65+    · "Senior"       (XL text, high contrast, voice-first)
│
└── DIMENSÃO 3 · Skin por Dispositivo de Entrada
    ├── Mobile padrão (touchscreen)
    ├── Wearable (Apple Watch, Galaxy Watch, Oura · tela pequena)
    ├── Fone de ouvido (audio-only, voice command)
    ├── Smart Speaker (Alexa/Nest/HomePod · sem tela)
    └── AR/VR (futuro · Vision Pro, Quest 3 · imersivo)
```

### Combinatória prática

- **3 dimensões × N opções = ~52 combinações teóricas** mas só ~12-15 serão produzidas em v1
- **Onboarding inteligente:** Cultural Voice já detecta locale → sugere skin país automaticamente · usuário só ajusta idade + dispositivo
- **Salvo em:** novo campo `profiles.skin_preference JSONB` = `{"country": "WhatsApp", "age": "millennial", "device": "mobile"}`

### Cronograma Multi-Skin (CABE no S18 atual?)

**Opção A — RECOMENDADO:** Lançar v1 com **skin padrão "AquariOS Native"** em 09/09/2026 + Multi-Skin como **v1.1 update** (1-2 semanas pós-launch).
- ✅ Não atrasa Play Store target
- ✅ App vai live com algo polido (skin Native bem feita)
- ✅ Coleta feedback real antes de produzir 12-15 skins
- ⏱ Adiciona ~80-120h para Multi-Skin pós-launch

**Opção B:** Adiar Play Store 2-3 semanas para incluir 5 skins core (BR/US/JP/KR/Senior) + 3 device skins (mobile/wearable/voice) no v1.
- ❌ Atrasa launch para ~01/10/2026
- ✅ Lança com diferenciação máxima
- ⏱ Adiciona ~120-160h no S18

**Opção C:** Mínimo viável — só 1 skin por dimensão (3 skins totais) + opt-in v1.1.
- ✅ Mantém target 09/09
- ✅ Skin Native + 1 cultural + 1 senior
- ⏱ Adiciona ~40h no S18

**Default da próxima sessão:** começar com Opção A · expansão pós-launch v1.1.

---

## 📋 Especificação técnica Multi-Skin (a refinar na próxima sessão)

### Arquitetura React Native proposta

```typescript
// mobile/lib/skinEngine.ts (criar)
export type SkinCountry = 'whatsapp' | 'instagram' | 'wechat' | 'line' | 'kakao'
                        | 'telegram' | 'signal' | 'native';
export type SkinAge     = 'gen_z' | 'millennial' | 'gen_x' | 'senior';
export type SkinDevice  = 'mobile' | 'wearable' | 'audio' | 'speaker' | 'ar_vr';

export interface UserSkin {
  country: SkinCountry;
  age: SkinAge;
  device: SkinDevice;
}

// Cada skin = ThemeProvider wrapper + Layout component variant
// Persistido em profiles.skin_preference JSONB
// Trocável a qualquer momento via config-admin.tsx
```

### Tabela SQL (migration 14 futuro)

```sql
CREATE TABLE skin_catalog (
  id              UUID PRIMARY KEY,
  skin_type       TEXT CHECK (skin_type IN ('country', 'age', 'device')),
  slug            TEXT UNIQUE,
  display_name    TEXT,
  reference_app   TEXT,            -- 'WhatsApp', 'Instagram', etc.
  preview_image_url TEXT,
  is_active       BOOLEAN DEFAULT true,
  is_default_for_locale TEXT[],    -- ['pt-BR', 'pt-PT'] para WhatsApp
  is_default_for_age TEXT,         -- 'senior' para skin XL
  is_default_for_device TEXT,      -- 'wearable' para skin pulso
  ip_item_number  SMALLINT         -- adicionar como item 31 IP Registry?
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skin_preference JSONB DEFAULT '{}';
```

### Roadmap revisado (com Multi-Skin Opção A)

| Sprint | Conteúdo | Esforço |
|---|---|---|
| S16 v2 (May 27 - Jul 8) | Fundação + Config + Orchestrator + 1 skin Native MVP | 273h (era 253h + 20h skin base) |
| S17 (Jul 9 - Aug 19) | Perímetro CerberOS | 285h |
| S18 (Aug 20 - Sep 9) | Tri-Cloud + APK Field + Launch v1 | 290h |
| **v1.1 (Sep 10 - Sep 24)** | **Multi-Skin expansion (12 skins)** | **120h** |
| **TOTAL até v1.1 funcional** | | **968h em 16 semanas** |

---

## 🎨 Decisões necessárias na próxima sessão (PARTE B)

1. **Confirmar Opção A/B/C** para Multi-Skin no roadmap
2. **Skin Native v1**: cores + tipografia + grid + componentes base
3. **Onboarding flow**: como apresenta as 3 perguntas (país já detectado · idade · dispositivo)
4. **Preview UX**: usuário vê preview da skin antes de escolher? (recomendado: sim)
5. **Trocar skin depois**: via config-admin.tsx ou tela própria?

---

## 🔒 Pendências humanas (não-AI)

| # | Decisão | Status |
|---|---|---|
| 1 | Merge PR #7 (governança Linha A) | ⏳ aguardando review |
| 2 | Setup conta Teleport Cloud ($1000/mês) | ⏳ até 31/05 |
| 3 | Setup conta Stripe + API keys | ⏳ antes de S17 |
| 4 | Setup conta AWS + Oracle Cloud + 🌏 Alibaba Cloud (free 12m) | ⏳ antes de S18 |
| 5 | Bootstrap aquarios_admin_grants (passphrase + UUID) | ⏳ quando quiser usar admin |
| 6 | Atualizar PDF Manual V1.0612 (8 novos itens IP + tri-cloud + Multi-Skin item 31) | ⏳ sem urgência |
| 7 | **Revogar token Supabase usado em 27/05** (`sbp_ecd166...`) | ⏳ recomendado |
| 8 | Decidir Opção A/B/C Multi-Skin | ⏳ primeira coisa na próxima sessão |

---

## 📊 KPIs ao final da sessão (próxima)

- [ ] E2E Encryption deployed em 4 tabelas (verificar via SQL)
- [ ] Teleport operacional (Fabiano testou 1 access grant)
- [ ] Crisis Plan templates aprovados (mock drill executado)
- [ ] Skin Native v1 wireframes prontos (Claude desenha mockups)
- [ ] Decisão Multi-Skin Opção A/B/C registrada em `aquarios_decisions`

---

## 🌊 Mantra desta fase

> "Fabiano é o decisor único (founder + LGPD subject + IP author).
> admin_ai é supra-usuário oculto (algoritmos + recovery).
> Manual V1.0512 = Lei 9.610. DEVPACK v4 = proposta.
> Tri-Cloud = AWS (Americas) + Oracle (failover) + Alibaba (Asia).
> Multi-Skin = personalização cultural + idade + dispositivo na tela de entrada.
> Target: Play Store 09/09/2026."

---END---

---

## 📦 Como abrir a próxima sessão

1. Iniciar novo chat Claude
2. Selecionar **Claude Opus 4.7** (`/model claude-opus-4-7`)
3. Colar TUDO entre `---START---` e `---END---` acima
4. Adicionar 1 frase no final: **"Pronto, vamos começar Parte A (S16 v2 Week 1) ou Parte B (Multi-Skin design)?"**

Claude responderá perguntando qual quer atacar primeiro, ou começará pela mais bloqueante (provavelmente Parte A com decisões de Multi-Skin em paralelo).

---

**Documento gerado em:** 27/05/2026 fim do dia
**Última sessão:** Claude Opus 4.7 · ~28k tokens consumidos · PR #7 com 6 commits
**Próxima ação imediata:** Fabiano revisa PR #7 + abre contas (Teleport/AWS/Oracle/Alibaba)
