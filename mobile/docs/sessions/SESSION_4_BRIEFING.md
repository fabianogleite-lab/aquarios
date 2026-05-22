# Sessão 4 — Polish + Build + Publicação
## Modelo: Sonnet | Estimativa: 1 sessão completa

---

## Prompt para iniciar

```
Sessão 4 de 5 — AquariOS Phase 4.

ANTES DE TUDO: Leia estes arquivos na ordem:
1. mobile/docs/sessions/MASTER_PLAN.md
2. mobile/docs/sessions/SESSION_3_COMPLETE.md
3. mobile/docs/sessions/SESSION_4_BRIEFING.md

CONTEXTO: Sessões 1-3 implementaram todos os módulos. App completo funcionando via Expo Go.

TAREFA DESTA SESSÃO:
1. Polish visual — consistência de cores, espaçamentos, tipografia
2. Animações de transição entre telas
3. Loading states e error handling em todas as telas
4. Offline handling (mensagem quando sem internet)
5. App icons e splash screen finais
6. Build AAB production com EAS Build
7. Upload para Google Play Console (se verification estiver pronta)
8. Testar build production no celular

ENTREGA: APK/AAB pronto para publicação, app polido visualmente.

AO FINALIZAR: Criar mobile/docs/sessions/SESSION_4_COMPLETE.md. Commit com tag session-4-complete.
```

---

## Detalhamento Técnico

### 1. Polish Visual

**Checklist de consistência:**
```
- [ ] Todas as telas usam backgroundColor: '#090c14'
- [ ] Cores do tema aplicadas uniformemente:
      - Primária: #b8952a (dourado)
      - Background: #090c14 (escuro)
      - Card: #0d1520
      - Border: #141c28
      - Texto primário: #ccd6e8
      - Texto secundário: #6a7a8a
      - Texto terciário: #3a4a5a
- [ ] Espaçamentos padronizados (8, 12, 16, 20, 24px)
- [ ] Font sizes padronizados (11, 12, 13, 14, 15, 16, 18, 24, 32)
- [ ] Todos os botões têm feedback visual (opacity/scale on press)
- [ ] Inputs têm focus state visível
- [ ] Scroll suave em todas as listas
```

**Criar arquivo de tema centralizado:**
```typescript
// lib/theme.ts
export const colors = {
  primary: '#b8952a',
  bg: '#090c14',
  card: '#0d1520',
  border: '#141c28',
  text: '#ccd6e8',
  textSecondary: '#6a7a8a',
  textMuted: '#3a4a5a',
  error: '#e74c3c',
  success: '#2ecc71',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
export const fontSize = { xs: 11, sm: 12, md: 14, lg: 16, xl: 18, xxl: 24, hero: 32 };
```

### 2. Animações

- Tabs: slide horizontal suave
- Cards: fade-in ao aparecer na lista
- Botões: scale(0.95) no press
- Loading: skeleton screens ao invés de spinners
- Splash → App: fade transition

### 3. Error Handling

Criar componente reutilizável:
```typescript
// components/ErrorBoundary.tsx
// components/LoadingState.tsx
// components/EmptyState.tsx
// components/OfflineNotice.tsx
```

Toda chamada ao Supabase deve ter try/catch com feedback visual.

### 4. Build Production

```bash
# Atualizar eas.json para production
# Build AAB
npx eas build --platform android --profile production

# Ou build APK para teste direto
npx eas build --platform android --profile preview
```

**eas.json atualizado:**
```json
{
  "cli": { "version": ">= 3.0.0" },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### 5. Checklist de Teste Final

- [ ] Todas as telas abrem sem erro
- [ ] Login → uso → logout → login: fluxo completo
- [ ] Dados persistem entre sessões
- [ ] App funciona com internet lenta (loading states)
- [ ] App mostra aviso sem internet
- [ ] Ícone aparece correto no launcher
- [ ] Splash screen carrega com foto
- [ ] Build production não crasha
- [ ] APK instala e roda no celular fora do Expo Go
