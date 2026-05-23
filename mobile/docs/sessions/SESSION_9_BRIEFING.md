# Sessao 9 — Teste Completo + Play Store + Build

## Modelo: Opus | Estimativa: 1 sessao

---

## Contexto

Phase 4 teve 8 sessoes (S1-S8):
- S1: Backend Supabase + Auth
- S2: ProteOS Chat + Diario CRUD
- S3: Nutricao + Comunidades + Wonder Night
- S4: Polish visual, tema, animacoes, build config
- S5: Debug, documentacao, GitHub push + tag v4.2.0
- S6: Bug fixes, ProteOS IA real (Claude Haiku 4.5), limpeza repo, release v4.3.0
- S7: SDK 56 upgrade, APK + AAB builds SUCESSO, Privacy Policy LGPD, Play Store listing
- S8: Seguranca (Edge Function), HygeiOS IVI, coming-soon modules, LGPD Settings

O app tem 20 telas, API key segura via Edge Function, IVI funcional, LGPD compliance.
O que falta: testar no celular, corrigir bugs, publicar no Play Store.

---

## Prompt para iniciar

```
Sessao 9 — AquariOS: Teste Completo + Play Store.

ANTES DE TUDO: Leia estes arquivos na ordem:
1. mobile/docs/sessions/MASTER_PLAN.md
2. mobile/docs/sessions/SESSION_8_COMPLETE.md
3. mobile/docs/sessions/SESSION_9_BRIEFING.md

REPO: https://github.com/fabianogleite-lab/aquarios
TAG ATUAL: v4.3.0 | ULTIMO COMMIT: (ver git log)

TOOLS DISPONIVEIS:
- Supabase CLI: v2.101.0 (linkado, access token aquarios-cli expira 21/06/2026)
  - Para usar: $env:SUPABASE_ACCESS_TOKEN = "SEU_TOKEN_AQUI"
  - Projeto: agebsmjsjrmazbozphnh
- gh CLI: "C:\Program Files\GitHub CLI\gh.exe" (autenticado como fabianogleite-lab)
- Chrome MCP: acessa supabase.com (github.com bloqueado na extensao)
- EAS CLI configurado (conta: @aquarios)
- Expo Go no celular do usuario

EDGE FUNCTION DEPLOYADA:
- Nome: chat
- Auth: valida sessao Supabase (401 sem auth)
- Rate limit: 50 msgs/dia por usuario
- Proxy: api.anthropic.com com ANTHROPIC_API_KEY dos secrets
- Modelo: claude-haiku-4-5-20251001

CREDENCIAIS DE TESTE:
- Email: fabianogleite@gmail.com
- Supabase project ID: agebsmjsjrmazbozphnh
- Credenciais em mobile/.env

TAREFA DESTA SESSAO (nesta ordem):

1. TESTAR APP COMPLETO
   - Usuario roda Expo Go ou instala APK
   - Testar TODOS os fluxos:
     a. Login/Register
     b. Home: verificar cards ativos + cards "Em Breve"
     c. ProteOS: chat via Edge Function (deve funcionar sem API key local)
     d. HygeiOS: IVI com scores Bio/Mental/Spirit
     e. Diario: criar/editar/deletar entradas
     f. Nutricao: registrar refeicoes, ver metas
     g. Comunidades: buscar/seguir usuarios
     h. Wonder Night: ver eventos
     i. Coming-soon: tocar SandeirOS, AsclepiOS, etc.
     j. Settings: exportar dados, badge plano, versao correta
     k. Settings: NAO testar excluir conta (irreversivel)
   - Registrar e corrigir bugs encontrados

2. CORRECOES (se necessario)
   - Fix bugs encontrados no teste
   - Se Edge Function der problema: verificar logs no Supabase dashboard
   - Se IVI nao calcular: verificar se tabelas existem no Supabase

3. PLAY STORE (se conta ativa)
   - Verificar se conta Google Play esta ativa
   - Criar app listing no Play Console
   - Upload screenshots reais do celular
   - Privacy policy: https://fabianogleite-lab.github.io/aquarios/privacy-policy.html
   - Upload AAB ou usar eas submit

4. NOVO BUILD (se houve mudancas)
   - Bump versionCode para 44
   - eas build --platform android --profile preview (APK)
   - eas build --platform android --profile production (AAB)

5. RELEASE + FECHAMENTO
   - Commit + push + tag
   - SESSION_9_COMPLETE.md
   - Atualizar MEMORY.md

ENTREGA: App testado no celular + bugs corrigidos + publicado no Play Store.
```

---

## Detalhamento Tecnico

### 1. Expo Go — Como rodar

```bash
cd mobile
npx expo start
```
Escanear QR code com Expo Go no celular.

### 2. Edge Function — Verificar logs

Via Chrome MCP:
- Navegar para https://supabase.com/dashboard/project/agebsmjsjrmazbozphnh/functions
- Selecionar funcao "chat"
- Aba "Logs" para ver chamadas

Ou via CLI:
```bash
$env:SUPABASE_ACCESS_TOKEN = "SEU_TOKEN_AQUI"
supabase functions logs chat
```

### 3. Play Store — Checklist

- [ ] Conta Google Play ativa
- [ ] App listing criado
- [ ] Descricoes (ver mobile/docs/PLAY_STORE_LISTING.md)
- [ ] Screenshots reais uploadados
- [ ] Privacy policy URL configurada
- [ ] Content rating preenchido
- [ ] AAB uploadado
- [ ] Track: internal testing primeiro

### 4. Tabelas Supabase existentes

- profiles, user_follows
- chat_messages
- diary_entries
- meals, nutrition_goals
- wonder_events, wonder_purchases
- timeline_posts, post_likes, notifications
