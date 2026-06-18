# Blueprints Meta AI — referência, NÃO aplicar

Material do ZIP `AquariOS_Pacote_Completo.zip` (Meta AI, 12/Jun/2026).
São **blueprints/pseudocódigo** — úteis como especificação de comportamento,
não como código de produção.

| Arquivo | O que é | Status |
|---|---|---|
| `aquarios_schema.sql` | Schema CRM (clientes, conversas, mensagens, campanhas…) | 🚫 **NÃO APLICAR** — é versão paralela da **migration 30, que JÁ ESTÁ EM PRODUÇÃO** com RLS FORCE. Este schema não tem RLS nenhuma. |
| `secao15_governanca.sql` | Tabela `meta_signals` (CDP) | 🚫 NÃO aplicar — `meta_signals` já existe (migration 30). |
| `aquarios_core.py` | Pipeline CRM + omnichannel + aprovação Slack + Leonardo | Blueprint (SupabaseClient é stub; erro de sintaxe no card Slack). Espec de comportamento p/ D2/D3. |
| `secao15_codigo.py` | Conversions API offline (ROAS), brand_guardian, modo treino | Blueprint. `brand_guardian` JÁ EXISTE em `business-agent/brand_guardian.py`. ⚠️ A versão daqui **contradiz a decisão D3** (bloqueia "espiritual" em CH/NO; EcumenicOS foi MANTIDO — não trocar "espiritual" por país). Regra de governança: nossas decisões > Meta AI. |
| `webhook_meta.py` | Webhook Cloud API de referência (HMAC + ack<20s + dedupe + disclosure + /delete-data) | Blueprint com **3 bugs + 2 violações** anotados no docstring (statuses dedupe errado, processed antes do sucesso, GET verify com params sem ponto; secret hardcoded; Redis desnecessário → Supabase UNIQUE). Implementação real = business-agent/ (entregas B+D). Números oficiais → `../PERGUNTAS_META_AI_12JUN.md`. |

## Deltas com valor (avaliar na trilha MKT/CRM — faixa de migration 40–49)

Diferenças deste blueprint vs migration 30 que podem virar migration `40_`:
- Tabela `sync_meta_log` (log bruto de webhook) — não existe na 30
- Campos extras em `clientes`: `ig_id`, `messenger_id`, `ticket_medio`,
  `historico_6_meses`, `lifetime_value`, `ultima_compra`
- `pipeline_stages.acao_automatica` + seed de 6 estágios com SLA
- Funções: conversão offline (Pixel/CAPI), modo treino (+número interno)

Regra: qualquer migration daqui nasce na faixa 40–49 com `ENABLE ROW LEVEL
SECURITY` na mesma migration (ver `mobile/supabase/migrations/README.md`).
