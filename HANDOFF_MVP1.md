# 🟢 HANDOFF — MVP1 (ProteOS Agente · finalizar) · próxima sessão

**Foco:** **finalizar o MVP1** = o produto AquariOS global com o **ProteOS** como agente
(motor único, 2 peles). O que faltava do "MVP0" foi **transportado para cá**. A próxima
sessão **começa no Item 1**.

> Sessão anterior (21/Jun) só **decidiu e apresentou** — nada de código novo foi escrito.
> Este handoff é o ponto de partida.

---

## 0. Numeração (reconciliada 21/Jun)
- **MVP0** = base/infra. **Parcial** — não é release separado, foi **absorvido no MVP1**.
- **MVP1** = *este* — finalizar: deploy da base + 2 skins + SLOs + AlexandriOS.
- **MVP2** = on-device tiny/offline + surface nativa + autonomia + soberania + Paytime F2 + ondas 3-4.

**O que JÁ existe e fica (base, não rebuildar):** Claude chat ProteOS (`chat` + `proteos.tsx` +
voz ElevenLabs) **live**; CerberOS shield (`business-agent/cerber_shield.py` + `voice_proxy.py`)
**live**; iVi 4D (`calculate_ivi`, migration 14); cache SandeirOS **em código** (`backend/sandeiros/`).

---

## 1. Decisões travadas nesta sessão (cânone — NÃO reabrir)
1. **Nomes:** **agente = ProteOS** (encarnação on-device da Agent.Interface) · **saúde UX = AsclepiOS** ·
   **HygeiOS = Agent.Data** (intacto). Ratifica o `AQUARIOS_LIVRO.md` (cap. 29/30/35). O erro antigo
   foi vender o agente como "atualização HygeiOS" — corrigido.
2. **Motor único, 2 peles:** mesmo engine; **Skin A** = Saúde/Voz Preventiva (AquariOS global) ·
   **Skin B** = B2B "salvar operação" (integrador). Pele = seed de cache + tools + marca, não fork.
3. **Nuvem custo-baixo:** Claude **Haiku 4.5 padrão → Opus 4.8 só no caso difícil**.
4. **4 alertas técnicos:** (1) on-device = **llama.cpp/GGUF CPU = chão** (NPU é fase posterior; aparelho
   antigo não tem NPU → o motor é o **cache**); (2) **parar de publicar 47mJ/60×** → **SLOs auditáveis**;
   (3) **MVP cloud+cache primeiro**, on-device é incremento (→ MVP2); (4) **ZERO Accessibility** no
   produto de massa — App Actions + API oficial + web-first + **1-toque**; Accessibility/Knox = só Skin B gated.
5. **tiny-BR próprio** (futuro/MVP2): destilar de **pesos abertos** (Llama/Qwen/Gemma), **NÃO** de traces Claude.

---

## 2. 🚦 Itens do MVP1 — EM ORDEM (a próxima sessão começa no Item 1)

### ▶ Item 1 — Deploy do cache SandeirOS  *(começa aqui)*
- **O quê:** aplicar migration `supabase/migrations/20260621060000_sandeiros_cache.sql` + seed
  `backend/sandeiros/data/seed_cache_800.sql`; ligar `backend/sandeiros/api.py` (`POST /sandeiros/responder`)
  no `main.py` da VM Oracle.
- **Precisa:** credencial do banco (estava adiado). `pip install python-multipart` na VM.
- **Pronto quando:** `/sandeiros/responder` devolve **HIT** no ar (0 token).
- **Ref:** `HANDOFF_SANDEIROS_PRODUCAO.md`, `CONFERENCIA_DEPLOY_PROXIMA_SESSAO.md`.

### Item 2 — Voz Preventiva (Skin A)
- **O quê:** loop **H1** do HygeiOS-agente — captura → decantação temporal → maturação de padrão →
  pede verificação (carimbo CerberOS) → fala via **ProteOS**. Liga iVi 4D → insight.
- **Pronto quando:** um padrão só vira insight **após recorrência confirmada + carimbo**.
- **Ref:** `HANDOFF_HYGEIOS_AGENTE.md` (H1/H3 — a "boca custo-zero" é o cache do Item 1).

### Item 3 — Skin B: 3 tools + 1-toque + Shopify F1
- **O quê:** Tool Bus **mínimo** — email/agenda/mensageria via **API oficial** (App Actions/deep link/REST),
  **confirmação 1-toque** (sem Accessibility), pagamento **Shopify F1** (PanaceIA Fase 1).
- **Reusa:** ponte WhatsApp já construída (`voice_proxy.py`), Paytime (Pix = MVP2).
- **Pronto quando:** 1 fluxo transacional ponta-a-ponta com confirmação de 1 toque.

### Item 4 — SLOs no app
- **O quê:** instrumentar **p95 latência · hit rate · crash-free · %bateria/hora · aderência ao RAM cap**.
  Trocar todo número não-medido (47mJ/60×) por **SLO auditável** (Alerta 2). Telemetria opt-in via CerberOS/LGPD.
- **Pronto quando:** SLOs visíveis no Admin/telemetria, com consentimento.

### Item 5 — AlexandriOS (ajuda) — **POR ÚLTIMO**
- **O quê:** `mobile/services/alexandrios.ts` já existe → criar tabela `alexandrios_kb` + migrar FAQs.
  É o **último módulo** porque **a ajuda documenta tudo que já existe** no MVP1.
- **Página de ajuda pública:** usar o **template novo do site** (ver §4).
- **Pronto quando:** help conversacional responde sobre os módulos do MVP1.

---

## 3. 📖 LER vs 🚫 só-referência
**📖 LER antes de começar:**
- `HANDOFF_MVP1.md` (este) — o plano.
- `HANDOFF_SANDEIROS_PRODUCAO.md` — passo de deploy do Item 1.
- `HANDOFF_HYGEIOS_AGENTE.md` — Item 2 (loop H1, fronteiras ProteOS↔HygeiOS↔CerberOS).
- `backend/sandeiros/api.py` + `responder.py` — o que vai ao ar no Item 1.

**🚫 Só referência (NÃO reler inteiro):**
- `AQUARIOS_LIVRO.md` — fonte de verdade; consultar capítulo, não ler tudo.
- `mobile/docs/COMPARATIVE_MANUAL_VS_DEVPACK.md` — **superseded** pelo LIVRO (reconciliação pendente, fora do MVP1).
- zips `HygeiOS_*`/`Atlas_*` em `Downloads/` — são **design/pitch**, não código; já destrinchados.

---

## 4. Template novo do site
- **`docs/engenharia.html`** = página pública dark, padrão **ATIVO / EM EVOLUÇÃO**, "stack real sem
  caixa-preta, auditável". Já frama **ProteOS = o agente** + **Claude roteado por custo**. Qualquer página
  pública do MVP1 (ajuda AlexandriOS, landing Skin B) segue **este** template + as regras de
  `feedback_sites_pro_template` (NUNCA expor IP/DRE/SAFE/schema). ⚠️ alinhar: a página cita cache "Qdrant";
  o código real é **pgvector/`fastembed`**.

## 5. Sigilo (sempre)
Codinomes neutros. Humanização do SandeirOS = Intervalo / Tríade / Equilíbrio / Reenquadramento.
CerberOS = "portal de verificação". **Nada de nomes de fontes/livros/autores em arquivo do repo.**

---

## 6. 🟢 Mensagem de abertura da próxima sessão (colar pra começar)
> "Vamos **finalizar o MVP1** (ProteOS agente, motor único / 2 peles). Leia `HANDOFF_MVP1.md`,
> `HANDOFF_SANDEIROS_PRODUCAO.md` e `HANDOFF_HYGEIOS_AGENTE.md`. Comece pelo **Item 1 — deploy do
> cache SandeirOS** (migration `20260621060000` + seed 800 + wire `/sandeiros/responder` no `main.py`
> da VM). Me peça a credencial do banco. Respeite as decisões travadas (ProteOS=agente, AsclepiOS=saúde,
> HygeiOS=dados; Claude Haiku→Opus; ZERO Accessibility; SLOs no lugar de mJ) e o sigilo. Confirme cada
> item antes do seguinte."
