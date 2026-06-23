# AquariOS

> Sistema Operacional Pessoal

Plataforma mobile que integra inteligencia artificial, autoconhecimento e bem-estar. Combina um assistente IA conversacional, diario reflexivo, tracking nutricional, rede social de crescimento e rituais noturnos — tudo em um unico app.

---

## Funcionalidades

- **ProteOS** — Assistente IA pessoal com historico de conversas
- **Diario do Ser** — Reflexoes diarias com humor, tags e busca
- **Nutricao** — Dashboard com macros, metas e historico por refeicao
- **Comunidades** — Follow, feed de reflexoes, likes e notificacoes
- **Wonder Night** — Eventos ao vivo com countdown e ingressos
- **Auth** — Registro, login, logout com sessao persistente
- **Offline** — Deteccao automatica de conectividade

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Mobile | React Native 0.81 + Expo SDK 54 |
| Router | expo-router v6 (file-based) |
| State | Zustand |
| Backend | Supabase (PostgreSQL + Auth) |
| Build | EAS Build |
| Linguagem | TypeScript |

## Instalacao

```bash
# Clone
git clone https://github.com/fabianogleite/aquarios.git
cd aquarios/mobile

# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais Supabase

# Iniciar dev server
npx expo start
```

### Variaveis de Ambiente

Criar `mobile/.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

## Build

```bash
# APK para teste
eas build --platform android --profile preview

# AAB para Google Play
eas build --platform android --profile production
```

## Estrutura

```
mobile/
  app/
    (auth)/         # Login e registro
    (app)/          # 14 telas do app (tabs)
  components/       # 5 componentes reutilizaveis
  lib/
    supabase.ts     # Cliente Supabase
    theme.ts        # Design tokens
  store/
    auth.ts         # Zustand auth store
  docs/
    WHITE_PAPER.md  # Documento conceitual
    BLUEPRINT.md    # Arquitetura tecnica
    HELP.md         # Guia do usuario
```

## Documentacao

- [White Paper](mobile/docs/WHITE_PAPER.md) — Visao, modulos e modelo de negocio
- [Blueprint](mobile/docs/BLUEPRINT.md) — Arquitetura, schema, padroes de codigo
- [Guia do Usuario](mobile/docs/HELP.md) — Como usar cada funcionalidade

## Autor

**Fabiano Gomes Leite** — Arkhe Labs
Email: fabianogleite@hotmail.com

## Licenca

Propriedade intelectual de Fabiano Gomes Leite.
Todos os direitos reservados.
