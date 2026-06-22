# ▶️ TEXTO PARA ABRIR A SESSÃO 3 (cole isto numa sessão nova)
> Sessão 3 = ÚLTIMA do MVP1 (fechamento/estrutura). A seguir, em **sessão própria**, vem o **CerberOS + Hardening**.

---

Executar **SESSÃO 3 do MVP1** — "Criar mvp1/" (fechamento). Plano aprovado em `ESCOPO_ARVORE_MVP1.md` / memória `project_mvp1_execution_plan`. **Sessão presencial-leve:** pode envolver merge na `main` (público) — não fazer push sem meu "ok".

## CONTEXTO — Sessões 1 e 2 CONCLUÍDAS (22/Jun), NÃO refazer
- **Backend MVP1 LIVE** na Azure: Container App `aquarios-hygeios-api` (rg `rg-aquarios-hygeios`), img `aquariosacr.azurecr.io/aquarios:latest`, FQDN `https://aquarios-hygeios-api.icystone-7ee8586d.brazilsouth.azurecontainerapps.io`. `SUPABASE_SERVICE_ROLE_KEY` = secret do Container App. Supabase `agebsmjsjrmazbozphnh`.
- **Supabase migrations aplicadas até `20260622000007`** (AlexandriOS reconcile + seed 3 públicos + policies admin-gated). KB viva: usuário 45 · admin 10 · integrador 8.
- **Consoles config-first prontos** (backoffice: Configurações + Servidores trilha-a-trilha + ajuda "?"). **Central de Ajuda pública** `docs/ajuda.html`. Mobile `HelpButton`. Demo `tests/wearable_whitelabel_demo.py` (verde).
- **Tudo da Sessão 2 está em commits LOCAIS no branch `reestruturacao/mvp0-mvp1`** (`ff3c225`, `705fe72`, `305b7f4`) — **NÃO pushados**. `main` intacta em `9297d68`. `origin/main` em `2f2d385`.
- Relatório completo de testes/achados: **`RELATORIO_MVP1_SESSAO2.md`**.

## LER PRIMEIRO
`ESCOPO_ARVORE_MVP1.md` (plano WS3 + lista de relevantes), `RELATORIO_MVP1_SESSAO2.md`, memórias `project_mvp1_execution_plan`, `feedback_remap_not_discard`, `feedback_no_action_without_scope`.
**Regras:** `feedback_config_first_console`, `feedback_sites_pro_template`, `feedback_humanizer_sigilo`, `feedback_publish_site_on_content`.

## EXECUTAR (Sessão 3)
1. **Nomenclatura canônica + `MVP1.md`** (doc único enxuto = fonte de verdade operacional: o que está no ar, como rodar, como pedir ajuda). Acaba a proliferação HANDOFF_*/ESCOPO_*/STATUS_*.
2. **Criar pasta `mvp1/`** com **dual-write SÓ NA MONTAGEM** (gravar cada relevante em `mvp0/` baseline + `mvp1/` ativo de uma vez; depois `mvp0/` congela). Relevantes (lista em `ESCOPO_ARVORE_MVP1.md`): `backend/`, `supabase/`, `main.py`, `Dockerfile`, `.dockerignore`, `requirements.txt`, `business-agent/`, `escambos/core/`, `infra/`, `legal/`, `tests/`, `scripts/`, + docs de escopo vivo (inclui `RELATORIO_MVP1_SESSAO2.md`).
   - **Vivos na raiz (NÃO mover):** `docs/` (GitHub Pages serve de `main/docs`) e `mobile/` (build Expo, 5.9 GB) e o build infra (`Dockerfile`/`main.py` referenciam a raiz). Mover quebra Pages/app/build.
3. **Cópia do `mvp1/` no Azure Blob** — container `mvp1-backup`, **assinatura CEL** (login `celgestoradeservicos@hotmail.com`, sub `d0c1b514-9205-46fa-b327-b8033528863d`). Backup versionado.
4. **Merge na `main` + smoke test verde** — ⚠️ **GATED na minha decisão** (ver abaixo).

## ⚠️ DECISÃO PENDENTE (resolver comigo no início da Sessão 3) — publish + sigilo
- A `main` local (`9297d68`) está **2 commits à frente** de `origin/main` (`2f2d385`); esses 2 incluem a **redação de sigilo do humanizador** com **rewrite de histórico AINDA pendente** (`security_sigilo_leak_repo_docs`). Por isso a Sessão 2 **NÃO pushou nada** e **segurou a publicação dos sites**.
- Itens a decidir antes de qualquer push: (a) publicar `docs/backoffice.html` + `docs/ajuda.html` + `docs/index.html` em `main` (melhorias prontas e verificadas); (b) como tratar o rewrite de histórico do sigilo; (c) merge do branch MVP1 → `main`.
- Comandos de publish-só-dos-sites estão em `RELATORIO_MVP1_SESSAO2.md` (seção "AÇÃO DO FUNDADOR").

## 🛡️ PRÓXIMA SESSÃO (depois desta) — CerberOS + Hardening (SESSÃO PRÓPRIA)
**Aviso para o fim da Sessão 3:** a sessão seguinte é dedicada ao **CerberOS + Hardening**. Achado da Sessão 2: o `cerber_shield.py` (L3 rate-limit / L6 payload / L7 Eternal Maze) **existe em `business-agent/` mas NÃO está ligado no backend live** (sem rate-limit/CORS/auth nos writes). Escopo + estado real na memória **`project_cerberos`**. **Exige rebuild+redeploy → fazer COM o fundador presente**, não no modo "deixa rodando".

> Backups (já nesta Sessão 3): `mvp1/` → Azure Blob `mvp1-backup` (assinatura CEL).
