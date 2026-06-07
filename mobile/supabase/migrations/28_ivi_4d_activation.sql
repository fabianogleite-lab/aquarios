-- ============================================================
-- Trilha 4 (S24/S25): Ativação real do IVI 4D — calculate_ivi
-- Data: 07/06/2026
-- ============================================================
-- Contexto: a migration 14 (14_s24_ivi_4d_fix.sql) já continha o
-- código 4D correto, mas seu rodapé condicionava a execução a
-- "após PR #4 mergeada". PR #4 foi FECHADA sem merge em 07/06
-- (achado: 31/32 arquivos do changeset já existiam em main por
-- outro caminho) — a condição de gate nunca se cumpriria.
--
-- Probe em prod (07/06, RPC via anon key) confirmou que a 14
-- nunca rodou de fato: calculate_ivi(p_bio,p_mental,p_spirit)
-- ainda responde com a fórmula 3D (V1.0512), a assinatura 4D
-- não existe, e a coluna calculated_social_component não existe
-- — apesar do histórico do CLI marcar a 14 como "applied" (bulk
-- repair de 04..16 assumiu objetos pré-existentes que, neste
-- caso, não existiam). Esta migration replica o conteúdo
-- idempotente da 14 sob um número novo, sem reescrever histórico.
--
-- Decisão: iVi = Físico×0.35 + Mental×0.30 + Espiritual×0.20 + Social×0.15
-- Ref: AQUARIOS_LIVRO.md (fonte de verdade) · D-38 · Conflito 1 (S24)
-- ============================================================

-- ============================================================
-- PARTE 1: coluna social em telemetry_vitality_logs
-- ============================================================

ALTER TABLE public.telemetry_vitality_logs
  ADD COLUMN IF NOT EXISTS calculated_social_component NUMERIC(5,2);

ALTER TABLE public.telemetry_vitality_logs
  ALTER COLUMN formula_version SET DEFAULT 'V2.0604';

-- ============================================================
-- PARTE 2: legado 3D preservado para auditoria histórica
-- ============================================================

CREATE OR REPLACE FUNCTION public.calculate_ivi_legacy_3d(
  p_bio    NUMERIC,
  p_mental NUMERIC,
  p_spirit NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND(
    (COALESCE(p_bio, 0)    * 0.40) +
    (COALESCE(p_mental, 0) * 0.35) +
    (COALESCE(p_spirit, 0) * 0.25),
    2
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- PARTE 3: nova função 4D — substitui calculate_ivi (3D → 4D)
-- ============================================================

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

COMMENT ON COLUMN public.telemetry_vitality_logs.ivi_total IS
  'IVI_Total = (Físico×0.35) + (Mental×0.30) + (Espiritual×0.20) + (Social×0.15). V2.0604. Item 9 IP Registry. AQUARIOS_LIVRO.md fonte de verdade.';

-- ============================================================
-- PARTE 4a: registrar a divergência D-38 em aquarios_divergencias
-- (a 14 referenciava D-38 em aquarios_decisions sem nunca criar a
-- linha correspondente aqui — FK divergence_code teria rejeitado
-- o INSERT se a 14 alguma vez tivesse rodado; bug latente, nunca
-- exposto. Fechando a cadeia D-37 → D-38 corretamente agora.)
-- ============================================================

INSERT INTO public.aquarios_divergencias (
  divergence_code, module_target, devpack_ref, manual_ref, severity, priority,
  title, devpack_says, manual_says, code_reality, divergence_type, status
) VALUES (
  'D-38', 'IVI fórmula', NULL, '§04', 'medium', 'P2',
  'IVI 3D obsoleta — aprovada 4D com dimensão Social',
  NULL,
  '(Bio×0.40)+(Mental×0.35)+(Spirit×0.25) — V1.0512 §04',
  'calculate_ivi() implementado em 3D (migration 12), sem suporte a Social',
  'Migrar function calculate_ivi 3D→4D + preservar legado como calculate_ivi_legacy_3d',
  'decided'
) ON CONFLICT (divergence_code) DO NOTHING;

-- ============================================================
-- PARTE 4b: registrar a decisão D-38 em aquarios_decisions
-- ============================================================

INSERT INTO public.aquarios_decisions (
  divergence_code, chosen_option, option_title, rationale,
  decisor_role, decisor_kind, effort_estimated, implementation_phase
) VALUES (
  'D-38',
  'A',
  'IVI 4D — Físico×0.35 + Mental×0.30 + Espiritual×0.20 + Social×0.15',
  'Fórmula 3D (V1.0512) obsoleta. Aprovada 4D em S24. Dimensão Social adicionada. AQUARIOS_LIVRO.md é fonte de verdade. calculate_ivi_legacy_3d mantida para auditoria histórica. (Ativação real em S24/S25 — migration 14 nunca chegou a rodar; ver cabeçalho desta migration.)',
  'fabiano_leite',
  'business',
  'S',
  '1'
) ON CONFLICT DO NOTHING;

-- ============================================================
-- PARTE 5: marcar registros históricos como legado (auditoria)
-- ============================================================

UPDATE public.telemetry_vitality_logs
   SET formula_version = 'V1.0512_LEGACY'
 WHERE formula_version = 'V1.0512'
    OR formula_version IS NULL;

-- ============================================================
-- FIM — Trilha 4: IVI 4D ativado de fato em prod
-- ============================================================
