-- Admin Settings — configurações dinâmicas do HygeiOS-agente
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave TEXT UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT DEFAULT 'string',  -- string|int|bool
    ts TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.admin_settings (chave, valor, descricao, tipo) VALUES
('hygeios_recorrencia_dias', '7', 'Janela de dias pra contar recorrência', 'int'),
('hygeios_recorrencia_vezes', '3', 'Quantas vezes em X dias = insight', 'int'),
('hygeios_carimbo_automat', 'false', 'CerberOS valida automaticamente? (true=sim|false=pedir usuário)', 'bool')
ON CONFLICT (chave) DO NOTHING;

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_settings_leitura ON public.admin_settings;
CREATE POLICY admin_settings_leitura ON public.admin_settings FOR SELECT USING (true);  -- app lê
