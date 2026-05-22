# Sessão 1 — Backend + Autenticação
## Modelo: Opus | Estimativa: 1 sessão completa

---

## Prompt para iniciar

Cole isto no Claude Code:

```
Sessão 1 de 5 — AquariOS Phase 4.

ANTES DE TUDO: Leia estes arquivos na ordem:
1. mobile/docs/sessions/MASTER_PLAN.md
2. mobile/docs/sessions/SESSION_1_BRIEFING.md
3. MEMORY.md

CONTEXTO: AquariOS é um app React Native (Expo SDK 54) rodando com expo-router v6.
O app já funciona no celular via Expo Go com 4 tabs (Home, Chat, Diário, Config).
Splash screen com foto personalizada já implementada.

TAREFA DESTA SESSÃO:
1. Configurar Supabase como backend
2. Criar schema do banco de dados (users, diario_entries, chat_messages, nutrition_logs, communities)
3. Implementar autenticação (login + registro) com Supabase Auth
4. Integrar auth no app (telas de login/registro + fluxo autenticado)
5. Testar login funcionando no celular via Expo Go

ENTREGA: App com login/registro real funcionando, dados no Supabase.

AO FINALIZAR: Criar mobile/docs/sessions/SESSION_1_COMPLETE.md com resumo do que foi feito, problemas, e estado dos arquivos. Commit com tag session-1-complete.
```

---

## Detalhamento Técnico

### 1. Setup Supabase

O usuário precisará:
- Criar conta em supabase.com (grátis)
- Criar projeto "aquarios"
- Fornecer: `SUPABASE_URL` e `SUPABASE_ANON_KEY`

Criar arquivo `mobile/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
EXPO_PUBLIC_API_URL=https://xxx.supabase.co
```

Instalar: `npx expo install @supabase/supabase-js`

### 2. Schema do Banco (SQL para rodar no Supabase Dashboard)

```sql
-- Users profile (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Diário do Ser
CREATE TABLE public.diario_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat ProteOS
CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  conversation_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Nutrição
CREATE TABLE public.nutrition_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  description TEXT NOT NULL,
  calories INTEGER,
  protein REAL,
  carbs REAL,
  fat REAL,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- Comunidades
CREATE TABLE public.communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.community_members (
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);

-- Wonder Night
CREATE TABLE public.wonder_night_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ritual_type TEXT,
  reflection TEXT,
  duration_minutes INTEGER,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diario_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wonder_night_logs ENABLE ROW LEVEL SECURITY;

-- Policies: cada user só vê seus dados
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own diario" ON public.diario_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own chat" ON public.chat_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own nutrition" ON public.nutrition_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own wonder_night" ON public.wonder_night_logs FOR ALL USING (auth.uid() = user_id);

-- Communities são públicas para leitura
CREATE POLICY "Anyone can view communities" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Members can view memberships" ON public.community_members FOR SELECT USING (true);

-- Trigger: criar profile automaticamente quando user registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Estrutura de Arquivos a Criar

```
mobile/
├── lib/
│   └── supabase.ts          # Client Supabase
├── store/
│   ├── auth.ts              # Zustand auth store
│   └── user.ts              # Zustand user store
├── app/
│   ├── _layout.tsx          # Root layout (já existe, adicionar auth check)
│   ├── (auth)/
│   │   ├── _layout.tsx      # Auth layout
│   │   ├── login.tsx        # Tela de login
│   │   └── register.tsx     # Tela de registro
│   ├── (app)/
│   │   ├── _layout.tsx      # App layout (tabs, protegido)
│   │   ├── index.tsx        # Home/Dashboard
│   │   ├── proteos.tsx      # Chat
│   │   ├── diario.tsx       # Diário
│   │   └── settings.tsx     # Config
│   └── index.tsx            # Entry: redireciona para auth ou app
```

### 4. Checklist de Teste

- [ ] Registro com email/senha cria user no Supabase
- [ ] Login redireciona para app
- [ ] Logout redireciona para login
- [ ] Profile criado automaticamente no registro
- [ ] Token persiste (não pede login ao reabrir)
- [ ] RLS funciona (user só vê seus dados)
