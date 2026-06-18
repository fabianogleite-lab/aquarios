# Pacote D · D5 — Teste E2E live (+55 / +351)

> 🚦 **BLOQUEADO — não executável agora.** Depende da **verificação Meta Business**
> (ação do fundador, 3–7 dias úteis). Os smoke tests locais (`test_endpoints.py`)
> já cobrem a nossa lógica sem a Meta. Esta checklist roda no dia em que a
> verificação liberar.

## Pré-requisitos (todos precisam estar ✅)
- [ ] Meta Business **verificado** + App em modo **Live**
- [ ] WhatsApp Business Account + número de teste/produção
- [ ] Webhook subscrito (campo `messages`) apontando p/ `https://api.podiumtec.com.br/webhook`
- [ ] `migration 30` **aplicada** no Supabase (`agebsmjsjrmazbozphnh`)
- [ ] `dashboard.sql` aplicado
- [ ] Service rodando na VM Oracle (systemd) com `.env` preenchido
- [ ] `compliance_por_pais` tem **BR** e **PT** com `ativo = true`

## Roteiro — Brasil (+55)
1. Enviar "Olá" do +55 para o número do agente.
2. **Esperado:** ACK do webhook < 20s; `business_agent_logs` registra `webhook.received`.
3. **Esperado:** 1ª resposta traz o **disclosure de IA** (AI_DISCLOSURE §2).
4. `clientes` tem 1 linha (wa_id), `conversas` 1, `mensagens` in+out.
5. Abrir o widget Click-to-WhatsApp, marcar **C** (marketing), enviar.
   **Esperado:** linha em `optins` (tipo `C_marketing`, `checkbox_checked=true`,
   `consent_version` preenchida) + `widget_interactions` com UTMs.
6. Disparar `/delete-data` (simular signed_request) → resposta `{url, confirmation_code}`
   200; `delete_requests` status `recebido`; `GET /delete-status?code=...` responde.

## Roteiro — Portugal (+351)
7. Repetir 1–4 com +351; `clientes.pais` deve resolver para **PT** (gate GDPR ativo).
8. Conferir que país fora da Onda 1 (ex.: `KR`) é **recusado** no `/widget/optin` (403).

## Critérios de aceite
- [ ] Latência ACK < 20s em todas as mensagens
- [ ] Retry 3x comprovado (derrubar token Meta → ver 3 tentativas no log)
- [ ] Nenhum dado de bem-estar enviado à Meta (PRIVACIDADE §6) — inspeção de payloads
- [ ] Disclosure de IA presente na 1ª msg de cada canal
- [ ] `/delete-data` válido responde 200; assinatura inválida → 400
