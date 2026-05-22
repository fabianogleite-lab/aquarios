# AquariOS — Phase 4: App Completo
## Master Plan · 5 Sessões

---

## Visão Geral

| Sessão | Modelo | Foco | Entrega |
|--------|--------|------|---------|
| S1 | Opus | Backend + Auth | Supabase configurado, login/registro funcionando no app |
| S2 | Sonnet | ProteOS + Diário | Chat IA real (Claude Haiku) + Diário persistente |
| S3 | Sonnet | Nutrição + Comunidades + Wonder Night | 3 módulos completos com persistência |
| S4 | Sonnet | Polish + Build + Publish | UI final, AAB build, upload Play Store |
| S5 | Opus | Debug + Documentação | White Paper, Blueprint, README, Help, GitHub release |

---

## Stack Técnico

- **Frontend:** React Native / Expo SDK 54 / expo-router v6
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **IA:** Claude API (Haiku) via Anthropic SDK
- **State:** Zustand
- **Build:** EAS Build
- **Distribuição:** Google Play Store

---

## Protocolo de Continuidade

### Fechamento de Sessão (OBRIGATÓRIO)
1. Criar `SESSION_X_COMPLETE.md` com:
   - O que foi entregue
   - O que foi testado
   - Problemas encontrados e soluções
   - Estado exato dos arquivos modificados
2. Atualizar `MEMORY.md` com status
3. Commit com tag: `session-X-complete`

### Abertura de Sessão (OBRIGATÓRIO)
1. Ler `MASTER_PLAN.md`
2. Ler `SESSION_X-1_COMPLETE.md` (sessão anterior)
3. Ler `SESSION_X_BRIEFING.md` (briefing da sessão atual)
4. Confirmar que ambiente funciona (npm start)
5. Executar tarefas do briefing

---

## Regras de Qualidade

- Testar CADA feature antes de marcar como concluída
- Não avançar módulo se o anterior tem bug
- Código limpo, tipado (TypeScript), comentado em PT-BR
- Commits frequentes com mensagens descritivas
- Zero dependências desnecessárias
