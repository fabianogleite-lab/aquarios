# Como iniciar a Sessão 1

## Pré-requisito: ✅ FEITO
- Supabase criado: https://agebsmjsjrmazbozphnh.supabase.co
- Credenciais salvas em mobile/.env

## Iniciar sessão

Cole no Claude Code (modelo: **Opus**):

```
Sessão 1 de 5 — AquariOS Phase 4.

ANTES DE TUDO: Leia estes arquivos na ordem:
1. mobile/docs/sessions/MASTER_PLAN.md
2. mobile/docs/sessions/SESSION_1_BRIEFING.md
3. MEMORY.md
4. mobile/.env (credenciais Supabase já configuradas)

CONTEXTO: AquariOS é um app React Native (Expo SDK 54) rodando com expo-router v6.
O app já funciona no celular via Expo Go com 4 tabs (Home, Chat, Diário, Config).
Splash screen com foto personalizada já implementada.
Supabase já criado e credenciais em .env.

TAREFA DESTA SESSÃO:
1. Configurar Supabase como backend (instalar SDK, criar client)
2. Criar schema do banco de dados no Supabase (SQL do briefing)
3. Implementar autenticação (login + registro) com Supabase Auth
4. Integrar auth no app (telas de login/registro + fluxo autenticado)
5. Testar login funcionando no celular via Expo Go

ENTREGA: App com login/registro real funcionando, dados no Supabase.

AO FINALIZAR: Criar mobile/docs/sessions/SESSION_1_COMPLETE.md com resumo do que foi feito, problemas, e estado dos arquivos. Commit com tag session-1-complete.
```
