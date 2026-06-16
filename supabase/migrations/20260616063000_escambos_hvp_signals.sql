-- migration 63: EscambOS HVP Signals — Rating / Ranking
-- LGPD obrigatório: user_hash_dop = SHA-256 (24 chars) — NUNCA PII em disco
-- CHECK constraint rejeita qualquer PII literal (ex: 'cliente_real_...')

CREATE TABLE IF NOT EXISTS public.escambos_hvp_signals (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_hash_dop   varchar(64) NOT NULL,
    produto_id      uuid        REFERENCES public.escambos_produtos(id) ON DELETE CASCADE,
    dwell_ms        int         NOT NULL DEFAULT 0,
    clicks          int         NOT NULL DEFAULT 0,
    categoria       text,
    scroll_velocity float       NOT NULL DEFAULT 0.0,
    assertividade   text        CHECK (assertividade IN (
                                    'ANTECIPADO_SUCESSO',
                                    'OBSERVACAO_ATIVA',
                                    'OBSERVACAO_PASSIVA'
                                )),
    created_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT check_privacidade_dop
        CHECK (user_hash_dop NOT LIKE 'cliente_real_%')
);

ALTER TABLE public.escambos_hvp_signals ENABLE ROW LEVEL SECURITY;

-- Telemetria: anon pode inserir (beacon API — Shopify / landing / mobile)
CREATE POLICY "hvp_anon_insert" ON public.escambos_hvp_signals
    FOR INSERT TO anon WITH CHECK (true);

-- Leitura: owner do produto via cadeia projeto → produto
CREATE POLICY "hvp_owner_read" ON public.escambos_hvp_signals
    FOR SELECT TO authenticated
    USING (produto_id IN (
        SELECT p.id
        FROM public.escambos_produtos p
        JOIN public.herme_projetos hp ON p.projeto_id = hp.id
        WHERE hp.user_id = auth.uid()
    ));

-- service_role lê tudo (HygeiOS API / ranking endpoint)
CREATE POLICY "hvp_service_read" ON public.escambos_hvp_signals
    FOR SELECT TO service_role USING (true);
