-- Evidência contínua ISO 27001 (base da futura self-declaration — NUNCA alegar
-- "certificado"). Cada controle recebe eventos do backend; o iso-autopilot
-- (GitHub Action nightly) gera a SoA a partir daqui.
-- Padrão migration 30: RLS ENABLE+FORCE sem policy = acesso só service_role.

CREATE TABLE IF NOT EXISTS public.cl_iso_evidence (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id  text NOT NULL,             -- ex: 'A.8.10'
  event       text NOT NULL,             -- ex: 'dsar_created'
  asset       text,                      -- recurso afetado (sem PII)
  details     jsonb,
  source      text NOT NULL DEFAULT 'business-agent',
  criado_em   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cl_iso_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cl_iso_evidence FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.cl_iso_evidence FROM anon;
REVOKE ALL ON public.cl_iso_evidence FROM authenticated;

CREATE INDEX IF NOT EXISTS idx_iso_evidence_control ON public.cl_iso_evidence (control_id, criado_em DESC);

COMMENT ON TABLE public.cl_iso_evidence IS
  'Evidências ISO 27001 auto-coletadas (A.5.15 acesso, A.8.10 eliminação/DSAR, A.8.15 logging...). SoA nightly via iso-autopilot.';
