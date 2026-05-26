-- ============================================================
-- S17: CONSTITUIÇÃO AQUARIOS — Algoritmo Unificado
-- Sessão 26/05/2026
--
-- 3 PILARES FUNDACIONAIS:
--   Pilar 1: SandeirOS (oculto) — 22 arcanos, 3 livros basais, 7 leis herméticas
--   Pilar 2: Psicologia Social (público quando necessário) — 10 módulos
--   Pilar 3: HygeiOS (enforcement) — gate + audit + CRM + gestão 130 personas
--
-- REGRAS INVIOLÁVEIS:
--   - SÓ HygeiOS fala com CerberOS (personas NUNCA)
--   - 7 leis herméticas NUNCA expostas ao usuário
--   - oracle_hidden / oracle_label NUNCA expostos como label
--   - fa-IR: NUNCA mencionar Baha'i
--   - ProteOS é AI-First
--   - Comunidades são o coração do AquariOS
-- ============================================================

-- ============================================================
-- PARTE 1: REGISTRO DE MÓDULOS (âncora única de verdade)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.aquarios_modules (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug            TEXT        NOT NULL UNIQUE,
  name            TEXT        NOT NULL,
  icon            TEXT,
  category        TEXT        NOT NULL,       -- 'module' | 'native_tool' | 'infrastructure'
  status          TEXT        DEFAULT 'planned', -- 'active' | 'built' | 'coming_soon' | 'planned'
  description     TEXT,
  code_anchor     TEXT,                       -- caminho principal no código
  db_tables       TEXT[],                     -- tabelas que este módulo usa
  depends_on      TEXT[],                     -- slugs de módulos dos quais depende
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.aquarios_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read modules" ON public.aquarios_modules FOR SELECT USING (true);
CREATE POLICY "Service role manages modules" ON public.aquarios_modules FOR ALL WITH CHECK (auth.role() = 'service_role');

INSERT INTO public.aquarios_modules (slug, name, icon, category, status, description, code_anchor, db_tables, depends_on) VALUES
  -- 8 MÓDULOS
  ('aeropagos',   'AeropagOS',   '🏛', 'module', 'built',        'Gamificação por lotes (XP, badges, leaderboard, mentor)',           'config/modules/aeropagos.json',     ARRAY['xp_log','badges','user_xp','user_tokens'], NULL),
  ('panaceia',    'PanaceIA',    '🛍', 'module', 'coming_soon',   'Marketplace + monetização (tokens, serviços, mentoria, loja)',      'app/(app)/coming-soon.tsx',          ARRAY['purchases','user_tokens','panaceia_offerings'], NULL),
  ('cerberos',    'CerberOS',    '🔐', 'module', 'active',        'Segurança ativa 7 camadas. SÓ recebe sinais de HygeiOS.',          'config/modules/cerberos.json',       ARRAY['audit_logs','rate_limit_log','hygeios_cerberos_signals'], ARRAY['hygeios']),
  ('sandeiros',   'SandeirOS',   '🔮', 'module', 'coming_soon',   'Engine simbólica: 22 arcanos + 3 livros basais + 7 leis herméticas', 'lib/proteos-cultural-voice.ts',    ARRAY['archetype_polarity','hermetic_balance_log'], NULL),
  ('asclepios',   'AsclepiOS',   '⚕',  'module', 'coming_soon',   'Módulo médico, prontuário longitudinal integrado ao HygeiOS',      'app/(app)/coming-soon.tsx',          NULL, ARRAY['hygeios']),
  ('hermeos',     'HermeOS',     '💰', 'module', 'coming_soon',   'Inteligência financeira pessoal',                                   'app/(app)/coming-soon.tsx',          NULL, NULL),
  ('eterios',     'EteriOS',     '📡', 'module', 'coming_soon',   'Conexão wearables e IoT',                                           'app/(app)/coming-soon.tsx',          ARRAY['telemetry_vitality_logs'], ARRAY['hygeios']),
  ('ecumenicos',  'EcumenicOS',  '☯',  'module', 'active',        'Sabedoria inter-religiosa: 13 tradições, 39 referências',           'app/(app)/coming-soon.tsx',          ARRAY['ecumenic_traditions','ecumenic_references'], NULL),

  -- FERRAMENTAS NATIVAS (não são módulos — são o OS)
  ('proteos',     'ProteOS',     '💬', 'native_tool', 'active',   'AI-First: assistente IA pessoal com Cultural Voice Layer',          'app/(app)/proteos.tsx',              ARRAY['chat_messages'], ARRAY['hygeios','sandeiros','ecumenicos']),
  ('hygeios',     'HygeiOS',     '🧬', 'native_tool', 'active',   'Gate + Audit + CRM + IVI. Gerencia 130 personas. Fala com CerberOS.', 'app/(app)/hygeios.tsx',           ARRAY['telemetry_vitality_logs','meals','audit_logs','content_audit_log','user_violations','persona_management'], NULL),
  ('comunidades', 'Comunidades', '👥', 'native_tool', 'active',   'Coração do AquariOS. 130 personas AI. Círculos por arquétipo.',     'app/(app)/comunidades.tsx',          ARRAY['community_posts','community_replies','community_ratings','community_members','communities'], ARRAY['hygeios']),
  ('diario',      'Diário do Ser','✎', 'native_tool', 'active',   'Reflexões diárias e autoconhecimento (E2E criptografado)',          'app/(app)/diario.tsx',               ARRAY['diario_entries'], NULL),
  ('nutricao',    'Nutrição',    '🥗', 'native_tool', 'active',   'Tracking nutricional inteligente (E2E criptografado)',              'app/(app)/nutricao.tsx',             ARRAY['meals','nutrition_goals'], NULL),
  ('wonder',      'Wonder Night','🌙', 'native_tool', 'active',   'Rituais noturnos de transformação',                                 'app/(app)/wonder-night.tsx',         ARRAY['wonder_night_logs','wonder_purchases'], NULL),
  ('tokens',      'Token Economy','🪙', 'native_tool', 'built',   '4 tipos: AI, Sync, Insight, Community',                             'hooks/useTokens.ts',                ARRAY['user_tokens','purchases'], ARRAY['aeropagos']),
  ('beckoffice',  'Beck Office', '🏢', 'native_tool', 'coming_soon','B2B para clínicas, empresas, white-label',                        'app/(app)/coming-soon.tsx',          NULL, ARRAY['hygeios'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PARTE 2: CONSTITUIÇÃO — 3 PILARES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.aquarios_constitution (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  pillar            TEXT        NOT NULL,      -- 'sandeiros' | 'psicologia_social' | 'hygeios'
  item_number       SMALLINT    NOT NULL,
  title             TEXT        NOT NULL,
  description       TEXT        NOT NULL,       -- descritivo público (quando PS) ou oculto (quando SandeirOS)
  bibliography      TEXT,                       -- referência bibliográfica
  algorithmic_proposal TEXT,                    -- como o algoritmo aplica
  hermetic_law      TEXT,                       -- lei hermética associada (nullable, oculta)
  arcana            TEXT,                       -- arcano SandeirOS associado (nullable)
  enforcement_action TEXT,                      -- 'warn' | 'flag' | 'block' (para PS)
  is_public         BOOLEAN     DEFAULT false,  -- visível ao usuário?
  created_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pillar, item_number)
);

ALTER TABLE public.aquarios_constitution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read constitution" ON public.aquarios_constitution FOR SELECT USING (true);
CREATE POLICY "Service role manages constitution" ON public.aquarios_constitution FOR ALL WITH CHECK (auth.role() = 'service_role');

-- PILAR 1: SANDEIROS (oculto — is_public = false)
INSERT INTO public.aquarios_constitution (pillar, item_number, title, description, bibliography, algorithmic_proposal, hermetic_law, is_public) VALUES
  ('sandeiros', 1, 'O Quarto Caminho',
   'Autoconhecimento como caminho no mundo ordinário. Não requer mosteiro — a vida cotidiana é o laboratório.',
   'Gurdjieff, G.I. — Relatos de Belzebu ao seu Neto; Ouspensky, P.D. — Fragmentos de um Ensinamento Desconhecido',
   'Toda interação do ProteOS parte do princípio que o usuário já está no caminho — não precisa ir a lugar nenhum especial.',
   'mentalismo', false),
  ('sandeiros', 2, 'A Voz do Silêncio',
   'O silêncio interior como fonte de conhecimento. A verdadeira voz fala quando o ruído cessa.',
   'Blavatsky, H.P. — A Voz do Silêncio (tradução do Livro dos Preceitos Áureos)',
   'ProteOS respeita pausas. Não preenche silêncio com ruído. Quando não sabe, cala. O algoritmo nunca inventa.',
   'vibração', false),
  ('sandeiros', 3, 'Livro dos Mortos do Tibet',
   'Bardo Thodol — navegação consciente entre estados de consciência. Toda crise é transição.',
   'Padmasambhava — Bardo Thodol; Evans-Wentz, W.Y. — The Tibetan Book of the Dead',
   'Crises do usuário são tratadas como bardos — transições, não fracassos. HygeiOS não patologiza.',
   'ritmo', false),
  ('sandeiros', 4, 'Lei do Mentalismo',      'O Todo é Mente. A transformação começa no pensamento.',                                   'Três Iniciados — O Caibalion (Kybalion)', 'Personas plantam sementes cognitivas antes de sugerir ação.',                         'mentalismo', false),
  ('sandeiros', 5, 'Lei da Correspondência',  'Assim em cima, assim embaixo. O macro reflete o micro.',                                  'Três Iniciados — O Caibalion', 'O que acontece na comunidade (macro) reflete o indivíduo (micro). HygeiOS lê ambos.',    'correspondência', false),
  ('sandeiros', 6, 'Lei da Vibração',         'Nada está parado. Tudo vibra, tudo se move.',                                             'Três Iniciados — O Caibalion', 'Tom da conversa importa. Persona ajusta frequência: grupo denso → leveza; frívolo → profundidade.', 'vibração', false),
  ('sandeiros', 7, 'Lei da Polaridade',       'Tudo tem seu oposto. Os opostos são idênticos em natureza, diferem em grau.',             'Três Iniciados — O Caibalion', 'Todo arquétipo tem complementar. Guerreiro↔Curador. HygeiOS equilibra lentamente via personas.', 'polaridade', false),
  ('sandeiros', 8, 'Lei do Ritmo',            'Tudo flui. O pêndulo oscila. Toda ação tem reação.',                                      'Três Iniciados — O Caibalion', 'Períodos de alta → baixa são naturais. Persona não força engagement constante.',          'ritmo', false),
  ('sandeiros', 9, 'Lei de Causa e Efeito',   'Toda causa tem seu efeito. Nada acontece por acaso.',                                     'Três Iniciados — O Caibalion', 'Cada interação gera consequência medida. Nada é aleatório no algoritmo.',                 'causa_efeito', false),
  ('sandeiros', 10,'Lei do Gênero',           'Tudo tem princípio masculino e feminino. Criação requer ambos.',                           'Três Iniciados — O Caibalion', 'Nenhum grupo deve ser só ação ou só contemplação. Equilíbrio ativo/receptivo.',           'gênero', false)
ON CONFLICT (pillar, item_number) DO NOTHING;

-- PILAR 2: PSICOLOGIA SOCIAL (público quando necessário — is_public = true)
INSERT INTO public.aquarios_constitution (pillar, item_number, title, description, bibliography, algorithmic_proposal, hermetic_law, arcana, enforcement_action, is_public) VALUES
  ('psicologia_social', 1, 'Gênese do Indivíduo Coletivo',
   'O indivíduo não está na sociedade — ele É a sociedade manifestada numa biografia. O eu é um nó numa rede.',
   'Vigotski, L.S. — Formação Social da Mente; Marx, K. — Teses sobre Feuerbach',
   'Comportamento individual processado como variável dependente do contexto. Meritocracia tóxica e culpa individualista são detectadas.',
   'correspondência', 'O Mundo', 'warn', true),
  ('psicologia_social', 2, 'Identidade e Subjetividade',
   'A identidade é dialética: metamorfose vs. cristalização. A interioridade é internalização de códigos externos.',
   'Ciampa, A.C. — A Estória do Severino e a História da Severina; Lane, S.T.M. — Psicologia Social',
   'Mapear como cultura e relações moldam percepção de si. Gaslighting identitário detectado e flagged.',
   'mentalismo', 'A Sacerdotisa', 'flag', true),
  ('psicologia_social', 3, 'Processos Grupais',
   'O grupo é entidade psíquica distinta da soma. Sistemas abertos adaptam; fechados geram entropia.',
   'Pichon-Rivière, E. — O Processo Grupal; Lane, S.T.M. — Processos Grupais',
   'Monitorar vínculos e papéis. Resistências à mudança detectadas. Scapegoating e toxicidade grupal flagged.',
   'ritmo', 'A Roda da Fortuna', 'flag', true),
  ('psicologia_social', 4, 'Instituições e Poder',
   'Vigilância invisível e normalização do comportamento. O poder circula em rede capilar.',
   'Foucault, M. — Vigiar e Punir; Microfísica do Poder',
   'Análise institucional detecta poder punitivo/disciplinar. Regras não escritas auditadas. Apologia abusiva flagged.',
   'causa_efeito', 'O Imperador', 'flag', true),
  ('psicologia_social', 5, 'Práxis de Território',
   'Empoderamento em zonas de vulnerabilidade. O território é rede viva de significados.',
   'Freire, P. — Pedagogia do Oprimido; Montero, M. — Hacer para Transformar',
   'Escuta ativa priorizada. Eficácia medida pela transformação real. Desumanização territorial bloqueada.',
   'correspondência', 'A Estrela', 'block', true),
  ('psicologia_social', 6, 'Racismo e Exclusão Social',
   'Racismo estrutural é modo de sociabilidade default do sistema. Não é opinião — é dado estrutural.',
   'Almeida, S. — Racismo Estrutural; Fanon, F. — Pele Negra, Máscaras Brancas',
   'Racismo e estigma tratados como bugs sistêmicos. Hate speech bloqueado imediatamente. Sem tolerância.',
   'polaridade', 'A Justiça', 'block', true),
  ('psicologia_social', 7, 'Gênero e Violência',
   'Gênero é performance repetitiva. O patriarcado é código operacional obsoleto.',
   'Butler, J. — Problemas de Gênero; Saffioti, H. — Gênero, Patriarcado, Violência',
   'Relações assimétricas detectadas. Normalização de violência bloqueada. Misoginia bloqueada imediatamente.',
   'gênero', 'A Força', 'block', true),
  ('psicologia_social', 8, 'Educação e Libertação',
   'Fracasso escolar é frequentemente fracasso planejado. Medicalização silencia diferenças.',
   'Freire, P. — Pedagogia do Oprimido; Patto, M.H.S. — A Produção do Fracasso Escolar',
   'Sistema educacional auditado: produz autonomia (Freire) ou rotula falhas (Patto)? Patologização abusiva flagged.',
   'mentalismo', 'O Hierofante', 'flag', true),
  ('psicologia_social', 9, 'Saúde Mental',
   'Sofrimento psíquico não é avaria mecânica — é resposta ao contexto. Liberdade sobre isolamento.',
   'Basaglia, F. — A Instituição Negada; Amarante, P. — Saúde Mental e Atenção Psicossocial',
   'Sofrimento processado como sinal de tensão no sistema. Estigma psiquiátrico flagged. Crise é feedback.',
   'vibração', 'A Lua', 'flag', true),
  ('psicologia_social', 10, 'Hiperconectividade e Cansaço',
   'Autoexploração por produtividade infinita resulta em burnout. Liquidez social dissolve vínculos.',
   'Han, B-C. — Sociedade do Cansaço; Bauman, Z. — Modernidade Líquida',
   'Protocolos de desaceleração ativados quando produtividade vira autodestrutiva. Fake news e glorificação de burnout flagged/blocked.',
   'ritmo', 'A Temperança', 'flag', true)
ON CONFLICT (pillar, item_number) DO NOTHING;

-- ============================================================
-- PARTE 3: HYGEIOS — CONTENT AUDIT + GESTÃO DE PERSONAS
-- ============================================================

-- 3a. Status de auditoria nos posts
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS audit_status     TEXT DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS audit_score      FLOAT,
  ADD COLUMN IF NOT EXISTS audit_violations JSONB,
  ADD COLUMN IF NOT EXISTS audit_at         TIMESTAMPTZ;

-- 3b. Log de auditoria de conteúdo (cada sanitização)
CREATE TABLE IF NOT EXISTS public.content_audit_log (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID,
  source_table    TEXT        NOT NULL,       -- 'community_posts' | 'chat_messages' | 'diario_entries'
  source_id       UUID,
  original_text   TEXT,                       -- fragmento original (para audit trail)
  sanitized_text  TEXT,                       -- após remoção
  violations      JSONB       DEFAULT '[]',   -- [{"module":6,"type":"racism","excerpt":"..."}]
  pii_removed     JSONB       DEFAULT '[]',   -- [{"type":"cpf","masked":"***"}]
  fact_check      JSONB,                      -- Google Fact Check API response
  action_taken    TEXT        NOT NULL,       -- 'allow' | 'warn' | 'shadow' | 'block'
  score           FLOAT,                      -- 0.0 (seguro) → 1.0 (crítico)
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_audit_user ON public.content_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_content_audit_action ON public.content_audit_log(action_taken);

ALTER TABLE public.content_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages content audit" ON public.content_audit_log FOR ALL WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Users see own audit log" ON public.content_audit_log FOR SELECT USING (auth.uid() = user_id);

-- 3c. Violações do usuário (escalamento)
CREATE TABLE IF NOT EXISTS public.user_violations (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID        NOT NULL,
  post_id           UUID,
  violation_type    TEXT        NOT NULL,       -- 'racism' | 'gender_violence' | 'fake_news' | 'gaslighting' | 'pii_exposure'
  severity          TEXT        NOT NULL,       -- 'warn' | 'flag' | 'block'
  modules_violated  INT[]       DEFAULT '{}',   -- {6,7} = módulos PS violados
  auto_action       TEXT,                       -- o que o sistema fez
  escalation_level  SMALLINT    DEFAULT 1,      -- 1=warn, 2=flag, 3=block, 4=suspend
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_violations_user ON public.user_violations(user_id);
ALTER TABLE public.user_violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages violations" ON public.user_violations FOR ALL WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Users see own violations" ON public.user_violations FOR SELECT USING (auth.uid() = user_id);

-- 3d. Padrões de PII para remoção automática
CREATE TABLE IF NOT EXISTS public.pii_patterns (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT    NOT NULL UNIQUE,
  pattern     TEXT    NOT NULL,               -- regex pattern
  locale      TEXT,                           -- NULL = universal, 'pt-BR' = específico
  mask        TEXT    DEFAULT '[removido]',
  active      BOOLEAN DEFAULT true
);

ALTER TABLE public.pii_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages PII" ON public.pii_patterns FOR ALL WITH CHECK (auth.role() = 'service_role');

INSERT INTO public.pii_patterns (name, pattern, locale, mask) VALUES
  ('cpf',           '\d{3}\.?\d{3}\.?\d{3}-?\d{2}',            'pt-BR', '[CPF removido]'),
  ('cnpj',          '\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2}',     'pt-BR', '[CNPJ removido]'),
  ('phone_br',      '(\+55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}',  'pt-BR', '[telefone removido]'),
  ('phone_intl',    '\+\d{1,3}\s?\d{6,14}',                     NULL,    '[phone removed]'),
  ('email',         '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', NULL, '[email removido]'),
  ('ssn_us',        '\d{3}-\d{2}-\d{4}',                        'en-US', '[SSN removed]'),
  ('address_cep',   '\d{5}-?\d{3}',                              'pt-BR', '[CEP removido]')
ON CONFLICT (name) DO NOTHING;

-- 3e. Sinais HygeiOS ↔ CerberOS (SOMENTE HygeiOS escreve)
CREATE TABLE IF NOT EXISTS public.hygeios_cerberos_signals (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  direction       TEXT        NOT NULL CHECK (direction IN ('hygeios_to_cerberos', 'cerberos_to_hygeios')),
  signal_type     TEXT        NOT NULL,       -- 'violation_escalation' | 'anomaly_detected' | 'reauth_required' | 'token_revoke'
  user_id         UUID,
  severity        TEXT        NOT NULL,       -- 'low' | 'medium' | 'high' | 'critical'
  payload         JSONB       DEFAULT '{}',
  acknowledged    BOOLEAN     DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hc_signals_unack ON public.hygeios_cerberos_signals(acknowledged) WHERE acknowledged = false;
ALTER TABLE public.hygeios_cerberos_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages signals" ON public.hygeios_cerberos_signals FOR ALL WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- PARTE 4: GESTÃO DAS 130 PERSONAS POR HYGEIOS
-- ============================================================

-- 4a. Tabela de gestão (HygeiOS controla todas as personas)
CREATE TABLE IF NOT EXISTS public.persona_management (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_id        UUID        NOT NULL,     -- FK para profiles (is_bot=true)
  community_locale  TEXT        NOT NULL,
  archetype         TEXT        NOT NULL,
  activity_level    TEXT        DEFAULT 'normal',  -- 'low' | 'normal' | 'increased' | 'high'
  interactions_today INT        DEFAULT 0,
  interactions_week  INT        DEFAULT 0,
  last_active       TIMESTAMPTZ DEFAULT now(),
  managed_by        TEXT        DEFAULT 'hygeios',  -- SEMPRE 'hygeios'
  created_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(persona_id)
);

ALTER TABLE public.persona_management ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages personas" ON public.persona_management FOR ALL WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Anyone can read persona mgmt" ON public.persona_management FOR SELECT USING (true);

-- Seed: registrar as 130 personas existentes no sistema de gestão
INSERT INTO public.persona_management (persona_id, community_locale, archetype)
SELECT p.id, p.locale, p.archetype
FROM public.profiles p
WHERE p.is_bot = true AND p.archetype IS NOT NULL
ON CONFLICT (persona_id) DO NOTHING;

-- 4b. Jornada do usuário por arquétipos
CREATE TABLE IF NOT EXISTS public.user_archetype_journey (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID        NOT NULL UNIQUE,
  phase                 TEXT        DEFAULT 'undefined',  -- 'undefined' | 'testing' | 'identified' | 'deep'
  current_archetype     TEXT,                              -- NULL enquanto testa
  tested_archetypes     JSONB       DEFAULT '[]',          -- ['Buscador','Curador',...]
  affinity_scores       JSONB       DEFAULT '{}',          -- {"Buscador":0.8,"Curador":0.3,...}
  polarity_balance      JSONB       DEFAULT '{}',          -- {"Guerreiro":0.8,"Curador":0.2}
  hermetic_interventions INT        DEFAULT 0,
  identified_at         TIMESTAMPTZ,
  updated_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_archetype_journey ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own journey" ON public.user_archetype_journey FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages journeys" ON public.user_archetype_journey FOR ALL WITH CHECK (auth.role() = 'service_role');

-- 4c. Log de interações persona ↔ usuário
CREATE TABLE IF NOT EXISTS public.persona_user_interactions (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_id        UUID        NOT NULL,
  user_id           UUID        NOT NULL,
  interaction_type  TEXT        NOT NULL,       -- 'post_view' | 'reply' | 'rating' | 'ignore' | 'direct_message'
  archetype         TEXT        NOT NULL,
  engagement_score  FLOAT,                      -- 0.0 a 1.0
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pui_user ON public.persona_user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pui_persona ON public.persona_user_interactions(persona_id);
ALTER TABLE public.persona_user_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages interactions" ON public.persona_user_interactions FOR ALL WITH CHECK (auth.role() = 'service_role');

-- 4d. Snapshot de equilíbrio de arquétipos por comunidade
CREATE TABLE IF NOT EXISTS public.archetype_balance (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  community_locale    TEXT        NOT NULL,
  archetype           TEXT        NOT NULL,
  user_count          INT         DEFAULT 0,
  target_percentage   FLOAT       DEFAULT 10.0,   -- ideal = 10% cada (10 arquétipos)
  actual_percentage   FLOAT       DEFAULT 0.0,
  action_needed       TEXT        DEFAULT 'none',  -- 'none' | 'increase_activity' | 'test_users'
  snapshot_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE(community_locale, archetype, snapshot_at)
);

ALTER TABLE public.archetype_balance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages balance" ON public.archetype_balance FOR ALL WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Anyone can read balance" ON public.archetype_balance FOR SELECT USING (true);

-- ============================================================
-- PARTE 5: POLARIDADE HERMÉTICA + REBALANCEAMENTO
-- ============================================================

-- 5a. Mapa de polaridade entre arquétipos (SandeirOS oculto)
CREATE TABLE IF NOT EXISTS public.archetype_polarity (
  id              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  archetype_a     TEXT    NOT NULL,
  archetype_b     TEXT    NOT NULL,
  hermetic_law    TEXT    NOT NULL,         -- 'polaridade' | 'gênero' | 'ritmo'
  relationship    TEXT    NOT NULL,         -- 'complementar' | 'tensão_criativa' | 'espelho'
  description     TEXT,
  UNIQUE(archetype_a, archetype_b)
);

ALTER TABLE public.archetype_polarity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read polarity" ON public.archetype_polarity FOR SELECT USING (true);
CREATE POLICY "Service role manages polarity" ON public.archetype_polarity FOR ALL WITH CHECK (auth.role() = 'service_role');

INSERT INTO public.archetype_polarity (archetype_a, archetype_b, hermetic_law, relationship, description) VALUES
  ('Buscador',    'Ancião',     'ritmo',       'complementar',    'A busca interior (início) encontra a integração (conclusão). Quem busca precisa de quem já integrou.'),
  ('Curador',     'Guerreiro',  'polaridade',  'complementar',    'Cuidado sem ação é passividade. Ação sem cuidado é violência. Equilíbrio fundamental.'),
  ('Mestre',      'Louco',      'polaridade',  'tensão_criativa', 'Tradição sem renovação cristaliza. Inovação sem tradição perde raiz. Tensão que cria.'),
  ('Místico',     'Testemunho', 'gênero',      'complementar',    'Profundidade sem observação é devaneio. Observação sem profundidade é superficial.'),
  ('Criador',     'Ponte',      'gênero',      'espelho',         'Criar é manifestar o interno. Conectar é manifestar o externo. Ambos são expressão.')
ON CONFLICT (archetype_a, archetype_b) DO NOTHING;

-- 5b. Log de rebalanceamento hermético
CREATE TABLE IF NOT EXISTS public.hermetic_balance_log (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        NOT NULL,
  from_archetype  TEXT        NOT NULL,
  to_archetype    TEXT        NOT NULL,
  hermetic_law    TEXT        NOT NULL,
  phase           TEXT        DEFAULT 'seeding',  -- 'seeding' | 'exposure' | 'interaction' | 'integration'
  persona_a_id    UUID,                           -- persona que "apresenta"
  persona_b_id    UUID,                           -- persona sendo apresentada
  started_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_hbl_user ON public.hermetic_balance_log(user_id);
ALTER TABLE public.hermetic_balance_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages hermetic log" ON public.hermetic_balance_log FOR ALL WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- PARTE 6: PANACEIA — CATÁLOGO DE MONETIZAÇÃO
-- ============================================================

CREATE TABLE IF NOT EXISTS public.panaceia_offerings (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  category        TEXT        NOT NULL,        -- 'token_sale' | 'service' | 'promo' | 'mentoring' | 'product' | 'ab_research'
  name            TEXT        NOT NULL,
  description     TEXT,
  token_type      TEXT,                        -- 'ai' | 'sync' | 'insight' | 'community' | NULL
  price_tokens    INT,
  price_cents     INT,
  reward_tokens   INT         DEFAULT 0,       -- tokens dados ao consumir (vídeo, pesquisa)
  reward_trigger  TEXT,                        -- 'video_watch' | 'survey_complete' | 'referral' | NULL
  active          BOOLEAN     DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.panaceia_offerings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read offerings" ON public.panaceia_offerings FOR SELECT USING (active = true);
CREATE POLICY "Service role manages offerings" ON public.panaceia_offerings FOR ALL WITH CHECK (auth.role() = 'service_role');

-- Seed: categorias iniciais (detalhamento em módulo futuro)
INSERT INTO public.panaceia_offerings (category, name, description, token_type, reward_tokens, reward_trigger) VALUES
  ('promo',       'Assista e Ganhe',       'Assista vídeo patrocinado e ganhe tokens',          'community', 5,  'video_watch'),
  ('ab_research', 'Pesquisa A/B',          'Participe de pesquisa e ganhe tokens',              'insight',   10, 'survey_complete'),
  ('promo',       'Indique um Amigo',      'Convide amigo e ambos ganham tokens',               'community', 20, 'referral'),
  ('token_sale',  'Pack AI Tokens',        '50 AI tokens para conversas avançadas com ProteOS', 'ai',        0,  NULL),
  ('service',     'Mentoria Personalizada', 'Sessão 1:1 com especialista via Beck Office',      NULL,        0,  NULL),
  ('product',     'Loja Curada',           'Suplementos, livros e wearables selecionados',      NULL,        0,  NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PARTE 7: HELPER FUNCTION — HygeiOS audit (SECURITY DEFINER)
-- ============================================================

CREATE OR REPLACE FUNCTION public.hygeios_log_content_audit(
  p_user_id       UUID,
  p_source_table  TEXT,
  p_source_id     UUID,
  p_original      TEXT,
  p_sanitized     TEXT,
  p_violations    JSONB,
  p_pii_removed   JSONB,
  p_action        TEXT,
  p_score         FLOAT
) RETURNS void AS $$
BEGIN
  INSERT INTO public.content_audit_log
    (user_id, source_table, source_id, original_text, sanitized_text, violations, pii_removed, action_taken, score)
  VALUES
    (p_user_id, p_source_table, p_source_id, p_original, p_sanitized, p_violations, p_pii_removed, p_action, p_score);

  -- Se action = 'block', registra violação automática
  IF p_action = 'block' THEN
    INSERT INTO public.user_violations (user_id, post_id, violation_type, severity, auto_action, escalation_level)
    VALUES (p_user_id, p_source_id, 'content_blocked', 'block', 'auto_block',
      COALESCE((SELECT MAX(escalation_level) + 1 FROM public.user_violations WHERE user_id = p_user_id), 1)
    );
  END IF;

  -- Se escalation_level >= 3, sinaliza CerberOS
  IF (SELECT COUNT(*) FROM public.user_violations WHERE user_id = p_user_id AND severity = 'block') >= 3 THEN
    INSERT INTO public.hygeios_cerberos_signals (direction, signal_type, user_id, severity, payload)
    VALUES ('hygeios_to_cerberos', 'violation_escalation', p_user_id, 'high',
      jsonb_build_object('reason', 'repeat_content_violations', 'violation_count',
        (SELECT COUNT(*) FROM public.user_violations WHERE user_id = p_user_id)));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FIM — 10_s17_aquarios_constitution.sql
-- 14 tabelas/colunas novas + seeds + helper function
-- Aprovado: sessão 26/05/2026
-- ============================================================
