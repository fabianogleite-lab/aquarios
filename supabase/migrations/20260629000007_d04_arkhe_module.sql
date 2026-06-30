-- D-04: módulo ARKHE — tickets de suporte/dúvida sobre autoria e arquitetura.
-- README e garantia autoral (SHA-256) ficam estáticos no app (Arkhe Labs não é módulo
-- de saúde — não precisa de tabela própria pra isso, só pro fluxo de tickets).
BEGIN;

CREATE TABLE IF NOT EXISTS public.arkhe_tickets (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.arkhe_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "arkhe_tickets_own_read" ON public.arkhe_tickets;
CREATE POLICY "arkhe_tickets_own_read" ON public.arkhe_tickets
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "arkhe_tickets_own_insert" ON public.arkhe_tickets;
CREATE POLICY "arkhe_tickets_own_insert" ON public.arkhe_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

REVOKE ALL ON public.arkhe_tickets FROM anon;
GRANT SELECT, INSERT ON public.arkhe_tickets TO authenticated;
GRANT ALL ON public.arkhe_tickets TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.arkhe_tickets_id_seq TO authenticated;

COMMIT;
