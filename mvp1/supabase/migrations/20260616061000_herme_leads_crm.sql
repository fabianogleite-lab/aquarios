-- migration 61: HermeOS CRM Pipeline (herme_leads)
-- Reusa lógica pipeline AquariOS — zero infra adicional

CREATE TABLE IF NOT EXISTS public.herme_leads (
    id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id     uuid        REFERENCES public.herme_projetos(id) ON DELETE CASCADE,
    canal_contato  text        CHECK (canal_contato IN ('whatsapp','email','ligacao','reuniao')),
    lead_score     text        NOT NULL DEFAULT 'cold'
                               CHECK (lead_score IN ('hot','warm','cold')),
    status         text        NOT NULL DEFAULT 'novo'
                               CHECK (status IN ('novo','contactado','convertido','perdido')),
    observacoes    text,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.herme_leads ENABLE ROW LEVEL SECURITY;

-- Owner lê os próprios leads
CREATE POLICY "herme_leads_owner_read" ON public.herme_leads
    FOR SELECT TO authenticated
    USING (projeto_id IN (
        SELECT id FROM public.herme_projetos WHERE user_id = auth.uid()
    ));

-- service_role escreve (pipeline ProteOS / backoffice admin)
CREATE POLICY "herme_leads_service_all" ON public.herme_leads
    FOR ALL TO service_role USING (true) WITH CHECK (true);
