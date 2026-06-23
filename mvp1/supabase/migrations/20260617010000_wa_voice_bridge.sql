-- migration 70: WhatsApp Voice Bridge — registro de conversas (transcrição 2 lados)
-- LGPD Art.46: wa_hash = SHA-256 do telefone (nunca número em texto claro)
-- Finalidade: aprendizado do consultor de voz (heYskY/EscambOS) — base legal por consentimento
-- AI_DISCLOSURE: welcome_text (routing.py) enviado no 1º contato satisfaz transparência de IA

CREATE TABLE IF NOT EXISTS public.wa_conversation_log (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    wa_hash     varchar(64) NOT NULL,                 -- SHA-256(telefone E.164), nunca raw
    project     text        NOT NULL DEFAULT 'heysky', -- heysky | escambos | odontolar | aquarios
    direction   text        NOT NULL CHECK (direction IN ('inbound','outbound')),
    modality    text        NOT NULL CHECK (modality  IN ('voice','text')),
    transcript  text,                                 -- texto transcrito (STT) ou escrito (TTS de saída)
    lang        varchar(8)  DEFAULT 'pt',
    consent     boolean     NOT NULL DEFAULT false,   -- consentimento LGPD p/ retenção/aprendizado
    created_at  timestamptz NOT NULL DEFAULT now(),

    -- wa_hash nunca pode ser um telefone em texto claro
    CONSTRAINT ck_wa_hash_not_plain CHECK (
        length(wa_hash) = 64
        AND wa_hash NOT SIMILAR TO '[0-9]{8,15}'
    )
);

ALTER TABLE public.wa_conversation_log ENABLE ROW LEVEL SECURITY;

-- service_role escreve (bridge via supabase-py)
CREATE POLICY "wa_log_service_all" ON public.wa_conversation_log
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- authenticated lê (backoffice + aprendizado, só registros com consentimento)
CREATE POLICY "wa_log_auth_read" ON public.wa_conversation_log
    FOR SELECT TO authenticated USING (consent = true);

CREATE INDEX IF NOT EXISTS idx_wa_log_hash    ON public.wa_conversation_log(wa_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_log_project ON public.wa_conversation_log(project, created_at DESC);

-- View de conversa agregada (para o backoffice montar a timeline transcrita dos 2 lados)
CREATE OR REPLACE VIEW public.vw_wa_conversa AS
SELECT
    wa_hash,
    project,
    lang,
    COUNT(*)                                            AS total_mensagens,
    COUNT(*) FILTER (WHERE direction = 'inbound')       AS do_cliente,
    COUNT(*) FILTER (WHERE direction = 'outbound')      AS nossas,
    COUNT(*) FILTER (WHERE modality  = 'voice')         AS por_voz,
    MIN(created_at)                                     AS iniciada_em,
    MAX(created_at)                                     AS ultima_em
FROM public.wa_conversation_log
WHERE consent = true
GROUP BY wa_hash, project, lang;
