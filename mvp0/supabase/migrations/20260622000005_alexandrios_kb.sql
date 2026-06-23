-- AlexandriOS — base de conhecimento da ajuda conversacional (Item 5 MVP1)
-- 3 públicos: usuario | admin | integrador. Conteúdo de AJUDA (não dado de usuário) → leitura pública.
--
-- ⚠️ RECONCILIAÇÃO: já existe uma tabela `alexandrios_kb` (migration 20260524120547,
-- "PARTE 5"): id UUID, slug UNIQUE, persona_tag, qualis_level (CHECK), FK ip_item_number, etc.
-- Por isso esta migration NÃO recria a tabela — ela ESTENDE a existente de forma idempotente
-- (ADD COLUMN IF NOT EXISTS), e cria a tabela só se um ambiente novo ainda não a tiver.
-- Assim funciona tanto em produção (tabela antiga) quanto num banco-país novo.

-- 1) Safety-net p/ ambiente novo (em prod isto é no-op, a tabela já existe).
CREATE TABLE IF NOT EXISTS public.alexandrios_kb (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_canonical BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Colunas novas do MVP1 (3 públicos + ancoragem da ajuda contextual). Idempotente.
ALTER TABLE public.alexandrios_kb ADD COLUMN IF NOT EXISTS publico      TEXT NOT NULL DEFAULT 'usuario';  -- usuario | admin | integrador
ALTER TABLE public.alexandrios_kb ADD COLUMN IF NOT EXISTS persona      TEXT;
ALTER TABLE public.alexandrios_kb ADD COLUMN IF NOT EXISTS related_faqs TEXT[] DEFAULT '{}';
ALTER TABLE public.alexandrios_kb ADD COLUMN IF NOT EXISTS tone         TEXT;
-- ancoragem ("?" em cada fase): a qual tela/módulo/rota esta entrada pertence (ex: "proteos","settings","skin-b/tools")
ALTER TABLE public.alexandrios_kb ADD COLUMN IF NOT EXISTS anchor       TEXT;
-- presentes na tabela antiga, mas garantimos p/ ambiente novo:
ALTER TABLE public.alexandrios_kb ADD COLUMN IF NOT EXISTS qualis_level  TEXT;
ALTER TABLE public.alexandrios_kb ADD COLUMN IF NOT EXISTS source_author TEXT;  -- 🔒 sigilo: só codinome neutro; nunca autor/livro real
ALTER TABLE public.alexandrios_kb ADD COLUMN IF NOT EXISTS ts            TIMESTAMPTZ DEFAULT NOW();

-- 3) Índices (agora as colunas existem com certeza).
CREATE INDEX IF NOT EXISTS alexandrios_kb_publico_idx  ON public.alexandrios_kb (publico);
CREATE INDEX IF NOT EXISTS alexandrios_kb_anchor_idx   ON public.alexandrios_kb (anchor);

-- 4) Backfill: as 10 entradas canônicas pré-existentes viram ajuda de USUÁRIO e ganham âncora por módulo.
UPDATE public.alexandrios_kb SET publico = 'usuario' WHERE publico IS NULL;
-- continuidade persona_tag -> persona (tabela antiga usa persona_tag)
UPDATE public.alexandrios_kb SET persona = persona_tag
  WHERE persona IS NULL AND persona_tag IS NOT NULL;
-- âncoras das entradas canônicas existentes (ajuda contextual "?")
UPDATE public.alexandrios_kb SET anchor = 'proteos'    WHERE slug = 'what-is-proteos'   AND anchor IS NULL;
UPDATE public.alexandrios_kb SET anchor = 'hygeios'    WHERE slug IN ('what-is-ivi')     AND anchor IS NULL;
UPDATE public.alexandrios_kb SET anchor = 'sandeiros'  WHERE slug = 'what-is-sandeiros'  AND anchor IS NULL;
UPDATE public.alexandrios_kb SET anchor = 'ecumenicos' WHERE slug = 'what-is-ecumenicos' AND anchor IS NULL;
UPDATE public.alexandrios_kb SET anchor = 'asclepios'  WHERE slug IN ('how-to-budget','how-to-diabetes','cardiac-checkup-50') AND anchor IS NULL;
UPDATE public.alexandrios_kb SET anchor = 'settings'   WHERE slug = 'lgpd-export-data'   AND anchor IS NULL;
UPDATE public.alexandrios_kb SET anchor = 'home'       WHERE slug = 'what-is-aquarios'   AND anchor IS NULL;

-- 5) RLS: leitura PÚBLICA (ajuda), escrita só service_role. Idempotente.
ALTER TABLE public.alexandrios_kb ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS alexandrios_kb_public_read ON public.alexandrios_kb;
CREATE POLICY alexandrios_kb_public_read ON public.alexandrios_kb FOR SELECT
  USING (true);
