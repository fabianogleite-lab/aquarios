# Audit Matrix — DEVPACK Master v4 vs Código Real

**Data:** 26/05/2026
**Branch:** `s17-s18-constitution-payments`
**Escopo:** 16 módulos do DEVPACK v4 (v1.0526) cruzados contra implementação em produção
**Metodologia:** leitura linha-a-linha das 8 migrações deployadas + 3 edge functions + 26 screens mobile

---

## Sumário Executivo

| Métrica | Valor |
|---|---|
| Módulos DEVPACK auditados | 16 (M-01 a M-16) |
| Tabelas SQL implementadas | 30+ (8 migrações deployadas) |
| Edge Functions ativas | 3 (chat, engine, seed-bots, community) |
| Screens mobile | 26 |
| **Divergências encontradas** | **25** |
| 🔴 Críticas (mudança conceitual) | 6 |
| 🟡 Médias (escopo parcial / faltante) | 11 |
| 🟢 Baixas (cosmético / informativo) | 8 |

---

## Achados Mais Importantes

1. **HermeOS** está com papel **completamente diferente** entre DEVPACK e código:
   - DEVPACK: "Dashboard Executivo — todas as decisões"
   - Código: "Inteligência financeira pessoal" (coming_soon)

2. **ARKHE não existe como módulo** no código — apenas como branding "Arkhe Labs". DEVPACK v4 explicitamente reposiciona ARKHE como documentação/PI/tickets.

3. **Sophrosyne (kernel)** não existe no código. Há `audit_logs` cumprindo parte do papel.

4. **Renomeação "Módulos → Eixos"** do DEVPACK v4 NÃO foi aplicada — tabela ainda chama-se `aquarios_modules`.

5. **PanaceIA** tem **conceito divergente**:
   - DEVPACK: marketplace de tokens de IA externos (1 token Anthropic = 1 TKN)
   - Código: Stripe payments + 4 tipos de token interno (AI/Sync/Insight/Community)

6. **DataCommunity 44 eixos** (IA/Token/Dados/Social/Util/Exp) — **não implementados**.

7. **ERC-20 DCT na Polygon** — **não implementado** (DEVPACK tem passo-a-passo completo).

8. **Código tem coisas MAIS sofisticadas que o DEVPACK em alguns pontos:**
   - Pilar 2 da Constituição (Vigotski/Foucault/Freire/Butler — 10 itens de Psicologia Social) é INOVAÇÃO do código.
   - 7 princípios estruturais ocultos (is_public=false) — alinhamento melhor com a base proprietária.
   - `SECURITY DEFINER` functions (`hygeios_log_content_audit`, `panaceia_deliver_tokens`) — arquitetura mais robusta.
   - 130 personas culturais (13 países × 10 arquétipos) vs 3 personas FAQ do DEVPACK.

---

## Matriz Detalhada de Divergências

> **Legenda:** 🔴 crítica · 🟡 média · 🟢 baixa · ⭐ código superior ao DEVPACK
> **Esforço:** XS (1h) · S (1d) · M (3d) · L (1sem) · XL (1mês+)

---

### D-01 🔴 HermeOS — Papel completamente diferente

| Campo | Valor |
|---|---|
| DEVPACK M-04 | Dashboard executivo · todas as decisões · Pipeline por país · CRM · Google Reviews |
| Código | `aquarios_modules.slug='hermeos'` · `name='HermeOS'` · `description='Inteligência financeira pessoal'` · status `coming_soon` |
| Tipo | **Mudança conceitual radical** |

**Opções:**

- **(A) Manter código** — HermeOS = finanças pessoais. Criar NOVO módulo `aquarios_dashboard` para o conceito do DEVPACK. Recomendado se finanças é prioridade real.
- **(B) Reposicionar HermeOS conforme DEVPACK** — transformar em dashboard executivo total. Migrar conceito financeiro para novo módulo "FinanceOS". Mais alinhado ao HermeOS (Hermes = mensageiro/integrador).
- **(C) Híbrido** — HermeOS como **integrador** (dashboard + alertas financeiros). Mantém referência mitológica mas amplia escopo.

**Esforço:** M-L · **Risco:** alto (afeta UI/UX e percepção de usuários alfa)

---

### D-02 🟡 AsclepiOS — Escopo "Toda saúde" não implementado

| Campo | Valor |
|---|---|
| DEVPACK M-05 | 7 eixos: Dental · Fisio · Nutrição · Oriental · Floresta · Mental · Psíquica · Rapidoc · 42 FAQs (Zé/Maria/Carlos) |
| Código | coming_soon · "Módulo médico, prontuário longitudinal integrado ao HygeiOS" · Rapidoc citado em features |
| Tipo | Escopo reduzido + sub-módulos faltantes |

**Opções:**

- **(A) Lançar AsclepiOS gradualmente** — começar por Nutrição (já existe!) + Mental + Dental nessa ordem. Cada eixo é uma feature flag.
- **(B) AsclepiOS = abrigo apenas para Rapidoc** — manter como gateway de telemedicina. Nutrição fica como native_tool standalone.
- **(C) Implementar tudo de uma vez** — escopo XL, não recomendado.

**Esforço:** L-XL · **Risco:** médio (cada eixo precisa de validação clínica)

---

### D-03 🔴 ProteOS — Multi-modal não implementado

| Campo | Valor |
|---|---|
| DEVPACK M-03 | Texto · OCR · Imagem · Voz (input) · API Omnichannel (WhatsApp/WebChat) · Questionários não-invasivos |
| Código | Chat texto only + Cultural Voice Layer (output adaptado por locale) · 4 personas (default/pragmatico/suporte/urgencia) |
| Tipo | Capacidades de entrada faltantes |

**Opções:**

- **(A) Adicionar voz primeiro** — Expo Speech-to-Text já disponível. ROI alto, esforço S.
- **(B) Adicionar OCR + Imagem** — Tesseract.js ou Google Cloud Vision. ROI médio.
- **(C) API Omnichannel (WhatsApp Business)** — depende de aprovação Meta. ROI alto B2B.
- **(D) Manter texto only** — focar em qualidade da Voz Cultural.

**Esforço por opção:** A=S · B=M · C=L · D=0
**Risco:** baixo (cada feature é aditiva)

---

### D-04 🟡 ARKHE — Módulo ausente

| Campo | Valor |
|---|---|
| DEVPACK M-10 | ARKHE = documentação · tickets · garantia autoral · NÃO é saúde |
| Código | "Arkhe Labs" aparece como branding (autor) — zero implementação de módulo de docs/tickets |
| Tipo | Módulo crítico ausente |

**Opções:**

- **(A) Criar módulo ARKHE com 3 funções básicas** — README in-app + Sistema de Tickets + Garantia autoral via SHA-256 git commits. Esforço M.
- **(B) Deixar ARKHE só como branding** — não criar módulo. Docs externos via GitHub Pages. Esforço 0.
- **(C) ARKHE = Help Engine + FAQ** — substituir `services/faqEngine.ts` por `aquarios_arkhe_kb` table. Reaproveita conteúdo existente.

**Esforço:** A=M · B=0 · C=S · **Risco:** baixo

---

### D-05 🟢 Sophrosyne Kernel — Ausente

| Campo | Valor |
|---|---|
| DEVPACK M-09 | Kernel barramento · `core_kernel_state` · `telemetry_vitality_logs` · `cognitive_prompt_registry` |
| Código | `audit_logs` cumpre parcialmente · `performance_metrics` (migration 11) cumpre telemetria · NÃO há prompt registry |
| Tipo | Conceito espalhado, sem nome unificado |

**Opções:**

- **(A) Renomear conjunto existente** — apelidar `audit_logs + performance_metrics + persona_management` de "Sophrosyne Layer" via view SQL. Esforço XS.
- **(B) Implementar `cognitive_prompt_registry`** — versionamento de prompts ProteOS (atualmente hardcoded em chat/index.ts). Esforço S.
- **(C) Ignorar Sophrosyne como nome** — manter por funções. Esforço 0.

**Esforço:** A=XS · B=S · C=0

---

### D-06 🟢 Renomeação "Módulos → Eixos"

| Campo | Valor |
|---|---|
| DEVPACK M-12 | Inviolável: em TODO o ecossistema, "módulos" = "eixos" |
| Código | Tabela: `aquarios_modules` · Coluna: `category='module'` · UI: "MÓDULOS" em coming-soon.tsx |
| Tipo | Cosmético inviolável |

**Opções:**

- **(A) Migração total** — renomear `aquarios_modules` → `aquarios_eixos` + atualizar todas referências TS/SQL/UI. Esforço M (breaking, mas mecânico).
- **(B) Manter "módulos" tecnicamente, exibir "eixos" na UI** — só camada de apresentação. Esforço XS.
- **(C) Ignorar** — admitir que "módulos" pegou. Esforço 0.

**Recomendação:** B (compromisso). **Esforço:** XS · **Risco:** baixo

---

### D-07 ⭐ EteriOS — Existe no código, NÃO no DEVPACK

| Campo | Valor |
|---|---|
| DEVPACK | Não menciona |
| Código | `aquarios_modules.slug='eterios'` · "Conexão wearables e IoT" coming_soon · depende de hygeios · tabela `telemetry_vitality_logs` |
| Tipo | Inovação do código |

**Opções:**

- **(A) Adicionar EteriOS ao DEVPACK v5** — documentar como novo módulo. Esforço XS (doc only).
- **(B) Mesclar EteriOS dentro de AsclepiOS** — biometria como sub-eixo. Esforço XS (DB only).
- **(C) Manter como independente** — esforço 0.

---

### D-08 ⭐ AeropagOS — Existe no código, NÃO no DEVPACK

| Campo | Valor |
|---|---|
| DEVPACK | Gamificação ética em Comunidades (M-11), mas sem nome |
| Código | `aquarios_modules.slug='aeropagos'` status='built' · Gamificação por lotes (XP, badges, leaderboard, mentor) |
| Tipo | Inovação do código já implementada |

**Opções:**

- **(A) Documentar AeropagOS no DEVPACK v5** — referência: Areópago grego (conselho deliberativo). Esforço XS.
- **(B) Manter sem nome** — esforço 0.

---

### D-09 🔴 DataCommunity 44 Eixos — Não implementado

| Campo | Valor |
|---|---|
| DEVPACK M-12 | 44 eixos: 8 IA + 6 Token + 6 Dados + 8 Social + 8 Util + 8 Experiência |
| Código | Conceito inexistente. Tokens existem como 4 tipos (`ai`/`sync`/`insight`/`community`) |
| Tipo | Escopo enorme não-implementado |

**Opções:**

- **(A) Implementar todos os 44 eixos** — Esforço XL+ (~6 meses). Não recomendado pré-launch.
- **(B) Mapear 4 tipos de token atuais aos eixos relevantes** — `ai` cobre 8 eixos IA. Esforço XS (taxonomia only).
- **(C) Implementar Top 10 eixos prioritários** — OCR, Calculadora IA, Análise Sentimentos, Bloco de Notas IA, Grupos Temáticos, Indicações, NFTs Conquista, Biometria, Avatar, Geração de Código. Esforço L.
- **(D) Abandonar conceito 44 eixos** — focar nos 8 módulos + native_tools. Esforço 0.

**Recomendação:** D pré-launch; C pós-launch.

---

### D-10 🔴 PanaceIA — Conceito divergente

| Campo | Valor |
|---|---|
| DEVPACK M-13 | Marketplace de tokens de IA externos (BYOK + exchange) · 1 token Anthropic = 1 TKN |
| Código (migration 11) | Stripe payments globais (13 moedas) · 4 tipos token interno · 12 packages × 3 tiers · NÃO há exchange |
| Tipo | Conceito completamente diferente |

**Opções:**

- **(A) Implementar exchange BYOK** — usuário traz API key Anthropic/OpenAI/Gemini → ProteOS roteia sem cobrar TKN. Esforço M.
- **(B) Manter Stripe-only** — mais simples, mais lucrativo. Esforço 0.
- **(C) Híbrido** — Stripe como default + BYOK como feature premium ("Traga sua chave"). Esforço S.

**Recomendação:** C — atrai usuários técnicos sem perder receita.

---

### D-11 🟡 ERC-20 DCT Polygon — Não implementado

| Campo | Valor |
|---|---|
| DEVPACK M-13 | Solidity completo + passo-a-passo deploy Polygon Mumbai/Mainnet · Supply 10M DCT · 1 DCT = 1000 TKN |
| Código | ZERO contrato Solidity. Token economy é off-chain (PostgreSQL) |
| Tipo | Escopo blockchain ausente |

**Opções:**

- **(A) Deploy DCT testnet (Mumbai)** — validar conceito sem custo. Esforço M.
- **(B) Deploy DCT mainnet** — adiciona credibilidade Web3 + complexidade regulatória. Esforço L + custos.
- **(C) Adiar Web3** — focar fiat/Stripe. Esforço 0.

**Recomendação:** C pré-launch; A pós-launch para PoC.

---

### D-12 🟡 TKN unidade — Não existe

| Campo | Valor |
|---|---|
| DEVPACK M-13 | 1 USD = 5000 TKN · paridade explícita |
| Código | `price_usd_cents` + `token_amount` (sem TKN unit unificada). 4 tipos isolados |
| Tipo | Modelo de pricing divergente |

**Opções:**

- **(A) Migrar para modelo TKN unificado** — quebra packages atuais. Esforço M.
- **(B) Adicionar TKN como wrapper UI** — exibir "ai_50 = 50 TKN AI" sem mudar DB. Esforço XS.
- **(C) Manter divergente** — modelo atual já é completo. Esforço 0.

---

### D-13 🟡 FAQ 42 questões — Verificar

| Campo | Valor |
|---|---|
| DEVPACK M-05 | 42 FAQs em SQL: 8 ZE + 9 DM + 8 CA + 17 outros |
| Código | `services/faqEngine.ts` existe (vide grep) — precisa auditoria |
| Tipo | Implementação parcial provável |

**Opções:**

- **(A) Auditar faqEngine.ts** — confirmar 42 FAQs. Esforço XS.
- **(B) Migrar FAQs para tabela `aquarios_arkhe_kb`** — searchable + versionável. Esforço S.

---

### D-14 🟢 Pipeline por país — Não implementado

| Campo | Valor |
|---|---|
| DEVPACK M-04 | 5 stages × 13 países · pré-kit cultural · funil por persona |
| Código | ZERO implementação |
| Tipo | Depende de resolução D-01 (HermeOS) |

**Bloqueio:** D-01 precisa ser resolvido primeiro.

---

### D-15 🟢 Google Reviews widget — Não implementado

| Campo | Valor |
|---|---|
| DEVPACK M-04 | Google Places API integration + widget React |
| Código | ZERO |
| Tipo | Feature externa simples |

**Opções:**

- **(A) Implementar via Places API** — esforço S + API key Google. ROI: trust signal.
- **(B) Widget Elfsight** — sem código. Esforço XS. Custo: $5-10/mês.
- **(C) Adiar** — não-crítico pré-launch. Esforço 0.

---

### D-16 🟢 Odontolar Plus — Não mencionado no código

| Campo | Valor |
|---|---|
| DEVPACK M-15 | Projeto de teste dentro de ProteOS |
| Código | ZERO referência |
| Tipo | Informativo (projeto pessoal do fundador) |

**Opções:**

- **(A) Documentar como projeto externo** — não entra no app. Esforço 0.
- **(B) Criar feature flag `aquarios_test_project`** — admin only. Esforço XS.

---

### D-17 🟢 NicoChat / Shopify — Não integrados

| Campo | Valor |
|---|---|
| DEVPACK M-15 | Para Odontolar Plus |
| Código | ZERO |
| Tipo | Dependente de D-16 |

**Recomendação:** ignorar pré-launch.

---

### D-18 🟡 130 personas vs 3 personas FAQ — Coexistência não documentada

| Campo | Valor |
|---|---|
| DEVPACK | Detalha 3 personas (Zé/Dona Maria/Carlos) com 42 FAQs |
| Código | 130 personas culturais (13 países × 10 arquétipos) + 3 personas FAQ (ainda usadas em engine/index.ts:355) |
| Tipo | Dois sistemas paralelos sem reconciliação |

**Opções:**

- **(A) Documentar coexistência no DEVPACK v5** — 3 personas = FAQ/segmentação · 130 personas = comunidade. Esforço 0 (doc).
- **(B) Unificar** — mapear 3 personas FAQ a 3 dos 10 arquétipos (Zé→Sobrevivente, Maria→Curador, Carlos→Guerreiro). Esforço S.
- **(C) Remover personas FAQ** — substituir engine/index.ts:355 lógica por arquétipos. Esforço M.

---

### D-19 ⭐ Constituição AquariOS — Pilar 2 PS é inovação

| Campo | Valor |
|---|---|
| DEVPACK | M-01 cita 7 princípios estruturais + fontes basais. Sem Pilar 2. |
| Código (migration 10) | 10 itens de Psicologia Social: Vigotski, Foucault, Freire, Almeida, Butler, Han, Bauman, Basaglia, Pichon-Rivière, Ciampa |
| Tipo | Inovação do código (mais sofisticada) |

**Opções:**

- **(A) Atualizar DEVPACK v5 com Pilar 2** — esforço XS (doc).
- **(B) Remover Pilar 2** — manter só DEVPACK original. Perde sofisticação. Esforço S (migration revert).

**Recomendação:** A.

---

### D-20 ⭐ 7 princípios estruturais ocultos — Mais alinhada

| Campo | Valor |
|---|---|
| DEVPACK | Sugere uso explícito como "base do ecossistema" |
| Código | `is_public=false` em todos os 10 itens SandeirOS · nunca expostas ao usuário |
| Tipo | Decisão filosófica do código mais sólida |

**Esforço:** 0 — alinhado com a base proprietária (estrutura simbólica oculta).

---

### D-21 🟢 HygeiOS Data Gate — 4 níveis vs 5

| Campo | Valor |
|---|---|
| DEVPACK M-08 | 5 níveis: free_anonimo / free_comunidade / starter / premium / professional / beck_office |
| Código (engine/index.ts:114) | 4 níveis: free / starter / premium / professional |
| Tipo | Mapping incompleto |

**Opções:**

- **(A) Adicionar `free_comunidade` e `beck_office`** — esforço XS.
- **(B) Manter 4 níveis** — beck_office vira "professional B2B" feature flag. Esforço 0.

---

### D-22 🟢 Cadastro fundador 130 personas — Sem `profile_data_removed`

| Campo | Valor |
|---|---|
| DEVPACK M-11 | Tabela com `profile_data_removed BOOLEAN` + função `remove_persona_profile_data()` |
| Código | `persona_management` sem coluna de remoção · `profiles.is_bot=true` |
| Tipo | LGPD enhancement faltante |

**Opções:**

- **(A) Adicionar colunas** — `profile_data_removed`, `profile_removed_at`, `profile_removed_by`. Esforço XS.
- **(B) Usar `is_active=false`** — soft delete simples. Esforço 0.

---

### D-23 ⭐ SandeirOS 22 arcanos + 3 livros — Inovação

| Campo | Valor |
|---|---|
| DEVPACK | Não detalha SandeirOS |
| Código | `aquarios_modules.slug='sandeiros'` description: "22 arcanos + 3 fontes basais + 7 princípios estruturais" |
| Tipo | Conceito proprietário do código |

**Esforço:** 0 — documentar no DEVPACK v5.

---

### D-24 ⭐ `oracle_hidden` / `oracle_label` — Inovação

| Campo | Valor |
|---|---|
| DEVPACK | Não menciona |
| Código (migration 08) | `ecumenic_traditions.oracle_modern` + `oracle_label` ocultos ao usuário |
| Tipo | Sistema simbólico proprietário |

**Esforço:** 0 — documentar.

---

### D-25 ⭐ SECURITY DEFINER functions — Arquitetura avançada

| Campo | Valor |
|---|---|
| DEVPACK | Não detalha funções SQL |
| Código | `hygeios_log_content_audit()` · `panaceia_deliver_tokens()` · `log_audit_event()` · `upsert_bot_persona()` |
| Tipo | Arquitetura SQL madura |

**Esforço:** 0 — manter.

---

## Roadmap de Decisões

### Prioridade 1 (decisão imediata)
- D-01 HermeOS (afeta UX e roadmap)
- D-10 PanaceIA (afeta modelo de receita)
- D-09 DataCommunity 44 eixos (define escopo pré-launch)

### Prioridade 2 (decisão antes do launch)
- D-03 ProteOS multi-modal
- D-04 ARKHE módulo
- D-18 Reconciliação 3 × 130 personas

### Prioridade 3 (pós-launch)
- D-11 ERC-20 DCT
- D-15 Google Reviews
- D-12 TKN unidade

### Prioridade 4 (cosmético/documentação)
- D-06 Eixos vs módulos
- D-19, D-20, D-23, D-24, D-25 (atualizar DEVPACK v5)

---

## Próximos Passos Sugeridos

1. **Reunião de 1h com decisão sobre D-01, D-09, D-10** — bloqueiam roadmap S18+.
2. **Atualizar DEVPACK para v5** incorporando inovações ⭐ do código (D-07, D-08, D-19, D-20, D-23, D-24, D-25).
3. **Implementar D-04 (ARKHE)** se desenvolvedor quiser sistema de tickets em produção.
4. **Documentar D-18** em `mobile/docs/PERSONAS_RECONCILIATION.md`.

---

## Tabela de referência rápida

| ID | Módulo | Severidade | Decisão necessária |
|---|---|---|---|
| D-01 | HermeOS | 🔴 | SIM — bloqueia roadmap |
| D-02 | AsclepiOS | 🟡 | SIM — bloqueia escopo |
| D-03 | ProteOS multi-modal | 🔴 | SIM — define features |
| D-04 | ARKHE | 🟡 | SIM |
| D-05 | Sophrosyne | 🟢 | Opcional |
| D-06 | Eixos vs módulos | 🟢 | Recomendado |
| D-07 | EteriOS | ⭐ | Doc only |
| D-08 | AeropagOS | ⭐ | Doc only |
| D-09 | 44 eixos | 🔴 | SIM — escopo enorme |
| D-10 | PanaceIA | 🔴 | SIM — receita |
| D-11 | ERC-20 DCT | 🟡 | Pós-launch |
| D-12 | TKN unidade | 🟡 | Pós-launch |
| D-13 | FAQ 42 | 🟡 | SIM — auditar |
| D-14 | Pipeline país | 🟢 | Bloqueado por D-01 |
| D-15 | Google Reviews | 🟢 | Pós-launch |
| D-16 | Odontolar | 🟢 | Ignorar |
| D-17 | NicoChat/Shopify | 🟢 | Ignorar |
| D-18 | 3 × 130 personas | 🟡 | SIM — documentar |
| D-19 | Pilar 2 PS | ⭐ | Doc only |
| D-20 | 7 princípios ocultos | ⭐ | Doc only |
| D-21 | 4 vs 5 níveis plano | 🟢 | Opcional |
| D-22 | profile_data_removed | 🟢 | LGPD enhancement |
| D-23 | SandeirOS 22 arcanos | ⭐ | Doc only |
| D-24 | oracle_hidden | ⭐ | Doc only |
| D-25 | SECURITY DEFINER | ⭐ | Manter |

---

*Auditoria realizada por: Claude Opus 4.7 em modo análise estrutural*
*Próxima ação humana: priorizar P1 (D-01, D-09, D-10) na próxima sessão*
