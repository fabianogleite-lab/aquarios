-- DSAR (LGPD Art.18) — tickets do Data Deletion Callback da Meta e pedidos diretos.
-- Padrão migration 30: RLS ENABLE+FORCE sem policy = acesso só service_role.
-- subject_hash = sha256(fone E.164)[:16], mesmo formato de leads.phone_hash — sem PII raw.

CREATE TABLE IF NOT EXISTS public.cl_dsar_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket      uuid NOT NULL UNIQUE,
  subject_hash text NOT NULL,
  source      text NOT NULL DEFAULT 'meta_deletion_callback',
  dry_run     boolean NOT NULL DEFAULT true,
  report      jsonb,
  criado_em   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cl_dsar_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cl_dsar_requests FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.cl_dsar_requests FROM anon;
REVOKE ALL ON public.cl_dsar_requests FROM authenticated;

CREATE INDEX IF NOT EXISTS idx_dsar_ticket ON public.cl_dsar_requests (ticket);
CREATE INDEX IF NOT EXISTS idx_dsar_subject ON public.cl_dsar_requests (subject_hash);

COMMENT ON TABLE public.cl_dsar_requests IS
  'Tickets DSAR — LGPD Art.18 VI + Meta Data Deletion Callback. Retenção 90d (purge futuro).';
