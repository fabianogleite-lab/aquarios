# 🌍 COUNTRY MATRIX — MVP 13 Países (AquariOS)

**Criado:** 09/Jun/2026 (S32) · **Fonte dos países:** `mobile/lib/proteos-cultural-voice.ts` (vozes culturais aprovadas)
**Decisão base:** os **13 países do `founder_vision`** (não a versão reduzida de 10 em PT/EN/ES).
**Status:** ✅ **APROVADO — S33 (10/Jun/2026).** Fundador aprovou os 4 gates (aprovação antecipada na abertura da S33). Decisões aplicadas em §Decisões.

---

## A matriz

| # | País | Locale | Idioma UI | Script / Direção | Moeda | Regime de privacidade | Pagamento | Onda |
|---|------|--------|-----------|------------------|-------|-----------------------|-----------|------|
| 1 | Brasil | `pt-BR` | Português (BR) | Latim / LTR | BRL | LGPD | Stripe ✅ | **1** |
| 2 | Estados Unidos | `en-US` | Inglês | Latim / LTR | USD | CCPA/CPRA | Stripe ✅ | **1** |
| 3 | Irã | `fa-IR` | Persa (Farsi) | Árabe / **RTL** | IRR | — | **Stripe ❌ (sanções OFAC)** → free tier, se lançar | **4** ⏸️ condicionado a parecer OFAC |
| 4 | Israel | `he-IL` | Hebraico | Hebraico / **RTL** | ILS | PPL | Stripe ✅ | **4** |
| 5 | Venezuela | `es-VE` | Espanhol | Latim / LTR | VES | — | Stripe ❌ → **free tier no MVP** | **1** (só free) |
| 6 | Portugal | `pt-PT` | Português (PT) | Latim / LTR | EUR | GDPR | Stripe ✅ | **1** |
| 7 | Tailândia | `th-TH` | Tailandês | Thai / LTR (sem espaços) | THB | PDPA | Stripe ✅ | **3** |
| 8 | Coreia do Sul | `ko-KR` | Coreano | Hangul / LTR | KRW | PIPA | Stripe ✅ | **3** |
| 9 | HK / Singapura | `zh-HK` | Chinês (Tradicional) | CJK / LTR | HKD / SGD | PDPO / PDPA | Stripe ✅ | **3** |
| 10 | Noruega | `nb-NO` | Norueguês (Bokmål) | Latim / LTR | NOK | GDPR (EEA) | Stripe ✅ | **2** |
| 11 | Nigéria | `en-NG` | Inglês | Latim / LTR | NGN | NDPA | Stripe ❌ → **Paystack** | **1** |
| 12 | Suíça | `de-CH` | Alemão (Suíço) | Latim / LTR | CHF | nFADP | Stripe ✅ | **2** |
| 13 | Peru | `es-PE` | Espanhol | Latim / LTR | PEN | Ley 29733 | Stripe ✅ | **1** |

---

## Leitura rápida (o que a matriz revela)

### Idiomas de UI distintos: **10** (temos 3 → faltam **7**)
- ✅ Já em `mobile/i18n/locales/`: **Português, Inglês, Espanhol** (cobre 6 dos 13 países).
- ❌ Faltam: **Persa (`fa`), Hebraico (`he`), Tailandês (`th`), Coreano (`ko`), Chinês Tradicional (`zh-Hant`), Norueguês (`nb`), Alemão (`de`)**.
- Variantes a tratar dentro de idiomas existentes: pt-PT (≠ pt-BR), en-NG, es-VE/es-PE.

### RTL (direita-p/-esquerda): **2** — `fa-IR`, `he-IL`
- `mobile/i18n/rtl.ts` já existe (scaffold) — falta **aplicar + QA de layout espelhado** (ícones, navegação, alinhamentos).

### Scripts complexos: **3** — Thai, Hangul, CJK
- Exigem **fontes embarcadas** e regras de quebra de linha próprias (tailandês não usa espaços entre palavras).

### Voz (ElevenLabs)
- STT hoje com `language_code` **fixo em `'pt'`** → vira bug fora do PT. Tornar dinâmico por locale na S34.

---

## ✅ Decisões do fundador — APROVADAS (S33 · 10/Jun/2026)

1. **Irã (`fa-IR`): ADIADO** — permanece na visão dos 13 (`founder_vision` intacto), mas fora do caminho crítico do MVP. Vai para a **Onda 4, condicionado a parecer OFAC** (sanções bloqueiam hoje pagamento E distribuição via infra US — Stripe / App Store / Play Store). **Nenhum investimento em farsi (`fa`) antes desse parecer.**
2. **Pagamento onde Stripe não cobre:** Nigéria → **Paystack** (Flutterwave como reserva). Venezuela → **só free tier no MVP** (sem gateway viável; revisitar pós-MVP). Irã → segue a decisão 1 (free tier se/quando lançar).
3. **Ordem de rollout: 4 ondas aprovadas** — Onda 1 = já-cobertos PT/EN/ES (Brasil, Portugal, EUA, Nigéria, Peru, Venezuela-free); Onda 2 = `nb`/`de`; Onda 3 = `ko`/`th`/`zh-Hant`; Onda 4 = `he` + `fa` (condicionado). Regra: **idioma pronto → país abre** (coluna "Onda" na matriz).
4. **Moeda de cobrança: local-first** — cobrar em moeda local onde o gateway liquida (BRL/USD/EUR/PEN via Stripe multi-currency; NGN via Paystack); **USD como fallback** onde não houver Price local configurado. Implementação na PanaceIA/Stripe (1 Product, N Prices por moeda).

---

*Documento-irmão: `ROADMAP_MVP_13_PAISES.md` (sequência S32→S37).*
