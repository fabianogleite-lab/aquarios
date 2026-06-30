-- D-21: HygeiOS Data Gate — colunas pra suportar níveis free_comunidade/beck_office
-- D-22: Personas LGPD — remoção controlada de dado (profile_data_removed)
BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS community_opt_in BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='persona_management') THEN
    ALTER TABLE public.persona_management
      ADD COLUMN IF NOT EXISTS profile_data_removed BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS profile_removed_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS profile_removed_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

COMMIT;
