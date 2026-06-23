-- migration 68: CerberOS Incident Registry — ANPD Audit Trail
-- LGPD Art. 46: ip_hash = SHA-256[:16] — IP jamais persistido em texto plano
-- Layers: 3=rate-limit | 6=payload-heuristic | 7=honeypot

CREATE TABLE IF NOT EXISTS public.cl_cerber_incidents (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_hash         varchar(16) NOT NULL,      -- SHA-256 truncado (não reversível)
    threat_type     text        NOT NULL,       -- ex: SQLI_UNION | RATE_LIMIT | HONEYPOT:/.env
    layer_triggered int         NOT NULL CHECK (layer_triggered BETWEEN 1 AND 7),
    severity        text        NOT NULL CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cl_cerber_incidents ENABLE ROW LEVEL SECURITY;

-- service_role escreve (cerber_shield.py via supabase-py)
CREATE POLICY "cerber_service_all" ON public.cl_cerber_incidents
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- authenticated lê (backoffice + auditoria ANPD)
CREATE POLICY "cerber_auth_read" ON public.cl_cerber_incidents
    FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_cerber_ip      ON public.cl_cerber_incidents(ip_hash);
CREATE INDEX IF NOT EXISTS idx_cerber_time    ON public.cl_cerber_incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cerber_sev     ON public.cl_cerber_incidents(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cerber_layer   ON public.cl_cerber_incidents(layer_triggered);

-- View agregada para relatório ANPD (últimas 24h)
CREATE OR REPLACE VIEW public.vw_cerber_report_24h AS
SELECT
    threat_type,
    layer_triggered,
    severity,
    COUNT(*)                              AS total_eventos,
    COUNT(DISTINCT ip_hash)              AS ips_unicos,
    MIN(created_at)                      AS primeiro_evento,
    MAX(created_at)                      AS ultimo_evento
FROM public.cl_cerber_incidents
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY threat_type, layer_triggered, severity
ORDER BY total_eventos DESC;
