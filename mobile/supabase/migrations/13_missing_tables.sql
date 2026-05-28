-- Migration 13: Tabelas faltantes referenciadas no código
-- xp_log | user_xp | user_profiles | performance_metrics

-- ─────────────────────────────────────────────────────────────
-- 1. xp_log — histórico de XP ganho por ação
--    useXP.ts / useGate.ts
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.xp_log (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action      TEXT        NOT NULL,
  xp_earned   INTEGER     NOT NULL DEFAULT 0,
  module      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS xp_log_user_id_idx ON public.xp_log (user_id);
CREATE INDEX IF NOT EXISTS xp_log_created_at_idx ON public.xp_log (created_at DESC);

ALTER TABLE public.xp_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own xp_log"
  ON public.xp_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp_log"
  ON public.xp_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 2. user_xp — nível e XP total acumulado (cache denormalizado)
--    leaderboard.tsx / achievements.tsx / store.tsx
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_xp (
  user_id     UUID        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  level       INTEGER     NOT NULL DEFAULT 1,
  total_xp    INTEGER     NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_xp_level_idx ON public.user_xp (level DESC);

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own user_xp"
  ON public.user_xp FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Leaderboard visible to authenticated"
  ON public.user_xp FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can upsert own user_xp"
  ON public.user_xp FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_xp"
  ON public.user_xp FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger: atualiza user_xp automaticamente ao inserir em xp_log
CREATE OR REPLACE FUNCTION public.sync_user_xp()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total INTEGER;
  v_level INTEGER;
  thresholds INTEGER[] := ARRAY[0,100,300,600,1000,1500,2100,2800,3600,4500];
  i INTEGER;
BEGIN
  SELECT COALESCE(SUM(xp_earned), 0) INTO v_total
    FROM public.xp_log WHERE user_id = NEW.user_id;

  v_level := 0;
  FOR i IN 1..array_length(thresholds, 1) LOOP
    IF v_total >= thresholds[i] THEN v_level := i - 1; END IF;
  END LOOP;

  INSERT INTO public.user_xp (user_id, level, total_xp, updated_at)
    VALUES (NEW.user_id, v_level, v_total, now())
    ON CONFLICT (user_id) DO UPDATE
      SET level = EXCLUDED.level,
          total_xp = EXCLUDED.total_xp,
          updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_user_xp ON public.xp_log;
CREATE TRIGGER trg_sync_user_xp
  AFTER INSERT ON public.xp_log
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_xp();

-- ─────────────────────────────────────────────────────────────
-- 3. user_profiles — perfil estendido do usuário
--    comunidades.tsx / comunidades-post-form.tsx /
--    OnboardingFlow / useCommunityScoring
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id         UUID        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT,
  persona         TEXT,                          -- persona detectada (ZÉ_DO_APERTO etc)
  onboarding_done BOOLEAN     NOT NULL DEFAULT false,
  avatar_url      TEXT,
  bio             TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own user_profiles"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Community members can view profiles"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own user_profiles"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_profiles"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-criar user_profiles ao criar profiles
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, name)
    VALUES (NEW.id, NEW.full_name)
    ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_user_profile ON public.profiles;
CREATE TRIGGER trg_create_user_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

-- ─────────────────────────────────────────────────────────────
-- 4. performance_metrics — telemetria de performance (HygeiOS)
--    lib/performance.ts
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id           TEXT,
  platform             TEXT,
  device_model         TEXT,
  os_version           TEXT,
  app_version          TEXT,
  network_type         TEXT,
  country_code         TEXT        DEFAULT 'BR',
  app_cold_start_ms    INTEGER,
  app_warm_start_ms    INTEGER,
  screen_transition_ms INTEGER,
  touch_to_render_ms   INTEGER,
  fps_average          NUMERIC(5,2),
  api_response_ms      INTEGER,
  screen_name          TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS perf_user_id_idx    ON public.performance_metrics (user_id);
CREATE INDEX IF NOT EXISTS perf_created_at_idx ON public.performance_metrics (created_at DESC);
CREATE INDEX IF NOT EXISTS perf_screen_idx     ON public.performance_metrics (screen_name);

ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own metrics"
  ON public.performance_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can read all metrics"
  ON public.performance_metrics FOR SELECT
  USING (auth.role() = 'service_role');
