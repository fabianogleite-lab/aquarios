-- C4 — métrica de sucesso do SandeirOS: % de respostas vindas de cache vs. Claude.
-- Aproximação com o schema existente: cada `hits` em cache_semantico = 1 chamada
-- ao Claude evitada. `count(*)` = 1 chamada original que POPULOU o cache (custou).

CREATE OR REPLACE VIEW public.sandeiros_metricas AS
SELECT
  count(*)                                   AS prompts_distintos_em_cache,
  coalesce(sum(hits), 0)                     AS respostas_servidas_do_cache,
  count(*) FILTER (WHERE fonte_original = 'CLAUDE') AS originadas_de_claude,
  count(*) FILTER (WHERE fonte_original = 'LLAMA')  AS originadas_de_llama,
  round(
    coalesce(sum(hits), 0)::numeric
    / GREATEST(coalesce(sum(hits), 0) + count(*), 1) * 100,
    1
  ) AS taxa_economia_pct  -- % de chamadas totais que NÃO precisaram chamar o Claude
FROM public.cache_semantico;

COMMENT ON VIEW public.sandeiros_metricas IS
  'C4: visibilidade da economia real do SandeirOS. taxa_economia_pct sobe conforme o cache amadurece (mais hits, mesmas entradas).';
