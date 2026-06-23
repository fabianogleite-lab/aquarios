-- Consoles config-first (WS2b): permitir que o ADMIN (com grant ativo) escreva via REST
-- direto do backoffice, SEM precisar do service_role no navegador e SEM redeploy do backend.
--
-- Problema: admin_settings e aquarios_modules só tinham policy de escrita p/ service_role,
-- então o backoffice (JWT 'authenticated') falhava em salvar (caía no fallback "local").
--
-- Solução segura: função SECURITY DEFINER que confere o grant ativo (a tabela
-- aquarios_admin_grants é service_role-only; a função, como definer, contorna a RLS dela
-- APENAS para responder true/false — nunca expõe linhas). As policies de escrita chamam essa
-- função. Continua restrito a admins concedidos; anon/usuário comum não escreve; leitura segue pública.

CREATE OR REPLACE FUNCTION public.is_active_admin()
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.aquarios_admin_grants g
     WHERE g.user_id = auth.uid()
       AND g.revoked_at IS NULL
  );
$$;

REVOKE ALL ON FUNCTION public.is_active_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated, anon;

-- admin_settings: leitura pública (já existe) + escrita só admin-com-grant.
DROP POLICY IF EXISTS admin_settings_admin_write ON public.admin_settings;
CREATE POLICY admin_settings_admin_write ON public.admin_settings
  FOR ALL TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- aquarios_modules: mesma correção (o editor de módulos do backoffice persiste de verdade).
DROP POLICY IF EXISTS aquarios_modules_admin_write ON public.aquarios_modules;
CREATE POLICY aquarios_modules_admin_write ON public.aquarios_modules
  FOR ALL TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());
