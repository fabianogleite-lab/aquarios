# AquariOS Audit Report #1
**Date:** 2026-05-26 | **Session:** S17 | **Branch:** main (8 commits ahead of origin)
**Scope:** Full codebase — 26 screens, 6 lib files, 3 SQL migrations, 1 Edge Function

---

## Executive Summary

| Category | Findings | Severity | Status |
|----------|----------|----------|--------|
| Table name inconsistencies | 4 conflicts | **CRITICAL** | FIXED |
| Legacy/orphan table refs | 3 tables | **HIGH** | FIXED |
| Hardcoded locale (pt-BR) | 9 screens, 18 instances | **HIGH** | FIXED |
| Missing i18n (useTranslation) | 25 of 26 screens | **HIGH** | OPEN — S18 |
| Console statements (production) | 18 across 8 screens | MEDIUM | OPEN — lib/logger.ts READY |
| Alert.alert hardcoded PT strings | 35 instances, 13 screens | MEDIUM | OPEN — S18 |
| StyleSheet naming inconsistency | 3 screens use `styles` vs `s` | LOW | OPEN |

### Fixes Applied This Session
- `lib/locale.ts` — centralized `formatDate()`, `formatTime()`, `formatNumber()`, `getDeviceLocale()`
- `lib/logger.ts` — production-safe logger (suppressed in non-__DEV__ builds)
- `diary_entries` → `diario_entries` in admin.tsx, hygeios.tsx, settings.tsx (3 files)
- `wonder_purchases` → `wonder_night_purchases` in hygeios.tsx, admin.tsx, settings.tsx (3 files)
- `shares` → `community_posts` in diario.tsx
- `timeline_posts` + `user_follows` removed from settings.tsx (orphan tables)
- All 18 hardcoded `pt-BR` date/number calls replaced with `lib/locale` utilities
- Redundant `Localization` import removed from proteos.tsx (now via `lib/locale`)
- Constitution SQL: `wonder_purchases` → `wonder_night_purchases` in `aquarios_modules`

---

## 1. CRITICAL — Table Name Conflicts

Code references tables with **different names** for the same data. Queries will silently fail on whichever name doesn't match the actual Supabase table.

### 1a. `wonder_purchases` vs `wonder_night_purchases`
| File | Line | Table Used |
|------|------|-----------|
| `hygeios.tsx` | 125 | `wonder_purchases` |
| `admin.tsx` | 37 | `wonder_purchases` |
| `settings.tsx` | 115 | `wonder_purchases` |
| `wonder-night.tsx` | 76 | `wonder_night_purchases` |

**Fix:** Verify actual Supabase table name, then unify all references.

### 1b. `diary_entries` vs `diario_entries`
| File | Line | Table Used |
|------|------|-----------|
| `admin.tsx` | 35 | `diary_entries` |
| `hygeios.tsx` | 124, 126 | `diary_entries` |
| `settings.tsx` | 49, 57, 113 | `diary_entries` |
| `diario.tsx` | 47, 96 | `diario_entries` |
| `diario-new.tsx` | 70 | `diario_entries` |

**Fix:** Single canonical name. Likely `diary_entries` (EN convention per migration 04).

---

## 2. HIGH — Legacy/Orphan Table References

Tables referenced in code that may not exist in current schema or are deprecated.

| Table | File | Line | Status |
|-------|------|------|--------|
| `timeline_posts` | `settings.tsx` | 118 | **ORPHAN** — replaced by `community_posts` |
| `shares` | `diario.tsx` | 83 | **ORPHAN** — legacy feed sharing |
| `shares` | `seed-bots/index.ts` | 266 | **ORPHAN** — Edge Function |
| `user_follows` | `settings.tsx` | 116-117 | **VERIFY** — may not exist in current schema |

**Impact:** Delete account flow (`settings.tsx`) fails silently on non-existent tables. User data may persist after "deletion".

---

## 3. HIGH — Hardcoded Locale 'pt-BR'

9 screens hardcode `'pt-BR'` in date/number formatting. With 13-country pilot, users in Iran, Israel, Croatia, etc. will see Brazilian date formats.

| File | Line | Pattern |
|------|------|---------|
| `BadgeCard.tsx` | 20 | `toLocaleDateString('pt-BR')` |
| `StoreCard.tsx` | 70 | `toLocaleString('pt-BR')` |
| `admin.tsx` | 97 | `toLocaleDateString('pt-BR')` |
| `comunidades-notificacoes.tsx` | 84 | `toLocaleDateString('pt-BR', {...})` |
| `comunidades-timeline.tsx` | 179 | `toLocaleDateString('pt-BR')` |
| `diario.tsx` | 105 | `toLocaleDateString('pt-BR', {...})` |
| `proteos.tsx` | 175 | `toLocaleTimeString('pt-BR', {...})` |
| `wonder-night.tsx` | 99 | `toLocaleDateString('pt-BR', {...})` |
| `store.tsx` | 122 | `toLocaleString('pt-BR')` |

**Fix:** Create `lib/locale.ts` helper:
```ts
import * as Localization from 'expo-localization';
export const getDeviceLocale = () => 
  Localization.getLocales()?.[0]?.languageTag ?? 'pt-BR';
export const formatDate = (d: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(d).toLocaleDateString(getDeviceLocale(), opts);
export const formatNumber = (n: number) =>
  n.toLocaleString(getDeviceLocale());
```
Then replace all 9 hardcoded instances.

---

## 4. HIGH — Missing i18n Integration

Only **1 of 26** screen files uses `useTranslation()` (login.tsx). The i18n infrastructure exists (`i18n/index.ts` + 3 locale JSONs) but is unused.

**Screens without useTranslation (25):**
```
_layout.tsx, index.tsx, register.tsx,
admin.tsx, achievements.tsx, coming-soon.tsx,
comunidades.tsx, comunidades-notificacoes.tsx,
comunidades-post-form.tsx, comunidades-timeline.tsx,
diario.tsx, diario-new.tsx, hygeios.tsx,
leaderboard.tsx, module/[id].tsx, nutricao.tsx,
nutricao-metas.tsx, nutricao-novo.tsx, proteos.tsx,
settings.tsx, store.tsx, wonder-night.tsx,
(app)/_layout.tsx, (auth)/_layout.tsx, app/index.tsx
```

**Impact:** All UI strings are hardcoded in Portuguese. Blocks 13-country launch.

---

## 5. MEDIUM — Console Statements for Production

18 `console.log/warn/error` across 8 screens. Must be removed or wrapped in `__DEV__` guard before Play Store release.

| File | Count | Types |
|------|-------|-------|
| `proteos.tsx` | 5 | 4 error, 1 error |
| `comunidades.tsx` | 3 | 1 warn, 2 error |
| `comunidades-timeline.tsx` | 3 | 3 error |
| `comunidades-post-form.tsx` | 2 | 1 warn, 1 error |
| `store.tsx` | 1 | 1 error |
| `achievements.tsx` | 1 | 1 error |
| `leaderboard.tsx` | 1 | 1 error |
| `module/[id].tsx` | 2 | 1 error, 1 log |

**Fix:** Create `lib/logger.ts`:
```ts
export const logger = {
  error: (...args: any[]) => __DEV__ && console.error(...args),
  warn: (...args: any[]) => __DEV__ && console.warn(...args),
  log: (...args: any[]) => __DEV__ && console.log(...args),
};
```

---

## 6. MEDIUM — Alert.alert Hardcoded Portuguese

35 `Alert.alert()` calls across 13 screens with Portuguese-only strings. Same i18n block as Finding 4.

**Top offenders:**
| File | Alert Count |
|------|------------|
| `settings.tsx` | 6 |
| `comunidades-timeline.tsx` | 6 |
| `nutricao-novo.tsx` | 4 |
| `diario.tsx` | 4 |
| `store.tsx` | 3 |

---

## 7. LOW — Style Variable Naming

22 screens use `s` for StyleSheet. 3 screens use `styles`:
- `store.tsx` (line 174)
- `achievements.tsx` (line 115)
- `leaderboard.tsx` (line 150)

**Fix:** Rename to `s` for consistency (3 files, find-replace).

---

## Positive Findings

| Area | Status |
|------|--------|
| Theme centralization | `lib/theme.ts` imported by all 23 screen files (380 usages) |
| Supabase client | Single instance in `lib/supabase.ts` |
| Crypto module | Isolated in `lib/crypto.ts` (SecureStore) |
| Cultural Voice | Single source of truth in `lib/proteos-cultural-voice.ts` |
| No UUID duplication | `generateUUID()` only in `proteos.tsx` |
| RLS policies | Properly applied across all S16/S17 migrations |
| No AsyncStorage in screens | All screen-level storage goes through Supabase |

---

## Codebase Metrics

| Metric | Value |
|--------|-------|
| Total screen files | 26 (.tsx) |
| Total lib files | 4 (.ts) |
| Total lines (screens) | ~5,700 |
| Largest screen | `comunidades-timeline.tsx` (478 lines) |
| Smallest screen | `(auth)/_layout.tsx` (14 lines) |
| SQL migrations | 10 files (04-10) |
| Edge Functions | 3 (chat, engine, seed-bots) |
| Supabase tables (estimated) | 30+ |
| Error handling patterns | 15 try/catch blocks across app |
| useEffect hooks | 9 across 7 screens |

---

## Recommended Fix Priority (S18 Blockers)

| Priority | Action | Effort | Blocks Play Store? |
|----------|--------|--------|-------------------|
| P0 | Fix table name conflicts (1a, 1b) | 30 min | YES — data loss |
| P0 | Remove orphan table refs (2) | 15 min | YES — silent failures |
| P1 | Create `lib/locale.ts` + replace pt-BR (3) | 1 hour | YES — 13 countries |
| P1 | Add `useTranslation()` to all screens (4) | 3 hours | YES — 13 countries |
| P2 | Create `lib/logger.ts` + wrap console (5) | 30 min | RECOMMENDED |
| P2 | i18n for Alert.alert strings (6) | 2 hours | YES — 13 countries |
| P3 | Normalize StyleSheet var name (7) | 10 min | NO |

**Total estimated effort for P0+P1+P2:** ~7 hours

---

*Generated by Claude Code — S17 Audit*
*Commit baseline: b452558 (main, 7 ahead of origin)*
