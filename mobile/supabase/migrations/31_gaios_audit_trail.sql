-- ============================================================================
-- 31_gaios_audit_trail.sql · GaiOS — Trilha de Auditoria Imutável (WORM)
-- ============================================================================
-- GaiOS = módulo de SISTEMA/GOVERNANÇA (decisão do fundador, 12/Jun/2026):
-- nasceu da divisão do CerberOS em DEFESA (borda, milissegundos) × SISTEMA
-- (retenção, anos). Handoff Fronteira F1→F2:
--   CerberOS GERA a evidência (carimbo §2) → GaiOS GUARDA e presta contas (§3)
--   → EteriOS transporta (§4). ProteOS = único contato com usuário.
--
-- Esta migration implementa o §3 do handoff:
--   • audit trail imutável com hash encadeado (blockchain-lite / WORM)
--   • dado carimbado persistido de forma centralizada
--   • retenção legal (fiscal/LGPD) + exportação read-only p/ fisco/ANPD
--   • acesso privilegiado SEMPRE com log imutável (revoga qualquer instrução
--     anterior de "acesso sem logs visíveis")
--
-- Multi-origem (decisão 12/Jun): 'meta' implementado agora; 'paytime' e
-- 'rapidoc' são integrações futuras já decididas; 'sistema' = eventos internos
-- (ex.: acesso privilegiado, mudanças de config, purgas formais).
--
-- ⚠️ STATUS: REDIGIDA, NÃO APLICADA. Entrega C da trilha de fronteira —
--    aplicar somente com aprovação explícita do fundador (prioridade a
--    decidir; B/D seguem gated no deploy D2/D3 com credenciais Meta).
--
-- DECISÃO 12/Jun: o trail mora AQUI (Supabase). O disco P6 de dados da VM
-- Azure (infra/azure/) é buffer de indisponibilidade + artefatos, não banco.
-- Numeração: faixa 31–39 reservada à Fronteira (ver migrations/README.md).
--
-- Padrões seguidos: migration 30 (RLS ENABLE+FORCE sem policy = anon e
-- authenticated ZERO acesso; quem opera é o backend via service_role).
-- ============================================================================

-- pgcrypto para digest sha256 (migration 24 já trata; garantia idempotente)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Origens válidas — gate multi-origem da fronteira
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gaios_origem') THEN
    CREATE TYPE public.gaios_origem AS ENUM ('meta', 'paytime', 'rapidoc', 'sistema');
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. Tabela WORM com hash encadeado
--    Campos do carimbo CerberOS (§2): 6 grátis (origem, timestamp, ip, login,
--    assinatura, hash) + 2 caros (fact_check, risco). O gate de
--    rastreabilidade roda ANTES (CerberOS, entrega B): aqui só chega registro
--    com procedência completa.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gaios_audit_trail (
  seq               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  origem            public.gaios_origem NOT NULL,
  evento            TEXT        NOT NULL,  -- ex.: 'webhook_recebido', 'acesso_privilegiado', 'exportacao_fiscal'
  -- carimbo CerberOS
  ts_evento         TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_origem         INET,
  login_origem      TEXT,                  -- identidade verificada do remetente
  assinatura_valida BOOLEAN,               -- HMAC X-Hub-Signature-256 validado
  fact_check        JSONB,                 -- resultado Google Fact Check Tools (se havia link)
  risco             NUMERIC(5,2),          -- score CerberOS (0–100)
  payload           JSONB       NOT NULL DEFAULT '{}'::jsonb,  -- registro carimbado completo
  -- encadeamento (preenchido SEMPRE pelo trigger; valores do cliente são ignorados)
  prev_hash         TEXT        NOT NULL,
  hash              TEXT        NOT NULL UNIQUE,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.gaios_audit_trail IS
  'GaiOS §3 — trilha imutável (WORM, hash encadeado ao registro anterior). '
  'Escrita: INSERT-only via service_role (backend). UPDATE/DELETE/TRUNCATE '
  'bloqueados por trigger. Retenção: prazo legal fiscal/LGPD — purga exige '
  'procedimento formal (DISABLE TRIGGER pelo owner) registrado como evento '
  '''sistema''. Convenção obrigatória: todo uso de credencial elevada gera '
  'evento ''acesso_privilegiado'' (acesso privilegiado NUNCA sem log).';

CREATE INDEX IF NOT EXISTS idx_gaios_trail_origem_ts
  ON public.gaios_audit_trail (origem, ts_evento DESC);
CREATE INDEX IF NOT EXISTS idx_gaios_trail_ts
  ON public.gaios_audit_trail (ts_evento DESC);

-- ----------------------------------------------------------------------------
-- 3. Trigger de encadeamento — calcula prev_hash/hash no INSERT
--    Advisory lock serializa a cadeia (sem bifurcação em INSERTs concorrentes;
--    volume de auditoria F1/F2 não exige throughput maior que isso).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.gaios_chain_hash()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prev TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('gaios_audit_trail'));
  SELECT t.hash INTO v_prev
    FROM public.gaios_audit_trail t
   ORDER BY t.seq DESC
   LIMIT 1;
  NEW.prev_hash := COALESCE(v_prev, 'GAIOS_GENESIS');
  NEW.hash := encode(digest(
      NEW.prev_hash
      || '|' || NEW.origem::text
      || '|' || NEW.evento
      || '|' || NEW.ts_evento::text
      || '|' || COALESCE(NEW.ip_origem::text, '')
      || '|' || COALESCE(NEW.login_origem, '')
      || '|' || COALESCE(NEW.assinatura_valida::text, '')
      || '|' || COALESCE(NEW.fact_check::text, '')
      || '|' || COALESCE(NEW.risco::text, '')
      || '|' || NEW.payload::text,
      'sha256'), 'hex');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_gaios_chain ON public.gaios_audit_trail;
CREATE TRIGGER trg_gaios_chain
  BEFORE INSERT ON public.gaios_audit_trail
  FOR EACH ROW EXECUTE FUNCTION public.gaios_chain_hash();

-- ----------------------------------------------------------------------------
-- 4. WORM — UPDATE/DELETE/TRUNCATE proibidos (vale até para service_role:
--    trigger dispara para qualquer role que não faça DISABLE TRIGGER)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.gaios_block_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION
    'gaios_audit_trail e WORM: % proibido. Purga por retencao legal = '
    'procedimento formal (owner: ALTER TABLE ... DISABLE TRIGGER), '
    'registrado antes como evento ''sistema''/''purga_formal''.', TG_OP;
END $$;

DROP TRIGGER IF EXISTS trg_gaios_worm ON public.gaios_audit_trail;
CREATE TRIGGER trg_gaios_worm
  BEFORE UPDATE OR DELETE ON public.gaios_audit_trail
  FOR EACH ROW EXECUTE FUNCTION public.gaios_block_mutation();

DROP TRIGGER IF EXISTS trg_gaios_worm_truncate ON public.gaios_audit_trail;
CREATE TRIGGER trg_gaios_worm_truncate
  BEFORE TRUNCATE ON public.gaios_audit_trail
  FOR EACH STATEMENT EXECUTE FUNCTION public.gaios_block_mutation();

-- ----------------------------------------------------------------------------
-- 5. RLS fechada (padrão migration 30): ENABLE + FORCE, SEM policy =
--    anon/authenticated zero acesso. Backend (service_role) bypassa RLS,
--    mas NÃO bypassa os triggers WORM acima.
-- ----------------------------------------------------------------------------
ALTER TABLE public.gaios_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaios_audit_trail FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.gaios_audit_trail FROM anon, authenticated;

-- ----------------------------------------------------------------------------
-- 6. Exportação read-only (§3) — para fisco/ANPD/auditor externo.
--    Fica FECHADA por default; conceder SELECT pontual quando o mecanismo
--    de admin do projeto for definido (memória: admin grant = gmail).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.gaios_audit_export AS
  SELECT seq, origem, evento, ts_evento, ip_origem, login_origem,
         assinatura_valida, fact_check, risco, payload, prev_hash, hash
    FROM public.gaios_audit_trail;

REVOKE ALL ON public.gaios_audit_export FROM anon, authenticated;

COMMENT ON VIEW public.gaios_audit_export IS
  'GaiOS §3 — exportação READ-ONLY do trail para fins fiscais/regulatórios. '
  'Toda exportação concedida deve ser precedida de evento '
  '''exportacao_fiscal'' na própria trilha.';

-- ----------------------------------------------------------------------------
-- 7. Verificador de integridade da cadeia — auditor roda e confere
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.gaios_verify_chain(p_max_rows BIGINT DEFAULT NULL)
RETURNS TABLE (ok BOOLEAN, total_verificado BIGINT, quebra_em_seq BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r       RECORD;
  v_prev  TEXT   := 'GAIOS_GENESIS';
  v_calc  TEXT;
  v_n     BIGINT := 0;
BEGIN
  FOR r IN SELECT * FROM public.gaios_audit_trail ORDER BY seq ASC LOOP
    v_calc := encode(digest(
        v_prev
        || '|' || r.origem::text
        || '|' || r.evento
        || '|' || r.ts_evento::text
        || '|' || COALESCE(r.ip_origem::text, '')
        || '|' || COALESCE(r.login_origem, '')
        || '|' || COALESCE(r.assinatura_valida::text, '')
        || '|' || COALESCE(r.fact_check::text, '')
        || '|' || COALESCE(r.risco::text, '')
        || '|' || r.payload::text,
        'sha256'), 'hex');
    IF r.prev_hash IS DISTINCT FROM v_prev OR r.hash IS DISTINCT FROM v_calc THEN
      RETURN QUERY SELECT false, v_n, r.seq;
      RETURN;
    END IF;
    v_prev := r.hash;
    v_n := v_n + 1;
    IF p_max_rows IS NOT NULL AND v_n >= p_max_rows THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN QUERY SELECT true, v_n, NULL::BIGINT;
END $$;

COMMENT ON FUNCTION public.gaios_verify_chain(BIGINT) IS
  'Percorre a cadeia recalculando os hashes. ok=false aponta o primeiro seq '
  'adulterado/quebrado. Uso: SELECT * FROM gaios_verify_chain();';

-- ----------------------------------------------------------------------------
-- 8. Bloco gênese — idempotente (só se a trilha estiver vazia)
-- ----------------------------------------------------------------------------
INSERT INTO public.gaios_audit_trail (origem, evento, payload)
SELECT 'sistema', 'genesis',
       jsonb_build_object(
         'migration', '31_gaios_audit_trail',
         'nota', 'Bloco zero da cadeia GaiOS — CerberOS gera, GaiOS guarda, EteriOS transporta')
WHERE NOT EXISTS (SELECT 1 FROM public.gaios_audit_trail);

-- ============================================================================
-- FIM 31. Próximos (gated): entrega B (cerberos_gate.py grava aqui via
-- service_role) + D (idempotência por meta_message_id) junto ao deploy D2/D3.
-- Verificação pós-aplicação:
--   SELECT * FROM gaios_verify_chain();           -- esperado: ok=true, 1, null
--   GET /rest/v1/gaios_audit_trail (anon)         -- esperado: 401/403/vazio
-- ============================================================================
