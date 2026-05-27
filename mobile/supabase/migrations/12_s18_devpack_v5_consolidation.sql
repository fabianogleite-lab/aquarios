-- ============================================================
-- 12_s18_devpack_v5_consolidation.sql
-- ============================================================
-- ARKHE Holding · AquariOS V1.0612 — Consolidação Legal Lei 9.610
--
-- Aprovado por: Fabiano Gomes Leite (CPF 521.363.886-49)
-- Data: 27/05/2026
-- Fonte autoritativa: Manual V1.0512 (12/05/2026)
-- Referência expansão: DEVPACK Master v4 (26/05/2026)
-- Auditoria base: mobile/docs/AUDIT_MATRIX_DEVPACK_V4.md
-- Comparativo: mobile/docs/COMPARATIVE_MANUAL_VS_DEVPACK.md
-- Decisões: mobile/docs/44_EIXOS_DISTRIBUTION_MAP.md
--
-- 17/17 decisões aprovadas. 30 itens autoria registrados.
-- ============================================================

BEGIN;

-- ============================================================
-- PARTE 1: ARKHE Holding (identidade legal)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.arkhe_holding (
  id              UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  legal_name      TEXT         NOT NULL UNIQUE,
  is_legal_entity BOOLEAN      DEFAULT true,
  author_cpf      TEXT         NOT NULL,
  author_name     TEXT         NOT NULL,
  founder_birth   DATE         NOT NULL,
  founder_locale  TEXT         DEFAULT 'pt-BR',
  protection_laws TEXT[]       DEFAULT ARRAY[
    'Lei 9.610/1998',
    'Convenção de Berna',
    'Acordo TRIPS',
    'LGPD 13.709/2018',
    'ISO 27001'
  ],
  manual_version  TEXT         DEFAULT 'V1.0512',
  consolidated_at DATE         NOT NULL,
  created_at      TIMESTAMPTZ  DEFAULT now(),
  updated_at      TIMESTAMPTZ  DEFAULT now()
);

ALTER TABLE public.arkhe_holding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads ARKHE identity" ON public.arkhe_holding FOR SELECT USING (true);
CREATE POLICY "Only service_role writes ARKHE" ON public.arkhe_holding FOR ALL WITH CHECK (auth.role() = 'service_role');

INSERT INTO public.arkhe_holding (legal_name, author_cpf, author_name, founder_birth, founder_locale, consolidated_at) VALUES
  ('ARKHE — Ecossistema · AquariOS Infrastructure', '52136388649', 'Fabiano Gomes Leite', '1968-06-19', 'pt-BR', '2026-05-12')
ON CONFLICT (legal_name) DO NOTHING;

-- aquarios_architecture (mapping: arkhe holding → aquarios product)
CREATE TABLE IF NOT EXISTS public.aquarios_architecture (
  id                UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  layer             TEXT         NOT NULL CHECK (layer IN ('holding', 'product_b2c', 'product_b2b', 'infrastructure')),
  name              TEXT         NOT NULL,
  description       TEXT,
  parent_layer      TEXT,
  is_legal_entity   BOOLEAN      DEFAULT false,
  manual_reference  TEXT,
  created_at        TIMESTAMPTZ  DEFAULT now()
);

ALTER TABLE public.aquarios_architecture ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads architecture" ON public.aquarios_architecture FOR SELECT USING (true);
CREATE POLICY "Only service_role writes architecture" ON public.aquarios_architecture FOR ALL WITH CHECK (auth.role() = 'service_role');

INSERT INTO public.aquarios_architecture (layer, name, description, parent_layer, is_legal_entity, manual_reference) VALUES
  ('holding',        'ARKHE',         'Holding legal e proprietária intelectual de todo o ecossistema',                 NULL,           true,  'V1.0512 §03'),
  ('product_b2c',    'AquariOS',      'Sistema Operacional do Ser Humano — Infra de Integração Humana B2C',             'ARKHE',        false, 'V1.0512 §01'),
  ('product_b2b',    'Beck Office',   'Plataforma B2B para profissionais de saúde — matching por IVI',                  'ARKHE',        false, 'V1.0512 §14'),
  ('infrastructure', 'HygeiOS+IVI',   'Núcleo analítico com filosofia encapsulada — invisível ao usuário',              'AquariOS',     false, 'V1.0512 §04')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PARTE 2: intellectual_property_registry (30 itens autoria)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.intellectual_property_registry (
  id                    UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  item_number           SMALLINT     NOT NULL UNIQUE,
  title                 TEXT         NOT NULL,
  description           TEXT,
  manual_section        TEXT,                          -- ex: '§04', '§17'
  manual_version_introduced TEXT     DEFAULT 'V1.0512', -- V1.0512 ou V1.0612
  implementation_status TEXT         NOT NULL CHECK (implementation_status IN ('ratified', 'partial', 'planned_phase2', 'planned_phase3', 'planned_phase4')),
  author_cpf            TEXT         NOT NULL DEFAULT '52136388649',
  author_name           TEXT         NOT NULL DEFAULT 'Fabiano Gomes Leite',
  registration_date     DATE         NOT NULL,
  legal_reference       TEXT         DEFAULT 'Lei 9.610/1998 · Convenção de Berna · TRIPS',
  code_anchor           TEXT,                          -- caminho no repo onde está implementado
  related_module        TEXT,                          -- slug em aquarios_modules
  created_at            TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ip_status ON public.intellectual_property_registry(implementation_status);
CREATE INDEX IF NOT EXISTS idx_ip_module ON public.intellectual_property_registry(related_module);

ALTER TABLE public.intellectual_property_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads IP registry" ON public.intellectual_property_registry FOR SELECT USING (true);
CREATE POLICY "Only service_role manages IP" ON public.intellectual_property_registry FOR ALL WITH CHECK (auth.role() = 'service_role');

-- Itens 1-22 originais do Manual V1.0512
INSERT INTO public.intellectual_property_registry (item_number, title, description, manual_section, implementation_status, registration_date, code_anchor, related_module) VALUES
  (1,  'Conceito e arquitetura do ecossistema ARKHE',                                                   'Holding legal cobrindo AquariOS + Beck Office',                                       '§23',  'ratified',       '2026-05-12', 'mobile/docs/COMPARATIVE_MANUAL_VS_DEVPACK.md', 'arkhe'),
  (2,  'Nome e design funcional do AquariOS como "sistema operacional do ser humano"',                  'Branding e proposta de valor central',                                                '§23',  'ratified',       '2026-05-12', 'mobile/app.json', NULL),
  (3,  'Nome, arquitetura e lógica de roteamento por intenção do ProteOS',                              '7 intenções: introspectivo, médico, contemplativo, financeiro, físico, geral, ops',  '§05',  'partial',        '2026-05-12', 'mobile/supabase/functions/chat/index.ts', 'proteos'),
  (4,  'Nome, engine simbólica e modo oculto/explícito do SandeirOS',                                   '22 arcanos, modo oculto default, 4 tiragens explícitas',                              '§06',  'planned_phase2', '2026-05-12', 'mobile/lib/proteos-cultural-voice.ts', 'sandeiros'),
  (5,  'Correspondência sistemática entre 7 princípios herméticos e 22 arcanos maiores',                'Tempero simbólico oculto — usuário nunca vê',                                         '§02',  'partial',        '2026-05-12', 'migration 10 aquarios_constitution', 'sandeiros'),
  (6,  'Nome, arquitetura e pipeline ETL de prevenção do HygeiOS com IVI interno',                       'Cron 6h · 7 tabelas extract · 3 anomalias',                                            '§04',  'planned_phase2', '2026-05-12', NULL, 'hygeios'),
  (7,  'Nome, engine de decisão clínica e algoritmo de risk_score do AsclepiOS',                         'Pipeline Analyze→Diagnose→Prescribe→Dispatch · 4 tiers',                              '§08',  'planned_phase2', '2026-05-12', NULL, 'asclepios'),
  (8,  'Nome, arquitetura e base textual do EcumenicOS (13 tradições × 3 livros × oráculo oculto)',    '13 tradições × 39 livros · 3 modos: single/multi/sincretismo',                        '§07',  'ratified',       '2026-05-12', 'mobile/supabase/migrations/08_s17_ecumenicos.sql', 'ecumenicos'),
  (9,  'Conceito, fórmula e cálculo tridimensional do IVI como componente interno do HygeiOS',         'IVI = (Bio×0.40) + (Mental×0.35) + (Spirit×0.25) · 5 faixas',                         '§04',  'partial',        '2026-05-12', 'PARTE 4 desta migration', 'hygeios'),
  (10, 'Arquitetura e matching por IVI do Beck Office',                                                 'Matching por estado integral · não por especialidade/geografia',                       '§14',  'planned_phase2', '2026-05-12', NULL, 'beckoffice'),
  (11, 'Design das 4 tiragens originais do SandeirOS (Espelho, Tríade, Cruz, Jornada de Hermes)',      '1, 3, 5, 7 cartas · respectivamente',                                                  '§06',  'planned_phase2', '2026-05-12', NULL, 'sandeiros'),
  (12, 'Política de soberania do usuário em 7 princípios fundamentais',                                 'LGPD art. 18 · exportação total · não monetização de dado',                            '§15',  'partial',        '2026-05-12', 'mobile/app/(app)/settings.tsx', NULL),
  (13, 'Algoritmo de detecção de padrões longitudinais tridimensionais (bio-mental-spirit)',           'Anomalias: CRITICAL_MARKER, USER_SILENCE, SPIRIT_STAGNATION',                          '§04',  'planned_phase2', '2026-05-12', NULL, 'hygeios'),
  (14, 'Integração dos 3 textos canônicos (Voz do Silêncio, Bardo Thodol, Quarto Caminho) com SandeirOS','Fundamento tríplice da engine simbólica',                                              '§06',  'ratified',       '2026-05-12', 'migration 10 aquarios_constitution sandeiros 1-3', 'sandeiros'),
  (15, 'Programa de Acessibilidade Social com faixas de preço por vulnerabilidade',                    'Estudante 50% · PcD 90% · Idoso 80+ vitalício · Crianças até 12',                     '§19',  'planned_phase2', '2026-05-12', NULL, NULL),
  (16, 'Arquitetura do EcumenicOS como oráculo ecumênico moderno (13 tradições + 39 livros)',          'Hiperlinks internos · usuário não sai do sistema',                                     '§07',  'ratified',       '2026-05-12', 'mobile/supabase/migrations/08_s17_ecumenicos.sql', 'ecumenicos'),
  (17, 'Conceito do Oráculo Oculto como princípio norteador interno invisível ao usuário',             'oracle_modern + oracle_label nunca expostos como label',                                '§07',  'ratified',       '2026-05-12', 'ecumenic_traditions.oracle_modern', 'ecumenicos'),
  (18, 'Princípio do Sincretismo como Elo entre tradições religiosas em plataforma digital',           'Síntese de convergências reais · +10 IVI Spirit',                                      '§07',  'partial',        '2026-05-12', 'mobile/lib/proteos-cultural-voice.ts', 'ecumenicos'),
  (19, 'EteriOS — nome, arquitetura e lógica de integração IoT/Wearable/Matter/Zigbee/Webhooks com IVI','7 categorias dispositivos · 6 protocolos · BLE 5.3, Matter 1.3, Zigbee 3.0',          '§10',  'planned_phase3', '2026-05-12', NULL, 'eterios'),
  (20, 'HermeOS como módulo de usuário — integração IVI ↔ finanças (educação, investimentos, conta)',  'Hermes media IVI Mental e finanças · Open Banking BCB',                                '§09',  'planned_phase2', '2026-05-12', NULL, 'hermeos'),
  (21, 'Modelo Free Anônimo + Free Comunidade com alimentação diferenciada do IVI e trial de 30 dias','2 níveis gratuitos · IVI Spirit parcial vs nada',                                       '§19',  'partial',        '2026-05-12', 'PARTE 12 desta migration', NULL),
  (22, 'XP Existencial — sistema de gamificação de comunidades integrado ao IVI Spirit',                'Nomenclatura específica · 7 níveis evolutivos: Semente→Mestre',                       '§11',  'partial',        '2026-05-12', 'PARTE 3 desta migration', 'aeropagos')
ON CONFLICT (item_number) DO NOTHING;

-- Itens 23-30: novas adições para Manual V1.0612 (ratificação retroativa de inovações pós-Manual)
INSERT INTO public.intellectual_property_registry (item_number, title, description, manual_section, manual_version_introduced, implementation_status, registration_date, code_anchor, related_module) VALUES
  (23, 'Pilar 2 — Psicologia Social Crítica como camada constitucional do AquariOS',                   '10 itens: Vigotski, Foucault, Freire, Almeida, Butler, Han, Bauman, Basaglia, Pichon-Rivière, Ciampa', '§02 V1.0612', 'V1.0612', 'ratified',       '2026-05-27', 'migration 10 aquarios_constitution', NULL),
  (24, '130 Personas Culturais (13 países × 10 arquétipos universais)',                                 'Camada cultural sobre 3+3 personas oficiais · derivação §21 Manual + EcumenicOS 13 tradições',         '§21 V1.0612', 'V1.0612', 'ratified',       '2026-05-27', 'mobile/supabase/migrations/09_s17_community_personas.sql', 'comunidades'),
  (25, 'AlexandriOS — help engine conversacional com KB Qualis AA',                                     'Engine de FAQ integrada · 42 perguntas críticas estruturadas',                                         '§03 V1.0612', 'V1.0612', 'partial',        '2026-05-27', 'mobile/services/alexandrios.ts', NULL),
  (26, 'KB_Foundation — base de conhecimento estruturada com proveniência acadêmica',                  'Cada fonte com Qualis level + author + checksum SHA-256',                                              '§03 V1.0612', 'V1.0612', 'ratified',       '2026-05-27', 'PARTE 6 desta migration', NULL),
  (27, 'MetadataStore — versionamento imutável via content_hash em tabelas públicas',                  'audit_logs + content_hash column em tabelas core',                                                     '§03 V1.0612', 'V1.0612', 'partial',        '2026-05-27', 'migration 07 audit_logs + PARTE 7', NULL),
  (28, 'CerberOS V1.0512 — defesa ativa por aprisionamento (ETERNAL MAZE)',                            '7 camadas · HygeiOS Data Gate · 32 workers · evidências legais',                                       '§03 V1.0612', 'V1.0612', 'ratified',       '2026-05-27', 'memory/project_cerberos.md', 'cerberos'),
  (29, 'AeropagOS — gamificação por lotes (Areópago grego deliberativo)',                              'XP Existencial + badges + leaderboard + mentor system',                                                '§11 V1.0612', 'V1.0612', 'ratified',       '2026-05-27', 'PARTE 3 desta migration', 'aeropagos'),
  (30, 'Wonder Night — ritual noturno de transformação',                                                'Prática contemplativa pré-sono · integra Diário e SandeirOS',                                           '§02 V1.0612', 'V1.0612', 'ratified',       '2026-05-27', 'mobile/app/(app)/wonder-night.tsx', 'wonder')
ON CONFLICT (item_number) DO NOTHING;

-- ============================================================
-- PARTE 3: existential_xp_log (rename de xp_log + 7 níveis Semente→Mestre)
-- ============================================================

-- Cria o type enum dos 7 níveis evolutivos
DO $$ BEGIN
  CREATE TYPE public.evolution_level AS ENUM ('Semente', 'Raiz', 'Tronco', 'Galho', 'Flor', 'Fruto', 'Mestre');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Rename xp_log → existential_xp_log se ainda não foi feito
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='xp_log')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='existential_xp_log') THEN
    ALTER TABLE public.xp_log RENAME TO existential_xp_log;
  END IF;
END $$;

-- Garante a tabela (caso não exista por algum motivo)
CREATE TABLE IF NOT EXISTS public.existential_xp_log (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID,
  action      TEXT         NOT NULL,
  xp_earned   INT          NOT NULL DEFAULT 0,
  module      TEXT,
  created_at  TIMESTAMPTZ  DEFAULT now()
);

-- Adiciona coluna evolution_level se não existe
ALTER TABLE public.existential_xp_log
  ADD COLUMN IF NOT EXISTS evolution_level public.evolution_level;

-- Tabela mestre de níveis evolutivos (auxiliar)
CREATE TABLE IF NOT EXISTS public.evolution_levels (
  level_name        public.evolution_level PRIMARY KEY,
  level_order       SMALLINT     NOT NULL UNIQUE,
  xp_threshold      INT          NOT NULL,
  description       TEXT,
  unlocks           TEXT[]
);

ALTER TABLE public.evolution_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads levels" ON public.evolution_levels FOR SELECT USING (true);
CREATE POLICY "Service role manages levels" ON public.evolution_levels FOR ALL WITH CHECK (auth.role() = 'service_role');

INSERT INTO public.evolution_levels (level_name, level_order, xp_threshold, description, unlocks) VALUES
  ('Semente', 1, 0,     'Início da jornada — primeiro contato com AquariOS',          ARRAY['perfil','onboarding']),
  ('Raiz',    2, 100,   'Hábitos iniciais formando-se — primeiras conexões',         ARRAY['comunidade_basico']),
  ('Tronco',  3, 500,   'Estrutura interna estabelecida — disciplina presente',      ARRAY['mentoria_grupo']),
  ('Galho',   4, 1500,  'Ramificações de prática — múltiplos módulos integrados',   ARRAY['liderança_circulo']),
  ('Flor',    5, 4000,  'Floração — contribuição visível à comunidade',              ARRAY['moderar_grupo','badges_premium']),
  ('Fruto',   6, 9000,  'Frutificação — mentor de outros buscadores',                ARRAY['mentor_oficial','revenue_share']),
  ('Mestre',  7, 20000, 'Maestria — referência arquetípica viva',                    ARRAY['conselho_arkhe','co_criação'])
ON CONFLICT (level_name) DO NOTHING;

-- ============================================================
-- PARTE 4: telemetry_vitality_logs — componentes IVI tridimensional
-- ============================================================
-- Garante a tabela base (referenciada em aquarios_modules.db_tables
-- mas nunca criada formalmente em migrations anteriores)

CREATE TABLE IF NOT EXISTS public.telemetry_vitality_logs (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID         REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type      VARCHAR(30)  NOT NULL,
  raw_payload      JSONB        NOT NULL DEFAULT '{}'::jsonb,
  calculated_score NUMERIC(5,2) CHECK (calculated_score BETWEEN 0.00 AND 100.00),
  persona_detected VARCHAR(30),
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tvl_user ON public.telemetry_vitality_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tvl_metric ON public.telemetry_vitality_logs(metric_type);

ALTER TABLE public.telemetry_vitality_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users see own vitality logs"
    ON public.telemetry_vitality_logs FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role manages vitality logs"
    ON public.telemetry_vitality_logs FOR ALL WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Adiciona colunas dos componentes IVI tridimensional (Manual V1.0512 §04)
ALTER TABLE public.telemetry_vitality_logs
  ADD COLUMN IF NOT EXISTS formula_version           TEXT          DEFAULT 'V1.0512',
  ADD COLUMN IF NOT EXISTS calculated_bio_component  NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS calculated_mental_component NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS calculated_spirit_component NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS ivi_total                 NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS ivi_band                  TEXT
    CHECK (ivi_band IN ('CRITICO', 'ALERTA', 'ATENCAO', 'BOM', 'EXCELENTE'));

-- Comentário explicativo da fórmula (vive no schema, não some)
COMMENT ON COLUMN public.telemetry_vitality_logs.ivi_total IS
  'IVI_Total = (Bio × 0.40) + (Mental × 0.35) + (Spirit × 0.25). Item 9 IP Registry. Manual V1.0512 §04.';

-- Function para calcular IVI dado os componentes
CREATE OR REPLACE FUNCTION public.calculate_ivi(
  p_bio    NUMERIC,
  p_mental NUMERIC,
  p_spirit NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND(
    (COALESCE(p_bio, 0)    * 0.40) +
    (COALESCE(p_mental, 0) * 0.35) +
    (COALESCE(p_spirit, 0) * 0.25),
    2
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function para determinar banda IVI
CREATE OR REPLACE FUNCTION public.ivi_band_for(p_total NUMERIC) RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN p_total <= 20  THEN 'CRITICO'
    WHEN p_total <= 40  THEN 'ALERTA'
    WHEN p_total <= 60  THEN 'ATENCAO'
    WHEN p_total <= 80  THEN 'BOM'
    ELSE                     'EXCELENTE'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- PARTE 5: alexandrios_kb (help engine + KB Qualis AA)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.alexandrios_kb (
  id                UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  slug              TEXT         NOT NULL UNIQUE,
  category          TEXT         NOT NULL,            -- 'faq' | 'guide' | 'reference' | 'troubleshooting'
  persona_tag       TEXT,                              -- 'ze_do_aperto' | 'dona_maria' | 'carlos' | NULL
  question          TEXT         NOT NULL,
  answer            TEXT         NOT NULL,
  source_url        TEXT,
  source_author     TEXT,
  source_year       SMALLINT,
  qualis_level      TEXT         CHECK (qualis_level IN ('A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'C', 'general')),
  is_canonical      BOOLEAN      DEFAULT false,
  checksum_sha256   TEXT,                              -- integridade do conteúdo
  language          TEXT         DEFAULT 'pt-BR',
  related_module    TEXT,
  ip_item_number    SMALLINT     REFERENCES public.intellectual_property_registry(item_number),
  created_at        TIMESTAMPTZ  DEFAULT now(),
  updated_at        TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alex_persona  ON public.alexandrios_kb(persona_tag);
CREATE INDEX IF NOT EXISTS idx_alex_category ON public.alexandrios_kb(category);
CREATE INDEX IF NOT EXISTS idx_alex_module   ON public.alexandrios_kb(related_module);

ALTER TABLE public.alexandrios_kb ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads canonical KB" ON public.alexandrios_kb FOR SELECT USING (is_canonical = true);
CREATE POLICY "Service role manages KB"    ON public.alexandrios_kb FOR ALL WITH CHECK (auth.role() = 'service_role');

-- Seed canônico (10 FAQs core, mais será populado pela aplicação)
INSERT INTO public.alexandrios_kb (slug, category, persona_tag, question, answer, qualis_level, is_canonical, language, related_module, ip_item_number) VALUES
  ('what-is-aquarios',      'guide',           NULL,            'O que é AquariOS?',                            'AquariOS é o Sistema Operacional do Ser Humano — uma Infraestrutura de Integração Humana que unifica corpo, mente, espírito, finanças e ambiente físico sob soberania do usuário.', 'general', true, 'pt-BR', NULL, 2),
  ('what-is-ivi',           'guide',           NULL,            'O que é IVI?',                                 'IVI (Índice de Vitalidade Integrada) é a leitura tridimensional do seu estado: Bio (40%), Mental (35%), Spirit (25%). Atualizado continuamente pelo HygeiOS.', 'general', true, 'pt-BR', 'hygeios', 9),
  ('what-is-proteos',       'guide',           NULL,            'O que é ProteOS?',                             'ProteOS é o hub conversacional do AquariOS. Detecta sua intenção e roteia para o módulo certo. Adapta tom à sua persona e cultura.',                            'general', true, 'pt-BR', 'proteos', 3),
  ('how-to-budget',         'faq',             'ze_do_aperto',  'Como gerenciar saúde com orçamento apertado?', 'AquariOS Free + água 2L/dia + sono 7-8h + SUS para preventivo. Custo zero, impacto alto.',                                                                       'general', true, 'pt-BR', 'asclepios', NULL),
  ('how-to-diabetes',       'faq',             'dona_maria',    'Como controlar diabetes sem complicações?',    'Monitoramento via AquariOS + 5 refeições balanceadas + HbA1c trimestral. Avise família por Comunidade.',                                                          'general', true, 'pt-BR', 'asclepios', NULL),
  ('cardiac-checkup-50',    'faq',             'carlos',        '50 anos, nunca fiz check-up. Preciso?',        'Sim, urgente. Exames: hemograma, perfil lipídico, glicemia, PA, ECG. AquariOS organiza, Beck Office encaminha.',                                                  'general', true, 'pt-BR', 'asclepios', NULL),
  ('lgpd-export-data',      'reference',       NULL,            'Como exporto meus dados?',                     'Configurações → Privacidade → Exportar dados. JSON ou CSV. LGPD art. 18. Você é dono dos seus dados.',                                                            'general', true, 'pt-BR', NULL, 12),
  ('what-is-sandeiros',     'guide',           NULL,            'O que é SandeirOS?',                           'SandeirOS é a engine simbólica dos 22 arcanos. Atua em modo oculto temperando respostas do ProteOS — você recebe profundidade sem conhecer o mecanismo.',     'general', true, 'pt-BR', 'sandeiros', 4),
  ('what-is-ecumenicos',    'guide',           NULL,            'O que é EcumenicOS?',                          'Oráculo ecumênico moderno: 13 tradições espirituais + 39 livros. Consulte uma tradição, compare múltiplas ou veja sincretismos.',                                  'general', true, 'pt-BR', 'ecumenicos', 8),
  ('admin-access',          'troubleshooting', NULL,            'Como acesso área admin?',                      'Configurações → toque 5x em "Arkhe Labs" → digite passphrase. Acesso restrito ao desenvolvedor.',                                                                  'general', true, 'pt-BR', NULL, NULL)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PARTE 6: kb_foundation (base de conhecimento acadêmica)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.kb_foundation (
  id                UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  slug              TEXT         NOT NULL UNIQUE,
  title             TEXT         NOT NULL,
  author            TEXT,
  publication_year  SMALLINT,
  qualis_level      TEXT         CHECK (qualis_level IN ('A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'C')),
  doi               TEXT,
  isbn              TEXT,
  category          TEXT         NOT NULL,       -- 'medical' | 'philosophical' | 'psychological' | 'financial' | 'symbolic' | 'ecumenical'
  abstract          TEXT,
  full_text_excerpt TEXT,
  language          TEXT         DEFAULT 'pt-BR',
  is_active         BOOLEAN      DEFAULT true,
  checksum_sha256   TEXT,
  related_modules   TEXT[],
  created_at        TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kbf_category ON public.kb_foundation(category);
CREATE INDEX IF NOT EXISTS idx_kbf_qualis   ON public.kb_foundation(qualis_level);

ALTER TABLE public.kb_foundation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active KB Foundation" ON public.kb_foundation FOR SELECT USING (is_active = true);
CREATE POLICY "Service role manages KB Foundation" ON public.kb_foundation FOR ALL WITH CHECK (auth.role() = 'service_role');

-- Seed das obras fundacionais
INSERT INTO public.kb_foundation (slug, title, author, publication_year, qualis_level, category, abstract, language, related_modules) VALUES
  ('voz-do-silencio',         'A Voz do Silêncio',                            'H. P. Blavatsky',     1889, 'A1', 'philosophical',  'Tradução dos Preceitos Áureos. Fundamento tríplice SandeirOS.',           'pt-BR', ARRAY['sandeiros']),
  ('bardo-thodol',            'Livro Tibetano dos Mortos (Bardo Thodol)',     'Padmasambhava',        700, 'A1', 'philosophical',  'Navegação consciente entre estados de consciência. Bardos.',              'pt-BR', ARRAY['sandeiros']),
  ('quarto-caminho',          'Fragmentos de um Ensinamento Desconhecido',    'P. D. Ouspensky',     1949, 'A1', 'philosophical',  'Quarto Caminho de Gurdjieff. Auto-observação no cotidiano.',              'pt-BR', ARRAY['sandeiros']),
  ('kybalion',                'O Caibalion (Kybalion)',                       'Três Iniciados',      1908, 'A2', 'philosophical',  '7 princípios herméticos. Base de toda a estrutura simbólica.',            'pt-BR', ARRAY['sandeiros','ecumenicos']),
  ('pedagogia-do-oprimido',   'Pedagogia do Oprimido',                        'Paulo Freire',        1968, 'A1', 'psychological',  'Pilar 2 PS. Educação como prática da liberdade.',                          'pt-BR', ARRAY['comunidades']),
  ('vigiar-e-punir',          'Vigiar e Punir',                               'Michel Foucault',     1975, 'A1', 'psychological',  'Pilar 2 PS. Microfísica do poder. Vigilância invisível.',                 'pt-BR', ARRAY['hygeios']),
  ('racismo-estrutural',      'Racismo Estrutural',                           'Silvio Almeida',      2018, 'A1', 'psychological',  'Pilar 2 PS. Hate speech bloqueado imediatamente.',                         'pt-BR', ARRAY['comunidades']),
  ('problemas-de-genero',     'Problemas de Gênero',                          'Judith Butler',       1990, 'A1', 'psychological',  'Pilar 2 PS. Performance de gênero. Misoginia bloqueada.',                  'pt-BR', ARRAY['comunidades']),
  ('formacao-social-mente',   'Formação Social da Mente',                     'L. S. Vigotski',      1978, 'A1', 'psychological',  'Pilar 2 PS. Individuo = sociedade manifestada em biografia.',             'pt-BR', ARRAY['proteos']),
  ('sociedade-do-cansaco',    'Sociedade do Cansaço',                         'Byung-Chul Han',      2010, 'A2', 'psychological',  'Pilar 2 PS. Autoexploração e burnout. Protocolos de desaceleração.',     'pt-BR', ARRAY['hygeios','proteos']),
  ('moral-landscape',         'The Moral Landscape',                          'Sam Harris',          2010, 'A2', 'philosophical',  'Ética secular baseada em ciência. Voz cultural en-US/nb-NO.',             'en-US', ARRAY['ecumenicos']),
  ('budismo-sem-crencas',     'Budismo Sem Crenças',                          'Stephen Batchelor',   1997, 'A2', 'philosophical',  'Budismo agnóstico. Voz cultural th-TH/en-US.',                            'en-US', ARRAY['ecumenicos'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PARTE 7: MetadataStore via content_hash em tabelas core
-- ============================================================

-- Adiciona content_hash em tabelas públicas chave para versionamento imutável
ALTER TABLE public.community_posts        ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE public.aquarios_constitution  ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE public.alexandrios_kb         ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE public.kb_foundation          ADD COLUMN IF NOT EXISTS content_hash TEXT;

-- Function para gerar checksum SHA-256 padronizado
CREATE OR REPLACE FUNCTION public.metadata_compute_hash(p_content TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN encode(sha256(p_content::bytea), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- PARTE 8: personas_cultural_map (ratificação 130 personas)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.personas_cultural_map (
  id                      UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_profile_id      UUID         NOT NULL UNIQUE,
  manual_derivation       TEXT         DEFAULT '§21_expansion_13traditions_10archetypes',
  legal_author_cpf        TEXT         DEFAULT '52136388649',
  is_cultural_variant     BOOLEAN      DEFAULT true,
  is_experimental         BOOLEAN      DEFAULT false,
  ratified_at             TIMESTAMPTZ  DEFAULT now(),
  ip_item_number          SMALLINT     DEFAULT 24 REFERENCES public.intellectual_property_registry(item_number),
  country_code            TEXT,
  archetype               TEXT,
  tradition               TEXT,
  created_at              TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pcm_country ON public.personas_cultural_map(country_code);
CREATE INDEX IF NOT EXISTS idx_pcm_archetype ON public.personas_cultural_map(archetype);

ALTER TABLE public.personas_cultural_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads cultural map" ON public.personas_cultural_map FOR SELECT USING (true);
CREATE POLICY "Service role manages map"  ON public.personas_cultural_map FOR ALL WITH CHECK (auth.role() = 'service_role');

-- Populate a partir das 130 personas existentes (profiles is_bot=true)
INSERT INTO public.personas_cultural_map (persona_profile_id, country_code, archetype, tradition)
SELECT
  p.id,
  CASE
    WHEN p.locale LIKE 'pt-BR%' THEN 'BR'
    WHEN p.locale LIKE 'en-US%' THEN 'US'
    WHEN p.locale LIKE 'pt-PT%' THEN 'PT'
    WHEN p.locale LIKE 'fa-IR%' THEN 'IR'
    WHEN p.locale LIKE 'he-IL%' THEN 'IL'
    WHEN p.locale LIKE 'es-VE%' THEN 'VE'
    WHEN p.locale LIKE 'th-TH%' THEN 'TH'
    WHEN p.locale LIKE 'ko-KR%' THEN 'KR'
    WHEN p.locale LIKE 'zh-HK%' THEN 'HK'
    WHEN p.locale LIKE 'nb-NO%' THEN 'NO'
    WHEN p.locale LIKE 'en-NG%' THEN 'NG'
    WHEN p.locale LIKE 'de-CH%' OR p.locale LIKE 'fr-CH%' THEN 'CH'
    WHEN p.locale LIKE 'es-PE%' THEN 'PE'
    ELSE substring(p.locale from '-([A-Z]{2})')
  END,
  p.archetype,
  p.tradition
FROM public.profiles p
WHERE p.is_bot = true AND p.archetype IS NOT NULL
ON CONFLICT (persona_profile_id) DO NOTHING;

-- ============================================================
-- PARTE 9: personas (master canônico 3+3 do Manual §21)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.personas (
  id                  UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  code                TEXT         NOT NULL UNIQUE,    -- 'ZE_DO_APERTO', 'DONA_MARIA', 'CARLOS', 'LUCAS_APP', 'FERNANDA', 'ZE_DAS_BETS'
  display_name        TEXT         NOT NULL,
  archetype_tone      TEXT         NOT NULL,            -- 'PRAGMATIC_DIRECT', 'SUPPORTIVE_CLINICAL', etc.
  description         TEXT,
  ticket_min          INT,                              -- centavos
  ticket_max          INT,                              -- centavos
  faq_count           INT          DEFAULT 0,
  is_phase            TEXT         CHECK (is_phase IN ('1', '2_pending', '3_pending')),
  is_active           BOOLEAN      DEFAULT true,
  ip_item_number      SMALLINT,
  manual_section      TEXT         DEFAULT '§21',
  created_at          TIMESTAMPTZ  DEFAULT now()
);

ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads personas" ON public.personas FOR SELECT USING (is_active = true);
CREATE POLICY "Service role manages personas" ON public.personas FOR ALL WITH CHECK (auth.role() = 'service_role');

INSERT INTO public.personas (code, display_name, archetype_tone, description, ticket_min, ticket_max, faq_count, is_phase) VALUES
  ('ZE_DO_APERTO', 'Roberto Santos / Zé do Aperto',  'PRAGMATIC_DIRECT',         'Micro-empreendedor 38a · SUS · orçamento apertado',         2490,  4990,  8, '1'),
  ('DONA_MARIA',   'Maria da Silva / Dona Maria',    'SUPPORTIVE_CLINICAL',      'Idosa 65a · diabetes tipo 2 · família central',             3990, 14990,  9, '1'),
  ('CARLOS',       'Carlos Mendes',                  'CLINICAL_URGENT',          'Executivo 52a · risco cardíaco · alta performance',         8990, 39990,  8, '1'),
  ('LUCAS_APP',    'Lucas Oliveira',                 'DATA_DRIVEN',              'Profissional digital · 30a · biohacker · busca evidência', 8990, 24990,  0, '2_pending'),
  ('FERNANDA',     'Fernanda Rocha',                 'CLINICAL_EVIDENCE_BASED',  'Profissional de saúde · base científica · alta exigência', 14990, 89900,  0, '2_pending'),
  ('ZE_DAS_BETS',  'José Cardoso / Zé das Bets',     'HARM_REDUCTION',           'Apostador compulsivo · 45a · redução de dano',             2490,  4990,  0, '3_pending')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- PARTE 10: panaceia_token_packages.pack_manual (4 packs do Manual §17)
-- ============================================================

DO $$ BEGIN
  CREATE TYPE public.token_pack_manual AS ENUM ('starter', 'basic', 'pro', 'elite', 'custom');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Adiciona coluna pack_manual à tabela existente (migration 11)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='panaceia_token_packages') THEN
    ALTER TABLE public.panaceia_token_packages
      ADD COLUMN IF NOT EXISTS pack_manual public.token_pack_manual DEFAULT 'custom';
  END IF;
END $$;

-- Cria a tabela de definição dos 4 packs canônicos do Manual
CREATE TABLE IF NOT EXISTS public.panaceia_pack_manual_definition (
  pack_manual         public.token_pack_manual PRIMARY KEY,
  display_name        TEXT       NOT NULL,
  ai_tokens           INT        DEFAULT 0,
  sync_tokens         INT        DEFAULT 0,
  insight_tokens      INT        DEFAULT 0,
  community_tokens    INT        DEFAULT 0,
  ai_unlimited        BOOLEAN    DEFAULT false,
  sync_unlimited      BOOLEAN    DEFAULT false,
  price_brl_cents     INT        NOT NULL,
  ip_item_number      SMALLINT
);

ALTER TABLE public.panaceia_pack_manual_definition ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads pack manual"        ON public.panaceia_pack_manual_definition FOR SELECT USING (true);
CREATE POLICY "Service role manages pack manual" ON public.panaceia_pack_manual_definition FOR ALL WITH CHECK (auth.role() = 'service_role');

INSERT INTO public.panaceia_pack_manual_definition (pack_manual, display_name, ai_tokens, sync_tokens, insight_tokens, community_tokens, ai_unlimited, sync_unlimited, price_brl_cents) VALUES
  ('starter', 'Starter Pack',   50,  10,   5,   0, false, false,  1990),
  ('basic',   'Basic Pack',    150,  30,  20,  20, false, false,  4990),
  ('pro',     'Pro Pack',      500, 100,  80, 100, false, false, 12990),
  ('elite',   'Elite Pack',      0,   0, 300, 300, true,  true,  29990)
ON CONFLICT (pack_manual) DO NOTHING;

-- ============================================================
-- PARTE 11: panaceia_offering_categories (9 categorias Manual §18)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.panaceia_offering_categories (
  id                  UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  slug                TEXT         NOT NULL UNIQUE,
  display_name        TEXT         NOT NULL,
  description         TEXT,
  revenue_share_creator NUMERIC(5,2),  -- % para o criador
  revenue_share_arkhe   NUMERIC(5,2),  -- % para ARKHE
  is_active           BOOLEAN      DEFAULT false,    -- ativação Fase 2
  is_marketplace_ready BOOLEAN     DEFAULT false,
  ip_item_number      SMALLINT,
  created_at          TIMESTAMPTZ  DEFAULT now()
);

ALTER TABLE public.panaceia_offering_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads categories"        ON public.panaceia_offering_categories FOR SELECT USING (true);
CREATE POLICY "Service role manages categories" ON public.panaceia_offering_categories FOR ALL WITH CHECK (auth.role() = 'service_role');

INSERT INTO public.panaceia_offering_categories (slug, display_name, description, revenue_share_creator, revenue_share_arkhe, is_active) VALUES
  ('mentorias',          'Mentorias',                    'Sessões 1:1 com especialistas. Agendamento via Beck Office.',                70.0, 30.0, false),
  ('terapias',           'Terapias',                     'Profissionais de saúde mental, nutrição, fisioterapia integrados ao Beck Office.', 75.0, 25.0, false),
  ('grupos_pagos',       'Grupos e Comunidades Pagas',   'Comunidades premium com moderação ativa e conteúdo exclusivo.',             70.0, 30.0, false),
  ('cursos',             'Cursos',                       'Trilhas de aprendizado estruturadas por criadores certificados.',           70.0, 30.0, false),
  ('wearables',          'Wearables Curados',            'Dispositivos homologados pelo EteriOS com integração nativa garantida.',    NULL, NULL, false),
  ('suplementos',        'Suplementos',                  'Recomendados por AsclepiOS com base no IVI Bio. Parceria farmácias.',       NULL, NULL, false),
  ('sensores_iot',       'Sensores IoT',                 'Kits de entrada para automação residencial via EteriOS (Matter/Zigbee).',   NULL, NULL, false),
  ('servicos_financeiros','Serviços Financeiros',        'Investimento, seguros, previdência integrados ao HermeOS. Suitability CVM.', NULL, NULL, false),
  ('protocolos_saude',   'Protocolos de Saúde',          'Programas estruturados por médicos. Integram AsclepiOS + Nutrição + Diário.', 70.0, 30.0, false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PARTE 12: plans (6 níveis incluindo free_anonimo)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.plans (
  id                  UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  slug                TEXT         NOT NULL UNIQUE,
  display_name        TEXT         NOT NULL,
  tier_order          SMALLINT     NOT NULL UNIQUE,
  requires_auth       BOOLEAN      DEFAULT true,
  price_brl_min       INT,            -- centavos
  price_brl_max       INT,            -- centavos
  trial_days          INT          DEFAULT 0,
  duration_days       INT,            -- NULL = permanente
  ivi_visibility      TEXT         CHECK (ivi_visibility IN ('none', 'spirit_only', 'full', 'full_longitudinal')),
  feeds_hygeios       BOOLEAN      DEFAULT false,
  description         TEXT,
  created_at          TIMESTAMPTZ  DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads plans"        ON public.plans FOR SELECT USING (true);
CREATE POLICY "Service role manages plans" ON public.plans FOR ALL WITH CHECK (auth.role() = 'service_role');

INSERT INTO public.plans (slug, display_name, tier_order, requires_auth, price_brl_min, price_brl_max, trial_days, duration_days, ivi_visibility, feeds_hygeios, description) VALUES
  ('free_anonimo',    'Free Anônimo',     1, false,      0,      0, 30, NULL, 'none',              false, 'Google Agenda externa, sem histórico, sem mood tagging. Conhece o sistema sem entregar dados.'),
  ('free_comunidade', 'Free Comunidade',  2, true,       0,      0, 30, NULL, 'spirit_only',       true,  'Participação em Comunidades, gamificação, IVI Spirit parcial.'),
  ('starter',         'Starter',          3, true,    1990,   3990,  0, NULL, 'full',              true,  'Plano de entrada — comunidades plenas + ProteOS completo.'),
  ('premium',         'Premium',          4, true,    7990,  24990,  0, NULL, 'full',              true,  'Starter + módulos à escolha + 1 wearable + IA contextual.'),
  ('professional',    'Professional',     5, true,   14990,  89900,  0, NULL, 'full_longitudinal', true,  'Integração total + EteriOS completo + automação preditiva + Beck Office.'),
  ('beck_office_b2b', 'Beck Office B2B',  6, true,   14990,  89900,  0, NULL, 'full_longitudinal', false, 'B2B para profissionais. Dashboard pacientes + alertas AsclepiOS + Rapidoc.')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PARTE 13: roadmap_phase_log (4 Fases Estratégicas Manual §22)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.roadmap_phase_log (
  id                  UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_number        SMALLINT     NOT NULL,
  phase_name          TEXT         NOT NULL,
  phase_description   TEXT,
  status              TEXT         NOT NULL CHECK (status IN ('planned', 'in_progress', 'complete', 'archived')),
  estimated_start     DATE,
  estimated_end       DATE,
  actual_start        DATE,
  actual_end          DATE,
  notes               TEXT,
  updated_at          TIMESTAMPTZ  DEFAULT now()
);

ALTER TABLE public.roadmap_phase_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads roadmap"        ON public.roadmap_phase_log FOR SELECT USING (true);
CREATE POLICY "Service role manages roadmap" ON public.roadmap_phase_log FOR ALL WITH CHECK (auth.role() = 'service_role');

INSERT INTO public.roadmap_phase_log (phase_number, phase_name, phase_description, status, actual_start, actual_end, notes) VALUES
  (1, 'Fundação Social',     'Diário · Comunidades · HermeOS básico · Free Anônimo + Comunidade · 3 personas calibradas · 30 dias trial',    'complete',    '2026-04-01', '2026-05-27', 'S1-S17 entregues. Migration 12 marca encerramento da Fase 1.'),
  (2, 'Núcleo Analítico',    'ProteOS roteamento real · HygeiOS ETL · AsclepiOS · Marketplace · Tokens · Beck Office · Lucas+Fernanda',     'in_progress', '2026-10-01', NULL,         'Schema preparado em migration 12. Pipeline ETL em migration 13.'),
  (3, 'Integração Física',   'EteriOS wearables + MedTech + IoT · Voz · HermeOS Open Banking · Zé das Bets · AR/VR',                         'planned',     NULL,         NULL,         'Fase 3 depende de partnerships hardware e Open Banking BCB.'),
  (4, 'Autonomia Preditiva', 'Multiagentes IA · automação preditiva · Edge AI · Enterprise API · AR/VR para SandeirOS/EcumenicOS',          'planned',     NULL,         NULL,         'Fase 4: visão de longo prazo (2027+).')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PARTE 14: aquarios_divergencias (registry da auditoria 27/05)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.aquarios_divergencias (
  id                UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  divergence_code   TEXT         NOT NULL UNIQUE,    -- 'D-01', 'D-02', ...
  module_target     TEXT         NOT NULL,
  devpack_ref       TEXT,
  manual_ref        TEXT,
  severity          TEXT         NOT NULL CHECK (severity IN ('critical', 'medium', 'low', 'innovation')),
  priority          TEXT         NOT NULL CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
  title             TEXT         NOT NULL,
  devpack_says      TEXT,
  manual_says       TEXT,
  code_reality      TEXT,
  divergence_type   TEXT,
  status            TEXT         DEFAULT 'open' CHECK (status IN ('open', 'decided', 'closed', 'reverted')),
  notes             TEXT,
  created_at        TIMESTAMPTZ  DEFAULT now()
);

ALTER TABLE public.aquarios_divergencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads divergencias"        ON public.aquarios_divergencias FOR SELECT USING (true);
CREATE POLICY "Service role manages divergencias" ON public.aquarios_divergencias FOR ALL WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- PARTE 15: aquarios_decisions (log com decisor nomeado)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.aquarios_decisions (
  id                UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  divergence_code   TEXT         NOT NULL REFERENCES public.aquarios_divergencias(divergence_code),
  chosen_option     TEXT         NOT NULL,        -- 'A' | 'B' | 'C' | 'D' | 'E' | freetext
  option_title      TEXT,
  rationale         TEXT,
  decisor_role      TEXT         NOT NULL CHECK (decisor_role IN ('admin_ai', 'fabiano_leite', 'system')),
  decisor_kind      TEXT         NOT NULL CHECK (decisor_kind IN ('technical', 'business', 'lgpd', 'recovery', 'cultural')),
  manual_version    TEXT         DEFAULT 'V1.0612',
  decided_at        TIMESTAMPTZ  DEFAULT now(),
  effort_estimated  TEXT         CHECK (effort_estimated IN ('XS', 'S', 'M', 'L', 'XL')),
  implementation_phase TEXT
);

ALTER TABLE public.aquarios_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads decisions"        ON public.aquarios_decisions FOR SELECT USING (true);
CREATE POLICY "Service role manages decisions" ON public.aquarios_decisions FOR ALL WITH CHECK (auth.role() = 'service_role');

-- Seed: as 17 decisões aprovadas em 27/05/2026
INSERT INTO public.aquarios_divergencias (divergence_code, module_target, devpack_ref, manual_ref, severity, priority, title, devpack_says, manual_says, code_reality, divergence_type, status) VALUES
  ('D-01', 'HermeOS',         'M-04',     '§09',     'critical',   'P1', 'HermeOS — financeiro vs dashboard',                  'Dashboard executivo',                       'Módulo financeiro (Hermes IVI Mental↔finanças)',          'Inteligência financeira pessoal',                                'DEVPACK errado · Manual = financeiro',                'decided'),
  ('D-04', 'ARKHE',            'M-10',     '§03',     'medium',     'P2', 'ARKHE — holding vs módulo',                          'Módulo docs/PI',                            'Holding legal acima do AquariOS',                          'Branding Arkhe Labs',                                              'Não é módulo · é holding',                            'decided'),
  ('D-05', 'Sophrosyne',       'M-09',     'NA',      'low',        'P4', 'Sophrosyne — não existe no Manual',                  'Kernel central',                            'NÃO EXISTE — núcleo é HygeiOS+IVI',                       'audit_logs parcial',                                              'DEVPACK invenção · descartar',                        'decided'),
  ('D-09', 'DataCommunity',    'M-12',     '§01-22',  'critical',   'P1', '44 eixos DataCommunity — distribuição',              '44 eixos isolados',                         'Não menciona 44 eixos',                                   'Não implementado',                                                'Distribuir nos 8 módulos · questionários→arcanos',   'decided'),
  ('D-10', 'PanaceIA',         'M-13',     '§17-18',  'critical',   'P1', 'PanaceIA — Stripe vs BYOK',                          'Marketplace tokens IA externos',            '4 packs tokens + 9 categorias marketplace',                'Stripe + 4 tipos token',                                          'Híbrido Stripe + BYOK premium',                       'decided'),
  ('D-13', 'AlexandriOS',      'M-05',     '§03',     'medium',     'P2', 'FAQ engine 42 perguntas',                            '42 FAQs Zé/Maria/Carlos',                   'AlexandriOS help engine + KB Qualis',                     'services/faqEngine.ts existe',                                    'Renomear + criar alexandrios_kb',                     'decided'),
  ('D-17', 'adm_ai',            NULL,      '§03',     'critical',   'P1', 'adm_ai mecanismo de acesso',                         'Não detalha',                               'Supra-usuário OCULTO',                                    'admin.tsx + 5 toques',                                            'Gate 4 camadas + aquarios_admin_grants',              'decided'),
  ('D-22', 'Personas LGPD',    'M-11',     '§21',     'low',        'P3', 'profile_data_removed mechanism',                     'profile_data_removed + função',             'Soft delete via is_active',                                'is_bot=true sem remoção controlada',                              'is_active=false + audit_log',                         'decided'),
  ('D-26', 'AeropagOS',        NULL,       'NA',      'innovation', 'P4', 'AeropagOS — não está no Manual',                     NULL,                                        'Não existe',                                              'aquarios_modules slug=aeropagos built',                            'Manter · entra em V1.0612 item 29',                   'decided'),
  ('D-27', 'CerberOS',         'M-08',     'NA',      'innovation', 'P4', 'CerberOS V1.0512 — não está no Manual',              'Segurança ETERNAL MAZE',                    'Não menciona',                                            'aquarios_modules slug=cerberos active',                            'Manter · entra em V1.0612 item 28',                   'decided'),
  ('D-28', 'Wonder Night',     NULL,       'NA',      'innovation', 'P4', 'Wonder Night — não está no Manual',                  NULL,                                        'Não menciona',                                            'native_tool active wonder',                                       'Manter · entra em V1.0612 item 30',                   'decided'),
  ('D-29', 'ProteOS taxonomia','M-03',     '§05',     'low',        'P4', 'ProteOS módulo vs native_tool',                      'Módulo central M-03',                       'Módulo visível §05',                                      'category=native_tool',                                            'Manter native_tool · doc em V1.0612',                 'decided'),
  ('D-30', 'Comunidades tax.', 'M-11',     '§11',     'low',        'P4', 'Comunidades/Diário/Nutrição taxonomia',              NULL,                                        'Módulos visíveis',                                        'category=native_tool',                                            'Manter native_tool · doc em V1.0612',                 'decided'),
  ('D-31', 'AlexandriOS doc',  NULL,       '§03',     'medium',     'P2', 'faqEngine sem nome AlexandriOS',                     NULL,                                        'AlexandriOS help engine',                                 'services/faqEngine.ts',                                           'Renomear arquivo + criar tabela',                     'decided'),
  ('D-32', 'KB_Foundation',    NULL,       '§03',     'medium',     'P2', 'KB_Foundation ausente',                              NULL,                                        'Base Qualis AA',                                          'Não existe',                                                      'Criar kb_foundation (PARTE 6)',                       'decided'),
  ('D-33', 'MetadataStore',    NULL,       '§03',     'medium',     'P3', 'MetadataStore parcial',                              NULL,                                        'Versionamento imutável',                                  'audit_logs parcial',                                              'content_hash em tabelas core',                        'decided'),
  ('D-37', 'IVI fórmula',       NULL,      '§04',     'medium',     'P2', 'IVI tridimensional sem fórmula',                     NULL,                                        '(Bio×0.40)+(Mental×0.35)+(Spirit×0.25)',                  'calculated_score sem fórmula',                                    'Adicionar componentes + functions',                   'decided')
ON CONFLICT (divergence_code) DO NOTHING;

INSERT INTO public.aquarios_decisions (divergence_code, chosen_option, option_title, rationale, decisor_role, decisor_kind, effort_estimated, implementation_phase) VALUES
  ('D-01', 'C',                  'Híbrido: integrador + financeiro',                              'Manual confirma financeiro. Híbrido amplia escopo sem quebrar.',                                              'fabiano_leite', 'business',  'L',  '2'),
  ('D-04', 'B',                  'Manter como branding (não criar módulo)',                       'Manual V1.0512 §03: ARKHE é holding, não módulo.',                                                            'fabiano_leite', 'business',  'XS', '1'),
  ('D-05', 'C',                  'Descartar conceito Sophrosyne',                                 'Manual não menciona. HygeiOS já cumpre papel.',                                                                'fabiano_leite', 'technical', 'XS', '1'),
  ('D-09', 'E',                  'Distribuir 44 eixos + questionários→arquétipos',               'Conecta DataCommunity, SandeirOS e Personas em sistema único.',                                                'fabiano_leite', 'business',  'M',  '2'),
  ('D-10', 'C',                  'Híbrido Stripe + BYOK premium',                                 'Stripe receita garantida + BYOK atrai técnicos. Manual §17 não proíbe BYOK.',                                  'fabiano_leite', 'business',  'S',  '2'),
  ('D-13', 'A',                  'Renomear faqEngine para alexandrios + criar kb',                'Manual §03 nomeia AlexandriOS como help engine.',                                                              'fabiano_leite', 'technical', 'S',  '1'),
  ('D-17', 'A',                  'Gate 4 camadas: invisibilidade + knock + crypto + dual auth',   'adm_ai é supra-usuário oculto (Manual §03). Mecanismo robusto + LGPD-safe.',                                   'fabiano_leite', 'lgpd',      'M',  '1'),
  ('D-22', 'B',                  'is_active=false soft delete + audit_log',                       'Simplicidade > controle granular. LGPD ainda satisfeito via audit_log.',                                       'admin_ai',      'lgpd',      'XS', '1'),
  ('D-26', 'A',                  'Manter AeropagOS · entra em V1.0612',                           'Já built. Ratificação retroativa como item 29 IP Registry.',                                                  'fabiano_leite', 'business',  'XS', '1'),
  ('D-27', 'A',                  'Manter CerberOS · entra em V1.0612',                            'Active em produção. Ratificação retroativa como item 28 IP Registry.',                                       'fabiano_leite', 'business',  'XS', '1'),
  ('D-28', 'A',                  'Manter Wonder Night · entra em V1.0612',                        'Active em produção. Ratificação retroativa como item 30 IP Registry.',                                       'fabiano_leite', 'business',  'XS', '1'),
  ('D-29', 'C',                  'Manter native_tool · documentar em V1.0612',                    'Não quebra código existente. Doc resolve.',                                                                    'fabiano_leite', 'technical', 'XS', '1'),
  ('D-30', 'C',                  'Manter native_tool para Comunidades/Diário/Nutrição',          'Mesmo critério de D-29.',                                                                                       'fabiano_leite', 'technical', 'XS', '1'),
  ('D-31', 'A',                  'Renomear faqEngine.ts → alexandrios.ts',                        'Aliado à decisão D-13.',                                                                                        'fabiano_leite', 'technical', 'XS', '1'),
  ('D-32', 'A',                  'Criar kb_foundation table',                                     'Item 26 IP Registry. PARTE 6 desta migration.',                                                                'fabiano_leite', 'business',  'S',  '1'),
  ('D-33', 'A',                  'content_hash em tabelas core',                                  'Item 27 IP Registry. PARTE 7 desta migration.',                                                                'fabiano_leite', 'technical', 'XS', '1'),
  ('D-37', 'A',                  'Schema agora + ETL Fase 2',                                     'IVI é item 9 (já declarado). Cálculo via function calculate_ivi.',                                             'fabiano_leite', 'business',  'M',  '2')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PARTE 16: aquarios_admin_grants (adm_ai gate 4 camadas)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.aquarios_admin_grants (
  user_id              UUID         REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  granted_at           TIMESTAMPTZ  DEFAULT now(),
  granted_by           TEXT         DEFAULT 'system_bootstrap',
  passphrase_hash      TEXT,                                       -- bcrypt da knock passphrase
  passphrase_set_at    TIMESTAMPTZ,
  pre_condition_met    BOOLEAN      DEFAULT false,                 -- usuário cumpriu pré-condição
  pre_condition_proof  JSONB        DEFAULT '{}'::jsonb,           -- {"active_days": 30, "xp": 100, ...}
  last_admin_access    TIMESTAMPTZ,
  revoked_at           TIMESTAMPTZ,
  revoked_reason       TEXT,
  notes                TEXT
);

ALTER TABLE public.aquarios_admin_grants ENABLE ROW LEVEL SECURITY;
-- APENAS service_role. Mesmo usuário autenticado NÃO vê esta tabela.
CREATE POLICY "Service role only admin grants" ON public.aquarios_admin_grants
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Function para validar acesso ao adm_ai
CREATE OR REPLACE FUNCTION public.aquarios_validate_admin_access(
  p_user_id     UUID,
  p_passphrase  TEXT
) RETURNS JSONB AS $$
DECLARE
  v_grant RECORD;
  v_now TIMESTAMPTZ := now();
BEGIN
  SELECT * INTO v_grant FROM public.aquarios_admin_grants
   WHERE user_id = p_user_id AND revoked_at IS NULL;

  IF v_grant IS NULL THEN
    -- Não logar erro detalhado (sec)
    RETURN jsonb_build_object('granted', false, 'reason', 'no_grant');
  END IF;

  IF v_grant.passphrase_hash IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'no_passphrase_set');
  END IF;

  IF NOT v_grant.pre_condition_met THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'precondition_not_met');
  END IF;

  -- bcrypt comparison precisa extensão pgcrypto (já presente em Supabase)
  IF v_grant.passphrase_hash = crypt(p_passphrase, v_grant.passphrase_hash) THEN
    UPDATE public.aquarios_admin_grants
       SET last_admin_access = v_now
     WHERE user_id = p_user_id;

    -- Audit log
    INSERT INTO public.audit_logs (user_id, event_type, resource, metadata)
    VALUES (p_user_id, 'admin_ai.access.granted', 'aquarios_admin_grants', jsonb_build_object('at', v_now));

    RETURN jsonb_build_object('granted', true, 'access_level', 'adm_ai', 'ttl_seconds', 3600);
  END IF;

  -- Falha de passphrase: log mas não detalhar para o caller
  INSERT INTO public.audit_logs (user_id, event_type, resource, metadata)
  VALUES (p_user_id, 'admin_ai.access.denied', 'aquarios_admin_grants', jsonb_build_object('reason', 'passphrase_mismatch', 'at', v_now));

  RETURN jsonb_build_object('granted', false, 'reason', 'invalid_credentials');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PARTE 17: panaceia_user_api_keys (BYOK criptografado)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.panaceia_user_api_keys (
  id                  UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider            TEXT         NOT NULL CHECK (provider IN ('anthropic', 'openai', 'google_gemini', 'mistral', 'cohere')),
  api_key_encrypted   TEXT         NOT NULL,         -- AES-256-GCM via lib/crypto.ts
  api_key_nonce       TEXT         NOT NULL,
  key_hint            TEXT,                          -- últimos 4 chars apenas, para UI
  is_active           BOOLEAN      DEFAULT true,
  usage_count         INT          DEFAULT 0,
  last_used_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ  DEFAULT now(),
  UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_byok_user ON public.panaceia_user_api_keys(user_id);

ALTER TABLE public.panaceia_user_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own keys (no api_key_encrypted)" ON public.panaceia_user_api_keys
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own keys" ON public.panaceia_user_api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own keys" ON public.panaceia_user_api_keys
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own keys" ON public.panaceia_user_api_keys
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access" ON public.panaceia_user_api_keys
  FOR ALL WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- PARTE 18: aquarios_arcana_catalog (22 arcanos · oculto · is_public=false)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.aquarios_arcana_catalog (
  arcana_number       SMALLINT     PRIMARY KEY CHECK (arcana_number BETWEEN 0 AND 21),
  arcana_name         TEXT         NOT NULL,
  arcana_symbol       TEXT,
  hermetic_law        TEXT,
  primary_archetype   TEXT,             -- mapping aos 10 arquétipos manifestos
  shadow_archetype    TEXT,             -- contraponto
  is_orphan           BOOLEAN      DEFAULT false,   -- arcanos que NÃO mapeiam a 1 dos 10 manifestos (intervenções)
  intervention_trigger TEXT,            -- quando esse arcano é invocado
  is_public           BOOLEAN      DEFAULT false,   -- NUNCA expor ao usuário
  ip_item_number      SMALLINT     DEFAULT 4 REFERENCES public.intellectual_property_registry(item_number)
);

ALTER TABLE public.aquarios_arcana_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only arcana" ON public.aquarios_arcana_catalog
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

INSERT INTO public.aquarios_arcana_catalog (arcana_number, arcana_name, hermetic_law, primary_archetype, shadow_archetype, is_orphan, intervention_trigger) VALUES
  (0,  'O Louco',         'ritmo',         'Louco',       'Roda da Fortuna', false, NULL),
  (1,  'O Mago',          'mentalismo',    'Criador',     'Imperatriz',      false, NULL),
  (2,  'A Sacerdotisa',   'mentalismo',    'Místico',     'Lua',             false, NULL),
  (3,  'A Imperatriz',    'gênero',        'Criador',     NULL,              false, NULL),
  (4,  'O Imperador',     'causa_efeito',  'Mestre',      NULL,              false, NULL),
  (5,  'O Hierofante',    'correspondência','Mestre',     'Imperador',       false, NULL),
  (6,  'Os Amantes',      'gênero',        'Ponte',       'Mundo',           false, NULL),
  (7,  'O Carro',         'vibração',      'Guerreiro',   'Força',           false, NULL),
  (8,  'A Força',         'polaridade',    'Guerreiro',   'Carro',           false, NULL),
  (9,  'O Eremita',       'mentalismo',    'Buscador',    'Pendurado',       false, NULL),
  (10, 'A Roda da Fortuna','ritmo',        'Louco',       'Eremita',         false, NULL),
  (11, 'A Justiça',       'causa_efeito',  'Testemunho',  'Eremita',         false, NULL),
  (12, 'O Pendurado',     'polaridade',    'Buscador',    NULL,              false, NULL),
  (13, 'A Morte',         'ritmo',         NULL,          NULL,              false, NULL),
  (14, 'A Temperança',    'ritmo',         NULL,          NULL,              true,  'Detecção de desequilíbrio em archetype_balance'),
  (15, 'O Diabo',         'polaridade',    NULL,          NULL,              true,  'Detecção de padrões de apego em user_violations'),
  (16, 'A Torre',         'causa_efeito',  NULL,          NULL,              true,  'Crise detectada via hygeios_cerberos_signals'),
  (17, 'A Estrela',       'vibração',      'Curador',     'Sacerdotisa',     false, NULL),
  (18, 'A Lua',           'vibração',      'Místico',     'Sacerdotisa',     false, NULL),
  (19, 'O Sol',           'mentalismo',    NULL,          NULL,              false, NULL),
  (20, 'O Julgamento',    'causa_efeito',  'Ancião',      NULL,              false, NULL),
  (21, 'O Mundo',         'correspondência','Ancião',     'Amantes',         false, NULL)
ON CONFLICT (arcana_number) DO NOTHING;

-- ============================================================
-- PARTE 19: aquarios_eixo_distribution (44 eixos → 8 módulos)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.aquarios_eixo_distribution (
  id                  UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  eixo_code           TEXT         NOT NULL UNIQUE,        -- ex: 'ia-001', 'token-005'
  eixo_name           TEXT         NOT NULL,
  eixo_function       TEXT,
  category            TEXT         NOT NULL,                -- 'IA' | 'Token' | 'Dados' | 'Social' | 'Util' | 'Experiencia'
  target_module       TEXT         NOT NULL,                -- slug em aquarios_modules
  arcana_revealed     SMALLINT     REFERENCES public.aquarios_arcana_catalog(arcana_number),
  implementation_status TEXT       DEFAULT 'taxonomy_only' CHECK (implementation_status IN ('taxonomy_only', 'partial', 'implemented')),
  notes               TEXT,
  created_at          TIMESTAMPTZ  DEFAULT now()
);

ALTER TABLE public.aquarios_eixo_distribution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads eixo distribution" ON public.aquarios_eixo_distribution FOR SELECT USING (true);
CREATE POLICY "Service role manages eixo dist"  ON public.aquarios_eixo_distribution FOR ALL WITH CHECK (auth.role() = 'service_role');

-- 46 eixos distribuídos conforme 44_EIXOS_DISTRIBUTION_MAP.md
INSERT INTO public.aquarios_eixo_distribution (eixo_code, eixo_name, eixo_function, category, target_module, arcana_revealed) VALUES
  -- AeropagOS (8)
  ('social-001', 'Perfil do Usuário',       'Identidade e jornada',                'Social', 'aeropagos', 1),
  ('social-005', 'Sistema de Reputação',    'Score IVI e confiança',                'Social', 'aeropagos', 11),
  ('social-006', 'Indicações',              'Convites para a rede',                 'Social', 'aeropagos', 6),
  ('social-007', 'Embaixadores',            'Líderes rotativos',                    'Social', 'aeropagos', 4),
  ('token-005', 'Governança DAO',           'Votação coletiva',                     'Token',  'aeropagos', 5),
  ('exp-001',   'Gamificação',              'Missões e badges',                     'Experiencia', 'aeropagos', 7),
  ('exp-002',   'NFTs de Conquista',        'Colecionáveis simbólicos',             'Experiencia', 'aeropagos', 17),
  ('exp-003',   'Avatar Personalizado',     'Identidade visual',                    'Experiencia', 'aeropagos', 18),
  -- PanaceIA (8)
  ('token-001', 'Token Ledger (TKN)',       'Contabilidade central',                'Token',  'panaceia', 10),
  ('token-002', 'Token DCT (Blockchain)',   'DCT futuro + BYOK',                    'Token',  'panaceia', 12),
  ('token-003', 'Staking',                  'Rendimento passivo',                   'Token',  'panaceia', 14),
  ('token-004', 'Yield Farming',            'Liquidez',                             'Token',  'panaceia', 1),
  ('token-006', 'Airdrop Manager',          'Distribuição',                         'Token',  'panaceia', 3),
  ('dados-005', 'Mercado de Dados',         'Compra/venda dados',                   'Dados',  'panaceia', 15),
  ('dados-006', 'Oráculo de Preços',        'Feed externo',                         'Dados',  'panaceia', 5),
  ('util-008',  'Conector Zapier',          'No-code automação',                    'Util',   'panaceia', 1),
  -- CerberOS (5)
  ('dados-001', 'Data Lake Core',           'Armazenamento central',                'Dados',  'cerberos', 16),
  ('dados-002', 'Data Mesh',                'Domínios isolados',                    'Dados',  'cerberos', 4),
  ('dados-003', 'Anonimizador',             'LGPD compliance',                      'Dados',  'cerberos', 2),
  ('util-006',  'API Pública',              'Integração externa',                   'Util',   'cerberos', 7),
  ('util-007',  'Webhooks',                 'Automação reativa',                    'Util',   'cerberos', 10),
  -- SandeirOS (4)
  ('ia-004',    'Análise de Sentimentos',   'Detecção emocional',                   'IA',     'sandeiros', 18),
  ('ia-007',    'Composição Musical',       'Linguagem além de palavras',           'IA',     'sandeiros', 17),
  ('ia-008',    'Renderização 3D',          'Visualização simbólica',               'IA',     'sandeiros', 21),
  ('exp-004',   'Mundo Virtual',            'Wonder Night avançado',                'Experiencia', 'sandeiros', 0),
  -- AsclepiOS (7)
  ('ia-002',    'Visão Computacional',      'Análise de exames',                    'IA',     'asclepios', 9),
  ('util-001',  'OCR Avançado',             'Extração de receitas',                 'Util',   'asclepios', 11),
  ('util-002',  'Calculadora IA',           'Nutrição/dosagem',                     'Util',   'asclepios', 14),
  ('util-003',  'Processador PDF',          'Documentos médicos',                   'Util',   'asclepios', 5),
  ('util-005',  'Planilha Inteligente',     'Tabelas longitudinais',                'Util',   'asclepios', 10),
  ('dados-004', 'Curadoria de Qualidade',   'Validação clínica',                    'Dados',  'asclepios', 2),
  ('rapidoc',   'Rapidoc telemedicina',     'Sub-módulo API CFM 2.314/2022',        'IA',     'asclepios', 17),
  -- HermeOS (5)
  ('ia-005',    'Tradução Multilíngue',     '13 países',                            'IA',     'hermeos', 21),
  ('ia-006',    'Geração de Código',        'Para developers',                      'IA',     'hermeos', 1),
  ('util-004',  'Bloco de Notas IA',        'Anotações com IA',                     'Util',   'hermeos', 5),
  ('pipeline-pais', 'Pipeline por País',    'Funil cultural DEVPACK M-04',          'Social', 'hermeos', 4),
  ('google-reviews', 'Google Reviews',      'Trust signals DEVPACK M-04',           'Social', 'hermeos', 20),
  -- EteriOS (4)
  ('ia-003',    'Processamento de Voz',     'Speech-to-text',                       'IA',     'eterios', 1),
  ('exp-005',   'Realidade Aumentada',      'Overlay',                              'Experiencia', 'eterios', 12),
  ('exp-007',   'Feedback Háptico',         'Vibração contextual',                  'Experiencia', 'eterios', 10),
  ('exp-008',   'Biometria',                'Sinais vitais IoT',                    'Experiencia', 'eterios', 3),
  -- EcumenicOS (5)
  ('ia-001',    'Chat da Jornada',          'ProteOS Cultural Voice (live)',        'IA',     'ecumenicos', 5),
  ('social-002','Feed de Atividades',       'Por tradição',                         'Social', 'ecumenicos', 6),
  ('social-003','Mensageria P2P',           'Por cultura',                          'Social', 'ecumenicos', 6),
  ('social-004','Grupos Temáticos',         '13 tradições',                         'Social', 'ecumenicos', 21),
  ('social-008','Eventos Ao Vivo',          'Webinars culturais',                   'Social', 'ecumenicos', 17)
ON CONFLICT (eixo_code) DO NOTHING;

-- ============================================================
-- PARTE 20: Helper functions
-- ============================================================

-- Function para registrar uma decisão (chamável pela aplicação)
CREATE OR REPLACE FUNCTION public.aquarios_record_decision(
  p_divergence_code TEXT,
  p_chosen_option   TEXT,
  p_rationale       TEXT,
  p_decisor_role    TEXT,
  p_decisor_kind    TEXT,
  p_effort          TEXT DEFAULT NULL,
  p_phase           TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.aquarios_decisions
    (divergence_code, chosen_option, rationale, decisor_role, decisor_kind, effort_estimated, implementation_phase)
  VALUES
    (p_divergence_code, p_chosen_option, p_rationale, p_decisor_role, p_decisor_kind, p_effort, p_phase)
  RETURNING id INTO v_id;

  UPDATE public.aquarios_divergencias SET status = 'decided' WHERE divergence_code = p_divergence_code;

  -- Audit
  INSERT INTO public.audit_logs (event_type, resource, resource_id, metadata)
  VALUES (
    'aquarios.decision.recorded',
    'aquarios_decisions',
    v_id::text,
    jsonb_build_object(
      'divergence_code', p_divergence_code,
      'chosen', p_chosen_option,
      'decisor_role', p_decisor_role
    )
  );

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PARTE 21: HermeOS description update (D-01 híbrido)
-- ============================================================

UPDATE public.aquarios_modules
   SET description = 'Hermes — mediador IVI Mental ↔ finanças. Educação financeira + Open Banking + Investimentos. Decisão D-01 (27/05): integrador + alertas financeiros.'
 WHERE slug = 'hermeos';

-- ============================================================
-- VERIFICAÇÕES FINAIS DE INTEGRIDADE
-- ============================================================

-- 1. Garantir que todos os 30 itens IP têm author_cpf correto
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.intellectual_property_registry WHERE author_cpf <> '52136388649') THEN
    RAISE EXCEPTION 'INTEGRIDADE: nem todos os itens IP têm author_cpf=52136388649';
  END IF;
END $$;

-- 2. Audit log da execução desta migration
INSERT INTO public.audit_logs (event_type, resource, metadata)
VALUES (
  'migration.executed',
  '12_s18_devpack_v5_consolidation',
  jsonb_build_object(
    'migration_version',     '12_s18',
    'manual_version_target', 'V1.0612',
    'ip_items_total',        30,
    'decisions_seeded',      17,
    'arcana_seeded',         22,
    'eixos_distributed',     46,
    'plans_added',           6,
    'token_packs_canonical', 4,
    'marketplace_categories',9,
    'executed_at',           now()
  )
);

COMMIT;

-- ============================================================
-- FIM — 12_s18_devpack_v5_consolidation.sql
-- 21 partes · ~700 linhas
-- 11 tabelas novas · 8 ALTERs · 4 functions · 1 enum · 1 type
-- Aprovado por Fabiano Gomes Leite (CPF 521.363.886-49) em 27/05/2026
-- ============================================================
