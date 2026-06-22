# HANDOFF LINEAR — AquariOS MVP1 → Presença Global
**Gerado:** 15/Jun/2026 · **Aprovado pelo fundador:** 15/Jun/2026
**Repo:** `C:\Users\DWOS\Desktop\AquariOS\aquarios-v2-complete\`
**Substitui o paralelismo anterior por UMA linha de execução.** Todo item travado por terceiro vai para a Fase 5.

---

## 🔒 REGRA DE OURO
Escopo → APROVADO explícito → executa SÓ o aprovado → para e reporta.
Bloco pequeno. Novo APROVADO por bloco. Nunca encadear dois blocos sem parar.
Verificar antes de afirmar (arquivo existe → ler; migration aplicada → checar no banco).

---

## 🌍 A NOVIDADE QUE RESOLVE DOR
**Dor:** bem-estar é fragmentado — humor, água, sono, meditação em apps isolados. Ninguém integra **físico + mental + espiritual + social** num número único que a pessoa entende.
**Novidade:** o **iVi 4D** (`Físico×0.35 + Mental×0.30 + Espiritual×0.20 + Social×0.15`) + agentes de IA com **voz cultural** (ProteOS, 14 vozes). Não é "mais um app de saúde" — é um **Sistema Operacional de Vitalidade**.
**Global já começou:** 3 idiomas em paridade estrutural (pt-BR, en-US, es = 268 linhas cada). Cobre BR + US + PT + NG(en) + PE/VE(es). A presença mundial é trajetória, não salto.

---

## 📊 ESTADO REAL VERIFICADO (15/Jun)
- Branch `chore/s33-hygeios-agent-checkpoint` está **2 commits à frente de `origin/main`** (checkpoint S33: migration 31 GaiOS + IaC Azure + motor MKT). **Não está em main.**
- `legal/` tem **6 docs prontos** (inclui Ato DPO), todos **untracked / não publicados**.
- `docs/privacy-policy.html` **existe**; faltam **`terms.html`** (link morto, linha 836) e **`deletion.html`**.
- Formspree **placeholder vivo** (`docs/index.html` linha 681).
- i18n: `en-US` e `es` **não são stubs** — paridade com `pt-BR`.

---

## 🛣️ A LINHA ÚNICA (5 fases — cada elo destrava o próximo)

### FASE 0 · DECISÕES (fundador — 0 código)
| # | Decisão | Status |
|---|---|---|
| P1 | **d3 = Espiritual** | ✅ CONFIRMADO 15/Jun — libera Fase 4 |
| P2 | **TokenGate AUTOMÁTICO** (webhook Shopify→Supabase, ~6h) | ✅ DECIDIDO 15/Jun |
| P6 | **Preços** dos 3 planos | ✅ DEFAULT inicial 15/Jun (R$39,90 / 79,90 / 149,90); fundador finaliza valor/formato/benefício no **dashboard backoffice** (dashboard-driven) |

### FASE 1 · FUNDAÇÃO PUBLICÁVEL (~6,5h · risco baixo, sem dependência externa)
1. ✅ FEITO 15/Jun — Secrets: repo limpo (zero segredo rastreado/histórico); `.key`+recovery já fora do repo; `.gitignore` reforçado (`*recovery*`, `*token*.txt`).
2. `mobile/.env.production` (nunca commitar)
3. ✅ FEITO 15/Jun — `docs/terms.html` + `docs/deletion.html` criados (fonte `legal/`), footer atualizado, **publicados em `main` e no ar** (podiumtec.com.br, HTTP 200). Pendência: nome do DPO (em branco no Ato) + corrigir `privacy-policy.html` que ainda cita entidade errada "Arkhe".
4. Formspree → `mailto:contato@podiumtec.com.br` (ou Brevo API)
5. Seeds `aquarios_modules` (MVP1 ativo / MVP2 `coming_soon`) — app deixa de parecer morto
6. Lote legal no `main` + **merge da branch S33 → main** — ⏳ PARCIAL: páginas `docs/*.html` já publicadas (15/Jun); falta versionar os 6 docs `legal/*.md` e decidir o merge do checkpoint S33.
✅ **Resultado:** site legal no ar, app vivo, repo limpo, Meta desbloqueável.

### FASE 2 · RECEITA (~10h · o que financia o resto)
1. Planos Shopify/Mercado Pago (após definir preços)
2. Seção `#planos` em odontolarplus
3. TokenGate `subscription_tier` + **webhook Shopify→Supabase AUTOMÁTICO** (~6h)
4. `coming-soon.tsx` como gate visual dos módulos MVP2
✅ **Resultado:** AquariOS FATURA com liberação automática de acesso.

### FASE 3 · PRESENÇA GLOBAL MÍNIMA (a novidade global)
1. Completar `pt-BR.json` + auditar `en-US`/`es` (28 telas)
2. ElevenLabs "Lis" no painel (ação fundador)
3. APK beta v0.2.0 (com .env.production + seeds + i18n)
4. **Verificação Meta Business + Meta Agent fora do MOCK** — Meta Business Agent é **GRATUITO nesta fase → entra no MVP1** (correção 15/Jun)
✅ **Resultado:** app multi-idioma + loja + Meta = presente globalmente.

### FASE 4 · MÓDULOS VIA DADOS (depois de faturando · sem código novo)
1. Busca-substitui `d3_emocional → d3_espiritual` em cada migration P2
2. Aplicar 32 (AsclepiOS) / 36 (Comunidades) / 37 (HermeOS) / 38 (Saúde P0)
3. Seeds EcumenicOS (13 tradições) + AlexandriOS FAQ
✅ **Resultado:** AsclepiOS, HermeOS, Comunidades completos.

### FASE 5 · ROBUSTEZ + EXPANSÃO (só com usuários/receita · todo o 🔴)
WORM migration 31 · GaiOS · Sentry · multi-cloud GCP/Alibaba · Azure Fase 0 · i18n Waves 2-4 (nb/de/ko/th/zh/he/fa) · D6 Irã (gate OFAC) · PanaceIA Stripe/BYOK.

---

## 💎 TRILHA PARALELA · ALINHADORES (maior ticket — modo duplo)
> Produto de **alto ticket** (ortodontia invisível). Roda em paralelo às fases porque o canal real é repo separado (odontolarplus) e independe do ritmo do app.

### Modo REAL — `odontolarplus.com.br` (Odontolar Clínica Ltda)
- Funil visível e legítimo: landing → avaliação → orçamento → Mercado Pago/parcelamento.
- É o **canal principal de receita** do vertical clínico — prioridade comercial sobre os planos de app.
- Sem dependência das fases do AquariOS; pode andar assim que houver escopo aprovado.

### Modo OCULTO — AquariOS (ativar "na hora certa")
- Groundwork preparado, **não visível ao usuário** até decisão de ativação.
- Mecanismo: módulo em `aquarios_modules` com `is_active=false` + feature flag (ex.: `alinhadores_funnel`); cross-sell silencioso a partir de sinais AsclepiOS → encaminha para o funil real em odontolarplus.
- **Gate de ativação:** decisão explícita do fundador ("na hora certa") — tipicamente quando AquariOS tiver base de usuários e Odontolar com fluxo de produção rodando.
- ⚠️ Muro LGPD: dados de saúde (AquariOS/HygeiOS) ≠ funil comercial. Encaminhamento sem vazar PII clínica.

**Quando entra na linha:** o groundwork oculto encaixa no Fase 2 (estrutura de receita) / Fase 4 (módulo via dados); o canal real é independente e pode começar a qualquer momento sob APROVADO próprio.

---

## ⚠️ PRINCÍPIO ANTI-DISPERSÃO
A causa-raiz do "tudo parado" foi abrir frentes demais em paralelo (Azure + multi-cloud + Meta + 13 países + GaiOS + WORM). **Uma linha de cada vez.** O 🔴 (travado por terceiro) só na Fase 5. A única exceção paralela autorizada é a Trilha Alinhadores, por ser o maior ticket e viver em repo separado.

---

## 📌 PRÓXIMO PASSO
Fechar as 3 decisões da Fase 0 (P1/P2/P6) → APROVADO do Bloco 1 (começa pelos secrets).
