# 🌍 COUNTRY MATRIX — MVP 13 Países (AquariOS)

**Criado:** 09/Jun/2026 (S32) · **Fonte dos países:** `mobile/lib/proteos-cultural-voice.ts` (vozes culturais aprovadas)
**Decisão base:** os **13 países do `founder_vision`** (não a versão reduzida de 10 em PT/EN/ES).
**Status:** rascunho para aprovação na **S33** (precisa das decisões do fundador marcadas com ⚠️).

---

## A matriz

| # | País | Locale | Idioma UI | Script / Direção | Moeda | Regime de privacidade | Pagamento |
|---|------|--------|-----------|------------------|-------|-----------------------|-----------|
| 1 | Brasil | `pt-BR` | Português (BR) | Latim / LTR | BRL | LGPD | Stripe ✅ |
| 2 | Estados Unidos | `en-US` | Inglês | Latim / LTR | USD | CCPA/CPRA | Stripe ✅ |
| 3 | Irã | `fa-IR` | Persa (Farsi) | Árabe / **RTL** | IRR | — | ⚠️ **Stripe ❌ (sanções OFAC)** |
| 4 | Israel | `he-IL` | Hebraico | Hebraico / **RTL** | ILS | PPL | Stripe ✅ |
| 5 | Venezuela | `es-VE` | Espanhol | Latim / LTR | VES | — | ⚠️ Stripe ❌ (cobertura limitada) |
| 6 | Portugal | `pt-PT` | Português (PT) | Latim / LTR | EUR | GDPR | Stripe ✅ |
| 7 | Tailândia | `th-TH` | Tailandês | Thai / LTR (sem espaços) | THB | PDPA | Stripe ✅ |
| 8 | Coreia do Sul | `ko-KR` | Coreano | Hangul / LTR | KRW | PIPA | Stripe ✅ |
| 9 | HK / Singapura | `zh-HK` | Chinês (Tradicional) | CJK / LTR | HKD / SGD | PDPO / PDPA | Stripe ✅ |
| 10 | Noruega | `nb-NO` | Norueguês (Bokmål) | Latim / LTR | NOK | GDPR (EEA) | Stripe ✅ |
| 11 | Nigéria | `en-NG` | Inglês | Latim / LTR | NGN | NDPA | ⚠️ Stripe ❌ (usar Paystack/Flutterwave) |
| 12 | Suíça | `de-CH` | Alemão (Suíço) | Latim / LTR | CHF | nFADP | Stripe ✅ |
| 13 | Peru | `es-PE` | Espanhol | Latim / LTR | PEN | Ley 29733 | Stripe ✅ |

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

## ⚠️ Decisões do fundador (gate da S33)

1. **Irã (`fa-IR`):** sanções OFAC podem inviabilizar pagamento e distribuição via infra US (Stripe / App Store / Play Store). **Manter, adiar ou trocar por outro país?**
2. **Pagamento onde Stripe não cobre:** Irã, Nigéria, Venezuela. Definir gateway alternativo (Paystack/Flutterwave p/ Nigéria) ou excluir esses mercados do MVP pago (deixar só plano free).
3. **Ordem de rollout:** sugerido começar pelos já-cobertos (PT/EN/ES = Brasil, EUA, Portugal, Venezuela, Nigéria, Peru) e abrir os de idioma novo conforme tradução fica pronta.
4. **Moeda de cobrança:** cobrar em moeda local ou padronizar em USD/EUR? (afeta PanaceIA/Stripe.)

---

*Documento-irmão: `ROADMAP_MVP_13_PAISES.md` (sequência S32→S37).*
