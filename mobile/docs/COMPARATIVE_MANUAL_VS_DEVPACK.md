# Manual V1.0512 vs DEVPACK v4 — Comparativo Lado a Lado

**Propósito:** decidir item por item qual fonte prevalece antes de gravar em SQL.
**Fonte 1 (autoria legal):** Manual V1.0512 · 12/05/2026 · Lei 9.610
**Fonte 2 (proposta de evolução):** DEVPACK Master v4 · 26/05/2026
**Fonte 3 (realidade técnica):** Código em produção · 27/05/2026

**Coluna "Decisão" — para você marcar com [M] (Manual), [D] (DEVPACK), [C] (Código), [H] (Híbrido) ou texto livre.**

---

## §1 — Identidade do Sistema

| Aspecto | Manual V1.0512 | DEVPACK v4 | Código | Sua decisão |
|---|---|---|---|---|
| **ARKHE** | Holding Legal / Propriedade Intelectual (acima do AquariOS) | Módulo (M-10) de docs/tickets/PI | Só branding "Arkhe Labs" | ☐ |
| **AquariOS** | "Sistema Operacional do Ser Humano" / Infra de Integração Humana | Ecossistema bio-mental-espiritual | App mobile + Supabase | ☐ |
| **Nome canônico** | AquariOS — Manual Completo V1.0512 | AquariOS — DevPack Master v4 | aquarios-mobile-v2 | ☐ |

---

## §2 — Filosofia

| Aspecto | Manual | DEVPACK | Código |
|---|---|---|---|
| **7 princípios estruturais** | "Estrutura semântica oculta — usuário NÃO precisa conhecer" | "Base estrutural pública do ecossistema" | `aquarios_constitution` com `is_public=false` ✅ alinhado ao Manual |
| **Fonte basal A** | Listado em §06 (fundamento tríplice) | Listado em M-01 | `aquarios_constitution.sandeiros[1]` ✅ |
| **Fonte basal B** | Listado em §06 | Listado em M-01 | `aquarios_constitution.sandeiros[3]` ✅ |
| **Fonte basal C** | Listado em §06 | Listado em M-01 | `aquarios_constitution.sandeiros[2]` ✅ |
| **Pilar 2 Psicologia Social** (Vigotski/Foucault/Freire/Butler) | ❌ Não mencionado | ❌ Não mencionado | ✅ Implementado em migration 10 (10 itens públicos) |

**Pergunta:** Pilar 2 PS foi adição do código sem ratificação. Manter? ☐

---

## §3 — Arquitetura (Módulos)

### 3.1 — Módulos visíveis ao usuário

| Manual V1.0512 (9 visíveis) | DEVPACK v4 (8 módulos) | Código (`aquarios_modules`) |
|---|---|---|
| ✅ **ProteOS** — hub conversacional central | ✅ ProteOS (M-03) | `proteos` category=`native_tool` ⚠ taxonomia diferente |
| ✅ **SandeirOS** — engine simbólica 22 arcanos | ✅ SandeirOS (citado em vários M) | `sandeiros` category=`module` status=`coming_soon` |
| ✅ **EcumenicOS** — 13 tradições | ✅ EcumenicOS (M-07) | `ecumenicos` category=`module` status=`active` |
| ✅ **AsclepiOS** — clínico | ✅ AsclepiOS (M-05) | `asclepios` category=`module` status=`coming_soon` |
| ✅ **HermeOS** — **financeiro** | ❌ HermeOS = "Dashboard Executivo" (M-04) | `hermeos` description="Inteligência financeira pessoal" ✅ alinhado ao Manual |
| ✅ **EteriOS** — IoT/Wearables/Matter/Zigbee/BLE | ❌ Não menciona | `eterios` category=`module` ✅ |
| ✅ **Comunidades** — motor social + gamificação | ✅ Comunidades (M-11) | `comunidades` category=`native_tool` ⚠ taxonomia |
| ✅ **Diário do Ser** | ❌ Não menciona como módulo | `diario` category=`native_tool` ⚠ taxonomia |
| ✅ **Nutrição** | ❌ Não menciona como módulo | `nutricao` category=`native_tool` ⚠ taxonomia |
| ❌ Não existe | ❌ Não existe | ➕ **AeropagOS** — gamificação built |
| ❌ Não existe | ✅ CerberOS (M-08) | ➕ **CerberOS** — segurança ativa |
| ❌ Não existe | ❌ Não menciona | ➕ **Wonder Night** native_tool |
| ❌ Não existe | ✅ PanaceIA (M-13) | ➕ **PanaceIA** coming_soon |

**Sua decisão (já tomada):** manter AeropagOS, CerberOS, Wonder Night — entrarão no Manual V1.0612.

**Pergunta pendente:**
- 3.1a — Manual diz "ProteOS é MÓDULO visível", código diz `native_tool`. Mudar `category='module'` para `proteos`, `comunidades`, `diario`, `nutricao`? ☐
- 3.1b — PanaceIA vem do DEVPACK v4. Manter como módulo visível ou virar "marketplace" no Manual V1.0612? ☐

### 3.2 — Módulos técnicos (background)

| Manual V1.0512 (8 técnicos) | Código |
|---|---|
| **HygeiOS + IVI** — núcleo analítico, filosofia encapsulada | `hygeios` category=`native_tool` + tabelas extensas ✅ |
| **AlexandriOS** — help engine conversacional | `services/faqEngine.ts` — existe sem nome ⚠ |
| **KB_Foundation** — base Qualis AA | ❌ Não existe |
| **MetadataStore** — versionamento imutável | Parcial em `audit_logs` ⚠ |
| **LGPDCompliance** — segurança AES-256 | `lib/crypto.ts` + `audit_logs` ✅ funcional |
| **AdminFunctions** — supra-usuário oculto `adm_ai` | `admin.tsx` + 5 toques ✅ parcial |
| **Beck Office** — B2B profissional | `beckoffice` category=`native_tool` coming_soon ✅ |
| **Rapidoc** — telemedicina CFM 2.314/2022 | Citado em coming-soon AsclepiOS ⚠ não integrado |

**Pergunta:**
- 3.2a — Renomear `services/faqEngine.ts` para `services/alexandrios.ts` + criar tabela `alexandrios_kb`? ☐
- 3.2b — Criar tabelas `kb_foundation` + `metadata_store`? ☐
- 3.2c — Implementar mecanismo `adm_ai` com 4 camadas (já aprovado por você)? ☐

---

## §4 — IVI (Índice de Vitalidade Integrada)

| Aspecto | Manual V1.0512 | Código |
|---|---|---|
| **Fórmula** | `IVI_Total = (Bio × 0.40) + (Mental × 0.35) + (Spirit × 0.25)` | `telemetry_vitality_logs.calculated_score` 0-100 sem fórmula explícita |
| **5 Faixas** | 0-20 CRÍTICO · 21-40 ALERTA · 41-60 ATENÇÃO · 61-80 BOM · 81-100 EXCELENTE | 4 níveis em `engine/index.ts` mapeados a planos (free/starter/premium/professional) ⚠ diferente |
| **Pipeline ETL** | 6h cron, 7 tabelas extract | ❌ Não implementado |
| **Ações por faixa** | MEDICAL_INTERVENTION / BEHAVIOR_ADJUSTMENT / MONITORING / PREVENTIVE / Excellence | ❌ Não implementado |
| **3 anomalias** | CRITICAL_MARKER / USER_SILENCE / SPIRIT_STAGNATION | ❌ Não implementado |

**Pergunta:** Implementar pipeline IVI conforme Manual em migration 12? ☐

---

## §5 — Personas

| Aspecto | Manual V1.0512 (3+3) | DEVPACK v4 (3 FAQ) | Código |
|---|---|---|---|
| **Roberto Santos / Zé do Aperto** | ✅ §21 — ticket R$24,90-49,90 | ✅ 8 FAQs ZE001-ZE008 | ✅ engine/index.ts:355 |
| **Maria da Silva / Dona Maria** | ✅ §21 — ticket R$39,90-149,90 | ✅ 9 FAQs DM001-DM009 | ✅ engine/index.ts |
| **Carlos Mendes** | ✅ §21 — ticket R$89,90-399,90 | ✅ 8 FAQs CA001-CA008 | ✅ engine/index.ts |
| **Lucas Oliveira (DATA_DRIVEN)** | 🔮 Futuro Fase 2 | ❌ Não menciona | ❌ Não implementado |
| **Fernanda Rocha (CLINICAL_EVIDENCE)** | 🔮 Futuro Fase 2 | ❌ Não menciona | ❌ Não implementado |
| **José Cardoso / Zé das Bets (HARM_REDUCTION)** | 🔮 Futuro Fase 3 | ❌ Não menciona | ❌ Não implementado |
| **130 personas culturais** (13 países × 10 arquétipos) | ❌ Não existe | ❌ Não existe | ✅ **invenção pós-Manual** em migration 09 |

**Pergunta:**
- 5a — As 130 personas culturais (Carlos Mendes / Maria Silva / Roberto Santos / Lucas Oliveira já existem em migration 09 como `is_bot=true`) entram como **ratificação** ou como **camada paralela** ao Manual? ☐
- 5b — Implementar Lucas/Fernanda/Zé das Bets como Fase 2/3 oficial? ☐

---

## §6 — Tokens

| Aspecto | Manual V1.0512 | DEVPACK v4 | Código |
|---|---|---|---|
| **4 tipos** | AI · Sync · Insight · Community | TKN externo + DCT on-chain ERC-20 | ✅ migration 11: ai/sync/insight/community |
| **Modelo** | Pacotes R$ · ganho por atividade | 1 USD = 5000 TKN + bônus DCT | USD cents-based + bonus_tokens |
| **4 Packs** | Starter R$19,90 · Basic R$49,90 · Pro R$129,90 · Elite R$299,90 | Não detalha | 12 packages (4 tipos × 3 tiers) ⚠ granularidade diferente |
| **Blockchain Polygon** | ❌ Não menciona | ✅ Contrato Solidity completo M-13 | ❌ Não implementado |

**Pergunta:**
- 6a — Reformatar `panaceia_token_packages` em **4 packs** conforme Manual em vez de 12? ☐
- 6b — DCT/Polygon entra ou fica de fora (decisão prévia já foi: adiar)? ☐
- 6c — BYOK (sua decisão D-10 híbrido) é compatível com Manual? **SIM** — Manual §17 menciona "AI Tokens para consultas avançadas ao ProteOS" sem proibir BYOK. ☐ confirmar?

---

## §7 — Marketplace / PanaceIA

| Manual V1.0512 (9 categorias) | DEVPACK v4 (PanaceIA M-13) | Código (`panaceia_offerings`) |
|---|---|---|
| 1. Mentorias (70/30) | "Marketplace de tokens IA" | `mentoring` |
| 2. Terapias (75/25) | Exchange BYOK | ❌ |
| 3. Grupos pagos (70/30) | | ❌ |
| 4. Cursos (70/30) | | ❌ |
| 5. Wearables curados | | `product` (curated store) |
| 6. Suplementos | | ❌ |
| 7. Sensores IoT | | ❌ |
| 8. Serviços Financeiros | | ❌ |
| 9. Protocolos de Saúde (70/30) | | ❌ |

**Pergunta:** Expandir `panaceia_offerings` para 9 categorias conforme Manual? ☐

---

## §8 — Planos

| Manual V1.0512 (6 níveis) | Código |
|---|---|
| Free Anônimo · R$0 | ⚠ Não há `free_anonimo` explícito |
| Free Comunidade · R$0 | ✅ `free_comunidade` em migration 09 |
| Starter · R$19,90-39,90 | ✅ engine/index.ts mapping |
| Premium · R$79,90-249,90 | ✅ |
| Professional · R$149,90-899 | ✅ |
| Beck Office B2B · R$149,90-899/profissional | ⚠ `beckoffice` native_tool sem pricing |

**Pergunta:** Implementar `free_anonimo` + ajustar matriz para 6 níveis? ☐

---

## §9 — Gamificação

| Manual V1.0512 (XP Existencial) | Código |
|---|---|
| XP Existencial · não "XP" genérico | `xp_log` table — terminologia genérica ⚠ |
| Badges nomeados ("Meditador Consistente", "Guardião da Tradição", "Investidor Ativo") | `badges` table genérica |
| 7 Níveis: Semente · Raiz · Tronco · Galho · Flor · Fruto · Mestre | `user_xp.level` inteiro ⚠ |
| Streaks 7/30/90 dias | ❌ Não implementado |
| Jornadas temáticas | ❌ Não implementado |
| Missões coletivas | ❌ Não implementado |

**Pergunta:** Renomear `xp_log` para `existential_xp_log` + adicionar coluna `evolution_level` (enum 7 níveis)? ☐

---

## §10 — Roadmap (Fases)

| Manual V1.0512 — 4 Fases Estratégicas |
|---|
| **Fase 1 — Fundação Social:** Diário · Comunidades · HermeOS básico · Free Anônimo + Comunidade · 3 personas calibradas |
| **Fase 2 — Núcleo Analítico:** ProteOS roteamento real · HygeiOS ETL · AsclepiOS · Marketplace · Tokens · Beck Office · Lucas+Fernanda |
| **Fase 3 — Integração Física:** EteriOS wearables + MedTech + IoT · Voz · HermeOS Open Banking · Zé das Bets |
| **Fase 4 — Autonomia Preditiva:** Multiagentes IA · automação preditiva · AR/VR · Edge AI · Enterprise API |

**Pergunta:** S18 atual está em qual fase? (Provavelmente Fase 1+2 misturadas) — alinhar nomeclatura? ☐

---

## §11 — Itens de autoria declarados (Manual §23)

22 itens registrados sob Lei 9.610. Confirmação rápida:

| # | Item | Existe no código? |
|---|---|---|
| 1 | Conceito arquitetura ARKHE | ✅ branding |
| 2 | AquariOS como "SO do Ser Humano" | ⚠ na splash não está claro |
| 3 | ProteOS roteamento por intenção | ⚠ chat existe, roteamento parcial |
| 4 | SandeirOS engine 22 arcanos | ❌ não implementado |
| 5 | Correspondência 7 princípios ↔ 22 arcanos | ⚠ princípios em constitution, arcanos faltam |
| 6 | HygeiOS pipeline ETL + IVI | ❌ pipeline ETL não implementado |
| 7 | AsclepiOS risk_score algorithm | ❌ não implementado |
| 8 | EcumenicOS 13×3 oráculo oculto | ✅ migration 08 |
| 9 | IVI tridimensional Bio/Mental/Spirit | ⚠ tabela existe, fórmula falta |
| 10 | Beck Office matching por IVI | ❌ não implementado |
| 11 | 4 tiragens SandeirOS | ❌ não implementado |
| 12 | 7 princípios soberania usuário | ⚠ implícitos |
| 13 | Algoritmo padrões longitudinais 3D | ❌ não implementado |
| 14 | Integração 3 textos canônicos × SandeirOS | ❌ não implementado |
| 15 | Acessibilidade Social tarifária | ❌ não implementado |
| 16 | EcumenicOS oráculo moderno 13+39 | ✅ migration 08 |
| 17 | Oráculo Oculto princípio interno | ✅ `oracle_modern`/`oracle_label` |
| 18 | Sincretismo como elo entre tradições | ⚠ em Cultural Voice |
| 19 | EteriOS nome+arquitetura IoT | ❌ só placeholder |
| 20 | HermeOS módulo IVI↔finanças | ❌ só placeholder |
| 21 | Free Anônimo + Comunidade trial 30d | ⚠ parcial |
| 22 | XP Existencial nome+arquitetura | ❌ só `xp_log` genérico |

**Cobertura atual: 5/22 ratificados · 7/22 parciais · 10/22 não-implementados.**

---

## Resumo das perguntas pendentes

| § | Pergunta | Sua marcação |
|---|---|---|
| 2 | Manter Pilar 2 Psicologia Social (não-ratificado)? | ☐ |
| 3.1a | Mudar ProteOS/Comunidades/Diário/Nutrição para `category='module'`? | ☐ |
| 3.1b | PanaceIA: módulo ou marketplace? | ☐ |
| 3.2a | Renomear `faqEngine` para `alexandrios`? | ☐ |
| 3.2b | Criar `kb_foundation` + `metadata_store`? | ☐ |
| 3.2c | adm_ai 4 camadas (já aprovado ✅) | ✅ |
| 4 | Implementar pipeline IVI no SQL? | ☐ |
| 5a | 130 personas = ratificação ou paralela? | ☐ |
| 5b | Lucas/Fernanda/Zé Bets agora? | ☐ |
| 6a | Reformatar tokens em 4 packs? | ☐ |
| 6b | DCT Polygon (decisão prévia: adiar) | ✅ adiar |
| 6c | BYOK compatível? (sim) | ✅ |
| 7 | Expandir `panaceia_offerings` a 9 categorias? | ☐ |
| 8 | Free Anônimo + 6 níveis? | ☐ |
| 9 | XP Existencial + 7 níveis Semente→Mestre? | ☐ |
| 10 | Marcar S18 como Fase X no SQL? | ☐ |
| 11 | Migration 12 registra os 22 itens autoria? | ☐ (recomendado SIM) |

---

## Recomendação geral

**Para a migration 12, sugiro [H] Híbrido orientado-Manual:**

1. Manual V1.0512 = base autoritativa para nomes, fórmulas, taxonomia
2. DEVPACK v4 = referência para 44 eixos (já distribuídos por sua decisão D-09)
3. Código = não quebrar o que funciona
4. Inovações pós-Manual (AeropagOS/CerberOS/Wonder Night/130 personas/Pilar 2 PS) = **registradas como adições ao Manual V1.0612**, todas atribuídas a Fabiano

**Marque suas respostas na coluna ☐ acima e me devolva.** Aí eu escrevo a migration 12 com confiança.
