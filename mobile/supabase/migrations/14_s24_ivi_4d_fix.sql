-- ============================================================
-- S24: IVI 4D — Correção crítica da fórmula calculate_ivi
-- Data: 04/06/2026
-- Decisão: iVi = Físico×0.35 + Mental×0.30 + Espiritual×0.20 + Social×0.15
-- Substitui: (Bio×0.40) + (Mental×0.35) + (Spirit×0.25) — fórmula 3D obsoleta
-- Ref: PROXIMO_CHAT.md S24 · AQUARIOS_LIVRO.md (fonte de verdade)
-- ============================================================

-- ============================================================
-- PARTE 1: Adicionar coluna social ao telemetry_vitality_logs
-- ============================================================

ALTER TABLE public.telemetry_vitality_logs
  ADD COLUMN IF NOT EXISTS calculated_social_component NUMERIC(5,2);

-- Atualizar formula_version default para rastrear registros novos vs. antigos
ALTER TABLE public.telemetry_vitality_logs
  ALTER COLUMN formula_version SET DEFAULT 'V2.0604';

-- ============================================================
-- PARTE 2: Substituir função calculate_ivi (3D → 4D)
-- ============================================================

-- Manter versão legada como fallback (não remover para não quebrar histórico)
CREATE OR REPLACE FUNCTION public.calculate_ivi_legacy_3d(
  p_bio    NUMERIC,
  p_mental NUMERIC,
  p_spirit NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
  -- Fórmula original V1.0512 — OBSOLETA — mantida para auditoria histórica
  RETURN ROUND(
    (COALESCE(p_bio, 0)    * 0.40) +
    (COALESCE(p_mental, 0) * 0.35) +
    (COALESCE(p_spirit, 0) * 0.25),
    2
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Nova função 4D — substitui calculate_ivi
CREATE OR REPLACE FUNCTION public.calculate_ivi(
  p_fisico      NUMERIC,
  p_mental      NUMERIC,
  p_espiritual  NUMERIC,
  p_social      NUMERIC DEFAULT 0
) RETURNS NUMERIC AS $$
BEGIN
  -- IVI 4D aprovado — V2.0604
  -- Físico×0.35 + Mental×0.30 + Espiritual×0.20 + Social×0.15
  RETURN ROUND(
    (COALESCE(p_fisico,     0) * 0.35) +
    (COALESCE(p_mental,     0) * 0.30) +
    (COALESCE(p_espiritual, 0) * 0.20) +
    (COALESCE(p_social,     0) * 0.15),
    2
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Atualizar comentário do campo ivi_total
COMMENT ON COLUMN public.telemetry_vitality_logs.ivi_total IS
  'IVI_Total = (Físico×0.35) + (Mental×0.30) + (Espiritual×0.20) + (Social×0.15). V2.0604. Item 9 IP Registry. AQUARIOS_LIVRO.md fonte de verdade.';

-- ============================================================
-- PARTE 3: Atualizar banda IVI (faixas permanecem iguais)
-- ============================================================

-- Verificar: faixas 0-20 CRÍTICO / 21-40 ALERTA / 41-60 ATENÇÃO / 61-80 BOM / 81-100 EXCELENTE
-- Sem alteração nas bandas — apenas confirmação que são válidas para 4D

-- ============================================================
-- PARTE 4: Registrar decisão no aquarios_decisions
-- ============================================================

INSERT INTO public.aquarios_decisions (
  divergence_code, chosen_option, option_title, rationale,
  decisor_role, decisor_kind, effort_estimated, implementation_phase
) VALUES (
  'D-38',
  'A',
  'IVI 4D — Físico×0.35 + Mental×0.30 + Espiritual×0.20 + Social×0.15',
  'Fórmula 3D (V1.0512) obsoleta. Aprovada 4D em S24. Dimensão Social adicionada. AQUARIOS_LIVRO.md é fonte de verdade. calculate_ivi_legacy_3d mantida para auditoria histórica.',
  'fabiano_leite',
  'business',
  'S',
  '1'
) ON CONFLICT DO NOTHING;

-- ============================================================
-- PARTE 5: Atualizar registros históricos de formula_version
-- (marca todos os existentes como legado para auditoria)
-- ============================================================

UPDATE public.telemetry_vitality_logs
   SET formula_version = 'V1.0512_LEGACY'
 WHERE formula_version = 'V1.0512'
    OR formula_version IS NULL;

-- ============================================================
-- FIM — S24 IVI 4D FIX
-- Executar no Supabase SQL Editor após PR #4 mergeado
-- ============================================================
