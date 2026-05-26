# S17 SESSION REMINDER — CerberOS Perímetro
**Cole este arquivo como contexto no início da sessão S17**

---

## ESTADO ATUAL (pós-S16)

### Branch ativa
```
security/critical-fixes
Último commit: 9da64c2
feat(security): S16 E2E encryption + audit logs + RLS hardening
```

### O que S16 entregou (COMPLETO)
- ✅ `mobile/lib/crypto.ts` — CryptoService AES-256-GCM, chave em SecureStore
- ✅ Migrations 06 + 07 aplicadas no Supabase (projeto agebsmjsjrmazbozphnh)
- ✅ 10 colunas `_encrypted` + `_nonce` criadas em 4 tabelas
- ✅ Tabela `audit_logs` + RLS + função `log_audit_event()`
- ✅ RLS communities com INSERT/UPDATE/DELETE policies
- ✅ 4 telas atualizadas: diario, proteos, nutricao (encrypt/decrypt)
- ✅ CVEs 001-010 corrigidos (commits anteriores)
- ⏳ JIT/Teleport — pendente (DevOps, infra externa)
- ⏳ PR + merge para main — pendente
- ⏳ APK rebuild com crypto — pendente

### Risco mitigado até aqui
- R$212.4M (80% do threat landscape)

---

## S17 — O QUE FAZER

### Objetivo
CerberOS Perímetro: camada de **detecção ativa** de ataques.
Timeline: 9 julho → 19 agosto 2026 | 285h

### Componentes S17 (em ordem de prioridade)

#### 1. CerberOS Layer 0 — Rate Limiting Inteligente (20h)
```
Já existe: rate limiting básico no engine (CVE-003)
S17 adiciona:
- Rate limiting por fingerprint (não só por userId)
- Sliding window (Redis/Upstash) vs fixed window atual
- Bloqueio progressivo: 1x warn → 2x slow → 3x block
- Edge Function: middleware de rate limiting compartilhado
```

#### 2. CerberOS Layer 1 — Anomaly Detection (40h)
```
- Log de padrões: horário, volume, sequência de requests
- Score de anomalia por sessão (0-100)
- Trigger: score > 70 → alerta; score > 90 → sessão suspensa
- Tabela: anomaly_scores (user_id, score, factors, created_at)
- Edge Function: /functions/v1/cerberus/anomaly
```

#### 3. CerberOS Layer 2 — ETERNAL MAZE Honeypot (80h)
```
- Endpoints falsos que parecem reais mas não existem
- Qualquer acesso = flag imediata de bot/scanner
- Exemplos: /api/admin, /api/backup, /api/config
- Edge Function: /functions/v1/honeypot (retorna 200 com dados falsos)
- Tabela: honeypot_hits (ip_hash, endpoint, user_id, created_at)
- Integração com audit_logs
```

#### 4. CerberOS Layer 3 — Aprisionamiento (25h)
```
- Usuários flagados entram em "maze mode"
- Respostas ficam progressivamente mais lentas (throttle real)
- Dados retornados são falsos/vazios (não erro, só inúteis)
- Saída: só manual pelo admin
- Tabela: maze_sessions (user_id, entered_at, level, reason)
```

#### 5. HygeiOS ↔ CerberOS Integration (30h)
```
- HygeiOS bloqueia engine para usuários em maze
- Score de anomalia alimenta Data Gate do HygeiOS
- Eventos de saúde suspeitos (data dump, export em massa) → flag
```

#### 6. ML Anomaly Detection — Fase 1 (40h)
```
- Modelo simples: IsolationForest ou Z-score
- Features: requests/hora, tamanho médio de payload, horário
- Treino: últimos 30 dias de audit_logs
- Deploy: Edge Function Python (Supabase não suporta, usar AWS Lambda)
- Output: score numérico → tabela anomaly_scores
```

#### 7. Testing + Deploy (45h)
```
- Penetration test básico (OWASP ZAP)
- Test honeypot hits
- Test maze mode
- APK rebuild + teste no dispositivo
- Deploy AWS Lambda para ML
```

---

## ARQUIVOS CHAVE PARA S17

```
mobile/supabase/functions/engine/index.ts    — adicionar CerberOS middleware
mobile/supabase/functions/chat/index.ts      — idem
mobile/lib/crypto.ts                         — já pronto, não tocar
mobile/supabase/migrations/                  — adicionar 08_s17_cerberus.sql
S16_DECISIONS/HYGEIOS_CERBERIOS_INTEGRATION.md — blueprint completo
COMPLETE_ROADMAP_TO_PLAYSTORE.md             — master doc
```

---

## PERMISSÕES NECESSÁRIAS S17

```
✅ Supabase (já tem) — deploy edge functions, SQL migrations
✅ Chrome MCP (já tem) — Supabase SQL Editor
✅ ADB (já tem) — dispositivo Motorola Edge 40 Neo (serial: 0085451633)
⚠️  AWS Lambda — precisará para ML (configurar na S17)
⚠️  GitHub — PR + merge security/critical-fixes → main antes de S17
```

---

## PRIMEIRA AÇÃO DA S17

```
1. git checkout -b feature/cerberus-s17
2. Criar migration 08_s17_cerberus_tables.sql:
   - anomaly_scores table
   - honeypot_hits table
   - maze_sessions table
3. Implementar Edge Function /cerberus/anomaly
4. Implementar honeypot endpoints
```

---

## TARGET FINAL

**Play Store: 9 de setembro de 2026**
S17 completa: 19 agosto 2026
S18 (infra + launch): 20 ago → 9 set 2026
