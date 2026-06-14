
-- Tabela 8: META SIGNALS (CDP conversacional)
CREATE TABLE meta_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id),
    wa_id TEXT,
    ig_id TEXT,
    evento_tipo TEXT CHECK (evento_tipo IN ('ad_view','ad_click','video_view','story_view','post_save','post_share','profile_visit','reels_watch_time')),
    campanha_id TEXT,
    ad_id TEXT,
    tempo_visualizacao_seg INT,
    plataforma TEXT CHECK (plataforma IN ('facebook','instagram','whatsapp','threads')),
    pais TEXT,
    dispositivo TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_meta_signals_cliente ON meta_signals(cliente_id);
CREATE INDEX idx_meta_signals_evento ON meta_signals(evento_tipo, created_at);
