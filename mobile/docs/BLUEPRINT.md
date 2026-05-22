# AquariOS - Blueprint Tecnico

**Versao:** 4.2.0 | **SDK:** Expo 54 | **RN:** 0.81.5

---

## Arquitetura

```
+------------------+
|   React Native   |
|   Expo SDK 54    |
+--------+---------+
         |
    expo-router v6
    (file-based routing)
         |
+--------+---------+
|     Zustand      |
|   (auth store)   |
+--------+---------+
         |
   Supabase JS SDK
         |
+--------+---------+
|    Supabase      |
|  - PostgreSQL    |
|  - Auth          |
|  - Realtime      |
|  - Storage       |
+------------------+
```

### Fluxo de Dados

```
Usuario -> Tela (React Native)
  -> Supabase SDK (REST API)
    -> PostgreSQL (com RLS)
      -> Resposta filtrada por user_id
    <- Dados retornam
  <- State atualizado (useState/Zustand)
<- UI re-renderiza
```

### Dependencias entre Modulos

```
Auth (Zustand store)
 |
 +-- ProteOS (chat_messages)
 +-- Diario (diario_entries, shares)
 +-- Nutricao (meals, nutrition_goals)
 +-- Comunidades (profiles, user_follows, likes, notifications)
 +-- Wonder Night (wonder_night_events, wonder_night_purchases)
```

Todos os modulos dependem do Auth store para `user.id`. Nenhum modulo depende de outro modulo diretamente.

---

## Stack Detalhado

| Camada | Pacote | Versao | Funcao |
|--------|--------|--------|--------|
| Runtime | react-native | 0.81.5 | Engine mobile |
| Framework | expo | 54.0.0 | Build, OTA updates |
| Router | expo-router | 6.0.23 | File-based routing |
| State | zustand | 4.5.0 | Auth state management |
| Backend | @supabase/supabase-js | 2.106.1 | PostgreSQL + Auth client |
| Storage | @react-native-async-storage/async-storage | 2.2.0 | Sessao persistente |
| Security | expo-secure-store | 15.0.8 | Secure token storage |
| Network | @react-native-community/netinfo | 11.4.1 | Deteccao offline |
| Splash | expo-splash-screen | 31.0.13 | Splash nativa |
| Navigation | react-native-screens | 4.16.0 | Navegacao nativa |
| Safe Area | react-native-safe-area-context | 5.6.0 | Insets de tela |
| Build | eas-cli | latest | Build na nuvem |
| TypeScript | typescript | 5.5.0 | Tipagem estatica |

### Build Tooling

| Ferramenta | Arquivo | Funcao |
|-----------|---------|--------|
| Babel | babel.config.js | Preset expo |
| Metro | metro.config.js | Resolver customizado (Supabase CJS fix para Hermes) |
| EAS | eas.json | Profiles: development, preview (APK), production (AAB) |
| TypeScript | tsconfig.json | Extends expo/tsconfig.base |

### Metro Resolver (Hermes Fix)

O Supabase JS v2 exporta ESM com `import()` dinamico, incompativel com o Hermes engine. O `metro.config.js` forca a resolucao para o bundle CJS:

```js
// metro.config.js
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@supabase/supabase-js') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/@supabase/supabase-js/dist/index.cjs'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};
```

---

## Schema do Banco (Supabase PostgreSQL)

### ERD

```
profiles
  id (uuid, PK, FK -> auth.users)
  username (text, unique)
  display_name (text)
  created_at (timestamptz)

chat_messages
  id (uuid, PK)
  conversation_id (text)
  user_id (uuid, FK -> auth.users)
  role (text: 'user' | 'assistant')
  content (text)
  created_at (timestamptz)

diario_entries
  id (uuid, PK)
  user_id (uuid, FK -> auth.users)
  content (text)
  mood (text)
  tags (text[])
  created_at (timestamptz)

meals
  id (uuid, PK)
  user_id (uuid, FK -> auth.users)
  name (text)
  calories (int)
  protein (numeric, nullable)
  carbs (numeric, nullable)
  fat (numeric, nullable)
  meal_type (text: 'breakfast' | 'lunch' | 'snack' | 'dinner')
  notes (text, nullable)
  created_at (timestamptz)

nutrition_goals
  user_id (uuid, PK, FK -> auth.users)
  daily_calories (int)
  daily_protein (int)
  daily_carbs (int)
  daily_fat (int)
  updated_at (timestamptz)

shares
  id (uuid, PK)
  user_id (uuid, FK -> auth.users)
  diario_id (uuid, FK -> diario_entries, nullable)
  content (text)
  is_public (boolean)
  created_at (timestamptz)

user_follows
  id (uuid, PK)
  follower_id (uuid, FK -> auth.users)
  following_id (uuid, FK -> auth.users)
  created_at (timestamptz)
  UNIQUE(follower_id, following_id)

likes
  id (uuid, PK)
  user_id (uuid, FK -> auth.users)
  share_id (uuid, FK -> shares)
  created_at (timestamptz)
  UNIQUE(user_id, share_id)

notifications
  id (uuid, PK)
  user_id (uuid, FK -> auth.users)
  from_user_id (uuid, FK -> auth.users)
  type (text: 'follow' | 'like' | 'comment')
  share_id (uuid, FK -> shares, nullable)
  is_read (boolean, default false)
  created_at (timestamptz)

wonder_night_events
  id (uuid, PK)
  title (text)
  description (text)
  event_date (timestamptz)
  join_url (text)
  price (numeric)
  is_active (boolean)
  created_at (timestamptz)

wonder_night_purchases
  id (uuid, PK)
  user_id (uuid, FK -> auth.users)
  event_id (uuid, FK -> wonder_night_events)
  ticket_code (text)
  created_at (timestamptz)
```

### RLS Policies

Todas as tabelas usam Row Level Security com a policy padrao:

```sql
-- Leitura: usuario ve seus proprios dados
CREATE POLICY "Users read own data" ON [table]
  FOR SELECT USING (auth.uid() = user_id);

-- Escrita: usuario insere seus proprios dados
CREATE POLICY "Users insert own data" ON [table]
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Excecoes:
-- shares: leitura publica quando is_public = true
-- profiles: leitura publica (para busca de usuarios)
-- wonder_night_events: leitura publica (para listar eventos)
```

---

## Estrutura de Diretorios

```
mobile/
  app/
    _layout.tsx          # Root layout (splash + auth guard + offline notice)
    index.tsx            # Entry redirect (auth check)
    (auth)/
      _layout.tsx        # Stack navigator (no header)
      login.tsx          # Login screen
      register.tsx       # Registration screen
    (app)/
      _layout.tsx        # Tab navigator (7 tabs visibles, 4 hidden)
      index.tsx          # Home screen (module cards)
      proteos.tsx        # ProteOS chat
      diario.tsx         # Diary list + search + delete
      diario-new.tsx     # New diary entry form
      nutricao.tsx       # Nutrition dashboard + meal list
      nutricao-novo.tsx  # New meal form
      nutricao-metas.tsx # Nutrition goals form
      comunidades.tsx    # User discovery + follow
      comunidades-timeline.tsx  # Feed (shared reflections)
      comunidades-notificacoes.tsx  # Notifications
      wonder-night.tsx   # Events + countdown + tickets
      settings.tsx       # Account, preferences, about, logout
  components/
    FadeInView.tsx       # Fade-in + slide-up animation wrapper
    PressableScale.tsx   # Press-to-scale animated button
    LoadingState.tsx     # Centered spinner + message
    EmptyState.tsx       # Icon + title + subtitle for empty lists
    OfflineNotice.tsx    # Red banner when offline (NetInfo)
  lib/
    supabase.ts          # Supabase client config
    theme.ts             # Design tokens (colors, spacing, fontSize, radius)
  store/
    auth.ts              # Zustand auth store (session, signIn, signUp, signOut)
  assets/
    splash-optimized.jpg # Splash photo
    icon.png             # App icon
    adaptive-icon.png    # Android adaptive icon
    favicon.png          # Web favicon
  docs/
    WHITE_PAPER.md       # Conceitual/business document
    BLUEPRINT.md         # This file
    HELP.md              # User guide
    sessions/            # Session documentation
  app.json               # Expo config
  eas.json               # EAS Build profiles
  babel.config.js        # Babel preset
  metro.config.js        # Metro resolver (Supabase CJS fix)
  tsconfig.json          # TypeScript config
  package.json           # Dependencies
  .env                   # Environment variables (not in git)
```

---

## Padroes de Codigo

### TypeScript Strict
- Todos os arquivos sao `.tsx` ou `.ts`
- Interfaces definidas para todas as entidades (Message, DiarioEntry, Meal, etc.)
- `as const` nos design tokens para type narrowing

### Componentes Funcionais
- Zero class components
- Hooks: `useState`, `useEffect`, `useCallback`, `useRef`, `useFocusEffect`
- Nenhum HOC ou render prop

### Zustand para State Global
- Unico store: `useAuthStore` (session, user, loading)
- State local para tudo mais (`useState` por tela)
- Sem Redux, sem Context API para dados

### Tema Centralizado
- `lib/theme.ts` exporta `colors`, `spacing`, `fontSize`, `radius`
- Zero cores hardcoded em qualquer tela
- Tokens tipados com `as const`

### Animacoes
- `FadeInView` com delay escalonado em listas
- `PressableScale` com spring animation em cards
- Splash screen com sequence animation
- Todas usam `useNativeDriver: true`

### Error Handling
- Supabase errors mostrados via `Alert.alert`
- Loading states em todas as operacoes async
- Empty states com componente padronizado
- Offline detection via NetInfo

---

## Deploy

### Variaveis de Ambiente

```
EXPO_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

### Build Pipeline

```bash
# APK para teste interno
eas build --platform android --profile preview

# AAB para Google Play Store
eas build --platform android --profile production
```

### EAS Build Profiles

| Profile | Distribuicao | Formato | Uso |
|---------|-------------|---------|-----|
| development | internal | APK | Dev com debug |
| preview | internal | APK | Teste interno |
| production | store | AAB | Google Play |

### Play Store Submission

```bash
eas submit --platform android --profile production
```

---

## Metricas do Bundle

- **Modules:** 1044
- **Bundle size:** 3.16 MB (Android HBC)
- **Build time:** ~5s (local export)
- **Dependencies:** 12 production, 5 dev
- **Telas:** 18 (14 visibles + 4 hidden tab routes)
- **Componentes:** 5 reutilizaveis
