-- migration 60: HermeOS Projetos + Wizard Respostas
-- EscambOS marketplace | HermeOS Pro project creation
-- C&L CNPJ 41.191.506/0001-02 | CNAE 74.90-1-04

CREATE TABLE IF NOT EXISTS public.herme_projetos (
    id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
    nome       text        NOT NULL,
    tagline    text,
    categoria  text,
    formato    text        CHECK (formato IN ('produto_fisico','servico','digital','conhecimento')),
    canal      text,
    plano      text        NOT NULL DEFAULT 'gratuito'
                           CHECK (plano IN ('gratuito','pro','enterprise')),
    site_config jsonb      NOT NULL DEFAULT '{}',
    lead_score  text        CHECK (lead_score IN ('hot','warm','cold')),
    sonho       text,       -- Q10 wizard (MVP2 — coluna criada agora)
    status      text        NOT NULL DEFAULT 'rascunho'
                            CHECK (status IN ('rascunho','ativo','pausado')),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.herme_projetos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "herme_proj_owner_all" ON public.herme_projetos
    FOR ALL TO authenticated
    USING  (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "herme_proj_anon_read_active" ON public.herme_projetos
    FOR SELECT TO anon USING (status = 'ativo');

-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.herme_wizard_respostas (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id      uuid        REFERENCES public.herme_projetos(id) ON DELETE CASCADE,
    q1_perfil       text,
    q2_habilidade   text[],
    q3_formato      text,
    q4_mercado      text[],
    q5_instrumentos text[],
    q6_urgencia     text,
    q7_renda_meta   text,
    q7_investimento text,
    q8_escala       text,
    q9_decisor      text,
    q10_sonho       text,       -- MVP2
    created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.herme_wizard_respostas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "herme_wizard_owner_all" ON public.herme_wizard_respostas
    FOR ALL TO authenticated
    USING  (projeto_id IN (SELECT id FROM public.herme_projetos WHERE user_id = auth.uid()))
    WITH CHECK (projeto_id IN (SELECT id FROM public.herme_projetos WHERE user_id = auth.uid()));
