# SECURITY AUDIT REPORT - AquariOS

> Gerado por `tools/security_audit.py` em 2026-06-12 12:27 UTC  
> HEAD: `057b81e` (main) - escopo: handoff Fronteira F1->F2, checklist §5 + regras §2-§4  
> Read-only: nenhum valor de secret aparece neste arquivo (apenas tipo, local e fingerprint).

## Resumo executivo

**Veredicto: REPROVADO (ha itens FAIL)**

| Status | Qtde |
|---|---|
| [FAIL] | 3 |
| [WARN] | 35 |
| [MANUAL] | 5 |
| [INFO] | 4 |
| [PASS] | 6 |
| [SKIP] | 0 |

## A1 - Secrets no historico git (refs alcancaveis)

- **[WARN] JWT no historico**
  - commit `1bc3d4189f9c` em `deploy_via_api.py` (2x no historico) - JWT service_role INERTE: EXPIRADA em 2024-11-18 e de OUTRO projeto (ref `agebsmjsjrmazbnzphnh` != atual `agebsmjsjrmazbozphnh`). Risco neutralizado; purga do historico e opcional (higiene). fp:a99ed5c9b5

## A10 - Itens manuais (nao automatizaveis)

- **[MANUAL] eSIM ProteOS (31 98323-5309)**
  - PIN do chip ativado; QR de reinstalacao guardado OFFLINE (vetor de SIM swap). 2G ja desativado conforme handoff.
- **[MANUAL] Wix / OdontolarPlus**
  - Revisar retencao de dados do formulario e das conversas da assistente Lis no painel Wix.
- **[MANUAL] Rotacao da chave Anthropic**
  - Opcional (S32: nunca vazou ao publico). Rotacionar por higiene quando conveniente.
- **[MANUAL] Credenciais Meta (sessao paralela)**
  - Ao receber: conferir que entram APENAS via .env na VM (/opt/business-agent/.env), nunca em arquivo do repo.
- **[MANUAL] Rate limiting na borda (entrega E - documentada)**
  - Recomendacao: nginx `limit_req zone=webhook burst=20 nodelay` na rota /webhook da VM Oracle + idempotencia (entrega D) no app. Aplicar junto ao deploy D2/D3.

## A2 - Incidentes conhecidos (remanescentes locais)

- **[INFO] Objeto `2d8245e` ainda existe no object store local**
  - S32: chave Anthropic real em DEPLOY_GUIDE.md. Tags que o alcancavam foram deletadas (commit inalcancavel; nunca esteve no remoto publico - GH013 bloqueou o push). O objeto esta inalcancavel mas ainda nao foi purgado. Purga definitiva (acao manual, destrutiva): `git gc --prune=now`.

## A3 - Secrets na working tree

- **[PASS] Nenhum secret em arquivos rastreados ou untracked**
  - Arquivos ignorados pelo .gitignore (ex.: .env) ficam fora do alcance de commit e nao sao lidos.

## A4 - Higiene de .env / .gitignore

- **[PASS] Nenhum .env real versionado**
  - Somente .env.example (placeholders) no indice.
- **[PASS] `.gitignore` raiz cobre `.env`**
  - Padrao sem barra aplica-se a qualquer subdiretorio (mobile/, business-agent/, etc.).
- **[PASS] `mobile/.env` existe e esta ignorado**
  - Confirmado via git check-ignore.

## A5 - service_role em codigo client

- **[PASS] Nenhuma referencia a service_role no codigo client**
  - Varrido mobile/ (.ts/.tsx/.js/.jsx/.json), excluindo supabase/ (server-side) e node_modules.

## A6 - Cobertura RLS estatica (migrations)

- **[FAIL] Tabela `existential_xp_log` sem ENABLE RLS em nenhuma migration**
  - Definida em `mobile\supabase\migrations/12_s18_devpack_v5_consolidation.sql`. Se o probe live (A7) nao mostra vazamento, a tabela esta vazia, nao existe em prod, ou a RLS foi ligada fora das migrations (Studio) - confirmar em pg_policies e corrigir a migration de qualquer forma.
- **[FAIL] Tabela `panaceia_currencies` sem ENABLE RLS em nenhuma migration**
  - Definida em `mobile\supabase\migrations/11_s18_panaceia_payments.sql`. Se o probe live (A7) nao mostra vazamento, a tabela esta vazia, nao existe em prod, ou a RLS foi ligada fora das migrations (Studio) - confirmar em pg_policies e corrigir a migration de qualquer forma.
- **[WARN] Tabela `aprovacoes_slack` com RLS mas sem CREATE POLICY**
  - Definida em `mobile\supabase\migrations/30_pacote_d_crm_meta_unified.sql`. RLS sem policy = ninguem acessa via anon/authenticated (pode ser intencional: acesso so via service_role).
- **[WARN] Tabela `business_agent_logs` com RLS mas sem CREATE POLICY**
  - Definida em `mobile\supabase\migrations/30_pacote_d_crm_meta_unified.sql`. RLS sem policy = ninguem acessa via anon/authenticated (pode ser intencional: acesso so via service_role).
- **[WARN] Tabela `campanhas` com RLS mas sem CREATE POLICY**
  - Definida em `mobile\supabase\migrations/30_pacote_d_crm_meta_unified.sql`. RLS sem policy = ninguem acessa via anon/authenticated (pode ser intencional: acesso so via service_role).
- **[WARN] Tabela `compliance_por_pais` com RLS mas sem CREATE POLICY**
  - Definida em `mobile\supabase\migrations/30_pacote_d_crm_meta_unified.sql`. RLS sem policy = ninguem acessa via anon/authenticated (pode ser intencional: acesso so via service_role).
- **[WARN] Tabela `consent_versions` com RLS mas sem CREATE POLICY**
  - Definida em `mobile\supabase\migrations/30_pacote_d_crm_meta_unified.sql`. RLS sem policy = ninguem acessa via anon/authenticated (pode ser intencional: acesso so via service_role).
- **[WARN] Tabela `conversas` com RLS mas sem CREATE POLICY**
  - Definida em `mobile\supabase\migrations/30_pacote_d_crm_meta_unified.sql`. RLS sem policy = ninguem acessa via anon/authenticated (pode ser intencional: acesso so via service_role).
- **[WARN] Tabela `delete_requests` com RLS mas sem CREATE POLICY**
  - Definida em `mobile\supabase\migrations/30_pacote_d_crm_meta_unified.sql`. RLS sem policy = ninguem acessa via anon/authenticated (pode ser intencional: acesso so via service_role).
- **[WARN] Tabela `gaios_audit_trail` com RLS mas sem CREATE POLICY**
  - Definida em `mobile\supabase\migrations/31_gaios_audit_trail.sql`. RLS sem policy = ninguem acessa via anon/authenticated (pode ser intencional: acesso so via service_role).
- **[WARN] Tabela `mensagens` com RLS mas sem CREATE POLICY**
  - Definida em `mobile\supabase\migrations/30_pacote_d_crm_meta_unified.sql`. RLS sem policy = ninguem acessa via anon/authenticated (pode ser intencional: acesso so via service_role).
- **[WARN] Tabela `meta_signals` com RLS mas sem CREATE POLICY**
  - Definida em `mobile\supabase\migrations/30_pacote_d_crm_meta_unified.sql`. RLS sem policy = ninguem acessa via anon/authenticated (pode ser intencional: acesso so via service_role).
- **[WARN] Tabela `optins` com RLS mas sem CREATE POLICY**
  - Definida em `mobile\supabase\migrations/30_pacote_d_crm_meta_unified.sql`. RLS sem policy = ninguem acessa via anon/authenticated (pode ser intencional: acesso so via service_role).
- **[WARN] Tabela `pipeline_stages` com RLS mas sem CREATE POLICY**
  - Definida em `mobile\supabase\migrations/30_pacote_d_crm_meta_unified.sql`. RLS sem policy = ninguem acessa via anon/authenticated (pode ser intencional: acesso so via service_role).
- **[WARN] Tabela `widget_interactions` com RLS mas sem CREATE POLICY**
  - Definida em `mobile\supabase\migrations/30_pacote_d_crm_meta_unified.sql`. RLS sem policy = ninguem acessa via anon/authenticated (pode ser intencional: acesso so via service_role).
- **[INFO] Cobertura de migrations**
  - 69 tabelas criadas, 69 com ENABLE RLS, 57 com policies. Dirs: mobile\supabase\migrations, supabase\migrations.

## A7 - RLS live probe (GET anonimo, read-only)

- **[WARN] SELECT anonimo retorna LINHAS em `alexandrios_kb`**
  - GET /rest/v1/alexandrios_kb com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `aquarios_architecture`**
  - GET /rest/v1/aquarios_architecture com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `aquarios_constitution`**
  - GET /rest/v1/aquarios_constitution com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `aquarios_decisions`**
  - GET /rest/v1/aquarios_decisions com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `aquarios_divergencias`**
  - GET /rest/v1/aquarios_divergencias com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `aquarios_eixo_distribution`**
  - GET /rest/v1/aquarios_eixo_distribution com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `aquarios_modules`**
  - GET /rest/v1/aquarios_modules com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `archetype_polarity`**
  - GET /rest/v1/archetype_polarity com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `arkhe_holding`**
  - GET /rest/v1/arkhe_holding com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `ecumenic_references`**
  - GET /rest/v1/ecumenic_references com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `evolution_levels`**
  - GET /rest/v1/evolution_levels com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `intellectual_property_registry`**
  - GET /rest/v1/intellectual_property_registry com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `kb_foundation`**
  - GET /rest/v1/kb_foundation com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `panaceia_offering_categories`**
  - GET /rest/v1/panaceia_offering_categories com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `panaceia_offerings`**
  - GET /rest/v1/panaceia_offerings com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `panaceia_pack_manual_definition`**
  - GET /rest/v1/panaceia_pack_manual_definition com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `persona_management`**
  - GET /rest/v1/persona_management com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `personas`**
  - GET /rest/v1/personas com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `personas_cultural_map`**
  - GET /rest/v1/personas_cultural_map com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `plans`**
  - GET /rest/v1/plans com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[WARN] SELECT anonimo retorna LINHAS em `roadmap_phase_log`**
  - GET /rest/v1/roadmap_phase_log com anon key devolveu dados sem login. Existe policy de SELECT nas migrations para esta tabela - exposicao compativel com o design; revisar se a INTENCAO de negocio segue valida (conteudo e publico para qualquer portador da anon key, que esta no bundle do APK).
- **[INFO] Resultado do probe (GET anon, read-only)**
  - 9 bloqueadas/sem rota, 30 retornam vazio (RLS filtrando), 21 retornam linhas, 0 erros de rede. Bloqueadas/sem rota: ecumenic_traditions, gaios_audit_trail, hygeios_payment_audit, mood_logs, panaceia_currencies, panaceia_subscriptions, panaceia_token_packages, panaceia_transactions, stripe_customers. Vazias: aprovacoes_slack, aquarios_admin_grants, aquarios_arcana_catalog, arcana_draws, archetype_balance, audit_logs, badges, business_agent_logs, campanhas, clientes, compliance_por_pais, consent_versions, content_audit_log, conversas, delete_requests, existential_xp_log, gratitude_logs, hermetic_balance_log, hydration_logs, hygeios_cerberos_signals, mensagens, meta_signals, optins, panaceia_user_api_keys, performance_metrics, persona_user_interactions, pii_patterns, pipeline_stages, purchases, relationship_logs. Probe de ESCRITA nao foi executado (read-only); anon write ja validado como 401 na S32 (migrations 17/18/23).

## A8 - Webhook HMAC (business-agent)

- **[INFO] Sem dedupe por meta_message_id no handler**
  - Coluna existe no schema; implementacao = entrega D (sequenciada junto ao deploy real D2/D3).
- **[PASS] Webhook valida X-Hub-Signature-256**
  - Validacao de assinatura Meta presente. Usa hmac.compare_digest (constant-time, correto).

## A9 - Release GitHub (APK)

- **[FAIL] Release publico com APK de DEBUG: `v0.1.0-beta/app-debug.apk`**
  - Debug build: assinado com debug keystore, depuravel, sem minify. Substituir por release assinado (checklist §5).

## Metodologia e limitacoes

- **A1**: `git log --all -p` (todas as refs: branches, tags) com 12 padroes de secret + decodificacao de payload JWT para distinguir anon (publica) de service_role (critica). Objetos *inalcancaveis* do object store nao sao varridos (cobertos pontualmente em A2).
- **A6/A7**: cobertura via parser das migrations (inclui RLS habilitada dinamicamente em blocos DO $$ + EXECUTE format, padrao da migration 30) + probe REST com anon key. Nao substitui inspecao de `pg_policies` em producao (policies criadas fora das migrations nao aparecem no estatico; o probe live cobre o efeito pratico de leitura). Exposicao com policy SELECT versionada = WARN (design a confirmar); sem policy conhecida = FAIL.
- **A7**: somente GET (read-only). Probe de INSERT/UPDATE nao e executado por design - validado na S32.
- **Itens fisicos** (eSIM, Wix, keystore) nao sao automatizaveis: ver A10.
- Pentest/carga (k6, OWASP ZAP) fora do escopo desta ferramenta (protocolo §6 do handoff).
