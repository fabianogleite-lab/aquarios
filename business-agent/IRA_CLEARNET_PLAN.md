# Pacote D · D6 — Irã (clearnet): plano de distribuição

> 🔴 **ARTEFATO DE PLANEJAMENTO — `publish` BLOQUEADO.** Gate **OFAC absoluto**
> (PRIVACIDADE §17 · COUNTRY_MATRIX decisão 1). **Zero investimento em farsi (`fa`)
> antes do parecer** — este documento é meta-nível (se/como lançar), não conteúdo `fa`.
> Irã permanece **Onda 4**. Nada aqui vai ao ar sem parecer jurídico de sanções.

## 1. Por que clearnet (e não App Store / Play / Stripe)
As superfícies usuais são controladas por entidades dos EUA e ficam sujeitas a OFAC.
Distribuição **clearnet local** evita esse trilho:
- **Cafe Bazaar** — maior loja Android local
- **Myket** — segunda loja Android local
- **Aparat** — vídeo (equivalente local ao YouTube) p/ presença/onboarding
- **Web PWA** — fallback universal, instalável, sem loja

## 2. O bloqueio central que o parecer precisa resolver
Nosso stack usa **operadores nos EUA**: Anthropic (Claude), ElevenLabs (voz), Supabase.
É exatamente a pergunta #1 do parecer (PRIVACIDADE §17, nota interna). Sem resolver
isto, **não há release**:
1. Uma sociedade BR pode ofertar app de bem-estar a usuários no Irã via lojas clearnet
   locais **sem violar OFAC**, dado o uso desses operadores US?
2. O modelo **free tier** (sem cobrança, sem trilho de pagamento US) reduz a exposição?
   Há *general license* p/ software de comunicação/bem-estar (cf. licenças tipo D)?
3. Que **segregação técnica** é exigida (NÃO rotear tráfego IR por operadores US —
   modelo/voz/banco alternativos não-US para esse tráfego)?
4. Obrigações de **screening** de usuários e **geolocalização**.

## 3. Arquitetura condicional (só se o parecer permitir)
- **Free tier apenas** (sem Stripe/Paystack; sem cobrança) — moeda IRR não liquida.
- **Segregação de operadores** para tráfego IR: avaliar modelo/voz/storage não-US
  (ou desligar voz ElevenLabs e features que dependam de operador US no IR).
- **Geofencing + screening** na entrada (consistente com listas de sanções).
- Localização `fa` (RTL) só **depois** do parecer — hoje congelada (decisão S33).

## 4. O que está pronto vs. travado
| Item | Estado |
|---|---|
| Plano de distribuição clearnet | ✅ este documento |
| Schema/infra (D1–D4) suporta IR como país inativo | ✅ `compliance_por_pais` NÃO seeda IR; gate OFAC no `compliance.py` bloqueia |
| Parecer OFAC | ⏳ **ação do fundador** (contratar advogado de sanções) |
| Localização farsi | ⛔ congelada até o parecer |
| `publish` em qualquer loja IR | ⛔ travado |

## 5. Checklist pós-parecer (não antes)
- [ ] Parecer OFAC recebido e favorável (com condições documentadas)
- [ ] Segregação técnica implementada conforme o parecer
- [ ] Localização `fa` + QA RTL (gate `brand_guardian.rtl_gate`)
- [ ] Contas Cafe Bazaar / Myket / Aparat (ação do fundador — parceiro local)
- [ ] Free tier confirmado sem nenhum trilho de pagamento US
