# Business Agent (Pacote D) — ferramenta MKT global do ProteOS via Meta

Orquestração **FastAPI-nativa** (sem n8n) que liga o ecossistema Meta
(WhatsApp/Instagram/Messenger) ao CRM do AquariOS no Supabase. Roda na VM Oracle
(`api.podiumtec.com.br`). Toda a documentação jurídica vive em `../legal/` (D0) e é a
**fonte de verdade** das amarrações abaixo.

## Status dos blocos
| Bloco | Entregável | Estado |
|---|---|---|
| **D1** | `../mobile/supabase/migrations/30_pacote_d_crm_meta_unified.sql` — 13 tabelas, RLS deny-by-default, pgcrypto, FK wa_id corrigida, `compliance_por_pais` (Onda 1) | ✅ design-only (não aplicado) |
| **D2** | `main.py` + `db.py` + `compliance.py` — webhook→enriquecer→compliance→insert→IA→envio (retry 3x); `/delete-data`; Slack | ✅ código |
| **D3** | `brand_guardian.py` — guarda de saúde/cultura no **app layer** (EcumenicOS; NÃO bane "espiritual") | ✅ código |
| **D4** | `dashboard.sql` (views Studio) + `widget/click-to-whatsapp.html` (disclosure IA + opt-in B/C) | ✅ design-only |
| **D5** | `tests/test_endpoints.py` (rodam já) + `tests/E2E_CHECKLIST.md` | ⏳ live bloqueado (verificação Meta Business) |
| **D6** | `IRA_CLEARNET_PLAN.md` | ⛔ publish bloqueado (parecer OFAC) |

## Amarrações legais (fonte: `../legal/`)
- `optins` / `consent_versions` ← CONSENTIMENTO_OPTIN · `widget_interactions` ← PRIVACIDADE §14
- `delete_requests` + `/delete-data` ← POLITICA_DE_EXCLUSAO Anexo A · disclosure ← AI_DISCLOSURE
- **Nunca** enviar dado de bem-estar à Meta (PRIVACIDADE §6) — só eventos lifestyle.

## Deploy na VM Oracle (resumo)
```bash
cd /opt/business-agent
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # preencher os segredos (NÃO commitar)
uvicorn main:app --host 127.0.0.1 --port 8002    # nginx já faz TLS/proxy
```
Exemplo de unit systemd (`/etc/systemd/system/business-agent.service`):
```ini
[Service]
EnvironmentFile=/opt/business-agent/.env
ExecStart=/opt/business-agent/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8002
Restart=always
```

## Ordem de ativação (cada passo exige APROVADO)
1. Revisar + aplicar `migration 30` (Supabase) e `dashboard.sql`.
2. Deploy do serviço + `.env` na VM; nginx roteia `/webhook`, `/delete-data`, `/widget/*`.
3. (Founder) Verificação Meta Business → subscrever webhook → registrar URLs Privacy/Terms/Delete.
4. Rodar `E2E_CHECKLIST.md` (+55/+351).

## Pendências do fundador (placeholders / ações)
CNPJ, endereço, DPO, foro, preços, retenção, idades-piso · verificação Meta Business ·
Meta for Startups · extensão Chrome (submissão dos docs) · parecer OFAC (D6).
