---
session: S14
title: "Comunidades + ARKHE FAQ Engine"
date: "24 de maio de 2026"
status: PRONTO PARA INICIAR
---

# S14 — COMUNIDADES + ARKHE FAQ ENGINE

**Branch:** master (tracking origin/main)  
**Commit base:** b7263e3 (S12 pendências resolvidas)  
**Prioridade:** ALTA (S15 depende de S14)  
**Timeline:** 1 sessão (4-5 horas)  
**Código novo esperado:** ~1200 linhas

---

## 📋 O QUE S14 ENTREGA

### Trilha A: Gamificação + Comunidades UI
- [ ] `mobile/app/(app)/achievements.tsx` — Grid de badges desbloqueados + progression
- [ ] `mobile/app/(app)/leaderboard.tsx` — Top 10 IVI (anonimizado) + posição do usuário
- [ ] `mobile/components/OnboardingFlow.tsx` — 3 telas guiando novo usuário (IVI, XP, Comunidade)
- [ ] Integração no _layout.tsx: novos botões no menu inferior

### Trilha B: Persona Segmentation (Cascata 3 Níveis)
- [ ] `mobile/hooks/usePersonaDetection.ts` — IMPLEMENTAÇÃO COMPLETA
  - Entrada: `useHealthScore()` result + telemetry_vitality_logs
  - Saída: `SegmentationResult { persona, confidence, economicContext, tone, faqSubset }`
  - Lógica:
    - **L1 (Demográfico):** Calcula demographic_score (idade, gênero, localização)
    - **L2 (Socioeconômico):** Detecta contexto econômico → **ZÉ_DO_APERTO | DONA_MARIA | CARLOS**
    - **L3 (Comportamental):** Analisa telemetry_vitality_logs para padrões de busca/frequência
  - Resultado: persona + tone (PRAGMATIC_DIRECT | SUPPORTIVE_CLINICAL | CLINICAL_URGENT)

### Trilha C: Intent Router (ProteOS Routing)
- [ ] `mobile/hooks/useIntentRouter.ts` — IMPLEMENTAÇÃO COMPLETA
  - Entrada: vector_similarity (0.0-1.0) + system_load (0.0-1.0)
  - Saída: `IntentRouterResult { destination, confidence }`
  - Lógica:
    - `similarity >= 0.85 && load <= 0.90` → **PROTEOS_ENGINE**
    - `similarity < 0.85` → **ASCLEPIOS_REFUTATION_QUEUE** (audit saída duvidosa)
    - `load > 0.90` → **SANDEIROS_DEGRADED_WORKER** (fallback)
  - Calculate entropy: -Σ(p × log2(p)) para medir incerteza da resposta

### Trilha D: AsclepiOS Audit (Validação Socrática)
- [ ] `mobile/services/asclepiOS.ts` — IMPLEMENTAÇÃO COMPLETA
  - Função: `auditOutput(output, schema?, persona?): AuditResult`
  - Responsabilidades:
    - Detectar **banned phrases** por persona (e.g., "milagre", "cura 100%")
    - Validar **estrutura** (JSON, schema se fornecido)
    - **Persona-aware validation** (Carlos menos formal, Zé pragmático)
  - Retorna: `{ passed: boolean, reasons?: string[] }`

### Trilha E: ARKHE FAQ Engine (42 FAQs)
- [ ] `mobile/services/faqEngine.ts` — IMPLEMENTAÇÃO COMPLETA
  - 3 personas × 14 FAQs = **42 FAQs total**
    - **Zé do Aperto (8 FAQs):** Questões SUS, acesso público, preventiva
    - **Dona Maria (9 FAQs):** Família, vínculos, suporte social, crônicas
    - **Carlos (8 FAQs):** Denial, mudança de crenças, especialista
  - Funções:
    - `searchFAQ(query, persona?, category?)` → FAQResult[]
    - `getFAQsByPersona(persona)` → FAQResult[]
    - `getFAQsByCategory(category)` → FAQResult[]
  - Interface: `FAQResult { id, question, answer, persona, category, relatedFAQs }`

### Trilha F: Comunidades Scoring (8 dimensões + mediação)
- [ ] Integração: comunidades/*.tsx → usePersonaDetection() + useIntentRouter()
- [ ] Feature: "Recomendações adaptadas" baseadas em persona
- [ ] Feature: "FAQ sugerida" inline no feed baseada em intent
- [ ] Backend: Edge Function `/engine` → action `get_community_recommendations`

---

## 🔗 DEPENDÊNCIAS DE S13

### Inputs obrigatórios (já implementados em S13)

| Dado | Origem | Como usar em S14 |
|------|--------|-----------------|
| `useHealthScore()` | S13 hook | Entrada para L2 persona (socioeconômico) |
| `telemetry_vitality_logs` | S12 table | Entrada para L3 persona (comportamental) |
| `user_xp`, `level` | S12 table | Para validar "acesso a FAQ avançada" |
| `plan_tier` | S13 score | Para validar acesso a recursos premium |
| Edge Function `/engine` | S13 | Adicionar action `get_community_recommendations` |

### Arquivos já pré-stagados em S13

```
✅ mobile/hooks/usePersonaDetection.ts  — assinatura vazia, pronto para impl
✅ mobile/hooks/useIntentRouter.ts      — assinatura vazia, pronto para impl
✅ mobile/services/asclepiOS.ts         — assinatura vazia, pronto para impl
✅ mobile/services/faqEngine.ts         — assinatura vazia, pronto para impl
```

---

## 📐 ALGORITMOS CRÍTICOS (DevPack M-02, M-03, M-05)

### 1. CASCATA 3 NÍVEIS — Persona Segmentation

```typescript
interface SegmentationResult {
  persona: 'ZÉ_DO_APERTO' | 'DONA_MARIA' | 'CARLOS';
  confidence: number;  // 0-100
  economicContext: 'LOW_INCOME_VARIABLE' | 'FIXED_LOW_INCOME' | 'MIDDLE_TO_HIGH';
  tone: 'PRAGMATIC_DIRECT' | 'SUPPORTIVE_CLINICAL' | 'CLINICAL_URGENT';
  faqSubset: string[];  // IDs das 8-9 FAQs da persona
  recommendations: string[];
}

function usePersonaDetection() {
  // L1: Demographics (age, gender, location) → L1_score
  const l1_score = calcDemographic(profile.age, profile.gender, profile.location);
  
  // L2: Socioeconomic (CRÍTICO) → economicContext
  const health_score = await useHealthScore();  // De S13
  const economic = detectEconomicContext(health_score.healthLevel, savings, income);
  // LOW_INCOME_VARIABLE < FIXED_LOW_INCOME < MIDDLE_TO_HIGH
  
  // L3: Behavioral (telemetry patterns) → persona tone
  const telemetry = await supabase.from('telemetry_vitality_logs').select(...);
  const l3_pattern = analyzeBehavior(telemetry);
  
  return {
    persona: selectPersona(l2_context),  // Baseado em L2
    confidence: l1_score * 100,
    economicContext: economic,
    tone: selectTone(l3_pattern),
    faqSubset: faqsByPersona[persona],
    recommendations: generateRec(persona, health_score)
  };
}
```

**Mapeamento L2 → Persona:**
- `LOW_INCOME_VARIABLE` → **ZÉ_DO_APERTO** (SUS, acesso público, variável)
- `FIXED_LOW_INCOME` → **DONA_MARIA** (renda fixa, vínculos comunitários)
- `MIDDLE_TO_HIGH` → **CARLOS** (seguro privado, acesso a especialista)

---

### 2. INTENT ROUTER — Destino da Resposta

```typescript
interface IntentRouterResult {
  destination: 'PROTEOS_ENGINE' | 'ASCLEPIOS_REFUTATION_QUEUE' | 'SANDEIROS_DEGRADED_WORKER';
  confidence: number;  // 0-100
}

function useIntentRouter() {
  // Entrada: resultado do embedding vetorial + carga do sistema
  const vector_similarity = calculateSimilarity(user_query, proteos_embeddings);
  const system_load = getSystemLoad();  // CPU, memory, queue length
  
  const entropy = calculateEntropy(probabilities);  // -Σ(p × log2(p))
  
  // Decisão
  if (vector_similarity >= 0.85 && system_load <= 0.90) {
    return { destination: 'PROTEOS_ENGINE', confidence: Math.round(entropy * 100) };
  }
  if (vector_similarity < 0.85) {
    return { destination: 'ASCLEPIOS_REFUTATION_QUEUE', confidence: 100 };
  }
  if (system_load > 0.90) {
    return { destination: 'SANDEIROS_DEGRADED_WORKER', confidence: 50 };
  }
}
```

---

### 3. ARKHE FAQ REPOSITORY (42 FAQs)

**Estrutura esperada:**

| Persona | FAQs | Foco | Exemplo |
|---------|------|------|---------|
| **ZÉ_DO_APERTO** | 8 | SUS, acesso público, preventiva | "Como faço pra ir no cardiologista do SUS?" |
| **DONA_MARIA** | 9 | Família, vínculos, crônicas | "Meu filho tem diabetes, como ajudar?" |
| **CARLOS** | 8 | Expertise, especialista, negação | "Que exames devo fazer anualmente?" |

Cada FAQ:
```typescript
{
  id: "faq_zé_01_sus_cardiologia",
  question: "Como agendar cardiologia pelo SUS?",
  answer: "... (resposta pragmática, direto) ...",
  persona: "ZÉ_DO_APERTO",
  category: "SUS",
  relatedFAQs: ["faq_zé_02_especialista", "faq_dona_maria_08_familia"]
}
```

---

## 🛠️ TRILHA A: COMPONENTES + SCREENS

### OnboardingFlow (3 telas)

**Tela 1: Bem-vindo ao IVI**
- Explicação visual: 8 dimensões de saúde
- Mostrar seu score atual (de S13 useHealthScore)
- CTA: "Próximo"

**Tela 2: Sistema de XP**
- Explicação: como ganha XP
- Visualização: XPBar com nível atual
- CTA: "Próximo"

**Tela 3: Comunidades**
- Explicação: conexão com outros usuários
- Teaser: "Top 10 pessoas com maior IVI"
- CTA: "Entendi! Levar pra Comunidades"

Resultado: flag `onboarding_done = true` no perfil do usuário.

### Achievements Screen

```
┌─────────────────────────────────┐
│  Minhas Conquistas              │
├─────────────────────────────────┤
│  ✅ Semente (desbloqueado)      │
│  ✅ Raiz (desbloqueado)         │
│  ✅ Tronco (desbloqueado)       │
│  ⭕ Fruto (32/50 XP)            │
│     [████████░░░░░░░░░░░]       │
│  ⭕ Flor (0/100 XP)             │
│     [░░░░░░░░░░░░░░░░░░░░░]     │
│  🔒 Transcendência (locked)     │
├─────────────────────────────────┤
│  Total: 7 badges                │
│  Progresso: 32%                 │
└─────────────────────────────────┘
```

### Leaderboard Screen

```
┌─────────────────────────────────┐
│  Top 10 IVI da Comunidade       │
├─────────────────────────────────┤
│  🥇 Aquariano #7 — 92 IVI       │
│  🥈 Aquariana #42 — 88 IVI      │
│  🥉 Aquariano #15 — 85 IVI      │
│  4.  Aquariana #9 — 81 IVI      │
│  5.  Aquariano #3 — 79 IVI      │
│  ...                            │
│  👤 Você: 15º — 72 IVI (+3)     │
│     ⬆️ Subiu 2 posições esta semana
└─────────────────────────────────┘
```

---

## 🧠 TRILHA B: SERVIÇOS + HOOKS

### Ordem de implementação (não paralizar bloqueadores):

1. **usePersonaDetection.ts** → Necessária para FAQs e recomendações
2. **faqEngine.ts** → Pode usar persona do passo 1
3. **useIntentRouter.ts** → Pode ser independente
4. **asclepiOS.ts** → Valida saídas de ProteOS

### Validação de cada um

```
✅ usePersonaDetection: confiance > 0.7 na 90% dos testes
✅ faqEngine: todos 42 FAQs retornam sem erro
✅ useIntentRouter: entropy calculation correto
✅ asclepiOS: detecta banned phrases com >0.95 precisão
```

---

## 📊 INTEGRAÇÃO COM S13

### Input Flow

```
User profile
  ↓
useHealthScore() [S13]
  ↓
usePersonaDetection() [S14] ← usa health_score para L2
  ↓
faqEngine.getFAQsByPersona(persona) [S14]
  ↓
IntentRouter evalua se resposta é confiável [S14]
  ↓
AsclepiOS audita antes de enviar [S14]
  ↓
User vê resposta + FAQ relacionada
```

### Backend Integration

Edge Function `/engine` (S13) precisa receber ação nova:

```typescript
case 'get_community_recommendations':
  // Input: { userId, moduleId }
  // Chama usePersonaDetection
  // Chama faqEngine.getFAQsByPersona
  // Retorna: { persona, faqIds, recommendations }
```

---

## ✅ CHECKLIST S14

### Fase 1: Segmentation (Day 1, ~2h)
- [ ] usePersonaDetection.ts implementado
- [ ] L1, L2, L3 calculando corretamente
- [ ] Test: criar 3 personas de exemplo, verificar mapping
- [ ] Test: confiance varia 0-100

### Fase 2: FAQs (Day 1, ~1.5h)
- [ ] 42 FAQs criadas em mobile/config/faqs.json ou table
- [ ] faqEngine.ts implementado
- [ ] searchFAQ retorna corretamente
- [ ] getFAQsByPersona retorna 8-9 results

### Fase 3: Intent Router (Day 1, ~1h)
- [ ] useIntentRouter.ts implementado
- [ ] Vector similarity calculando
- [ ] System load tracking
- [ ] Entropy calculation validado

### Fase 4: AsclepiOS (Day 2, ~1h)
- [ ] Banned phrases definidas por persona
- [ ] asclepiOS.auditOutput() validando
- [ ] Test: passa banned phrases, falha corretamente

### Fase 5: UI (Day 2, ~1.5h)
- [ ] achievements.tsx renderizando badges
- [ ] leaderboard.tsx mostrando Top 10
- [ ] OnboardingFlow.tsx 3 telas
- [ ] Menu linking

### Fase 6: Integration (Day 2, ~0.5h)
- [ ] usePersonaDetection() chamado no /comunidades
- [ ] FAQ sugerida inline no feed
- [ ] Edge Function recebendo action nova

---

## 📝 BRIEFING CONCISO PARA INÍCIO IMEDIATO

**Start point:** commit b7263e3 (S12 + S13 merged)

**First task:** Implementar `usePersonaDetection.ts`
- Recebe: `useHealthScore()` + `telemetry_vitality_logs`
- Retorna: `{ persona, confidence, economicContext, tone, faqSubset }`
- Lógica: L1 (demog) + L2 (econ) + L3 (behavior)

**Blocker:** Nenhum — S13 outputs já estão prontos

**Quick win:** FAQs — cria 42 JSON objects com personas/categorias

---

## 🎯 RESULTADO ESPERADO S14

**Código novo:** ~1200 linhas  
**Tabelas novas:** 1 (faqs table, opcional)  
**Commits:** 5-7  
**PR:** Para main, com descrição completa  
**Tag:** v5.0.0-s14 (antes de S15 merge)  

**Features visíveis:**
1. Menu mostra "Comunidades" com leaderboard integrado
2. User vê top 10 IVI anonimizado
3. User vê suas conquistas + progresso
4. First-time users veem onboarding 3 telas
5. FAQs sugeridas baseadas em persona
6. ProteOS responde com maior contexto sobre persona do user

---

## 🔄 S15 Dependências

**O que S15 usará de S14:**
1. `usePersonaDetection()` → Comunidades scoring
2. `faqEngine()` → Help system da plataforma
3. `useIntentRouter()` → ProteOS routing em produção
4. `asclepiOS()` → Validação de outputs before publish

**Sem S14, S15 fica limitado** a generic recommendations (não persona-aware).

---

*Briefing S14 — Pronto para execução imediata*  
*Data: 24 de maio de 2026*  
*Status: Bloqueadores = 0*
