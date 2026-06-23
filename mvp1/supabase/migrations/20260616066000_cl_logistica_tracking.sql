-- migration 66: FulfillmentManager Tracking — Logística Multi-vendedor
-- Integra Amazon SP-API getPackageTrackingDetails + pool de transportadoras
-- user_hash_dop = SHA-256 do cliente — LGPD: zero PII em disco

CREATE TABLE IF NOT EXISTS public.cl_logistica_tracking (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            varchar(50) NOT NULL,
    produto_id          uuid        REFERENCES public.escambos_produtos(id),
    user_hash_dop       varchar(64) NOT NULL,
    status_transporte   text        NOT NULL DEFAULT 'pendente'
                                    CHECK (status_transporte IN (
                                        'pendente',
                                        'coletado',
                                        'em_transito',
                                        'saiu_entrega',
                                        'entregue',
                                        'devolvido',
                                        'extraviado'
                                    )),
    transportadora      text,       -- 'amazon','correios','jadlog','melhor_envio'
    url_rastreio        text,       -- URL externa (não exposta publicamente)
    cod_rastreio        varchar(80),
    tentativas          int         NOT NULL DEFAULT 0,
    ultimo_evento       text,
    entregue_em         timestamptz,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT check_privacidade_tracking
        CHECK (user_hash_dop NOT LIKE 'cliente_real_%')
);

ALTER TABLE public.cl_logistica_tracking ENABLE ROW LEVEL SECURITY;

-- Owner do produto lê rastreio dos seus pedidos
CREATE POLICY "tracking_owner_read" ON public.cl_logistica_tracking
    FOR SELECT TO authenticated
    USING (produto_id IN (
        SELECT p.id
        FROM public.escambos_produtos p
        JOIN public.herme_projetos hp ON p.projeto_id = hp.id
        WHERE hp.user_id = auth.uid()
    ));

-- service_role escreve (FulfillmentManager FastAPI)
CREATE POLICY "tracking_service_all" ON public.cl_logistica_tracking
    FOR ALL TO service_role USING (true) WITH CHECK (true);
