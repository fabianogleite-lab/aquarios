-- migration 64: HermeOS Planos — Gate Free / Pro / Enterprise
-- taxa_comissao por parceiro (default 10%) — base do split IFRS 15

CREATE TABLE IF NOT EXISTS public.herme_planos (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid        REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    plano           text        NOT NULL DEFAULT 'gratuito'
                                CHECK (plano IN ('gratuito','pro','enterprise')),
    projetos_max    int         NOT NULL DEFAULT 1,   -- 1=gratuito | -1=ilimitado
    projetos_ativos int         NOT NULL DEFAULT 0,
    taxa_comissao   numeric(5,4) NOT NULL DEFAULT 0.10, -- 10% default, configurável
    validade        timestamptz,  -- NULL = sem expiração (gratuito)
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.herme_planos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "herme_planos_owner_read" ON public.herme_planos
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "herme_planos_service_all" ON public.herme_planos
    FOR ALL TO service_role USING (true) WITH CHECK (true);
