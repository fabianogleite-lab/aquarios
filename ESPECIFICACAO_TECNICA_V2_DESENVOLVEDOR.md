# AquariOS — Especificação Técnica V1→V2 (Desenvolvedor)
## Documento de execução — grounded no código real, S32 (09/06/2026)

> **Diferença deste documento para a versão genérica anterior:** tudo aqui referencia
> arquivos, tabelas, hooks e infraestrutura que **já existem no repo**. Não há
> recomendações de stack nova (Kafka, BigQuery, Drools) — a V2 se constrói **em cima**
> do que está rodando, não ao lado.

---

## 1. Onde a V1 realmente está (não é teoria — é o `git log`)

A V1 não está "em produção teórica". Está **quase pronta para o Play Store** (target
09/09/2026). O que já existe e funciona:

| Camada | Estado real | Evidência |
|---|---|---|
| **App mobile** | Expo SDK 56, 9 módulos UX, 40+ telas | `mobile/app/(app)/*.tsx` |
| **iVi 4D** | Motor SQL ativo (`calculate_ivi`), migrations 28+29 aplicadas | Supabase functions |
| **Auth + RLS** | Completo, hardening em 3 rounds (17/18/23) | `migrations/17,18,23_*.sql` |
| **E2E + Audit** | AES-256-GCM + `audit_logs` | `mobile/lib/crypto.ts`, migration 06/07 |
| **Comunidades** | Posts, likes, follows, 130+ bot personas | `useCommunityAPI.ts`, migrations 24-27 |
| **Gamificação** | XP, badges, leaderboard, arcanos diários | `useXP.ts`, `jornada.tsx`, migration 22 |
| **HygeiOS v2 (motor Python)** | Arquitetura aprovada (síntese A+B+C), substitui `calcIVI` client-side | `mobile/docs/ARCHITECTURE_HYGEIOS_V2.md` |
| **Backend Python** | FastAPI rodando em `api.podiumtec.com.br`, HTTPS live | Oracle VM `aquarios-server-1` |
| **i18n** | pt-BR/en-US/es ativos, 14 vozes culturais no ProteOS | `mobile/i18n/`, `proteos-cultural-voice.ts` |

**Conclusão prática:** a V2 não começa de uma "fundação vazia". Ela começa de um app
funcional onde **parte da V2 já está em construção** (o motor Python *é* a V2 do
HygeiOS). O trabalho real é: (a) terminar a costura Python↔Supabase, (b) estender o
padrão "motor Python" para os outros módulos que a estratégia pede em V2.

---

## 2. Restrição que muda tudo: a infraestrutura é pequena

A versão genérica anterior sugeria Kafka/Kinesis + BigQuery + TensorFlow. Isso **não
serve** para a infra real:

| Recurso | Realidade | Implicação |
|---|---|---|
| **Oracle VM (HygeiOS+CerberOS+Core)** | E2.1.Micro — **1 OCPU / 1GB RAM** (498MB real) | Sem Kafka, sem containers pesados, sem ML training in-process |
| **Deploy** | "Terceira via" — `git pull` + `pip install -r requirements.txt` + `systemctl restart` | Sem Docker rebuild a cada deploy |
| **Data lake** | Supabase Postgres + (futuro) S3 + DuckDB — **não** Kafka/BigQuery | DuckDB roda embutido, zero infra extra |
| **A1.Flex (4 OCPU/24GB)** | Capacidade esgotada em SP e Ashburn (S27) | "Motor de ML pesado" é V3+, não V2 |

**Regra de ouro para V2:** qualquer feature que exija processamento pesado contínuo
(streaming de eventos, treino de modelo em tempo real) **não cabe na V2**. V2 usa:
- Batch jobs leves (cron/systemd timer) rodando o motor Python a cada N horas
- DuckDB para analytics local (já decidido para o data lake)
- Regras determinísticas + estatística simples (correlação, médias móveis) — não
  "modelos de ML" generativos

---

## 3. Mapeamento Estratégia → Módulos Reais

A tabela da estratégia ("HygeiOS parcial", "ProteOS contextual" etc.) precisa virar
arquivos concretos. Usando o `scope_modular_aquarios.md` como base:

### 3.1 HygeiOS — Analytics Comportamental (V2 core)

**Já existe (V1):**
- `mobile/app/(app)/hygeios.tsx` — score iVi 4D
- Tabelas: `mood_logs`, `hydration_logs`, `gratitude_logs`, `relationship_logs`, `meals`
- `mobile/hooks/useHealthScore.ts`

**O que falta para V2 (correlação contextual):**
- Endpoint novo no FastAPI (Oracle): `GET /api/v2/insights/{user_id}`
  - Lê as 5 tabelas acima via Supabase service-role
  - Calcula correlações simples (ex.: Pearson entre `hydration_logs.amount` e
    `mood_logs.score` dos últimos 30 dias)
  - Roda como **batch noturno** (systemd timer, não real-time) — escreve resultado em
    nova tabela `user_insights` (Supabase)
- Nova migration: `30_user_insights.sql`
  ```sql
  create table user_insights (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null,
    insight_type text not null,        -- 'correlation', 'trend', 'recommendation'
    payload jsonb not null,            -- { "metric_a": "hydration", "metric_b": "mood", "correlation": 0.42 }
    generated_at timestamptz default now(),
    expires_at timestamptz             -- insights são temporários, refresh diário
  );
  -- RLS: mesmo padrão das migrations 17/18/23 (owner-only read/write)
  ```
- App: novo card no `index.tsx` (Home dashboard) — "Seu padrão da semana" — lê
  `user_insights` via Supabase client (read-only, RLS já protege)

### 3.2 ProteOS — IA Contextual

**Já existe (V1):**
- `mobile/supabase/functions/chat/index.ts` — chama Claude API
- `mobile/hooks/usePersonaDetection.ts`, `useIntentRouter.ts`
- `mobile/lib/proteos-cultural-voice.ts` (14 vozes)

**O que falta para V2:**
- A edge function `chat/index.ts` hoje responde a comandos diretos. Para V2, o
  **system prompt** passa a receber um resumo de `user_insights` (gerado pelo HygeiOS
  acima) como contexto adicional — não é um modelo novo, é **enriquecer o prompt**
  existente com dados reais do usuário.
- Mudança concreta: antes de chamar Claude, a edge function faz uma query a
  `user_insights WHERE user_id = X ORDER BY generated_at DESC LIMIT 3` e injeta no
  prompt: `"Contexto do usuário: {insights}"`.
- Custo: zero infra nova — é uma query extra + string concatenation na function que já
  existe.

### 3.3 EteriOS — Stub de Integração (preparação V3, sem ativar)

**Não existe ainda no código.** Para V2, criar **apenas a estrutura**, sem lógica:

- `mobile/services/eteriOS.ts` — interface TypeScript com adapters vazios:
  ```typescript
  interface DeviceAdapter {
    name: string;
    isAvailable(): Promise<boolean>;
    readMetrics(): Promise<HealthMetric[]>;
  }
  // V2: só implementa o adapter que JÁ é usado (Apple Health/Google Fit
  // via expo-health, se já estiver no app — verificar antes de adicionar lib nova)
  export const adapters: DeviceAdapter[] = [
    // appleHealthAdapter, googleFitAdapter — V2
    // matterAdapter, zigbeeAdapter — V3 (não implementar agora)
  ];
  ```
- **Decisão a confirmar com o fundador antes de codar:** o app já tem alguma
  integração com Apple Health / Google Fit? Se não, isso é o único item de V2 que
  introduz dependência nova (`expo-health` ou similar) — vale validar custo/benefício
  vs. adiar para V3 junto com EteriOS completo.

### 3.4 CerberOS — já está à frente da V2

A estratégia pede "autenticação forte + logs + observabilidade básica" para V2. Isso
**já está pronto** (migrations 06, 07, 17, 18, 23 — RLS hardening completo, audit_logs
ativo). **Nenhuma ação necessária aqui para V2.** Esforço deve ir para HygeiOS/ProteOS.

### 3.5 HermeOS — manter simples

A estratégia sugere "modelar dados financeiros para suportar V4 (tokens)". **Não fazer
isso agora** — é especulação sobre um schema que pode mudar muito até V4 (24+ meses).
Seguir o princípio do projeto: não desenhar para requisitos hipotéticos. V2 mantém
HermeOS como está.

---

## 4. Cronograma V2 (realista, considerando equipe atual)

| Fase | Entregas | Esforço estimado |
|---|---|---|
| **Fase 1 — `user_insights` pipeline** | Migration 30 + batch job Python (Oracle, systemd timer) + card no Home | 1-2 sprints |
| **Fase 2 — ProteOS contextual** | Edge function `chat` lê `user_insights` e injeta no prompt | 0.5 sprint (baixo risco, sem infra nova) |
| **Fase 3 — EteriOS stub** | Interface TS vazia + decisão sobre Apple Health/Google Fit | 0.5 sprint (decisão) + 1 sprint (se aprovado) |
| **Fase 4 — Validação** | Beta com early adopters, medir engajamento com cards de insight | 1 sprint |

**Total: ~4-5 sprints** — muito menor que as "20-24 semanas" da versão genérica, porque
**não há infraestrutura nova a montar**: reaproveita Supabase + Oracle VM + FastAPI já
live.

---

## 5. O que NÃO fazer na V2 (evitar retrabalho)

1. **Não introduzir Kafka/Kinesis/BigQuery** — DuckDB + Supabase Postgres bastam até V3.
2. **Não criar "engine de regras" genérica (Drools/Node-RED)** — as correlações de V2
   são estatística simples (Pearson, médias móveis); uma lib genérica de regras é
   over-engineering para o escopo atual.
3. **Não modelar schema financeiro para V4 agora** — schema vai mudar; desenhar cedo
   demais cria migrations obsoletas.
4. **Não tocar em CerberOS** — já está à frente do que V2 precisa.
5. **Não dividir HygeiOS v2 em "microserviços"** — é **um** FastAPI rodando numa VM de
   1GB. Microserviços nessa escala = overhead de rede sem benefício.

---

## 6. Preparação real para V3 (sem código especulativo)

A única preparação que **vale a pena** fazer durante a V2:

- **`mobile/services/eteriOS.ts`** como interface vazia (Seção 3.3) — custo
  praticamente zero, documenta a intenção.
- **`user_insights` como tabela genérica** (`insight_type` + `payload jsonb`) — já é
  extensível por natureza; quando V3 trouxer dados de IoT, os insights de
  correlação podem incluir essas métricas sem mudar o schema.

Tudo o mais (CerberOS pleno, tokenomics, IA multiagente) é trabalho de V3/V4 e não deve
gerar código ou schema agora — gera **decisão de arquitetura registrada em memória**
(como já é feito em `scope_modular_aquarios.md` e `ARCHITECTURE_HYGEIOS_V2.md`).

---

## 7. Antes de começar — checklist de decisão (founder)

| Decisão | Por quê precisa de aprovação |
|---|---|
| Confirmar que `user_insights` roda como batch noturno (não real-time) | Limite de RAM da VM Oracle |
| Apple Health/Google Fit entra na V2 ou fica para V3 (junto com EteriOS) | Nova dependência mobile, custo de revisão de permissões na loja |
| Qual card de insight aparece primeiro no Home (hidratação×humor? sono×produtividade?) | Produto — qual correlação tem maior "wow factor" para o usuário |

---

## Referências

- `mobile/docs/ARCHITECTURE_HYGEIOS_V2.md` — decisão A+B+C, motor Python
- `scope_modular_aquarios.md` — mapa de arquivos por agente
- `ESTRATEGIA_EVOLUCAO_ATUALIZADA_S32_2026.md` — roadmap V1-V5 e janela de IPO
- `STATUS_FINAL_UNIFICADO_06JUN2026.md` — estado operacional S32

---

**Documento gerado em S32 (09/06/2026) — substitui a versão genérica anterior por uma
grounded no código e infraestrutura reais do projeto.**
