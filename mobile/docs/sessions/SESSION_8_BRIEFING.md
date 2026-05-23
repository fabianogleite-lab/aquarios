# Sessao 8 — Play Store Submission + Seguranca

## Modelo: Opus | Estimativa: 1 sessao

---

## Contexto

Phase 4 teve 7 sessoes (S1-S7):
- S1: Backend Supabase + Auth
- S2: ProteOS Chat + Diario CRUD
- S3: Nutricao + Comunidades + Wonder Night
- S4: Polish visual, tema, animacoes, build config
- S5: Debug, documentacao, GitHub push + tag v4.2.0
- S6: Bug fixes, ProteOS IA real (Claude Haiku 4.5), limpeza repo, release v4.3.0
- S7: SDK 56 upgrade, APK + AAB builds SUCESSO, Privacy Policy LGPD, Play Store listing

O app esta funcional, APK (91MB) e AAB estao prontos.
O que falta: testar APK, publicar no Play Store, corrigir seguranca da API key.

---

## Prompt para iniciar

```
Sessao 8 — AquariOS: Play Store + Seguranca.

ANTES DE TUDO: Leia estes arquivos na ordem:
1. mobile/docs/sessions/MASTER_PLAN.md
2. mobile/docs/sessions/SESSION_7_COMPLETE.md
3. mobile/docs/sessions/SESSION_8_BRIEFING.md

REPO: https://github.com/fabianogleite-lab/aquarios
TAG ATUAL: v4.3.0 | ULTIMO COMMIT: 1fb4b35

TOOLS DISPONIVEIS:
- gh CLI: C:\Program Files\GitHub CLI\gh.exe (autenticado como fabianogleite-lab)
- Chrome MCP: acessa supabase.com (github.com bloqueado na extensao)
- EAS CLI configurado (conta: @aquarios)
- Expo Go no celular do usuario

BUILDS PRONTOS:
- APK preview: https://expo.dev/artifacts/eas/ozbJDCJ8fujk6mm6awKxu4.apk (91MB)
- AAB production: https://expo.dev/artifacts/eas/tRA22rmTGXthK56766zCPS.aab
- APK anexado no GitHub release v4.3.0

TAREFA DESTA SESSAO (nesta ordem):

1. TESTAR APP
   - Usuario instala APK no celular OU testa via Expo Go
   - Testar: login, Home cards, ProteOS chat (IA real), Diario CRUD, Nutricao, Comunidades, Wonder Night, Settings
   - Registrar e corrigir bugs encontrados
   - Se corrigir bugs: novo build APK/AAB com versionCode 44

2. SEGURANCA — MIGRAR API KEY
   - ANTHROPIC_API_KEY esta exposta como EXPO_PUBLIC_ no .env (embutida no APK)
   - Edge Function "chat" ja deployada no Supabase mas com bug no SDK import
   - Corrigir Edge Function para funcionar
   - Alterar proteos.tsx para chamar Edge Function em vez de API direta
   - Remover EXPO_PUBLIC_ANTHROPIC_API_KEY do .env
   - Testar que ProteOS continua funcionando

3. PLAY STORE SUBMISSION (se conta ativa)
   - Verificar se conta Google Play esta ativa
   - Criar app listing no Play Console:
     - Copiar conteudo de mobile/docs/PLAY_STORE_LISTING.md
     - Upload screenshots (mockups ou prints reais do celular)
     - Privacy policy: https://fabianogleite-lab.github.io/aquarios/privacy-policy.html
     - Content rating questionnaire
   - Upload AAB: `eas submit --platform android --profile production`
   - Ou upload manual pelo Play Console

4. RELEASE + FECHAMENTO
   - Se houve mudancas: novo commit, tag, release
   - SESSION_8_COMPLETE.md
   - Atualizar MEMORY.md

NOTA SOBRE TOOLS:
- gh CLI path completo: & "C:\Program Files\GitHub CLI\gh.exe"
- Chrome MCP: pode acessar Supabase dashboard (deploy Edge Functions, ver logs)
- Chrome MCP: NAO acessa github.com nem github.io
- Supabase project ID: agebsmjsjrmazbozphnh
- Credenciais Supabase em mobile/.env

ENTREGA: App testado + API key segura + app publicado no Play Store.
```

---

## Detalhamento Tecnico

### 1. Edge Function — Fix necessario

A Edge Function "chat" foi deployada na S6 via Supabase dashboard.
Problema: import do SDK Anthropic nao funciona no Deno runtime do Supabase.

Opcoes para corrigir:
A) Usar fetch direto para api.anthropic.com (sem SDK) — mais simples
B) Importar SDK via esm.sh ou cdn.skypack.dev (Deno-compatible)
C) Criar RPC function no PostgreSQL como proxy

Recomendacao: Opcao A (fetch direto) — ja funciona no proteos.tsx, basta mover para Edge Function.

### 2. Alteracao no proteos.tsx

Antes (chamada direta):
```typescript
const res = await fetch('https://api.anthropic.com/v1/messages', {
  headers: { 'x-api-key': apiKey }
});
```

Depois (via Edge Function):
```typescript
const res = await supabase.functions.invoke('chat', {
  body: { messages: apiMessages }
});
```

### 3. Play Store — Checklist Pre-Submit

- [ ] Conta Google Play ativa
- [ ] Service Account key (JSON) para eas submit automatico
- [ ] App listing criado no Play Console
- [ ] Descricao curta + longa (ver PLAY_STORE_LISTING.md)
- [ ] Screenshots uploadados (min 2, recomendado 5-8)
- [ ] Privacy policy URL configurada
- [ ] Content rating preenchido
- [ ] AAB uploadado
- [ ] Track: internal testing primeiro, depois production

### 4. Supabase Edge Function — Acesso via Chrome MCP

Para editar/deployar a Edge Function:
1. Chrome MCP navega para supabase.com → projeto agebsmjsjrmazbozphnh
2. Menu lateral: Edge Functions
3. Selecionar funcao "chat"
4. Editar codigo inline ou via CLI (`supabase functions deploy chat`)
5. ANTHROPIC_API_KEY ja configurada como secret no Supabase
