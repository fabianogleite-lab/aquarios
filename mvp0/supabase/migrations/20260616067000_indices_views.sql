-- migration 67: Índices de performance + Views analíticas
-- Alimenta backoffice: CRM pipeline, Ranking marketplace, DRE simplificado

-- ────────────────────────────────────────────────────────────────
-- ÍNDICES
-- ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_herme_projetos_user
    ON public.herme_projetos(user_id);

CREATE INDEX IF NOT EXISTS idx_herme_projetos_status
    ON public.herme_projetos(status);

CREATE INDEX IF NOT EXISTS idx_herme_leads_projeto
    ON public.herme_leads(projeto_id, lead_score, status);

CREATE INDEX IF NOT EXISTS idx_escambos_produtos_projeto
    ON public.escambos_produtos(projeto_id, status);

CREATE INDEX IF NOT EXISTS idx_hvp_produto
    ON public.escambos_hvp_signals(produto_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hvp_hash
    ON public.escambos_hvp_signals(user_hash_dop);

CREATE INDEX IF NOT EXISTS idx_fiscal_order
    ON public.cl_fiscal_nfse(order_id, status);

CREATE INDEX IF NOT EXISTS idx_tracking_order
    ON public.cl_logistica_tracking(order_id, status_transporte);

-- ────────────────────────────────────────────────────────────────
-- VIEW: CRM Pipeline
-- Kanban do backoffice — projetos × leads agrupados por estágio
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.vw_crm_pipeline AS
SELECT
    hp.id                   AS projeto_id,
    hp.nome                 AS projeto_nome,
    hp.categoria,
    hp.plano,
    hp.lead_score           AS projeto_score,
    hp.status               AS projeto_status,
    hp.created_at           AS projeto_criado_em,
    hl.id                   AS lead_id,
    hl.canal_contato,
    hl.lead_score           AS lead_classificacao,
    hl.status               AS lead_status,
    hl.observacoes,
    hl.updated_at           AS lead_atualizado_em
FROM public.herme_projetos hp
LEFT JOIN public.herme_leads hl ON hl.projeto_id = hp.id;

-- ────────────────────────────────────────────────────────────────
-- VIEW: Ranking Marketplace (HVP)
-- Produtos ranqueados por intensidade de atenção agregada
-- intensity = log1p(avg_dwell_ms/1000) × (1 + avg_clicks/5)
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.vw_ranking_marketplace AS
SELECT
    ep.id                   AS produto_id,
    ep.titulo,
    ep.tipo,
    ep.categoria,
    ep.subcategoria,
    ep.preco,
    ep.disponibilidade,
    COUNT(hvp.id)           AS total_sinais,
    ROUND(AVG(hvp.dwell_ms))              AS avg_dwell_ms,
    ROUND(AVG(hvp.clicks)::numeric, 2)   AS avg_clicks,
    ROUND(
        (LN(1 + AVG(hvp.dwell_ms) / 1000.0)
         * (1 + AVG(hvp.clicks) / 5.0))::numeric,
        4
    )                       AS hvp_intensity,
    COUNT(hvp.id) FILTER (
        WHERE hvp.assertividade = 'ANTECIPADO_SUCESSO'
    )                       AS antecipado_sucesso_ct
FROM public.escambos_produtos ep
LEFT JOIN public.escambos_hvp_signals hvp ON hvp.produto_id = ep.id
WHERE ep.status = 'ativo'
GROUP BY ep.id, ep.titulo, ep.tipo, ep.categoria, ep.subcategoria,
         ep.preco, ep.disponibilidade
ORDER BY hvp_intensity DESC NULLS LAST;

-- ────────────────────────────────────────────────────────────────
-- VIEW: DRE Simplificado (C&L Lucro Real)
-- Receita bruta × PIS/COFINS × comissão líquida por período
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.vw_dre_simplificado AS
SELECT
    DATE_TRUNC('month', created_at)        AS competencia,
    COUNT(*)                               AS total_nfse,
    ROUND(SUM(valor_comissao)::numeric, 2) AS receita_bruta,
    ROUND(SUM(pis_apurado)::numeric, 4)    AS total_pis,
    ROUND(SUM(cofins_apurado)::numeric, 4) AS total_cofins,
    ROUND(
        (SUM(valor_comissao)
         - SUM(pis_apurado)
         - SUM(cofins_apurado))::numeric,
        2
    )                                      AS receita_liquida
FROM public.cl_fiscal_nfse
WHERE status <> 'erro'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY competencia DESC;
