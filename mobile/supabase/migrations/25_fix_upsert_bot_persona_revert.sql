-- Migration 25: Corrige upsert_bot_persona (dois bugs)
-- Bug 1 (migration 24): lookup por username que não existe em profiles → volta para display_name
-- Bug 2 (migration 09): INSERT em timeline_posts que não existe → corrige para community_posts
-- O warning "unused parameter p_username" é nível extra e não bloqueia execução.

CREATE OR REPLACE FUNCTION public.upsert_bot_persona(
  p_username    TEXT,
  p_display     TEXT,
  p_locale      TEXT,
  p_archetype   TEXT,
  p_tradition   TEXT,
  p_seed_post   TEXT
) RETURNS void AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Lookup por display_name (coluna garantidamente existente em profiles)
  SELECT id INTO v_id FROM public.profiles WHERE display_name = p_display LIMIT 1;

  IF v_id IS NULL THEN
    v_id := gen_random_uuid();
    INSERT INTO public.profiles (id, display_name, locale, is_bot, archetype, tradition, plan)
    VALUES (v_id, p_display, p_locale, true, p_archetype, p_tradition, 'free_comunidade')
    ON CONFLICT DO NOTHING;
  ELSE
    UPDATE public.profiles
    SET locale = p_locale, is_bot = true, archetype = p_archetype, tradition = p_tradition
    WHERE id = v_id;
  END IF;

  INSERT INTO public.community_posts (user_id, content, is_public, created_at)
  SELECT v_id, p_seed_post, true, now() - (INTERVAL '1 day' * (random() * 14)::int)
  WHERE v_id IS NOT NULL
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
