-- Migration 27: upsert_bot_persona com schema correto de community_posts
-- community_posts não tem is_public — colunas reais: user_id, title, content,
-- category, tags, view_count, reply_count, helpful_count, created_at

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
  v_title TEXT;
BEGIN
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

  -- Deriva título do seed post (primeiros 60 chars)
  v_title := left(p_seed_post, 60);

  INSERT INTO public.community_posts (user_id, title, content, category, tags, view_count, reply_count, helpful_count, created_at)
  SELECT
    v_id,
    v_title,
    p_seed_post,
    p_tradition,
    ARRAY[]::TEXT[],
    0,
    0,
    0,
    now() - (INTERVAL '1 day' * (random() * 14)::int)
  WHERE v_id IS NOT NULL
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
