-- migration 69: CPF hash obrigatório em herme_leads
-- Fundamento legal: Art. 14 Lei 8.934/1994 (identificação do vendedor)
-- LGPD Art. 46: armazenar apenas SHA-256 do CPF (64 chars hex), nunca texto claro

ALTER TABLE public.herme_leads
    ADD COLUMN IF NOT EXISTS cpf_hash                  varchar(64),
    ADD COLUMN IF NOT EXISTS identidade_verificada_em  timestamptz;

COMMENT ON COLUMN public.herme_leads.cpf_hash IS
    'SHA-256(CPF sem pontuação), nunca texto plano — LGPD Art.46 + Lei 8.934/1994';

-- CHECK garante que cpf_hash nunca recebe CPF em texto claro (11 dígitos ou formatado)
ALTER TABLE public.herme_leads
    ADD CONSTRAINT ck_lead_cpf_not_plain
    CHECK (
        cpf_hash IS NULL
        OR (
            length(cpf_hash) = 64
            AND cpf_hash NOT SIMILAR TO '[0-9]{11}'
            AND cpf_hash NOT SIMILAR TO '[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}'
        )
    );

-- Índice para consulta por hash (auditoria KYC)
CREATE INDEX IF NOT EXISTS idx_leads_cpf_hash
    ON public.herme_leads(cpf_hash)
    WHERE cpf_hash IS NOT NULL;
