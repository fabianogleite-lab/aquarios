# 🎯 ESCOPO — Widget do Business Agent (Meta) + Máquina de Vendas OdontolarPlus

**Criado:** 12/Jun/2026 · **Status:** ⏳ AGUARDANDO APROVADO do fundador
**Regra-mãe:** Scope > Approval > Execution. Cada bloco exige APROVADO próprio.
**Relação:** extensão operacional do PACOTE D (`HANDOFF_PACOTE_D.md`). Não reabre decisões do Pacote D nem do S34.

---

## 1. Interpretação do pedido (12/Jun)

1. **Preparar a solicitação do widget junto à Meta** — o widget Click-to-WhatsApp (D4) já existe no repo; o que falta para ele funcionar é a cadeia Meta: Verificação Business → credenciais (`META_TOKEN`/`PHONE_ID`) → deploy do business-agent → endpoint `/widget/optin` vivo.
2. **Primeira ativação: odontolarplus.com.br** — assim que o backend estiver no ar, o primeiro embed do widget é no site OdontolarPlus (GitHub Pages, repo `fabianogleite-lab/odontolarplus` `/docs`).
3. **Rodar o framework de MKT** (Kotler 7 etapas + `Full Marketing Plan Odontolarplus.pdf` como formato-mestre) para montar uma **máquina de vendas**: fluida, operante, autossuficiente, automatizada, potente.
4. **Agressiva no início** — por necessidade de reconhecimento de marca — com **gate objetivo de descalonamento**: quando o reconhecimento estiver estabelecido, a agressividade é retirada. O dial da agressividade mexe em budget/frequência/cadência/criativo; **nunca em compliance** (janela 24h Meta, opt-in sem pré-marcação, LGPD, brand_guardian sem claims de saúde).

## 2. Inventário do que JÁ está pronto (verificado 12/Jun)

| Peça | Onde | Estado |
|---|---|---|
| Widget Click-to-WhatsApp (D4) | `business-agent/widget/click-to-whatsapp.html` | ✅ pronto (disclosure IA + opt-in B/C sem pré-marcação + UTMs) |
| Backend do widget (D2/D3) | `business-agent/` (`/widget/optin`, webhook, compliance, brand_guardian) | ✅ código · ❌ NÃO deployado |
| CRM + views (D1/D4) | migration 30 (13 tabelas RLS) + `dashboard.sql` (6 views) | ✅ APLICADOS em produção |
| VM Oracle | api.podiumtec.com.br (nginx + TLS + systemd) | ✅ operando |
| Guia da verificação Meta | `business-agent/PASSO_A_PASSO_VERIFICACAO_META.md` | ✅ atualizado 11/Jun (C&L confirmado; workaround conta de ads) |
| Jurídico D0 | `legal/` (5 docs) | ✅ docs prontos · ⏳ placeholders do fundador |
| Framework MKT | `Full Marketing Plan Odontolarplus.pdf` (formato-mestre) + Kotler 7 etapas (`HANDOFF_S34` §2) | ✅ disponíveis |
| Site alvo | odontolarplus.com.br (Pages `/docs`, HTTPS) | ✅ no ar |
| E2E | `business-agent/tests/E2E_CHECKLIST.md` (+55/+351) | ✅ pronto p/ rodar |

## 3. Cadeia de dependências (por que a ordem é esta)

```
widget no site  ←  /widget/optin vivo  ←  business-agent deployado
       ←  META_TOKEN + PHONE_ID  ←  Verificação Meta Business (SÓ FUNDADOR)
                                       └── gargalo: 10 min a ~14 dias úteis → COMEÇAR JÁ
```

## 4. Blocos de execução

### Bloco 0 — FUNDADOR (paralelo, começar já) 🔴
Seguir `PASSO_A_PASSO_VERIFICACAO_META.md`:
- **Parte 1:** verificação do C&L (`business_id=785398925693475`) — Cartão CNPJ + comprovante ≤1 ano, dados idênticos ao CNPJ.
- **Parte 2:** app WhatsApp em developers.facebook.com → `PHONE_ID` + token temporário → System User → `META_TOKEN` permanente + `META_APP_SECRET` + `META_VERIFY_TOKEN`.
- 2FA no admin (recomendado Meta).
- **Saída:** "Meta verificada + tenho as credenciais" (os 5 valores do `.env.example`).

### Bloco 1 — Pre-stage VM (Claude; NÃO depende do Bloco 0)
- Código em `/opt/business-agent` + venv + unit systemd **desligada**; `.env` com placeholders (sem segredo real).
- nginx: rotas `/webhook`, `/delete-data`, `/widget/*` preparadas (porta interna 8002).
- Smoke local (`test_endpoints.py`).
- Resultado: ligar vira ação de 5 minutos quando as credenciais chegarem.

### Bloco 2 — Ativação (Claude; gated no Bloco 0)
- `.env` real → ligar serviço → registrar webhook + callback `/delete-data` na Meta → rodar `E2E_CHECKLIST.md` (+55/+351).

### Bloco 3 — Widget no odontolarplus.com.br (gated no Bloco 2)
- Aplicar as 4 decisões do §6.
- Adaptar o bloco HTML (`data-pais="BR"`, `data-lang="pt-BR"`, UTMs) e posicionar no site (sugestão: nova seção acima do rodapé, sem conflitar com a Lis em `#assistente`).
- Commit no repo `fabianogleite-lab/odontolarplus` `/docs` + conferir Pages/HTTPS.
- **Teste do funil completo:** clique → opt-in → linhas em `optins`/`widget_interactions` → WhatsApp abre → ProteOS responde → lead visível nas 6 views.

### Bloco 4 — Máquina de vendas / Framework MKT (gated no Bloco 3)
- **4a.** Destilar o `Full Marketing Plan Odontolarplus.pdf` + Kotler (7 etapas: missão → macro → micro → objetivos → estratégia/alvo → marketing-mix → controle) num **plano operacional de 90 dias**: campanhas, criativos (motor `agencia/`), cadência, KPIs.
- **4b.** Campanhas Meta Ads click-to-WhatsApp — conta **"AquariOS - Ads"** (portfólio Fabiano Leite) até o limite do C&L liberar; transferir depois.
- **4c.** Automação do funil: 6 estágios de pipeline no CRM + 6 views como painel de controle + alertas Slack já no código.
- **4d.** **Modo agressivo + gate de descalonamento** (§5).

## 5. Modo agressivo — definição operacional (proposta)

**Agressividade = máximo permitido dentro das regras**, nunca além delas.

| Dial | Fase AGRESSIVA (reconhecimento) | Fase SUSTENTÁVEL (após o gate) |
|---|---|---|
| Frequência de ads | 3–5×/semana por pessoa | 1,5–2×/semana |
| Retargeting | amplo (visitantes site + engajou WhatsApp) | só carrinho/conversa quente |
| Follow-up WhatsApp | D0 / D2 / D7 (templates aprovados, janela 24h) | D0 / D7 |
| Budget | 100% do teto definido | −40% |
| CTA/criativo | oferta de entrada forte, direta | institucional/comunidade |

**Gate de descalonamento (fundador define os números no APROVADO):**
`[X] semanas consecutivas com CPL ≤ R$[Y] E ≥ [Z] conversas orgânicas/semana` → muda para fase sustentável. Medição: views do dashboard (D4).

**Invariantes (não entram no dial):** opt-in B/C sem pré-marcação · opt-out imediato · janela 24h/templates Meta · zero claim de saúde (brand_guardian) · zero dado de bem-estar enviado à Meta (PRIVACIDADE §6).

## 6. Decisões do fundador (responder junto com o APROVADO)

1. **Marca do widget no site Odontolar:** manter "Fale com o ProteOS 🌊" (estratégia do case — `PASSO_A_PASSO` §⚠️) **ou** variante "OdontolarPlus, powered by ProteOS"?
2. **Texto do opt-in B** fala de humor/diário/iVi (bem-estar AquariOS). Para o público Odontolar: manter ou redigir variante odontológica? (variante = nova linha em `consent_versions`)
3. **Número WhatsApp de produção:** qual número entra na Parte 2.3?
4. **Números do gate** de descalonamento: X semanas / CPL R$Y / Z conversas.

## 7. Fora do escopo (não reabrir aqui)

D6/Irã (parecer OFAC) · Azure/Plano de Recuperação · Meta for Startups · localização S34 · `meta-agente/` (cache de tokens; agents/ledger MOCK) · aplicação da migration 31.

## 8. Critérios de aceite

- **B0:** credenciais nas mãos do fundador (5 valores).
- **B1:** serviço instala/roda local na VM; nginx responde 404 controlado nas rotas novas; systemd desligado.
- **B2:** webhook verificado pela Meta; E2E +55/+351 ✅.
- **B3:** lead real criado a partir do site (registro em `optins` + `widget_interactions` com UTM) e conversa iniciada.
- **B4:** 1ª campanha no ar + painel mostrando CPL/conversas + gate de descalonamento documentado e medível.
