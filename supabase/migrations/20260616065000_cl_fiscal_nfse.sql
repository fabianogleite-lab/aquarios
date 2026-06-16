-- migration 65: Fiscal NFS-e Registry — Lucro Real (PIS + COFINS)
-- C&L CNPJ 41.191.506/0001-02
-- CNAE 74.90-1-04 (intermediação) + 82.91-1-00 (análise cadastral)
-- Lucro Real não-cumulativo: PIS 1,65% | COFINS 7,60%

CREATE TABLE IF NOT EXISTS public.cl_fiscal_nfse (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        varchar(50) UNIQUE NOT NULL,
    user_hash_dop   varchar(64) NOT NULL,
    valor_comissao  numeric(10,2) NOT NULL,
    pis_apurado     numeric(10,4) NOT NULL,  -- valor_comissao × 0.0165
    cofins_apurado  numeric(10,4) NOT NULL,  -- valor_comissao × 0.0760
    xml_nfse_ref    text,        -- hash do XML ou número na prefeitura BH
    status          text        NOT NULL DEFAULT 'gerada'
                                CHECK (status IN (
                                    'gerada',
                                    'enviada_amazon',
                                    'enviada_cliente',
                                    'erro'
                                )),
    created_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT check_privacidade_fiscal
        CHECK (user_hash_dop NOT LIKE 'cliente_real_%')
);

ALTER TABLE public.cl_fiscal_nfse ENABLE ROW LEVEL SECURITY;

-- Backoffice admin (authenticated) pode ler
CREATE POLICY "fiscal_auth_read" ON public.cl_fiscal_nfse
    FOR SELECT TO authenticated USING (true);

-- service_role escreve (core_engine FastAPI)
CREATE POLICY "fiscal_service_all" ON public.cl_fiscal_nfse
    FOR ALL TO service_role USING (true) WITH CHECK (true);
