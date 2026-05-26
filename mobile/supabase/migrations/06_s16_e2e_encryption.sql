-- S16: E2E Encryption — Colunas de dados cifrados
-- Backward compatible: content original permanece para entradas antigas
-- Novas entradas: content='[encrypted]', content_encrypted+content_nonce preenchidos

-- diario_entries
ALTER TABLE public.diario_entries
  ADD COLUMN IF NOT EXISTS content_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS content_nonce      TEXT;

-- chat_messages
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS content_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS content_nonce      TEXT;

-- wonder_night_logs (futuro — sem tela de escrita ainda)
ALTER TABLE public.wonder_night_logs
  ADD COLUMN IF NOT EXISTS reflection_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS reflection_nonce      TEXT;

-- meals (tabela real usada pelas telas de nutrição)
ALTER TABLE public.meals
  ADD COLUMN IF NOT EXISTS name_encrypted  TEXT,
  ADD COLUMN IF NOT EXISTS name_nonce      TEXT,
  ADD COLUMN IF NOT EXISTS notes_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS notes_nonce     TEXT;

-- ============================================================
-- RLS Hardening — Comunidades faltavam INSERT/UPDATE/DELETE
-- ============================================================
ALTER TABLE public.communities      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view communities"     ON public.communities;
DROP POLICY IF EXISTS "Members can view memberships"    ON public.community_members;

-- Communities: leitura pública, escrita só do criador
CREATE POLICY "Anyone can view communities"
  ON public.communities FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create communities"
  ON public.communities FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Community creator can update"
  ON public.communities FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Community creator can delete"
  ON public.communities FOR DELETE
  USING (auth.uid() = created_by);

-- Community members
CREATE POLICY "Members can view memberships"
  ON public.community_members FOR SELECT USING (true);

CREATE POLICY "Users can join communities"
  ON public.community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
  ON public.community_members FOR DELETE
  USING (auth.uid() = user_id);
