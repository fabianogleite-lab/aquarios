-- ============================================================================
-- Pacote D · D4 (fase 1) — Dashboard via Supabase Studio (views de leitura).
-- ⚠️ DESIGN-ONLY — aplicar junto/depois da migration 30, com APROVADO.
-- Backoffice apenas: consumir via Studio / service_role (NÃO expor a anon).
-- Fase 2 (tela do fundador) consome estas mesmas views por uma API admin.
-- ============================================================================

-- Funil: leads por estágio
CREATE OR REPLACE VIEW v_funil AS
SELECT ps.ordem, c.pipeline_stage, ps.nome, count(*) AS clientes
FROM clientes c JOIN pipeline_stages ps ON ps.stage_key = c.pipeline_stage
GROUP BY ps.ordem, c.pipeline_stage, ps.nome
ORDER BY ps.ordem;

-- Taxa de opt-in por país e tipo (B bem-estar / C marketing)
CREATE OR REPLACE VIEW v_optin_rate AS
SELECT c.pais, o.tipo,
       count(*) FILTER (WHERE o.checkbox_checked AND o.revogado_ts IS NULL) AS ativos,
       count(*) AS total
FROM optins o JOIN clientes c ON c.id = o.cliente_id
GROUP BY c.pais, o.tipo
ORDER BY c.pais, o.tipo;

-- Volume de mensagens por dia e direção
CREATE OR REPLACE VIEW v_mensagens_volume AS
SELECT date_trunc('day', created_at) AS dia, direcao, count(*) AS qtd,
       round(avg(latencia_ms)) AS latencia_media_ms
FROM mensagens
GROUP BY 1, 2
ORDER BY 1 DESC, 2;

-- CTR de campanhas
CREATE OR REPLACE VIEW v_campanhas_ctr AS
SELECT nome, status, pais_alvo, enviados, entregues, lidos, cliques,
       round(cliques::numeric / NULLIF(enviados, 0) * 100, 2) AS ctr_pct,
       orcamento_usd
FROM campanhas
ORDER BY created_at DESC;

-- Cobertura de compliance (países ativos por onda)
CREATE OR REPLACE VIEW v_compliance_cobertura AS
SELECT onda, pais, idioma, regime_privacidade, gateway_pagamento, moeda, ativo
FROM compliance_por_pais
ORDER BY onda, pais;

-- Exclusões pendentes (SLA 30 dias — EXCLUSAO §6)
CREATE OR REPLACE VIEW v_delete_pendentes AS
SELECT confirmation_code, origem, status, recebido_ts,
       (now() - recebido_ts) AS aberto_ha,
       (recebido_ts + interval '30 days') AS prazo_legal
FROM delete_requests
WHERE status <> 'concluido'
ORDER BY recebido_ts;
