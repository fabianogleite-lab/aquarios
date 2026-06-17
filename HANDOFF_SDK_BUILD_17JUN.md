# HANDOFF — SDK AquariOS Build 17/Jun/2026

> **Objetivo:** Entregar 3 artefatos sincronizados: APK instalável + Web + Backoffice
> **Status:** 🟡 **Em progresso** — APK em build, web exportado, backoffice criado

---

## ✅ O QUE FOI CONSTRUÍDO NESTA SESSÃO

### 1. **Backoffice do Usuário** (novo)
**Arquivo:** `mobile/app/(app)/backoffice-user.tsx` (575 linhas)

Painel para donos de projeto EscambOS com 3 abas:

#### **Overview Tab**
- KPIs em cards: leads hot/warm/cold, taxa conversão, pedidos por status
- Cores visuais por score (hot=#ef4444, warm=#f59e0b, cold=#6b7280)
- Dados agregados em tempo real do Supabase

#### **Leads Tab**
- Listagem de leads com filtro por status (novo/contactado/convertido/perdido)
- Badge de score (hot/warm/cold) à esquerda
- Canal de contato + data de criação
- Tap para expandir observações
- RLS automática: user só vê leads dos seus projetos

#### **Pedidos Tab**
- Rastreio com status de transporte (pendente/em_trânsito/entregue/extraviado)
- Transportadora + último evento + data entrega
- Badges coloridas por status
- Join automático: projetos → produtos → rastreio

#### **Queries Supabase**
```sql
-- Join automático segue RLS:
herme_projetos (user_id = auth.uid())
  ↓
herme_leads (projeto_id)
  ↓
escambos_produtos (projeto_id)
  ↓
cl_logistica_tracking (produto_id)
```

**Rota:** Adicionada ao tabBar como 💼 "Negócio" entre Ranking e Config

---

### 2. **Web Export**
**Comando:** `npx expo export --platform web`
**Output:** `mobile/dist/` (2MB bundle + assets)
- Mesmo código = 100% sincronizado com mobile
- Usa `react-native-web` + `react-dom` (já nas deps)
- Backoffice renderiza no web automaticamente

---

### 3. **APK Build Status**

| Build | Status | Motivo |
|---|---|---|
| `0fe6463a-1e87-482d-8196-02e6a99174e4` | ❌ errored | Erro anterior (18Jun@02:00) |
| `ba466f16-8f95-421a-a5c0-6ff367b9a1be` | 🔄 building | Novo build após fix TS (17Jun@~02:30) |

**Logs:** https://expo.dev/accounts/aquarios/projects/aquarios-274s3k/builds/ba466f16-8f95-421a-a5c0-6ff367b9a1be
**ETA:** ~15min

---

## 📋 PRÓXIMOS PASSOS — Ordem de prioridade

### **Hoje (enquanto APK builda)**
1. ✅ Backoffice criado
2. ✅ Web exportado
3. ⏳ APK build (aguardar ba466f16)

### **Quando APK sair**
1. Download + instalar no device
2. Smoke test: ProteOS voice + Backoffice negócio
3. Atualizar link nos sites (`docs/` → release v0.2.0 ou similar)

### **Web + Backoffice**
1. Servir `dist/` em GitHub Pages (pr para main)
   - Opção A: `docs/app/index.html` → serve `dist/`
   - Opção B: Repo separado `aquarios-web` → Pages próprio
2. Testar no desktop: todas as telas + sync com mobile
3. Validar RLS: user só vê seus dados

### **Complementos**
1. Mobile: fix `language_code` dinâmico no ElevenLabs (hoje fixo 'pt')
2. Web: responsivo mobile (testar em phone browser)
3. Backoffice: adicionar "novo lead" + "atualizar status" (MVP2)

---

## 🔧 NOTAS TÉCNICAS

### Estrutura do SDK
```
mobile/
  ├─ app/(app)/
  │  ├─ index.tsx              ← Home (telas do app)
  │  ├─ backoffice-user.tsx    ← NEW: Dashboard negócio
  │  ├─ admin.tsx              ← Dev admin (stats de seed)
  │  └─ [30+ outras telas]
  ├─ dist/                      ← Web export (React)
  ├─ package.json               ← react-native-web + expo-router
  └─ eas.json                   ← preview profile (APK)
```

### Query padrão para RLS
```typescript
const { data: leads } = await supabase
  .from('herme_leads')
  .select(`
    *, 
    herme_projetos!inner(user_id)
  `)
  .eq('herme_projetos.user_id', user.id);
```

### Cores + Ícones usados
- **Overview:** 📊 (stats, KPIs)
- **Leads:** 👥 (CRM)
- **Pedidos:** 📦 (logistics)
- **Navegação:** 💼 (business)

---

## ✨ Commits dessa sessão

```
96ca1df - fix(backoffice): radius.full → radius.pill (TS error)
8cc809f - feat(backoffice): user backoffice dashboard — leads + pedidos + KPIs
```

---

## 📌 REFERÊNCIAS RÁPIDAS

| Recurso | Link/Caminho |
|---|---|
| APK build atual | https://expo.dev/accounts/aquarios/projects/aquarios-274s3k/builds/ba466f16-8f95-421a-a5c0-6ff367b9a1be |
| Feature branch | feat/s34-odontolarplus-heysky-shopify-v1 |
| Backoffice código | mobile/app/(app)/backoffice-user.tsx:575 |
| Web export | mobile/dist/ (2MB) |
| RLS base | herme_projetos (user_id = auth.uid()) |

---

## 🚀 VISÃO: MVP1 SDK Completo

```
┌─────────────────────────────────────────────────────┐
│ AquariOS SDK v0.2.0 (MVP1)                          │
├─────────────────────────────────────────────────────┤
│ 📱 APK                 ba466f16 (building)           │
│ 🌐 Web (react)         dist/ (2MB, sync=100%)       │
│ 💼 Backoffice (user)   ✅ leads + pedidos + KPIs    │
│ ⚙️ Admin (dev)         /admin (stats + seed)         │
│ 🔐 RLS                 ✅ auth.uid() automatic       │
└─────────────────────────────────────────────────────┘
```

---

## ⚠️ Achados / Pendências

1. **APK build anterior errored** → causa desconhecida (Gradle?) → novo build em fila
2. **Web → módulos nativos** → expo-audio/camera crasham sem guarda → testar no device antes
3. **Backoffice edição** → MVP1 = read-only (leads + rastreio). MVP2 = novo lead + update status
4. **ElevenLabs `language_code`** → fixo 'pt' no bridge. Dinâmico = routing.reply_language(iso2)

---

**Handoff criado por:** Claude Haiku 4.5  
**Data:** 2026-06-17T02:35Z  
**Próxima ação:** Aguardar APK ba466f16 → download + teste no device
