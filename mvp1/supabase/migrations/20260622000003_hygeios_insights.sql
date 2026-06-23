-- H1 — Insights detectados (padrões recorrentes)
CREATE TABLE IF NOT EXISTS public.hygeios_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL DEFAULT 'PADRAO_RECORRENTE',
    dimensao TEXT,  -- fisico|mental|espiritual|social
    status TEXT DEFAULT 'AGUARDANDO_CARIMBO',  -- AGUARDANDO_CARIMBO|APROVADO|REJEITADO
    dados JSONB,  -- { tipo, dias_janela, ocorrencias, ... }
    resposta_cache_id UUID,  -- link pro SandeirOS (F1 cache)
    carimbo_cerberios JSONB,  -- verificação CerberOS { timestamp, admin_id, ... }
    ts TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hygeios_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS insights_proprio_user ON public.hygeios_insights;
CREATE POLICY insights_proprio_user ON public.hygeios_insights FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');
