-- Migration 24: Corrige pgcrypto + aquarios_validate_admin_access
-- Problema: crypt() do pgcrypto não encontrado porque extensão fica em
-- schema extensions, não public. A função precisava de prefixo de schema.
-- Também corrige warning: p_username não usado em upsert_bot_persona.

-- 1. Habilita pgcrypto no schema extensions (idempotente)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Recria função com extensions.crypt() (prefixo de schema explícito)
CREATE OR REPLACE FUNCTION public.aquarios_validate_admin_access(
  p_user_id     UUID,
  p_passphrase  TEXT
) RETURNS JSONB AS $$
DECLARE
  v_grant RECORD;
  v_now TIMESTAMPTZ := now();
BEGIN
  SELECT * INTO v_grant FROM public.aquarios_admin_grants
   WHERE user_id = p_user_id AND revoked_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'no_grant');
  END IF;

  IF v_grant.passphrase_hash IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'no_passphrase_set');
  END IF;

  IF NOT v_grant.pre_condition_met THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'precondition_not_met');
  END IF;

  -- bcrypt via extensions.crypt() — schema explícito, independe do search_path
  IF v_grant.passphrase_hash = extensions.crypt(p_passphrase, v_grant.passphrase_hash) THEN
    UPDATE public.aquarios_admin_grants
       SET last_admin_access = v_now
     WHERE user_id = p_user_id;

    INSERT INTO public.audit_logs (user_id, event_type, resource, metadata)
    VALUES (
      p_user_id,
      'admin_ai.access.granted',
      'aquarios_admin_grants',
      jsonb_build_object('at', v_now)
    );

    RETURN jsonb_build_object('granted', true, 'access_level', 'adm_ai', 'ttl_seconds', 3600);
  END IF;

  INSERT INTO public.audit_logs (user_id, event_type, resource, metadata)
  VALUES (
    p_user_id,
    'admin_ai.access.denied',
    'aquarios_admin_grants',
    jsonb_build_object('reason', 'passphrase_mismatch', 'at', v_now)
  );

  RETURN jsonb_build_object('granted', false, 'reason', 'invalid_credentials');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. upsert_bot_persona: warning "unused parameter p_username" é nível extra
--    (não bloqueia nada). Manter comportamento original — lookup por display_name.
--    Não alterar: mudar lookup para username quebraria se coluna não existir no schema remoto.
