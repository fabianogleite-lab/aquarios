# ▶️ TEXTO PARA ABRIR A PRÓXIMA SESSÃO: CerberOS + Hardening (cole numa sessão nova)
> Sessão **própria e presencial** — exige **rebuild + redeploy** do backend (não "deixa rodando").
> Depois dela vem a **FINALIZAÇÃO do MVP1** (bloco gated: merge + publish + sigilo + backup).

## ✅ RESOLVIDO 03/Jul — incidente da VM travada (era bloqueador, texto original preservado abaixo)
Reboot feito pelo fundador (Actions → Reboot no console) → VM voltou "Running" em ~2min. Redeploy
executado (main.py/cerber_shield.py/dsar.py/iso_evidence.py via scp) + restart do serviço + headers
nginx aplicados + GitHub Secrets configurados (`SUPABASE_SERVICE_KEY`/`SUPABASE_URL` em
fabianogleite-lab/aquarios). Rota `/meta/data_deletion` confirmada viva (400, não mais 404).
Memória pós-restart estável (~200Mi available, sem re-disparar). **Falta só:** testar o DSAR
de ponta a ponta clicando "Test" no painel Meta (App Dashboard → Data Deletion → Test) — a
rota já responde, só falta o teste real do fluxo completo.

## 🚨 BLOQUEADOR — resolver ANTES de qualquer outro item (incidente 03/Jul, texto original)
**`aquarios-server-1` (Oracle VM, produção WhatsApp) está travada** — status "Running" no console
OCI, mas SSH (porta 22) e HTTPS (porta 443) inacessíveis. Causa investigada e não foi ação externa
(descartados: Fly/Neon, GitHub OAuth apps, ação via console/API Oracle — Work Requests vazio).
**Hipótese confirmada pelos gráficos de Monitoring:** OOM/travamento de kernel — shape é
`VM.Standard.E2.1.Micro` (só **1 GB de RAM**); CPU/memória/disco/load subiram juntos ~11:45→12:10 UTC
(memory ~85-90%, Memory Allocation Stalls disparou = kernel forçando reclaim de página), depois
**tudo caiu pra zero e ficou morto** a partir de ~12:15 UTC — travou logo após nosso restart do
serviço consolidado (webhook+SandeirOS+ivi_v2 num só processo) pra rotacionar o `META_APP_SECRET`.
**Ação pendente (só o fundador, via console):** Oracle Console → Compute → `aquarios-server-1` →
**Actions → Reboot**. Depois do reboot, retomar o item 5 do roteiro abaixo (rebuild+redeploy já
tinha sido feito antes da travada — confirmar se sobreviveu ou se precisa refazer).
**Risco recorrente:** 1 GB de RAM é pouco pro serviço consolidado — considerar monitorar memória
ou avaliar upgrade de shape se voltar a travar.

---

Executar a **SESSÃO CerberOS + Hardening**. Escopo e estado real na memória `project_cerberos`.

## CONTEXTO — Sessões 1–3 do MVP1 CONCLUÍDAS (22/Jun), NÃO refazer
- **Backend MVP1 LIVE** na Azure: Container App `aquarios-hygeios-api` (rg `rg-aquarios-hygeios`),
  img `aquariosacr.azurecr.io/aquarios:latest`,
  FQDN `https://aquarios-hygeios-api.icystone-7ee8586d.brazilsouth.azurecontainerapps.io`.
  `SUPABASE_SERVICE_ROLE_KEY` = secret do Container App. Supabase `agebsmjsjrmazbozphnh`, migrations até `20260622000007`.
- **Azure login = CEL** (`celgestoradeservicos@hotmail.com`, sub `d0c1b514-9205-46fa-b327-b8033528863d`,
  tenant `9a480d29`). RGs: `rg-aquarios-hygeios` (Container App + ACR + env + db) e `AquariOS_Test`
  (Foundry/OpenAI/Meta/AppInsights/LogAnalytics). **SEM storage account.**
- **Sessão 3 montou `mvp0/` + `mvp1/` + `MVP1.md`** → commit **`a46a353`** no branch `reestruturacao/mvp0-mvp1`,
  **NÃO pushado**. `mvp1/` = versão ativa · `mvp0/` = baseline (histórico + operacional) · `MVP1.md` = fonte de verdade operacional.
- **Git:** `main` local em `9297d68` (intacta, 2 à frente de `origin/main` `2f2d385`). Branch 7 à frente de main, sem push.

## LER PRIMEIRO
Memória `project_cerberos`, `MVP1.md`, memória do backlog das 21 tabelas públicas (`session_20jun_p1_backlog`),
regras `feedback_no_action_without_scope`, `feedback_sites_pro_template`, `feedback_humanizer_sigilo`.

## EXECUTAR — CerberOS + Hardening (COM o fundador; exige redeploy)
1. **Ligar `cerber_shield.py`** (em `business-agent/`) no backend live: rate-limit **L3** / payload **L6** /
   Eternal Maze **L7** + honeypots. Hoje o backend live **não tem** rate-limit/CORS/auth nos writes.
2. **`register_cerber`** + **CORS** + **auth nos writes**.
3. Corrigir **mismatch de env** `SUPABASE_SERVICE_KEY` × `SUPABASE_SERVICE_ROLE_KEY`.
   Confirmar tabela **`cl_cerber_incidents`** (migration `20260616068000_cerber_incidents.sql`).
4. **21 tabelas públicas** — classificar conteúdo real antes de qualquer fix de RLS. Colidem com
   `feedback_sites_pro_template`: `aquarios_constitution`, `aquarios_architecture`, `arkhe_holding`,
   `intellectual_property_registry`. Decisão de **intenção de negócio**, não técnica pura.
5. **Settle fronteira CerberOS × GaiOS** (defesa × sistema/governança).
6. **Hardening do repo:** gitignorar `supabase/.temp/` no repo TODO (a raiz versiona scratch da CLI —
   sem credencial, mas expõe project-ref + host do pooler). Cobre também as cópias em `mvp*/`.
⚠️ **rebuild + redeploy do Container App → COM o fundador presente.**

## DEPOIS DO CERBEROS — FINALIZAÇÃO DO MVP1 (bloco gated, decisão do fundador)
- **(a) Merge** branch `reestruturacao/mvp0-mvp1` → `main`, após **smoke test verde** do backend.
- **(b) Publish dos sites:** `docs/backoffice.html` + `docs/ajuda.html` + `docs/index.html` → `main` (Pages).
  Comandos prontos em `RELATORIO_MVP1_SESSAO2.md` (seção "AÇÃO DO FUNDADOR").
- **(c) Sigilo:** `main` local está 2 commits à frente de `origin/main` (`9297d68` redação + `edd7091`),
  com **rewrite de histórico PENDENTE** (`security_sigilo_leak_repo_docs`). **Resolver antes de qualquer push.**
- **(d) Backup Azure Blob** do `mvp1/` (container `mvp1-backup`, assinatura CEL) — **adiado na Sessão 3**;
  exige **criar uma storage account** (a conta CEL não tem nenhuma).
- **(e) (opcional)** amend do `a46a353` tirando `mvp*/supabase/.temp/` — ou já cobrir no gitignore repo-wide do passo 6.

## 🚫 TRAVAS (não violar)
- **Nada de push sem "ok"** do fundador — sigilo de histórico ainda pendente.
- **Azure: responder a uma pergunta ≠ aprovar.** Não criar recurso faturável sem um "cria" explícito.
