-- S17: EcumenicOS — 13 tradições + 39 referências aprovadas
-- Sessão original: 13/05/2026 "Módulo médico e criação do EcumenicOS"
-- Aprovação linha a linha pelo usuário

-- ============================================================
-- SCHEMA
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ecumenic_traditions (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug              TEXT        NOT NULL UNIQUE,   -- 'catolicismo', 'budismo', etc.
  name              TEXT        NOT NULL,
  icon              TEXT,
  oracle_modern     TEXT,       -- campo oculto: nunca exposto ao usuário como label
  oracle_label      TEXT,       -- ex: "Axé — Força Vital" (também oculto)
  active            BOOLEAN     DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ecumenic_references (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  tradition_id      UUID        NOT NULL REFERENCES public.ecumenic_traditions(id) ON DELETE CASCADE,
  position          SMALLINT    NOT NULL CHECK (position IN (1,2,3)),
  -- 1=Canônico, 2=Interpretativo, 3=Diálogo Contemporâneo
  title             TEXT        NOT NULL,
  author            TEXT,
  year              TEXT,
  description       TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ecumenic_refs_tradition ON public.ecumenic_references(tradition_id);

-- RLS
ALTER TABLE public.ecumenic_traditions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecumenic_references  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read traditions"
  ON public.ecumenic_traditions FOR SELECT USING (true);

CREATE POLICY "Anyone can read references"
  ON public.ecumenic_references FOR SELECT USING (true);

CREATE POLICY "Service role manages traditions"
  ON public.ecumenic_traditions FOR ALL
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role manages references"
  ON public.ecumenic_references FOR ALL
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- SEED: 13 TRADIÇÕES
-- ============================================================

INSERT INTO public.ecumenic_traditions (slug, name, icon, oracle_modern, oracle_label) VALUES
  ('catolicismo',          'Cristianismo Católico',           '✝️', 'Gnôthi Seauton — Conhece-te a Ti Mesmo', 'Oráculo de Delfos'),
  ('protestantismo',       'Cristianismo Protestante (Luterano)', '✝️', 'Gnôthi Seauton — Conhece-te a Ti Mesmo', 'Oráculo de Delfos'),
  ('islamismo',            'Islamismo',                       '☪️', 'Gnôthi Seauton — Conhece-te a Ti Mesmo', 'Oráculo de Delfos'),
  ('judaismo',             'Judaísmo',                        '✡️', 'Gnôthi Seauton — Conhece-te a Ti Mesmo', 'Oráculo de Delfos'),
  ('hinduismo',            'Hinduísmo',                       '🕉️', 'Gnôthi Seauton — Conhece-te a Ti Mesmo', 'Oráculo de Delfos'),
  ('budismo',              'Budismo',                         '☸️', 'Gnôthi Seauton — Conhece-te a Ti Mesmo', 'Oráculo de Delfos'),
  ('taoismo',              'Taoísmo',                         '☯️', 'Wu Wei', 'Não-ação como sabedoria suprema'),
  ('confucionismo',        'Confucionismo',                   '⚖️', 'Gnôthi Seauton — Conhece-te a Ti Mesmo', 'Oráculo de Delfos'),
  ('candomble',            'Candomblé',                       '🌿', 'Axé', 'Axé — Força Vital'),
  ('zoroastrismo',         'Zoroastrismo',                    '🔥', 'Gnôthi Seauton — Conhece-te a Ti Mesmo', 'Oráculo de Delfos'),
  ('xamanismo_amazonico',  'Xamanismo Amazônico',             '🌿', 'Yachak', 'Yachak — Sabedor Xamânico'),
  ('gnosticismo',          'Gnosticismo',                     '👁️', 'Gnôthi Seauton — Conhece-te a Ti Mesmo', 'Oráculo de Delfos'),
  ('ateismo_secularismo',  'Ateísmo / Secularismo',           '🔭', 'Gnôthi Seauton — Conhece-te a Ti Mesmo', 'Oráculo de Delfos')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: 39 REFERÊNCIAS (3 por tradição)
-- ============================================================

DO $$
DECLARE
  t_id UUID;
BEGIN

  -- 1. CATOLICISMO
  SELECT id INTO t_id FROM public.ecumenic_traditions WHERE slug = 'catolicismo';
  INSERT INTO public.ecumenic_references (tradition_id, position, title, author, year, description) VALUES
    (t_id, 1, 'Bíblia Sagrada', NULL, NULL, 'Texto fundador do Cristianismo'),
    (t_id, 2, 'Catecismo da Igreja Católica (CIC)', 'Santa Sé', '1992', 'Sistematização doutrinária oficial'),
    (t_id, 3, 'Fratelli Tutti', 'Papa Francisco', '2020', 'Encíclica sobre fraternidade e amizade social');

  -- 2. PROTESTANTISMO LUTERANO
  SELECT id INTO t_id FROM public.ecumenic_traditions WHERE slug = 'protestantismo';
  INSERT INTO public.ecumenic_references (tradition_id, position, title, author, year, description) VALUES
    (t_id, 1, 'Bíblia Sagrada', NULL, NULL, 'Sola Scriptura — fundamento da Reforma'),
    (t_id, 2, 'A Liberdade do Cristão', 'Martim Lutero', '1520', 'Tratado fundamental sobre fé e liberdade espiritual'),
    (t_id, 3, 'Catecismo Menor (Small Catechism)', 'Martim Lutero', '1529', 'Instrução prática para vida cristã cotidiana');

  -- 3. ISLAMISMO
  SELECT id INTO t_id FROM public.ecumenic_traditions WHERE slug = 'islamismo';
  INSERT INTO public.ecumenic_references (tradition_id, position, title, author, year, description) VALUES
    (t_id, 1, 'Alcorão (Al-Qur''an)', NULL, NULL, 'Palavra sagrada revelada ao Profeta Muhammad'),
    (t_id, 2, 'Hadith (Coleção Sahih Bukhari)', 'Al-Bukhari', '846', 'Ditos e ações do Profeta — segunda fonte jurídica'),
    (t_id, 3, 'The Study Quran', 'Seyyed Hossein Nasr', '2015', 'Tradução e comentário acadêmico-espiritual contemporâneo');

  -- 4. JUDAÍSMO
  SELECT id INTO t_id FROM public.ecumenic_traditions WHERE slug = 'judaismo';
  INSERT INTO public.ecumenic_references (tradition_id, position, title, author, year, description) VALUES
    (t_id, 1, 'Torá', NULL, NULL, 'Os cinco livros de Moisés — fundamento da Lei'),
    (t_id, 2, 'Talmud Babilônico', NULL, '~500 EC', 'Compilação de discussões rabínicas e jurisprudência'),
    (t_id, 3, 'Ética dos Pais (Pirkei Avot) — Maimônides', 'Maimônides', '1168', 'Comentário filosófico sobre ética e conduta moral');

  -- 5. HINDUÍSMO
  SELECT id INTO t_id FROM public.ecumenic_traditions WHERE slug = 'hinduismo';
  INSERT INTO public.ecumenic_references (tradition_id, position, title, author, year, description) VALUES
    (t_id, 1, 'Bhagavad Gita', NULL, NULL, 'Diálogo de Krishna sobre dever, alma e libertação'),
    (t_id, 2, 'Upanishads', NULL, NULL, 'Textos filosóficos sobre Brahman, Atman e a natureza do ser'),
    (t_id, 3, 'O Evangelho de Sri Ramakrishna', 'Mahendranath Gupta', '1942', 'Ensinamentos do santo hindu sobre harmonia entre tradições');

  -- 6. BUDISMO
  SELECT id INTO t_id FROM public.ecumenic_traditions WHERE slug = 'budismo';
  INSERT INTO public.ecumenic_references (tradition_id, position, title, author, year, description) VALUES
    (t_id, 1, 'Dhammapada', NULL, NULL, 'Versos do Buda sobre o caminho da sabedoria'),
    (t_id, 2, 'O Coração do Ensinamento do Buda', 'Thich Nhat Hanh', '1998', 'Introdução viva aos conceitos fundamentais do Dharma'),
    (t_id, 3, 'Budismo sem Crenças', 'Stephen Batchelor', '1997', 'Budismo agnóstico como prática ética secular');

  -- 7. TAOÍSMO
  SELECT id INTO t_id FROM public.ecumenic_traditions WHERE slug = 'taoismo';
  INSERT INTO public.ecumenic_references (tradition_id, position, title, author, year, description) VALUES
    (t_id, 1, 'Tao Te Ching', 'Laozi', NULL, 'O livro do Caminho e da Virtude — texto fundador'),
    (t_id, 2, 'Zhuangzi', 'Zhuangzi', NULL, 'Parábolas sobre liberdade, relatividade e natureza do Tao'),
    (t_id, 3, 'O Livro do Equilíbrio (I Ching)', NULL, NULL, 'Oráculo de transformação e sabedoria dinâmica');

  -- 8. CONFUCIONISMO
  SELECT id INTO t_id FROM public.ecumenic_traditions WHERE slug = 'confucionismo';
  INSERT INTO public.ecumenic_references (tradition_id, position, title, author, year, description) VALUES
    (t_id, 1, 'Os Analectos (Lunyu)', 'Confúcio', NULL, 'Ditos de Confúcio sobre virtude, relações e governança'),
    (t_id, 2, 'Mêncio (Mengzi)', 'Mêncio', NULL, 'Expansão da filosofia confuciana sobre bondade humana'),
    (t_id, 3, 'Confucius Lives Next Door', 'T.R. Reid', '1999', 'O confucionismo como força moral viva no mundo contemporâneo');

  -- 9. CANDOMBLÉ
  SELECT id INTO t_id FROM public.ecumenic_traditions WHERE slug = 'candomble';
  INSERT INTO public.ecumenic_references (tradition_id, position, title, author, year, description) VALUES
    (t_id, 1, 'Os Orixás', 'Pierre Fatumbi Verger', '1981', 'Referência clássica sobre os orixás e cultos afro-brasileiros'),
    (t_id, 2, 'Dicionário de Yorubá', 'José Beniste', '1997', 'Linguagem sagrada e sabedoria da tradição iorubá'),
    (t_id, 3, 'Axé: A Presença do Sagrado no Candomblé', 'Gauthier & Carvalho', NULL, 'Integração contemporânea da força vital no cotidiano');

  -- 10. ZOROASTRISMO
  SELECT id INTO t_id FROM public.ecumenic_traditions WHERE slug = 'zoroastrismo';
  INSERT INTO public.ecumenic_references (tradition_id, position, title, author, year, description) VALUES
    (t_id, 1, 'Avesta (Gathas)', 'Zaratustra', NULL, 'Poesia zoroástrica sagrada — hinos ao Ahura Mazda'),
    (t_id, 2, 'Bundahishn', NULL, NULL, 'Cosmologia zoroástrica — explicação do bem, mal e criação'),
    (t_id, 3, 'Zoroastrianism in the Modern World', 'Mehraban Soroushpour', NULL, 'Ressurgimento espiritual e relevância contemporânea');

  -- 11. XAMANISMO AMAZÔNICO
  SELECT id INTO t_id FROM public.ecumenic_traditions WHERE slug = 'xamanismo_amazonico';
  INSERT INTO public.ecumenic_references (tradition_id, position, title, author, year, description) VALUES
    (t_id, 1, 'The Cosmic Serpent: DNA and the Origins of Knowledge', 'Jeremy Narby', '1998', 'Cosmologia xamânica amazônica e seres de poder'),
    (t_id, 2, 'Ayahuasca Medicine', 'Alan Shoemaker', '2014', 'Etnografia das plantas de poder; medicina da floresta'),
    (t_id, 3, 'The Shaman''s Journey in the Modern World', 'Jeremy Narby', NULL, 'Integração do xamanismo amazônico com ciência contemporânea');

  -- 12. GNOSTICISMO
  SELECT id INTO t_id FROM public.ecumenic_traditions WHERE slug = 'gnosticismo';
  INSERT INTO public.ecumenic_references (tradition_id, position, title, author, year, description) VALUES
    (t_id, 1, 'A Hipóstase dos Arcontes (Nag Hammadi)', NULL, NULL, 'Narrativa simbólica gnóstica do conhecimento e criação'),
    (t_id, 2, 'O Apócrifo de João (Nag Hammadi)', NULL, NULL, 'Revelação direta; cosmologia gnóstica esotérica'),
    (t_id, 3, 'The Secret Book of John — Modern Spiritual Commentary', 'Stevan Davies', NULL, 'Reinterpretação espiritual contemporânea não-acadêmica');

  -- 13. ATEÍSMO / SECULARISMO
  SELECT id INTO t_id FROM public.ecumenic_traditions WHERE slug = 'ateismo_secularismo';
  INSERT INTO public.ecumenic_references (tradition_id, position, title, author, year, description) VALUES
    (t_id, 1, 'Por que não Sou Cristão', 'Bertrand Russell', '1927', 'Crítica filosófica da religião e defesa da razão'),
    (t_id, 2, 'Deus, um Delírio (The God Delusion)', 'Richard Dawkins', '2006', 'Argumento científico e filosófico pelo ateísmo'),
    (t_id, 3, 'The Moral Landscape', 'Sam Harris', '2010', 'Ética secular baseada em ciência e bem-estar humano');

END $$;
