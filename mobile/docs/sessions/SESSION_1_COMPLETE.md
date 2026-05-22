# Sessão 1 — Backend + Autenticação
## Status: COMPLETA (pendente teste de registro no celular)
## Data: 22/05/2026

---

## O que foi entregue

### 1. Supabase SDK integrado
- `@supabase/supabase-js` instalado
- `@react-native-async-storage/async-storage` para persistência de sessão
- Client configurado em `lib/supabase.ts`

### 2. Schema do Banco de Dados (7 tabelas)
- `profiles` — perfil do usuário (extends auth.users)
- `diario_entries` — Diário do Ser
- `chat_messages` — Chat ProteOS
- `nutrition_logs` — Nutrição
- `communities` — Comunidades
- `community_members` — Membros de comunidades
- `wonder_night_logs` — Wonder Night
- **RLS ativado** em todas as tabelas pessoais
- **Policies** criadas (user só vê seus dados)
- **Trigger** `on_auth_user_created` cria profile automaticamente

### 3. Autenticação implementada
- `store/auth.ts` — Zustand store com signUp, signIn, signOut, initialize
- `app/(auth)/login.tsx` — Tela de login com branding AquariOS
- `app/(auth)/register.tsx` — Tela de registro com validação
- `app/(auth)/_layout.tsx` — Stack layout para auth

### 4. Rotas reestruturadas (expo-router groups)
- `app/_layout.tsx` — Root layout com splash + auth redirect
- `app/index.tsx` — Entry redirect (auth → login, session → app)
- `app/(app)/_layout.tsx` — Tabs layout (Home, Chat, Diário, Config)
- `app/(app)/index.tsx` — Home com saudação personalizada
- `app/(app)/settings.tsx` — Config com dados reais + botão logout

### 5. Configuração Supabase Dashboard
- Email Auth habilitado
- "Confirm email" desativado (para facilitar testes)
- SQL executado via Management API

---

## Estrutura de Arquivos Criados/Modificados

```
mobile/
├── index.js                     [NOVO] Entry point explícito
├── lib/
│   └── supabase.ts              [NOVO] Client Supabase
├── store/
│   └── auth.ts                  [NOVO] Zustand auth store
├── supabase/
│   └── schema.sql               [NOVO] Schema completo para referência
├── app/
│   ├── _layout.tsx              [MODIFICADO] Root com splash + auth check
│   ├── index.tsx                [MODIFICADO] Redirect entry
│   ├── (auth)/
│   │   ├── _layout.tsx          [NOVO] Stack layout
│   │   ├── login.tsx            [NOVO] Tela de login
│   │   └── register.tsx         [NOVO] Tela de registro
│   ├── (app)/
│   │   ├── _layout.tsx          [NOVO] Tabs layout
│   │   ├── index.tsx            [MOVIDO] Home + saudação
│   │   ├── proteos.tsx          [MOVIDO] Chat
│   │   ├── diario.tsx           [MOVIDO] Diário
│   │   └── settings.tsx         [MOVIDO] Config + logout real
```

---

## Problemas Encontrados e Soluções

1. **Supabase SQL Editor crashava** ao clicar "Run and enable RLS"
   - Causa: conflito extensão Chrome com DOM do Supabase
   - Solução: executar SQL via Management API (fetch com access token)

2. **Metro não resolvia entry point** ("Unable to resolve ./index")
   - Causa: `package.json` main field `expo-router/entry` não estava sendo respeitado
   - Solução: criar `index.js` explícito na raiz com `import 'expo-router/entry'`

3. **Ngrok tunnel falhava** ("Cannot read properties of undefined reading 'body'")
   - Causa: problema temporário no serviço ngrok
   - Solução: usar modo `--lan` (celular e PC na mesma rede WiFi)

---

## Estado para Teste

- App abre no celular via Expo Go (LAN mode)
- Tela de login aparece corretamente
- **PENDENTE**: testar registro + login + redirecionamento para tabs

### Checklist de Teste (para quando acordar)

- [ ] Registro com email/senha cria user no Supabase
- [ ] Login redireciona para app (tabs)
- [ ] Home mostra saudação com nome do usuário
- [ ] Logout redireciona para login
- [ ] Profile criado automaticamente no registro
- [ ] Token persiste (não pede login ao reabrir)

---

## Comando para iniciar o app

```bash
cd mobile && npx expo start --lan --clear
```

No Expo Go: `exp://192.168.0.160:8081`

---

## Próxima Sessão: S2 (Sonnet)
Foco: ProteOS Chat IA real (Claude Haiku) + Diário do Ser persistente
