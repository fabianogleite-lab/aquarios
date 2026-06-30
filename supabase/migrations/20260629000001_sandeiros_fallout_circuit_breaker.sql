-- SandeirOS F3 — Camada Fallout + Circuit Breaker (unificação: aprimorar_cache = cache.set() existente).
-- Não cria segunda definição de cache_semantico — reusa a tabela já em produção.

-- ============================================================
-- fallout_log: avisos humanizados sobre eventos do motor (4 tons)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fallout_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  evento      TEXT NOT NULL,           -- ex: 'claude_indisponivel', 'sandeiros_indisponivel', 'gpu_offline'
  tom         TEXT NOT NULL DEFAULT 'neutro' CHECK (tom IN ('neutro','amigavel','tecnico','urgente')),
  mensagem    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fallout_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_fallout_read" ON public.fallout_log
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "service_role_write_fallout" ON public.fallout_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- View de transparência (últimos 7 dias) — §8.3 console
CREATE OR REPLACE VIEW public.user_fallout_dashboard AS
  SELECT id, user_id, evento, tom, mensagem, created_at
  FROM public.fallout_log
  WHERE created_at > now() - INTERVAL '7 days'
  ORDER BY created_at DESC;

-- ============================================================
-- circuit_breaker_state: estado EXTERNO pro Breaker B (edge function, sem
-- memória entre invocações). Breaker A (Oracle, processo persistente) usa
-- pybreaker em memória — não precisa desta tabela, só escreve no fallout_log.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.circuit_breaker_state (
  servico         TEXT PRIMARY KEY,        -- ex: 'sandeiros_oracle'
  estado          TEXT NOT NULL DEFAULT 'CLOSED' CHECK (estado IN ('CLOSED','OPEN','HALF_OPEN')),
  falhas_recentes INT NOT NULL DEFAULT 0,
  aberto_desde    TIMESTAMPTZ,
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.circuit_breaker_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only_breaker" ON public.circuit_breaker_state
  FOR ALL USING (auth.role() = 'service_role');

INSERT INTO public.circuit_breaker_state (servico, estado)
VALUES ('sandeiros_oracle', 'CLOSED')
ON CONFLICT (servico) DO NOTHING;

-- ============================================================
-- registrar_fallout: função única chamada pelos 2 breakers (A e B)
-- ============================================================
CREATE OR REPLACE FUNCTION public.registrar_fallout(
  p_user_id   UUID,
  p_evento    TEXT,
  p_tom       TEXT DEFAULT 'neutro',
  p_mensagem  TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.fallout_log (user_id, evento, tom, mensagem)
  VALUES (p_user_id, p_evento, p_tom, p_mensagem)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nota de unificação (sem nova função): aprimorar_cache() do §12 É o método
-- SemanticCache.set() já implementado em backend/sandeiros/semantic_cache.py —
-- mesma regra (só sobrescreve se qualidade_score nova > atual). Não duplicar.

-- Bob (sandeiros_subagents) ganha a tarefa que faltava:
UPDATE public.sandeiros_subagents
SET tasks = tasks || '["Fallout: registrar eventos do motor via registrar_fallout() quando os Circuit Breakers A/B abrirem"]'::jsonb
WHERE slug = 'bob';
