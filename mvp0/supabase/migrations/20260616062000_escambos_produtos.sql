-- migration 62: EscambOS Catálogo de Produtos
-- Catálogo do marketplace — produto físico / serviço / digital / conhecimento

CREATE TABLE IF NOT EXISTS public.escambos_produtos (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id      uuid        REFERENCES public.herme_projetos(id) ON DELETE CASCADE,
    titulo          text        NOT NULL,
    descricao       text,
    preco           numeric(10,2),  -- NULL = "consulte"
    tipo            text        CHECK (tipo IN ('produto_fisico','servico','digital','conhecimento')),
    categoria       text,
    subcategoria    text,
    disponibilidade text        NOT NULL DEFAULT 'disponivel'
                                CHECK (disponibilidade IN ('disponivel','ocupado','esgotado')),
    status          text        NOT NULL DEFAULT 'ativo'
                                CHECK (status IN ('ativo','pausado')),
    created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.escambos_produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "escambos_prod_owner_all" ON public.escambos_produtos
    FOR ALL TO authenticated
    USING  (projeto_id IN (SELECT id FROM public.herme_projetos WHERE user_id = auth.uid()))
    WITH CHECK (projeto_id IN (SELECT id FROM public.herme_projetos WHERE user_id = auth.uid()));

CREATE POLICY "escambos_prod_anon_read_active" ON public.escambos_produtos
    FOR SELECT TO anon USING (status = 'ativo');
