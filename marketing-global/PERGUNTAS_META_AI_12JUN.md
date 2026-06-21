# Perguntas à Meta AI — 12/Jun/2026 (transporte: fundador)

Status: ✅ ENVIADAS e RESPONDIDAS 12/Jun — resumo abaixo; script de referência
em `blueprints-meta-ai/webhook_meta.py` (com 5 correções obrigatórias anotadas).

## Respostas (12/Jun) — resumo e impacto

| # | Resposta oficial (via Meta AI) | Impacto |
|---|---|---|
| A1 | HTTP 200 em **≤20s**; sem ack → retries exponenciais por **~24h** | Gate B: ack imediato + processamento async (confirma o desenho) |
| A2 | Dedupe por **WAMID** (`messages[].id`); statuses reusam o MESMO WAMID | D: UNIQUE `meta_message_id`; statuses dedupe por **(id, status)** — não só id |
| A3 | **Sem lista oficial de IPs**; HMAC X-Hub-Signature-256 é o único mecanismo | NSG sem allowlist p/ webhook; HMAC segue sendo o portão |
| B4 | Preço **por mensagem** (desde 1/jul/2025); BR ~US$0,0625–0,09; **VE exige BSP com billing fora do país** | Reforça VE = free tier (COUNTRY_MATRIX, gate S33) |
| B5 | Disclosure IA: **1ª mensagem + perfil do número**; opt-in explícito p/ CTWA | D2/D3 + `legal/` (consentimento); registrar disclosure em optins, não em cache |
| B6 | **1 app Meta, 3 produtos**; rate limits POR APP | Arquitetura: app único WA+IG+Messenger |
| B7 | Tier 1 = 1K conversas/24h; sobe após 7d quality "High" + >50% do volume | D5: plano de aquecimento do número. *Conferir no painel: doc oficial costuma citar 250 antes da Verificação de Negócio |
| C8 | Proibidos: "antes/depois", "garantido", "cura"; dado de saúde = **consentimento explícito** (LGPD art. 11) | brand_guardian (D3) + optins/consent_versions |
| C9 | POST `signed_request` (base64); responder `{url, confirmation_code}`; processar ≤7 dias | Fecha spec do `/delete-data` em `legal/` + persistir em `delete_requests` (mig 30) |
| C10 | Reprovações: endereço divergente, D-U-N-S desatualizado; acelera: **contrato social + conta de luz no MESMO CNPJ** | 🎯 AÇÃO DO FUNDADOR na Verificação de Negócio em andamento |

> Confiança: respostas sem citação de doc oficial — tratar como orientação
> forte; números críticos (20s, tier inicial) conferir no painel quando o app
> estiver ativo.

---

## Bloco pronto para colar na Meta AI

Contexto: nosso backend é FastAPI numa VM (nginx + TLS), validamos
X-Hub-Signature-256 em todo webhook, banco Supabase/Postgres, lançamento em
6 países (BR/PT/US/NG/PE/VE), vertical saúde/bem-estar com IA respondendo.
Pergunto sobre regras e números OFICIAIS da plataforma:

**A — Webhook (Cloud API)**
1. Qual o timeout oficial de resposta do webhook antes de reentrega, e a
   política exata de retries (quantidade, intervalo/backoff, por quanto tempo)?
2. Para deduplicação na reentrega: o recomendado é dedupe por
   `messages[].id`, por `entry[].id` + timestamp, ou outro? O mesmo
   `message_id` pode chegar em payloads de tipos diferentes (mensagem vs
   status)?
3. Existe lista oficial de IP ranges/ASN de origem dos webhooks para
   allowlist de firewall, ou a validação por HMAC é o único mecanismo
   suportado?

**B — Mensageria e crescimento**
4. Tabela 2026 de categorias de template (utility/marketing/authentication):
   preços e restrições específicas para BR, PT, US, NG, PE e VE — alguma
   limitação especial para Venezuela?
5. Click-to-WhatsApp Ads com IA respondendo: quais os requisitos de
   aprovação e o formato obrigatório de disclosure de IA (primeira mensagem,
   perfil do número, ambos)?
6. Para operar WhatsApp + Instagram + Messenger no mesmo backend: 1 app Meta
   com 3 produtos ou apps separados? Como os rate limits se aplicam por app
   nesse cenário?
7. Número novo começa em qual tier de conversas/24h e qual o caminho mais
   rápido e seguro para subir de tier (critérios de quality rating)?

**C — Compliance / jurídico**
8. Vertical saúde: existe lista oficial de claims proibidos em templates e
   anúncios (ex.: "antes e depois", "garantido")? Varia por país? E qual a
   política para dados sensíveis de saúde trafegando em conversas do
   WhatsApp Business (equivalente a PHI/LGPD art. 11)?
9. Data deletion callback: o formato exato do request que a Meta envia
   (signed_request? campos?) e da resposta esperada (confirmation_code +
   status URL) para o nosso endpoint `/delete-data`?
10. Verificação de Negócio de LTDA brasileira (temos D-U-N-S ativo): quais
    são as causas mais comuns de reprovação/atraso e que documento acelera
    mais (contrato social, fatura, domínio verificado)?

---

## Por que estas e não outras

- Respostas de 1–3 definem o design final do gate CerberOS (entrega B) e da
  idempotência (D) — hoje estão desenhados por boas práticas, não por números
  oficiais.
- 4–7 destravam D2 (fluxos), D4 (widget CTWA) e D5 (teste +55/+351).
- 8–9 fecham specs que estão abertas em `legal/` (callback de exclusão) e no
  brand_guardian (lista de claims).
- 10 ataca o gargalo atual (Verificação de Negócio, sessão paralela).
- NÃO perguntamos sobre infra/orquestração (decididas: VM própria, FastAPI
  nativo, sem n8n, sem Container Apps) — regra de governança: nossas decisões
  prevalecem sobre sugestões da Meta AI.
