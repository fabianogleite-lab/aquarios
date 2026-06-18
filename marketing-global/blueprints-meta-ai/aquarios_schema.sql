
-- AquariOS - Schema completo para Pipeline + CRM + Omnichannel
-- PostgreSQL / Supabase

-- 1. CLIENTES (fonte da verdade)
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wa_id TEXT UNIQUE, -- WhatsApp
    ig_id TEXT UNIQUE, -- Instagram
    messenger_id TEXT UNIQUE, -- Messenger
    email TEXT,
    nome TEXT,
    pais TEXT NOT NULL DEFAULT 'BR',
    idioma TEXT DEFAULT 'pt-BR',
    fuso TEXT DEFAULT 'America/Sao_Paulo',
    opt_in_status BOOLEAN DEFAULT false,
    opt_in_ts TIMESTAMPTZ,
    dado_saude BOOLEAN DEFAULT false, -- LGPD
    ticket_medio NUMERIC(10,2) DEFAULT 0,
    historico_6_meses INT DEFAULT 0,
    ultima_compra DATE,
    pipeline_stage TEXT DEFAULT 'lead_novo',
    pipeline_score INT DEFAULT 0,
    lifetime_value NUMERIC(12,2) DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clientes_wa ON clientes(wa_id);
CREATE INDEX idx_clientes_pais ON clientes(pais);
CREATE INDEX idx_clientes_stage ON clientes(pipeline_stage);

-- 2. PIPELINE (estágios configuráveis)
CREATE TABLE pipeline_stages (
    stage_key TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    ordem INT NOT NULL,
    probabilidade_fechamento INT, -- 0-100
    sla_horas INT DEFAULT 24,
    acao_automatica TEXT -- ex: 'enviar_template_boas_vindas'
);

INSERT INTO pipeline_stages VALUES
('lead_novo', 'Lead Novo', 1, 10, 1, 'enviar_boas_vindas'),
('qualificado', 'Qualificado', 2, 30, 4, 'agendar_consulta'),
('agendado', 'Agendado', 3, 60, 24, 'enviar_lembrete'),
('atendido', 'Atendido', 4, 80, 48, 'enviar_orcamento'),
('fechado_ganho', 'Fechado Ganho', 5, 100, 0, 'cobrar_pix'),
('fechado_perdido', 'Fechado Perdido', 6, 0, 0, 'nutrir');

-- 3. CONVERSAS OMNICHANNEL
CREATE TABLE conversas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id),
    canal TEXT NOT NULL CHECK (canal IN ('whatsapp','instagram','messenger')),
    canal_id TEXT NOT NULL, -- wa_id, ig_id, etc
    status TEXT DEFAULT 'aberta',
    ultima_mensagem_ts TIMESTAMPTZ DEFAULT now(),
    agente_responsavel TEXT DEFAULT 'ai-first',
    janela_24h_expira TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversas_cliente ON conversas(cliente_id);
CREATE INDEX idx_conversas_canal ON conversas(canal_id);

-- 4. MENSAGENS (tudo que entra e sai)
CREATE TABLE mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversa_id UUID REFERENCES conversas(id),
    direcao TEXT CHECK (direcao IN ('in','out')),
    tipo TEXT, -- text, image, template, interactive
    conteudo JSONB,
    meta_message_id TEXT,
    status_meta TEXT, -- sent, delivered, read, failed
    processado_por TEXT DEFAULT 'ai-first',
    latencia_ms INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mensagens_conversa ON mensagens(conversa_id);
CREATE INDEX idx_mensagens_status ON mensagens(status_meta);

-- 5. CAMPANHAS
CREATE TABLE campanhas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    pais_alvo TEXT[],
    template_meta TEXT,
    criativo_url TEXT, -- Leonardo
    status TEXT DEFAULT 'rascunho',
    orcamento_usd NUMERIC(10,2),
    enviados INT DEFAULT 0,
    entregues INT DEFAULT 0,
    lidos INT DEFAULT 0,
    cliques INT DEFAULT 0,
    ctr NUMERIC(5,2),
    criado_por TEXT DEFAULT 'ai-first',
    aprovado_por TEXT,
    aprovado_ts TIMESTAMPTZ,
    disparado_ts TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. APROVAÇÕES SLACK (HumanLayer)
CREATE TABLE aprovacoes_slack (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    acao TEXT NOT NULL, -- 'disparar_campanha', 'gerar_criativo', 'cobrar_valor_alto'
    payload JSONB NOT NULL,
    custo_estimado_usd NUMERIC(10,2),
    risco_score INT, -- 0-100
    solicitado_por TEXT DEFAULT 'ai-first',
    slack_ts TEXT,
    slack_channel TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','reprovado','expirado')),
    decidido_por TEXT,
    decidido_ts TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_aprovacoes_status ON aprovacoes_slack(status);

-- 7. SINCRONIZAÇÃO META
CREATE TABLE sync_meta_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento TEXT, -- webhook.received, message.sent, etc
    payload JSONB,
    processado BOOLEAN DEFAULT false,
    erro TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
