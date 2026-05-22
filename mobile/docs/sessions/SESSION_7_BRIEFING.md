# Sessao 7 — Build, Teste e Play Store

## Modelo: Opus | Estimativa: 1 sessao

---

## Contexto

Phase 4 teve 6 sessoes (S1-S6):
- S1: Backend Supabase + Auth
- S2: ProteOS Chat + Diario CRUD
- S3: Nutricao + Comunidades + Wonder Night
- S4: Polish visual, tema, animacoes, build config
- S5: Debug, documentacao, GitHub push + tag v4.2.0
- S6: Bug fixes (Home cards, ProteOS UUID), ProteOS IA real (Claude Haiku 4.5), limpeza repo (22k linhas removidas), GitHub release v4.3.0, EAS build submetido

O app esta funcional no Expo Go, ProteOS responde com IA real, repo esta limpo.
O que falta: verificar build APK, testar no celular, build AAB, Play Store.

---

## Prompt para iniciar

```
Sessao 7 — AquariOS: Build Final + Play Store.

ANTES DE TUDO: Leia estes arquivos na ordem:
1. mobile/docs/sessions/MASTER_PLAN.md
2. mobile/docs/sessions/SESSION_6_COMPLETE.md
3. mobile/docs/sessions/SESSION_7_BRIEFING.md

REPO: https://github.com/fabianogleite-lab/aquarios
TAG ATUAL: v4.3.0 | COMMIT: 1bc3d41

TOOLS DISPONIVEIS:
- gh CLI autenticado como fabianogleite-lab
- Chrome MCP para Supabase (github.com bloqueado na extensao)
- EAS CLI configurado

TAREFA DESTA SESSAO (nesta ordem):

1. VERIFICAR BUILD APK
   - Checar status do build EAS ID: 0b644164-d4fa-4ed2-8879-397117a45068
   - Se falhou: diagnosticar erro Gradle nos logs e corrigir
   - Se sucesso: baixar APK

2. TESTAR APK NO CELULAR
   - Instalar no celular real
   - Testar: login, Home cards, ProteOS chat, Diario, Nutricao, Comunidades, Wonder Night, Settings
   - Registrar bugs encontrados

3. BUILD AAB (PRODUCTION)
   - Bump versionCode de 42 para 43 em app.json
   - `eas build --platform android --profile production`
   - AAB necessario para Play Store

4. PLAY STORE SUBMISSION
   - Verificar app.json (nome, versao, icones)
   - Privacy policy (LGPD) — criar URL publica
   - Screenshots do app (5-8)
   - Descricao curta e longa em PT-BR
   - Content rating questionnaire
   - Upload AAB via `eas submit`

NOTA SEGURANCA:
- ANTHROPIC_API_KEY esta exposta como EXPO_PUBLIC_ no .env (embutida no APK)
- Para producao: migrar para Edge Function no Supabase (chat function ja deployada, precisa fix no SDK import)
- Alternativa: usar Supabase REST API como proxy

ENTREGA: APK testado + AAB no Play Store + app publicado.
```

---

## Detalhamento Tecnico

### 1. Build APK — Diagnostico se falhou

O build anterior (421fa6db) falhou com "Gradle build failed with unknown error".
Possiveis causas:
- Expo SDK 54 pode ter incompatibilidade com EAS Build servers atuais
- Builds anteriores bem-sucedidos usaram SDK 56 (commit diferente)
- Solucao: pode ser necessario upgrade para SDK 56 (`npx expo install --fix`)

### 2. Checklist Pre-Play Store

- [ ] app.json: nome, versao, icone, splash
- [ ] eas.json: production profile correto
- [ ] Privacy policy URL publica
- [ ] Screenshots do app (5-8)
- [ ] Descricao curta (80 chars) e longa em PT-BR
- [ ] Content rating questionnaire
- [ ] Support email configurado
- [ ] versionCode incrementado (42 -> 43)

### 3. Seguranca para Producao

A API key Anthropic esta em `EXPO_PUBLIC_ANTHROPIC_API_KEY` no mobile/.env.
Isso significa que a key sera embutida no APK/AAB — qualquer pessoa pode extrair.

Opcoes:
A) Migrar para Edge Function (Supabase) — key fica server-side
B) Usar Supabase como proxy (RPC function)
C) Aceitar risco para MVP beta (key pode ser rotated depois)
