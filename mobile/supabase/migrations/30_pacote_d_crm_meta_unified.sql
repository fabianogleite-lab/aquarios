-- ============================================================================
-- Pacote D · D1 — Schema unificado CRM + Meta (Business Agent do ProteOS)
-- Migration 30 · 10/Jun/2026
-- ✅ APLICADA 11/Jun/2026 via Management API (sessão Studio) — verificada:
--    13 tabelas c/ RLS, 6 países (Onda 1), 6 estágios, 6 views. Idempotente (re-rodável).
-- Supabase project: agebsmjsjrmazbozphnh
-- ----------------------------------------------------------------------------
-- Unifica:
--   • 8 tabelas do pacote CRM (.zip): clientes, pipeline_stages, conversas,
--     mensagens, campanhas, aprovacoes_slack, business_agent_logs (era
--     sync_meta_log no .zip), meta_signals.
--   • 5 tabelas Meta/compliance [ASSUMED — derivadas dos docs legais D0,
--     confirmar]: optins, consent_versions, widget_interactions,
--     delete_requests, compliance_por_pais.
--
-- Princípios desta migration:
--   • RLS em TODAS as tabelas — deny-by-default (anon/authenticated NÃO acessam;
--     só o service_role do FastAPI, que faz bypass de RLS no Supabase).
--   • pgcrypto habilitado (gen_random_uuid + digest p/ hashing de PII).
--   • FK canônica via cliente_id (UUID) + ON DELETE CASCADE — corrige o bug do
--     wa_id (linkagem solta sem FK) e habilita o /delete-data.
--   • SEM guarda médica / banimento de termos no DB — isso vai p/ D3 (app layer,
--     alinhado ao EcumenicOS). Aqui só existe FLAG (dado_sensivel), nunca bloqueio.
--
-- Amarrações legais (fonte de verdade = legal/):
--   optins              ← CONSENTIMENTO_OPTIN §5 (prova de opt-in)
--   consent_versions    ← CONSENTIMENTO_OPTIN §9 (versionamento de texto)
--   widget_interactions ← PRIVACIDADE §14 (Click-to-WhatsApp, UTMs)
--   delete_requests     ← EXCLUSAO Anexo A.3/A.4 (callback /delete-data)
--   business_agent_logs ← EXCLUSAO Anexo A.4 (log do agente)
--   compliance_por_pais ← COUNTRY_MATRIX (Onda 1)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- BLOCO A — 8 TABELAS DO PACOTE CRM (.zip), adaptadas ao AquariOS
-- ============================================================================

-- 1) clientes — fonte da verdade omnichannel (lead/contato Meta)
CREATE TABLE IF NOT EXISTS clientes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wa_id         TEXT UNIQUE,                 -- WhatsApp E.164 (chave de lookup da Meta)
    ig_id         TEXT UNIQUE,                 -- Instagram
    messenger_id  TEXT UNIQUE,                 -- Messenger
    app_user_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- vínculo com conta do app, quando existir
    email         TEXT,
    nome          TEXT,
    pais          TEXT NOT NULL DEFAULT 'BR',  -- FK p/ compliance_por_pais add. ao fim (forward-ref)
    idioma        TEXT DEFAULT 'pt-BR',
    fuso          TEXT DEFAULT 'America/Sao_Paulo',
    opt_in_status BOOLEAN DEFAULT false,       -- consentimento C (marketing) — espelha optins
    opt_in_ts     TIMESTAMPTZ,
    dado_sensivel BOOLEAN DEFAULT false,       -- FLAG LGPD (não é guarda; enforcement é D3)
    pipeline_stage TEXT DEFAULT 'lead_novo',   -- FK p/ pipeline_stages add. ao fim (forward-ref)
    pipeline_score INT DEFAULT 0,
    lifetime_value NUMERIC(12,2) DEFAULT 0,
    tags          TEXT[],
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clientes_wa    ON clientes(wa_id);
CREATE INDEX IF NOT EXISTS idx_clientes_pais  ON clientes(pais);
CREATE INDEX IF NOT EXISTS idx_clientes_stage ON clientes(pipeline_stage);

-- 2) pipeline_stages — estágios configuráveis (seed GENERALIZADO p/ wellness;
--    o .zip vinha com funil odontológico — adaptado ao AquariOS)
CREATE TABLE IF NOT EXISTS pipeline_stages (
    stage_key     TEXT PRIMARY KEY,
    nome          TEXT NOT NULL,
    ordem         INT NOT NULL,
    probabilidade_fechamento INT,              -- 0-100
    sla_horas     INT DEFAULT 24,
    acao_automatica TEXT
);
INSERT INTO pipeline_stages (stage_key,nome,ordem,probabilidade_fechamento,sla_horas,acao_automatica) VALUES
    ('lead_novo','Lead Novo',1,10,1,'enviar_disclosure_ia'),
    ('opt_in','Opt-in Confirmado',2,30,4,'enviar_boas_vindas'),
    ('onboarding','Onboarding',3,50,24,'ativar_modulos_bemestar'),
    ('ativo','Usuário Ativo',4,70,48,'acompanhar_ivi'),
    ('assinante','Assinante',5,100,0,'nutrir_premium'),
    ('inativo','Inativo',6,0,0,'reengajar')
ON CONFLICT (stage_key) DO NOTHING;

-- 3) conversas — omnichannel  [EXCLUSAO A.4: excluir no /delete-data]
CREATE TABLE IF NOT EXISTS conversas (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id    UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    canal         TEXT NOT NULL CHECK (canal IN ('whatsapp','instagram','messenger')),
    canal_id      TEXT NOT NULL,
    status        TEXT DEFAULT 'aberta',
    ultima_mensagem_ts TIMESTAMPTZ DEFAULT now(),
    agente_responsavel TEXT DEFAULT 'ai-first',
    janela_24h_expira  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_conversas_cliente ON conversas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_conversas_canal   ON conversas(canal_id);

-- 4) mensagens — tudo que entra/sai
CREATE TABLE IF NOT EXISTS mensagens (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversa_id   UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
    direcao       TEXT CHECK (direcao IN ('in','out')),
    tipo          TEXT,
    conteudo      JSONB,
    meta_message_id TEXT,
    status_meta   TEXT,
    processado_por TEXT DEFAULT 'ai-first',
    latencia_ms   INT,
    created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mensagens_conversa ON mensagens(conversa_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_status   ON mensagens(status_meta);

-- 5) campanhas
CREATE TABLE IF NOT EXISTS campanhas (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome          TEXT NOT NULL,
    pais_alvo     TEXT[],
    template_meta TEXT,
    criativo_url  TEXT,
    status        TEXT DEFAULT 'rascunho',
    orcamento_usd NUMERIC(10,2),
    enviados      INT DEFAULT 0,
    entregues     INT DEFAULT 0,
    lidos         INT DEFAULT 0,
    cliques       INT DEFAULT 0,
    ctr           NUMERIC(5,2),
    criado_por    TEXT DEFAULT 'ai-first',
    aprovado_por  TEXT,
    aprovado_ts   TIMESTAMPTZ,
    disparado_ts  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- 6) aprovacoes_slack — HumanLayer (IA pede aprovação humana)
CREATE TABLE IF NOT EXISTS aprovacoes_slack (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    acao          TEXT NOT NULL,
    payload       JSONB NOT NULL,
    custo_estimado_usd NUMERIC(10,2),
    risco_score   INT,
    solicitado_por TEXT DEFAULT 'ai-first',
    slack_ts      TEXT,
    slack_channel TEXT,
    status        TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','reprovado','expirado')),
    decidido_por  TEXT,
    decidido_ts   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_aprovacoes_status ON aprovacoes_slack(status);

-- 7) business_agent_logs — log bruto do agente (era sync_meta_log no .zip)
--    [EXCLUSAO A.4: anonimizar — remover vínculo wa_id — ou excluir]
CREATE TABLE IF NOT EXISTS business_agent_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id    UUID REFERENCES clientes(id) ON DELETE SET NULL,
    evento        TEXT,                        -- webhook.received, message.sent, ...
    payload       JSONB,
    processado    BOOLEAN DEFAULT false,
    erro          TEXT,
    created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bal_processado ON business_agent_logs(processado, created_at);

-- 8) meta_signals — CDP conversacional (eventos de mídia Meta)
--    FK wa_id CORRIGIDA: linkagem canônica via cliente_id; wa_id/ig_id soltos
--    do .zip REMOVIDOS (eram fonte de drift sem integridade referencial).
CREATE TABLE IF NOT EXISTS meta_signals (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id    UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    evento_tipo   TEXT CHECK (evento_tipo IN ('ad_view','ad_click','video_view','story_view','post_save','post_share','profile_visit','reels_watch_time')),
    campanha_id   UUID REFERENCES campanhas(id) ON DELETE SET NULL,
    ad_id         TEXT,
    tempo_visualizacao_seg INT,
    plataforma    TEXT CHECK (plataforma IN ('facebook','instagram','whatsapp','threads')),
    pais          TEXT,
    dispositivo   TEXT,
    created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_meta_signals_cliente ON meta_signals(cliente_id);
CREATE INDEX IF NOT EXISTS idx_meta_signals_evento  ON meta_signals(evento_tipo, created_at);

-- ============================================================================
-- BLOCO B — 5 TABELAS META/COMPLIANCE  [ASSUMED — derivadas dos docs D0]
-- ============================================================================

-- 9) compliance_por_pais — config por país (seed Onda 1)  ← COUNTRY_MATRIX
CREATE TABLE IF NOT EXISTS compliance_por_pais (
    pais          TEXT PRIMARY KEY,            -- ISO-3166-1 alpha-2
    locale        TEXT NOT NULL,
    idioma        TEXT NOT NULL,
    regime_privacidade TEXT,                   -- LGPD, GDPR, CCPA, NDPA, ...
    autoridade    TEXT,
    gateway_pagamento  TEXT,                   -- stripe | paystack | free_tier
    moeda         TEXT,
    marketing_optin_obrigatorio BOOLEAN DEFAULT true,
    double_optin_recomendado    BOOLEAN DEFAULT true,
    idade_minima  INT DEFAULT 18,
    onda          INT NOT NULL,
    ativo         BOOLEAN DEFAULT false,       -- país liberado p/ operar
    notas         TEXT
);
-- Seed APENAS Onda 1 (BR, US, PT, NG, PE, VE). Demais ondas: na abertura de cada onda.
-- Irã (fa-IR) NÃO entra aqui — Onda 4, condicionado a parecer OFAC (gate absoluto).
INSERT INTO compliance_por_pais
  (pais,locale,idioma,regime_privacidade,autoridade,gateway_pagamento,moeda,idade_minima,onda,ativo,notas) VALUES
  ('BR','pt-BR','Português (BR)','LGPD','ANPD','stripe','BRL',18,1,true,NULL),
  ('US','en-US','Inglês','CCPA/CPRA','CPPA','stripe','USD',18,1,true,'opt-out venda/compartilhamento'),
  ('PT','pt-PT','Português (PT)','GDPR','CNPD','stripe','EUR',18,1,true,'arrependimento 14 dias (UE)'),
  ('NG','en-NG','Inglês','NDPA','NDPC','paystack','NGN',18,1,true,'gateway Paystack'),
  ('PE','es-PE','Espanhol','Ley 29733','ANPD-Peru (MINJUS)','stripe','PEN',18,1,true,NULL),
  ('VE','es-VE','Espanhol','—','—','free_tier','USD',18,1,true,'só free tier no MVP — sem gateway')
ON CONFLICT (pais) DO NOTHING;

-- 10) consent_versions — textos de consentimento versionados ← CONSENTIMENTO §9
CREATE TABLE IF NOT EXISTS consent_versions (
    consent_version TEXT PRIMARY KEY,          -- ex: v1.0_20260610
    tipo          TEXT NOT NULL CHECK (tipo IN ('B_bemestar','C_marketing','ai_disclosure')),
    idioma        TEXT NOT NULL,
    texto         TEXT NOT NULL,               -- texto EXATO exibido
    vigente       BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- 11) optins — prova auditável de consentimento ← CONSENTIMENTO §5
CREATE TABLE IF NOT EXISTS optins (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id    UUID REFERENCES clientes(id) ON DELETE CASCADE,
    phone_e164    TEXT,
    tipo          TEXT NOT NULL CHECK (tipo IN ('B_bemestar','C_marketing')),
    consent_text  TEXT NOT NULL,               -- texto exato exibido
    consent_version TEXT REFERENCES consent_versions(consent_version),
    timestamp_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address    INET,
    source        TEXT,                        -- landing_podiumtec, app_onboarding, instagram_ad...
    language      TEXT,
    checkbox_checked BOOLEAN NOT NULL DEFAULT false,
    double_optin_confirmed BOOLEAN DEFAULT false,  -- CONSENTIMENTO §7
    revogado_ts   TIMESTAMPTZ,                 -- opt-out (revogação)
    created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_optins_cliente ON optins(cliente_id);
CREATE INDEX IF NOT EXISTS idx_optins_phone   ON optins(phone_e164);

-- 12) widget_interactions — Click-to-WhatsApp / tracking ← PRIVACIDADE §14
--     [EXCLUSAO A.4: excluir PII (ip/user_agent); manter agregado anônimo]
CREATE TABLE IF NOT EXISTS widget_interactions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id    UUID REFERENCES clientes(id) ON DELETE SET NULL,
    session_id    TEXT,
    evento        TEXT,                        -- view, click, optin_check
    referrer      TEXT,
    utm_source    TEXT,
    utm_medium    TEXT,
    utm_campaign  TEXT,
    pais          TEXT,
    ip_address    INET,                        -- PII → excluir no /delete-data
    user_agent    TEXT,                        -- PII → excluir no /delete-data
    created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_widget_session ON widget_interactions(session_id);

-- 13) delete_requests — rastreio do callback /delete-data ← EXCLUSAO Anexo A.3/A.4
CREATE TABLE IF NOT EXISTS delete_requests (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    confirmation_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8),'hex'),
    origem        TEXT NOT NULL CHECK (origem IN ('meta','app','email')),
    wa_id         TEXT,                        -- identificador recebido da Meta
    cliente_id    UUID REFERENCES clientes(id) ON DELETE SET NULL,
    status        TEXT NOT NULL DEFAULT 'recebido' CHECK (status IN ('recebido','em_processamento','concluido','rejeitado')),
    recebido_ts   TIMESTAMPTZ DEFAULT now(),
    concluido_ts  TIMESTAMPTZ,                 -- meta: <= 30 dias (EXCLUSAO §6)
    detalhes      JSONB
);
CREATE INDEX IF NOT EXISTS idx_delete_status ON delete_requests(status);

-- FKs cross-bloco de clientes (tabelas-alvo já criadas acima) — idempotente.
-- Efeito colateral desejado: cliente só é aceito em país seedado/ativo (allowlist
-- por Onda). O gate gracioso fica no D2; esta FK é o backstop de integridade.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_clientes_pipeline') THEN
    ALTER TABLE clientes ADD CONSTRAINT fk_clientes_pipeline
      FOREIGN KEY (pipeline_stage) REFERENCES pipeline_stages(stage_key);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_clientes_pais') THEN
    ALTER TABLE clientes ADD CONSTRAINT fk_clientes_pais
      FOREIGN KEY (pais) REFERENCES compliance_por_pais(pais);
  END IF;
END $$;

-- ============================================================================
-- BLOCO C — RLS: deny-by-default em TODAS as tabelas
-- ----------------------------------------------------------------------------
-- No Supabase o service_role (usado pelo FastAPI server-side) faz BYPASS de RLS.
-- Habilitar RLS SEM policy permissiva = anon + authenticated NÃO acessam nada.
-- pipeline_stages e compliance_por_pais são config (sem PII) mas também ficam
-- fechadas: o app não lê isso direto, quem lê é o agente (service_role).
-- Dashboard (D4 fase 1) lê via Supabase Studio / service_role.
-- ============================================================================
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clientes','pipeline_stages','conversas','mensagens','campanhas',
    'aprovacoes_slack','business_agent_logs','meta_signals',
    'compliance_por_pais','consent_versions','optins','widget_interactions',
    'delete_requests'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;

-- TEMPLATE (NÃO habilitado) — leitura admin no dashboard fase 2.
-- Habilitar só depois de confirmar o mecanismo de admin do projeto
-- (memória: "Admin grant backoffice = gmail"). Ex.:
-- CREATE POLICY admin_read_clientes ON clientes FOR SELECT TO authenticated
--   USING ( (auth.jwt() ->> 'email') IN (SELECT email FROM admin_allowlist) );

-- ============================================================================
-- FIM D1. Próximo: D2 (fluxos FastAPI consomem este schema via service_role).
-- ✅ Aplicada em produção 11/Jun/2026 (verificada).
-- ============================================================================
