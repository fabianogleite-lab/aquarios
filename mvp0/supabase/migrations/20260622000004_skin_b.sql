-- Skin B — confirmações 1-toque (Tool Bus)
CREATE TABLE IF NOT EXISTS public.skin_b_confirmacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool TEXT NOT NULL,  -- email|whatsapp|calendar
    payload JSONB,
    status TEXT DEFAULT 'AGUARDANDO_CONFIRMACAO',  -- AGUARDANDO_CONFIRMACAO|CONFIRMADO|REJEITADO
    ts TIMESTAMPTZ DEFAULT NOW()
);

-- Shopify F1 — ordens/pagamentos
CREATE TABLE IF NOT EXISTS public.skin_b_shopify_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shopify_order_id TEXT UNIQUE,
    produto TEXT,
    valor_centavos INT,
    status TEXT DEFAULT 'PENDENTE',  -- PENDENTE|PAGO|CANCELADO
    ts TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.skin_b_confirmacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS confirmacoes_proprio_user ON public.skin_b_confirmacoes;
CREATE POLICY confirmacoes_proprio_user ON public.skin_b_confirmacoes FOR SELECT
  USING (auth.uid() = user_id);

ALTER TABLE public.skin_b_shopify_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS shopify_proprio_user ON public.skin_b_shopify_orders;
CREATE POLICY shopify_proprio_user ON public.skin_b_shopify_orders FOR SELECT
  USING (auth.uid() = user_id);
