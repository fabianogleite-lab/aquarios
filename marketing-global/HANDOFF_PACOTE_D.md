# 🧰 HANDOFF — PACOTE D (Ferramenta MKT Global Meta/ProteOS)

**Criado:** 10/Jun/2026 · **Atualizado:** 11/Jun/2026
**Status:** D0 ✅ · **D1 ✅ APLICADO em produção** · D2/D3 ✅ código · D4 ✅ views no ar · D5/D6 construídos (execução travada em ação do fundador)
**Regra-mãe:** Scope > Approval > Execution. Novo APROVADO por bloco. Nosso handoff **sobrepõe** a Meta AI.

---

## 1. PROMPT DE ABERTURA DA PRÓXIMA SESSÃO (copiar e colar)

```
Sessão de continuação do PACOTE D (ferramenta MKT global ProteOS via ecossistema Meta).

📖 LER PRIMEIRO (leitura é livre):
- memória: project_meta_agent_strategy.md + collaboration_rules.md (Regra #9) — base + regras duras
- memória: project_pacote_d_build.md — ESTADO ATUAL (D1 aplicado, paths, 4 ASSUMEDs)
- marketing-global/HANDOFF_PACOTE_D.md — este handoff
- legal/ (5 docs do D0) — p/ revisar #2–#5 e preencher placeholders
- COUNTRY_MATRIX.md — fonte de verdade por país

🚫 NÃO LER (só referência — NÃO abrir):
- marketing-global/HANDOFF_S34_MKT_GLOBAL.md — Pacotes A/B/C, OUTRA trilha (não misturar)
- código business-agent/ + AquariOS_Pacote_Completo.zip — abrir só se for mexer no deploy D2/D3

REGRAS DURAS (Regra #9 — toda a sessão):
1. NÃO crie/edite/apague arquivos, NÃO dispare agentes, NÃO pesquise em massa sem eu escrever APROVADO.
2. Responder perguntas ≠ aprovação. Dúvidas se resolvem DENTRO da iteração do escopo.
3. Fluxo: escopo enxuto → meu APROVADO → executar SÓ o aprovado → parar. Novo APROVADO por bloco.
4. Nosso handoff SOBREPÕE a Meta AI; perguntar antes de adotar algo da Meta que conflite.

ESTADO (decidido — não reabrir):
- D0 ✅ 5 docs em legal/ (só #1 revisado pela Meta AI).
- D1 ✅ APLICADO em produção (Supabase agebsmjsjrmazbozphnh, 11/Jun): migration 30
  (13 tabelas, RLS deny-by-default, pgcrypto, FK wa_id corrigida, compliance_por_pais
  Onda 1) + dashboard.sql (6 views). Verificado.
- D2/D3 ✅ código em business-agent/ (FastAPI-nativo, SEM n8n) — NÃO deployado.
- D4 ✅ views no ar + widget Click-to-WhatsApp pronto.
- D5 testes locais ok; E2E live TRAVADO (verificação Meta Business).
- D6 plano clearnet; publish TRAVADO (OFAC). Cafe Bazaar/Myket/Aparat + web; SEM farsi antes do parecer.

GATE (Regra #9.5): após eu aprovar o escopo do bloco, executar bloco a bloco. NÃO executar nada antes do meu APROVADO.

PRÓXIMOS BLOCOS (me apresente escopo enxuto e aguarde APROVADO; pode recomendar ordem):
- D0-review: revisão interna de conformidade dos docs #2–#5 (prep p/ submissão em lote via extensão Chrome).
- Confirmar os 4 ASSUMEDs do D1 (nomes das 5 tabelas Meta etc.).
- VM pre-stage (opcional): code+venv+systemd desligado, pronto p/ ligar com credenciais Meta.
- [após verificação Meta] deploy D2/D3 + E2E D5.
- D6 (paralelo): só após parecer OFAC.

Comece confirmando o que leu e apresentando o escopo enxuto do bloco que eu indicar — aguarde meu APROVADO.
```

---

## 2. O que está pronto (11/Jun)
- **D0 jurídico** — 5 docs em `legal/` (Privacidade v0.2 revisada pela Meta AI; #2–#5 sem revisão).
- **D1 schema** — `mobile/supabase/migrations/30_pacote_d_crm_meta_unified.sql` — **APLICADO + verificado** (13 tabelas, RLS deny-by-default, pgcrypto, FK wa_id corrigida, `compliance_por_pais` Onda 1: BR/US/PT/NG/PE/VE; 6 estágios de pipeline).
- **D2/D3** — `business-agent/` (`main.py`/`db.py`/`compliance.py`/`brand_guardian.py`) — webhook verify+assinatura, ACK<20s, retry 3x, `/delete-data` HMAC, Slack, `/widget/optin`; guard EcumenicOS (não bane "espiritual"; bane claim de saúde; gate RTL).
- **D4** — `business-agent/dashboard.sql` (6 views, **no ar**) + `business-agent/widget/click-to-whatsapp.html` (disclosure IA + opt-in B/C).
- **D5** — `business-agent/tests/` (smoke local + `E2E_CHECKLIST.md`).
- **D6** — `business-agent/IRA_CLEARNET_PLAN.md`.

## 3. Pendências
- **Deploy D2/D3 na VM** — gated nas credenciais Meta (`META_TOKEN`/`PHONE_ID` nascem da verificação Business).
- **D0-submit** — #2–#5 sem revisão; submissão em lote aguarda extensão Chrome ativa.
- **D5 E2E live** — gated na verificação Meta Business.
- **D6 publish** — gated no parecer OFAC.
- **Placeholders** (fundador): CNPJ, endereço, DPO, foro, preços Premium/Professional, retenções, idades-piso.
- **4 ASSUMEDs do D1** (a confirmar): (1) nomes das 5 tabelas Meta (`optins`/`consent_versions`/`widget_interactions`/`delete_requests`/`compliance_por_pais`); (2) migration nº **30**; (3) `clientes.pais` default BR + FK allowlist por Onda; (4) sem detecção de país por DDI (default BR).
- **Não commitado:** `legal/`, `business-agent/`, migration 30 (sem segredos — `.env` é só `.example`).

## 4. Ações que SÓ o fundador executa (paralelas — começar já)
1. 🔴 **Verificação Meta Business** — gargalo (3–7 dias úteis). 👉 **passo a passo com links:** `business-agent/PASSO_A_PASSO_VERIFICACAO_META.md`.
2. 🟠 **Preencher placeholders** dos 5 docs em `legal/`.
3. 🟠 **Parecer OFAC** (advogado de sanções) — destrava o D6.
4. 🟡 **Meta for Startups** (US$10k) + ativar **extensão Chrome** de submissão (D0-submit).

---

*D1 aplicado nesta sessão via Management API com a sessão logada do Studio (Claude-in-Chrome) — sem expor senha/PAT. Migration idempotente (re-rodável).*
