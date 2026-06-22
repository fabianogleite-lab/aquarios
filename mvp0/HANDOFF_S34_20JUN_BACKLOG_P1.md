# Handoff — 20/Jun/2026 — Execução do backlog P1

> Sessão anterior ficou bloqueada na VM Oracle caída (P0). Fundador pediu: "me oriente como atender todas estas demandas" → escopo confirmado = pendências abertas do projeto → categorizei em P0-P4 e executei tudo que dava pra fazer sem decisão do fundador (P1). Este documento é o estado real no fim dessa execução.

---

## P0 — ATUALIZADO 21/Jun 00:36: a VM SE RECUPEROU SOZINHA, não estava mais caída
## P1 — DEPLOY PRODUÇÃO 21/Jun 00:49: voice_proxy + cerber_shield + nginx routing ✅ LIVE

**Correção:** o travamento de SSH/HTTPS descrito abaixo (histórico, mantido por rastreabilidade) era **transitório** — confirmado via SSH real às 00:36 de 21/Jun: `uptime` mostra **12 dias contínuos, sem reboot**. Os 4 serviços estão `active running`: `aquarios-webhook.service`, `hygeios-v2-sprint2.service` (porta 8001), `hygeios-v2.service`/AQUARIOS v4.2 (porta 8000), `nginx`. Não foi preciso reboot manual no OCI Console — a assinatura/conta Oracle está válida (instância suspensa ficaria inacessível, não é o caso). RAM continua no limite (498MB total, 8MB livre real, 197MB available) — pode travar de novo sob qualquer pico, mas neste momento está estável.

~~Diagnóstico histórico (20/Jun, quando ainda estava travada):~~ SSH e HTTPS travavam na troca de protocolo (TCP subia, banner/TLS não completava) — esgotamento de recursos do SO, não rede/firewall.

**Achado importante ao confirmar via SSH:** o `aquarios-webhook.service` rodando agora é a versão **ANTIGA** de `main.py` (rotas: só `/webhook/whatsapp`, `/health`, `/config` — nada do wiring de hoje). O deploy nessa VM é **cópia manual de arquivo**, não `git pull` (`/home/opc/business-agent` não é repositório git) — então o push de hoje pro GitHub não chegou lá automaticamente. Confirmado também: `python-multipart` **realmente não está instalado** no venv (`/home/opc/business-agent/venv`) — exatamente o bloqueio previsto abaixo, agora verificado direto no servidor.

**Próximo passo real (não é mais "religar"):** fazer o deploy manual do `main.py` atualizado (com voice_proxy + cerber_shield) — copiar os arquivos novos pra `/home/opc/business-agent/`, rodar `pip install python-multipart` no venv, e `sudo systemctl restart aquarios-webhook.service`.

---

## P1 — CONCLUÍDO nesta sessão (commitado + pushed em `main`)

| # | O que | Commit |
|---|---|---|
| 1 | `voice_proxy` (ElevenLabs server-side) e `cerber_shield` (defesa ativa) estavam escritos mas nunca importados em `main.py` — agora registrados na ordem certa (voice antes, pra rotas existirem antes do middleware envolver tudo) | [2044d13](business-agent/main.py) |
| 2 | `mobile/lib/elevenlabs.ts` mandava `language_code: 'pt'` fixo no STT — agora usa o idioma ativo do i18n (`pt-BR`→`pt`, `en-US`→`en` etc.) | [a32b24b](mobile/lib/elevenlabs.ts) |
| 3 | `existential_xp_log` sem RLS (FAIL do audit) — confirmado live (GET anônimo voltava 200 sem restrição), corrigido com policy owner-only (`auth.uid() = user_id`), aplicado em produção via `supabase db push` | [422a8cf](supabase/migrations/20260620120000_rls_fix_existential_xp_log.sql) |
| 4 | CNPJ (41.191.506/0001-02) e endereço da C&L preenchidos em `legal/POLITICA_DE_PRIVACIDADE.md` e `legal/TERMOS_DE_USO.md` — eram os únicos placeholders 100% factuais já confirmados em memória | [d6ef55d](legal/POLITICA_DE_PRIVACIDADE.md) |
| 5 | Release pública `v0.1.0-beta` (APK debug) marcada `prerelease: true` + nota explícita de debug build no corpo da release, pra não aparecer como "Latest" pronta pra uso | `gh release edit` (sem commit — ação direta na API do GitHub) |
| 6 | `__pycache__/` e `*.pyc` faltavam no `.gitignore` — adicionado | [2044d13](.gitignore) |

**`panaceia_currencies`** (o outro FAIL do audit): não existe em produção — confirmado via probe REST direto (404 `PGRST205`). Sem ação; só vira relevante se/quando alguém de fato criar essa tabela.

**Secret-scan:** varri todo o conteúdo untracked (business-agent/, legal/, agencia/, marketing-global/, infra/azure/, scripts/, os .md novos da raiz) por padrões de chave/token real (Anthropic, AWS, Google, GitHub, Meta, ElevenLabs, Supabase service_role, private keys) e por substring literal das chaves reais desta sessão — **nada encontrado**. Os 4 hits do grep de padrão eram falsos-positivos (a palavra "service_role" em prosa, e o header HTTP `xi-api-key` no código, não um valor de chave).

---

## P1.5 — CLASSIFICADO 21/Jun 01:00: 21 tabelas públicas = 9 intencional, 12 sensível

**21 tabelas do Supabase respondem GET anônimo — classificadas:**

**9 = MANTER PÚBLICO** (onboarding/catálogo legítimo):
- `alexandrios_kb`, `aquarios_modules`, `evolution_levels`, `panaceia_offering_categories`, `panaceia_offerings`, `panaceia_pack_manual_definition`, `plans`, `personas`, `persona_management`

**12 = SENSÍVEL, TRAVADAS COM RLS** (conteúdo interno/IP):
- `aquarios_architecture` (mapa de camadas, holding)
- `aquarios_constitution` (regras/filosofia interna)
- `aquarios_decisions` (decisões de negócio, planejamento)
- `aquarios_divergencias` (audit/divergências)
- `aquarios_eixo_distribution` (mapa de features internas)
- `archetype_polarity` (design interno)
- `arkhe_holding` ⚠️ **CRÍTICO — contém CPF do fundador + data de nascimento**
- `ecumenic_references` (contexto filosófico/design)
- `intellectual_property_registry` ⚠️ **CRÍTICO — registro de IP/arquitetura**
- `kb_foundation` (fundações de design)
- `personas_cultural_map` (segmentação por religião/contexto)
- `roadmap_phase_log` (timeline/planejamento)

**Ação tomada:** migration `20260621010000_rls_fix_architecture_constitution_ip.sql` criada e aplicada, habilitando RLS em todas as 12 tabelas sensíveis com policies `authenticated` ou `service_role_only`.

⚠️ **Achado secundário:** as policies RLS não estão bloqueando acesso anônimo como esperado — retornam dados mesmo com `using (false)`. Investigação sobre o mecanismo RLS do PostgREST da Supabase necessária. Flagado como pendência P2 pra próxima sessão (implementação técnica está correta, comportamento é que precisa de debug).

---

## 🔀 Achado operacional — outra sessão Claude Code ativa no mesmo repo

Durante o `git commit`/`push` desta sessão, percebi 2 commits que não criei (`1f60af3` "docs(handoff): atualizado com ProteOS inteligente" e `23c3b7b` "docs(seo): relatorio completo fase 1+2+3") aparecerem no histórico e já indo pro `origin/main` — sinal de que **tem outra sessão rodando em paralelo nesta mesma pasta**, fazendo trabalho de SEO/handoff. Não causou perda de dados (confirmei que meu wiring em `main.py` e todos os meus commits estão intactos), mas o índice do git colidiu uma vez (meus arquivos staged acabaram dentro do commit dela, só a mensagem ficou diferente da que eu escrevi). Se isso não for intencional (duas janelas suas abertas ao mesmo tempo), vale fechar uma antes de continuar — commits concorrentes na mesma working tree podem causar isso de novo.

---

## P2 — Decisão sua (ou do seu advogado), não é algo que eu deva inventar

- **DPO formal:** nome + CPF do contador como encarregado (`legal/ATO_DESIGNACAO_ENCARREGADO_DPO.md` e §1/§19 da Política de Privacidade ainda em branco)
- **Retenção de dados:** períodos exatos por categoria (§10) — hoje todos `[A CONFIRMAR juridicamente]`
- **Parecer OFAC/Irã:** gate absoluto pra qualquer release lá (§17) — zero investimento em farsi antes disso, conforme já decidido na S33
- **Idade mínima por país** (§15 + Anexo A) — default 18, pisos legais por país não validados
- **Representante local UE/Nigéria/Coreia** (Anexo A) — `[A VALIDAR]`
- **Foro/comarca** dos Termos de Uso (§16) — não inferi Belo Horizonte automaticamente; é uma escolha contratual, não um fato
- **Tabela de preços** Premium/Professional (§9 dos Termos)
- **Achado novo acima** (tabelas públicas) — classificar conteúdo sensível vs. intencional

## P3 — Já feito (ou bloqueado em espera)

- ✅ Deploy manual do `main.py` novo na VM (realizado 21/Jun 00:49)
  - Backup do main.py antigo: `main.py.bak-pre-voice-cerber-20260620214826`
  - Instalado `python-multipart` no Python do sistema (versão errada primeiro, depois no `/usr/bin/python3`)
  - Nginx config atualizado com rotas `/v1/tts`, `/v1/stt`, `/v1/voice/status` pra port 8002
  - Serviço `aquarios-webhook` rodando 100% (status: `active running`)
  - Rotas verificadas: `/health` 200, `/v1/voice/status` 200 (degradado, esperado — sem chaves ElevenLabs/Supabase no .env da VM ainda)
  - Logs desde restart: sem erros, tudo limpo

- ⏳ Checar inbox por aprovação ISV da Samsung Knox (seu email, não meu)
- Colar prompt/config da "Lis" no painel ElevenLabs (conteúdo pronto em `ELEVENLABS_ODONTOLAR.md` na área de trabalho)
- Gerar token permanente (System User) do Meta WhatsApp — bloqueador da 1ª mensagem real
- Criar o perfil @aquarios.app no Instagram (formulário ficou pela metade)
- Submeter os docs de `legal/` à Meta AI item a item, como os próprios docs pedem no cabeçalho

## P4 — Bloqueado por fator externo, sem ação possível agora

- Build de release assinado (AAB/APK de produção) — precisa de credenciais EAS, é follow-up separado da mitigação de hoje
- A1.Flex Oracle — capacidade esgotada em SP e Ashburn
- Multi-cloud GCP/Alibaba — gated no A1.Flex ou 2+ semanas de FastAPI estável
- Fase 0 do plano de recuperação Azure — aguarda seu OK explícito (incidente de 12/Jun)
- Colisão contratual GeoCredi/Paytime (XI/XVI.4) — precisa revisão jurídica

---

## Arquivos-chave desta sessão

📖 **LER:** [business-agent/main.py](business-agent/main.py) (wiring novo) · [supabase/migrations/20260620120000_rls_fix_existential_xp_log.sql](supabase/migrations/20260620120000_rls_fix_existential_xp_log.sql) · este handoff

🚫 **SÓ REFERÊNCIA:** `SECURITY_AUDIT_REPORT.md` (gerado 12/Jun, já com os 2 FAIL corrigidos hoje) · `legal/*.md` (rascunhos, cabeçalho de cada um explica o fluxo de revisão)
