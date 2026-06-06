-- ============================================================
-- S24: MÓDULOS — Atualização de metadata completa
-- Data: 04/06/2026
-- Objetivo: preencher descriptions e adicionar módulos ausentes
-- Ref: MASTER_CONSOLIDACAO_CONHECIMENTO_v1.md · PROXIMO_CHAT.md S24
-- ============================================================

-- ============================================================
-- PARTE 1: Atualizar módulos existentes com descriptions completas
-- ============================================================

UPDATE public.aquarios_modules SET
  description = 'Assistente IA pessoal AI-first. Detecta 5 Vieses de Gurdjieff. SandeirOS opera silenciosamente. Interface primária do AquariOS.',
  icon = '💬'
WHERE slug = 'proteos';

UPDATE public.aquarios_modules SET
  description = 'Índice de Vitalidade Integrada 4D. Pipeline ETL. Calcula Físico×0.35 + Mental×0.30 + Espiritual×0.20 + Social×0.15. Fala com CerberOS.',
  icon = '🧬'
WHERE slug = 'hygeios';

UPDATE public.aquarios_modules SET
  description = 'Engine simbólica de 22 arcanos. Modo oculto (padrão) — tempera respostas do ProteOS. Modo explícito — 4 tiragens originais.',
  icon = '🔮'
WHERE slug = 'sandeiros';

UPDATE public.aquarios_modules SET
  description = 'Sabedoria inter-religiosa: 13 tradições (Catolicismo ao Existencialismo). 3 modos: Quick 30s · Depth 5min · Full Journey 30min.',
  icon = '☯'
WHERE slug = 'ecumenicos';

UPDATE public.aquarios_modules SET
  description = 'Segurança ativa 7 camadas. Audit trail LGPD-compliant. Soft delete 90 dias. Só recebe sinais de HygeiOS.',
  icon = '🔐'
WHERE slug = 'cerberos';

UPDATE public.aquarios_modules SET
  description = 'Módulo médico longitudinal. Prontuário, anamnese assistida por IA, exames e integração com telemedicina Rapidoc.',
  icon = '⚕'
WHERE slug = 'asclepios';

UPDATE public.aquarios_modules SET
  description = 'Inteligência financeira pessoal. Open Banking, educação financeira e alertas de impacto no IVI Mental. Decisão D-01: integrador + financeiro.',
  icon = '💰'
WHERE slug = 'hermeos';

UPDATE public.aquarios_modules SET
  description = 'Conexão com wearables e IoT. Apple Watch, Oura Ring, Fitbit, Garmin. Dados de VFC, sono e movimento para HygeiOS.',
  icon = '📡'
WHERE slug = 'eterios';

UPDATE public.aquarios_modules SET
  description = 'Gamificação por lotes. XP Existencial (5 tipos), badges, leaderboard e sistema de mentoria entre usuários.',
  icon = '🏛'
WHERE slug = 'aeropagos';

UPDATE public.aquarios_modules SET
  description = 'Marketplace + monetização. Tokens AI/Sync/Insight/Community. Serviços, mentoria, loja e rev share 70/30.',
  icon = '🛍'
WHERE slug = 'panaceia';

UPDATE public.aquarios_modules SET
  description = 'Coração do AquariOS. Círculos por arquétipo IVI. 130 personas AI. Moderação algorítmica CerberOS-powered.',
  icon = '👥'
WHERE slug = 'comunidades';

UPDATE public.aquarios_modules SET
  description = 'Reflexões diárias e autoconhecimento longitudinal. E2E criptografado. Exportação completa (JSON + PDF).',
  icon = '✎'
WHERE slug = 'diario';

UPDATE public.aquarios_modules SET
  description = 'Tracking nutricional inteligente. Análise por fotografia. E2E criptografado. Impacto direto no IVI Físico.',
  icon = '🥗'
WHERE slug = 'nutricao';

UPDATE public.aquarios_modules SET
  description = 'Rituais noturnos de transformação. Práticas contemplativas, sono consciente e check-in existencial.',
  icon = '🌙'
WHERE slug = 'wonder';

UPDATE public.aquarios_modules SET
  description = '4 tipos de token: AI (50/semana), Sync (100/mês), Insight (5/relatório), Community (20/mês). Regen por ações.',
  icon = '🪙'
WHERE slug = 'tokens';

UPDATE public.aquarios_modules SET
  description = 'B2B para clínicas, consultórios e empresas. Matching por IVI. White-label. Agenda + prontuário + telemedicina integrados.',
  icon = '🏢'
WHERE slug = 'beckoffice';

-- ============================================================
-- PARTE 2: Inserir módulos ausentes do MASTER_CONSOLIDACAO
-- (módulos planejados ainda não registrados)
-- ============================================================

INSERT INTO public.aquarios_modules (slug, name, icon, category, status, description, code_anchor, db_tables, depends_on) VALUES

  -- Módulo Clínico Avançado (AsclepiOS expandido)
  ('rapidoc',       'Rapidoc',          '🩺', 'module',      'coming_soon', 'Telemedicina integrada CFM 2.314/2022. Videochamada E2E, receituário digital ICP-Brasil e laudo com validade jurídica.',                   'app/(app)/telemedicina.tsx',          NULL, ARRAY['asclepios']),

  -- Agendamento
  ('agenda',        'Agenda do Ser',    '📅', 'module',      'coming_soon', 'Linha do tempo biológica, mental, espiritual e social. Ciclos circadianos, energéticos e espirituais respeitados.',                         'app/(app)/coming-soon.tsx',           ARRAY['user_events'], ARRAY['hygeios']),

  -- Movimento
  ('movimento',     'Movimento',        '🤸', 'module',      'coming_soon', '9 modalidades (Tai Chi, Yoga, musculação, pilates e mais). Atenção dividida — três centros operando simultaneamente.',                       'app/(app)/coming-soon.tsx',           ARRAY['movement_logs'], ARRAY['hygeios']),

  -- Sono
  ('sono',          'Sono Consciente',  '😴', 'module',      'coming_soon', 'Rastreamento de sono via wearable + input manual. Componentes de qualidade, profundidade e sonhos. Impacto IVI Físico + Mental.',            'app/(app)/coming-soon.tsx',           ARRAY['sleep_logs'], ARRAY['eterios','hygeios']),

  -- Meditação
  ('meditacao',     'Meditação',        '🧘', 'module',      'coming_soon', 'Práticas contemplativas guiadas (vipassana, mindfulness, zazen). Timer, contador de sessões e impacto IVI Mental + Espiritual.',             'app/(app)/coming-soon.tsx',           ARRAY['meditation_logs'], ARRAY['hygeios']),

  -- Respiração
  ('respiracao',    'Respiração',       '🌬', 'module',      'coming_soon', 'Técnicas respiratórias (Wim Hof, coerência cardíaca, pranayama). Integrado com VFC via EteriOS.',                                            'app/(app)/coming-soon.tsx',           ARRAY['breathing_logs'], ARRAY['eterios','hygeios']),

  -- Humor e check-in
  ('humor',         'Check-in de Humor','😊', 'module',      'coming_soon', 'Registro diário de humor, energia e intenção (escala 1–10). Alimenta HygeiOS em tempo real. Padrões detectados pelo ProteOS.',              'app/(app)/coming-soon.tsx',           ARRAY['mood_logs'], ARRAY['hygeios']),

  -- Hidratação
  ('hidratacao',    'Hidratação',       '💧', 'module',      'coming_soon', 'Rastreamento de ingestão hídrica. Lembretes adaptativos. Impacto direto no IVI Físico.',                                                      'app/(app)/coming-soon.tsx',           ARRAY['hydration_logs'], ARRAY['hygeios']),

  -- Suplementação
  ('suplementos',   'Suplementos',      '💊', 'module',      'coming_soon', 'Rastreamento de suplementação e medicamentos. Horários, doses e alertas. Histórico para Módulo Médico.',                                      'app/(app)/coming-soon.tsx',           ARRAY['supplement_logs'], ARRAY['asclepios']),

  -- Estresse
  ('estresse',      'Gestão de Estresse','⚡','module',      'coming_soon', 'Monitor de carga cognitiva + estresse percebido. ProteOS sugere intervenções. Risk score AsclepiOS ativado em limiar.',                       'app/(app)/coming-soon.tsx',           ARRAY['stress_logs'], ARRAY['asclepios','hygeios']),

  -- Financeiro pessoal (complemento HermeOS)
  ('orcamento',     'Orçamento',        '📊', 'module',      'coming_soon', 'Controle de receitas e despesas com impacto no IVI Mental. Complementa HermeOS — foco em comportamento, não só saldo.',                      'app/(app)/coming-soon.tsx',           ARRAY['financial_logs'], ARRAY['hermeos']),

  -- Gratidão
  ('gratidao',      'Gratidão',         '🙏', 'module',      'coming_soon', 'Registro diário de gratidões. Padrão longitudinal detectado pelo ProteOS. Impacto mensurável no IVI Espiritual.',                            'app/(app)/coming-soon.tsx',           ARRAY['gratitude_logs'], ARRAY['hygeios']),

  -- Afirmações
  ('afirmacoes',    'Afirmações',       '✨', 'module',      'coming_soon', 'Criação e rastreamento de afirmações positivas personalizadas. Frequência e reforço. Integrado com ProteOS.',                                 'app/(app)/coming-soon.tsx',           NULL, ARRAY['proteos']),

  -- Metas
  ('metas',         'Metas do Ser',     '🎯', 'module',      'coming_soon', 'Definição e rastreamento de metas físicas, mentais, espirituais e sociais. OKR pessoal com impacto no IVI.',                                 'app/(app)/coming-soon.tsx',           ARRAY['goals'], ARRAY['hygeios']),

  -- Relacionamentos
  ('relacionamentos','Relacionamentos', '❤',  'module',      'coming_soon', 'Mapeamento de vínculos significativos. Qualidade, frequência e suporte. Alimenta IVI Social.',                                               'app/(app)/coming-soon.tsx',           ARRAY['relationship_logs'], ARRAY['hygeios']),

  -- Propósito
  ('proposito',     'Propósito',        '🌟', 'module',      'coming_soon', 'Exploração e rastreamento do senso de propósito. Ikigai adaptado. ProteOS guia via maiêutica socrática (AsclepiOS).',                        'app/(app)/coming-soon.tsx',           NULL, ARRAY['asclepios','proteos']),

  -- Criatividade
  ('criatividade',  'Criatividade',     '🎨', 'module',      'coming_soon', 'Espaço de expressão criativa (texto, desenho, música). Registro de projetos e insights criativos. Impacto IVI Mental + Espiritual.',         'app/(app)/coming-soon.tsx',           ARRAY['creative_logs'], ARRAY['hygeios']),

  -- Leitura
  ('leitura',       'Leitura',          '📚', 'module',      'coming_soon', 'Rastreamento de leituras com reflexões. Biblioteca pessoal integrada. Sugestões do ProteOS com base no estado IVI.',                         'app/(app)/coming-soon.tsx',           ARRAY['reading_logs'], ARRAY['proteos']),

  -- Viagens e experiências
  ('experiencias',  'Experiências',     '🗺', 'module',      'coming_soon', 'Registro de experiências significativas (viagens, eventos, encontros). Memória existencial longitudinal no Diário do Ser.',                  'app/(app)/coming-soon.tsx',           NULL, ARRAY['diario']),

  -- Ancestralidade
  ('ancestralidade','Ancestralidade',   '🌳', 'module',      'coming_soon', 'Exploração de padrões familiares e ancestrais. Constelação sistêmica digital. EcumenicOS integrado.',                                        'app/(app)/coming-soon.tsx',           NULL, ARRAY['ecumenicos','proteos']),

  -- Sonhos
  ('sonhos',        'Diário de Sonhos', '🌙', 'module',      'coming_soon', 'Registro e análise de sonhos. Padrões recorrentes detectados pelo SandeirOS. Integrado com Wonder Night e Diário do Ser.',                   'app/(app)/coming-soon.tsx',           ARRAY['dream_logs'], ARRAY['sandeiros','diario']),

  -- Saúde sexual
  ('saude_sexual',  'Saúde Sexual',     '💞', 'module',      'coming_soon', 'Rastreamento de ciclos, libido e bem-estar sexual. Dados 100% privados (E2E). Impacto IVI Físico + Social.',                                 'app/(app)/coming-soon.tsx',           ARRAY['sexual_health_logs'], ARRAY['hygeios']),

  -- Dor e sintomas
  ('sintomas',      'Sintomas e Dor',   '🩹', 'module',      'coming_soon', 'Rastreamento de dores, sintomas e condições. Histórico enviado ao Módulo Médico. AsclepiOS alerta em padrões preocupantes.',                 'app/(app)/coming-soon.tsx',           ARRAY['symptom_logs'], ARRAY['asclepios']),

  -- Redes sociais e tempo de tela
  ('tela',          'Saúde Digital',    '📱', 'module',      'coming_soon', 'Rastreamento de tempo de tela e uso de redes sociais. Impacto no IVI Mental. Intervenções do ProteOS em uso excessivo.',                     'app/(app)/coming-soon.tsx',           ARRAY['screen_logs'], ARRAY['hygeios']),

  -- Ambiente
  ('ambiente',      'Ambiente',         '🏠', 'module',      'coming_soon', 'Qualidade do ambiente físico (luz, ruído, organização). Checkpoints semanais. Impacto IVI Físico + Mental.',                                 'app/(app)/coming-soon.tsx',           ARRAY['environment_logs'], ARRAY['hygeios']),

  -- AlexandriOS (Help Engine)
  ('alexandrios',   'AlexandriOS',      '📖', 'infrastructure','active',    'Motor de ajuda contextual. 42 FAQs críticas em 15 categorias. KB Foundation Qualis AA. Decisão D-13.',                                      'services/alexandrios.ts',             ARRAY['kb_foundation'], NULL)

ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  icon        = EXCLUDED.icon,
  status      = EXCLUDED.status;

-- ============================================================
-- FIM — S24 MÓDULOS METADATA
-- Total após esta migration: 44 módulos registrados
-- ============================================================
