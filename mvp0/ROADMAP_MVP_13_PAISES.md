# 🗺️ ROADMAP MVP Multi-País — 13 Países (AquariOS)

**Criado:** 09/Jun/2026 (S32) · **Decisão base:** os **13 países do `founder_vision`** (não a versão reduzida de 10 em PT/EN/ES).
**Documento-irmão:** `COUNTRY_MATRIX.md` (os 13 × idioma × script × moeda × privacidade × pagamento).

---

## Princípio

A **casca do app está pronta**. Os dois bloqueios reais para multi-país são:
1. **Localização** — UI em 10 idiomas (hoje 3).
2. **Infra** — 1 VM Oracle de 1 GB (≈498 MB úteis, já em swap) **não serve** 13 países.

Compliance e lojas vêm logo atrás. Cada fase abaixo = **1 handoff/sessão**.

---

## Sequência

### ✅ S32 — Saneamento *(concluído)*
- 🔐 Chave ElevenLabs removida de handoff + `memory/` no `.gitignore`; memória consolidada.
- Versão unificada `V1.0512 → V2.0604` (UI); bloco i18n morto `hygeios.dimensions` removido.
- Branches stale arquivadas como tags + remoto limpo.
- **Commits:** `d4aa88b` (saneamento) + cherry-pick `settings.json`.

### ✅ S33 — Definir a matriz dos 13 *(concluído 10/Jun/2026)*
- `COUNTRY_MATRIX.md` **APROVADO** — os 4 gates decididos pelo fundador:
  1. **Irã adiado** — Onda 4, condicionado a parecer OFAC; nenhum investimento em farsi antes.
  2. **Pagamento:** Nigéria → Paystack; Venezuela → free tier no MVP; Irã segue o item 1.
  3. **Rollout em 4 ondas** (Onda 1 = 6 países PT/EN/ES) — ver §Ordem de rollout.
  4. **Moeda local-first** (local onde o gateway liquida; USD fallback).
- S34 e S35 desbloqueadas (escopo fechado; ordem de idiomas da S34 = ordem das ondas).

### 🔤 S34 — Localização *(caminho crítico — semanas/meses)*
- Traduzir UI: **+7 idiomas** (`fa, he, th, ko, zh-Hant, nb, de`) além de pt/en/es.
- **RTL** (`fa`, `he`): aplicar `mobile/i18n/rtl.ts` + QA de layout espelhado.
- **Fontes** CJK/Thai embarcadas + regras de quebra de linha.
- STT/TTS `language_code` **dinâmico por locale** (hoje fixo `'pt'`).
- Formatação por locale (data/número/moeda) + variantes (pt-PT, en-NG, es-PE).
- **QA por idioma** (idealmente revisor nativo).
- **Esforço:** o item mais longo do roadmap. Pode ser faseado por idioma (ver ordem de rollout).

### 🖥️ S35 — Infra para escala *(urgente — pode correr em paralelo à S34)*
- Migrar motor iVi/FastAPI para **GCP Cloud Run** (Always Free, serverless, escala automática) — desbloqueia o gargalo da VM de 1 GB.
- nginx failover Oracle ↔ GCP; monitoramento (Uptime Kuma/Grafana).
- **Plano detalhado já existe:** `session30_handoff.md` → §FASE 9, etapas 9.1–9.5 (estimativa 6–9 h).
- **Esforço:** ~1 sessão dedicada.

### ⚖️ S36 — Compliance & lojas
- Políticas/ToS **localizadas por regime**: GDPR (PT/NO), LGPD (BR), CCPA/CPRA (US), PDPA (TH/SG), PIPA (KR), PDPO (HK), nFADP (CH), NDPA (NG), PPL (IL), Ley 29733 (PE).
- Cobertura de pagamento por país (alternativas onde Stripe não atende).
- Listings Play Store + App Store + **classificação etária** por país; metadados localizados.
- **Esforço:** ~1 sessão (+ tempo de revisão jurídica externa).

### 🚀 S37 — Launch readiness
- Teste de carga, monitoramento ativo, **beta em 1–2 países** → abrir os 13 de forma escalonada.
- Go/No-Go por país conforme tradução + compliance + pagamento prontos.

---

## Riscos transversais (decidir cedo)

| Risco | Detalhe | Ação |
|-------|---------|------|
| 🇮🇷 **Sanções (Irã)** | OFAC pode bloquear Stripe / App Store / Play Store p/ `fa-IR` | ✅ S33: **adiado** p/ Onda 4, gate = parecer OFAC |
| 💳 **Pagamento** | Stripe não cobre Irã, Nigéria, Venezuela direto | ✅ S33: Paystack (NG); free tier (VE, IR) |
| 🔤 **Localização** | 7 idiomas novos + 2 RTL + 3 scripts complexos | Faseado por idioma; QA nativo |
| 🖥️ **Infra** | 1 VM de 1 GB não escala p/ 13 países | GCP Cloud Run **antes** de qualquer tração real |

---

## Ordem de rollout — ✅ APROVADA na S33 (mitiga o gargalo de tradução)

1. **Onda 1 — já cobertos (PT/EN/ES):** Brasil, Portugal, EUA, Nigéria, Peru, Venezuela* (*ver pagamento).
2. **Onda 2 — idiomas latinos novos:** Noruega (`nb`), Suíça (`de`).
3. **Onda 3 — scripts complexos:** Coreia (`ko`), Tailândia (`th`), HK/Singapura (`zh-Hant`).
4. **Onda 4 — RTL:** Israel (`he`), Irã (`fa`)* (*se sanções permitirem).

---

*S32 (09/Jun/2026) · S33 (10/Jun/2026): `COUNTRY_MATRIX.md` aprovado. Próximo: S34 — localização (começar por `nb`/`de`, ordem das ondas).*
