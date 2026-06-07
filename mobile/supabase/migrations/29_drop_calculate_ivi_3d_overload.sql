-- ============================================================
-- Trilha 4 (S24/S25): remove o overload 3D de calculate_ivi
-- Data: 07/06/2026
-- ============================================================
-- A migration 28 criou calculate_ivi(p_fisico, p_mental,
-- p_espiritual, p_social) — mas como Postgres distingue funções
-- por assinatura de parâmetros, isso NÃO substituiu a antiga
-- calculate_ivi(p_bio, p_mental, p_spirit): criou um overload.
-- Resultado: "calculate_ivi" passou a responder por DUAS fórmulas
-- diferentes (3D e 4D) dependendo dos nomes de parâmetro usados —
-- exatamente o que a migration 14 dizia eliminar ("Substitui:
-- fórmula 3D obsoleta"), mas seu CREATE OR REPLACE nunca teria
-- conseguido (mesmo problema, só nunca chegou a rodar pra expor).
--
-- Zero callers confirmados (grep em todo mobile/ por "calculate_ivi"
-- fora de migrations — nenhum). A fórmula 3D já está preservada
-- permanentemente em calculate_ivi_legacy_3d (criada na 28). Logo,
-- dropar o overload de 3 parâmetros completa a substituição com
-- segurança total.
-- ============================================================

DROP FUNCTION IF EXISTS public.calculate_ivi(NUMERIC, NUMERIC, NUMERIC);

-- ============================================================
-- FIM — agora "calculate_ivi" tem uma única assinatura (4D),
-- e a 3D vive só em calculate_ivi_legacy_3d para auditoria.
-- ============================================================
