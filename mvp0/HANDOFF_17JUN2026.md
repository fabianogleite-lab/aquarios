# HANDOFF 17/JUN/2026 → NOVA SESSÃO
## Contexto: Fabiano Gomes Leite | C&L Gestora CNPJ 41.191.506/0001-02
## Repo: fabianogleite-lab/aquarios | Oracle VM: 137.131.158.242:8001 (api.podiumtec.com.br)

> Substitui o handoff anterior. Quase tudo que estava "pendente" foi **executado e verificado**
> nesta sessão. Não rediscutir o que está marcado ✅.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ✅ O QUE FOI ENTREGUE NESTA SESSÃO (16-17/Jun) — não rediscutir
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Sites no ar (GitHub Pages, commit 2265129)
- **podiumtec.com.br/escambos/** — landing EscambOS + `criar.html` (wizard 11 etapas). PT-BR+EN, 2 barras, banner LGPD, badge KYC.
- **podiumtec.com.br/heysky/** — landing heYskY: Space Grotesk, Y's ouro #F5B800, calculadora solar JS puro, CTA telefone (ElevenLabs), scroll infinito, HVP dwell tracking.
- **podiumtec.com.br/investidores.html** — hub expandido p/ **3 projetos** (AquariOS+EscambOS+heYskY): cards overview + seções com TAM/modelo/status. Senha `aquarios2026`.

### Supabase — migrations 60-70 TODAS APLICADAS ✅ (via CLI db push)
60 herme_projetos+wizard · 61 herme_leads CRM · 62 escambos_produtos · 63 escambos_hvp_signals
64 herme_planos · 65 cl_fiscal_nfse · 66 cl_logistica_tracking · 67 índices+3 views
68 cl_cerber_incidents+vw_cerber_report_24h · 69 cpf_hash em herme_leads (Lei 8.934/94)
70 wa_conversation_log+vw_wa_conversa
- ⚠️ NOTA p/ futuros pushes: o remoto tem migrations mobile/ (04-29) de pasta diferente. Se o
  guard "remote not in local" travar: `migration repair --status reverted 04..29` (só bookkeeping).

### Oracle VM — tudo wired e verificado ✅ (commit 9e27442)
- main.py: `core_engine → ranking_endpoint → wa_bridge → cerber` (cerber por último = middleware externo)
- `/v1/rank` (POST) + `/v1/rank/health` — HVP 3 adapters [escambos, odontolar, heysky]
- `/cerber/status`, `/api/v2/health`, `/admin/backoffice` (Bearer), `/v1/ingestao` (HMAC)
- HMAC_SECRET + ADMIN_TOKEN **já estavam setados** (não mexer)
- Rotina reconexão reutilizável: `infra/oracle/reconnect_and_verify.sh`

### WhatsApp ↔ ElevenLabs Voice Bridge — deployado INERTE (commit 9e27442)
- `business-agent/whatsapp_voice_bridge.py`: áudio cliente→STT (transcrito), nosso texto→TTS (voz)+transcrição.
  **Transcreve os 2 lados.** Disclosure de IA no 1º contato. LGPD: só `wa_hash`.
- Rotas: `/webhook/whatsapp` (verify+inbound) · `/wa/reply` (nosso texto→voz) · `/wa/status`
- `send_voice()` serve tanto chatbot quanto operador humano. Cérebro do chatbot = seam (plugar ProteOS depois).
- **Inerte até credenciais** (WA=false EL=false em /wa/status).

### Auditoria CerberOS — 10/10 PASS ✅ (commit ebf6b2b)
- `tests/cerber_audit.py` + log `tests/audit_logs/cerber_audit_2026-06-17T0114Z.log`
- HEALTH(4) · L2 HMAC(2) · L4 idempotência · L6 SQLi tarpit · L7 honeypot · L3 rate-limit — todos PASS
- 41 incidentes gerados foram gravados em `cl_cerber_incidents` (trilha LGPD/ANPD validada)
- **VEREDITO: stack subiu correto e seguro.**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔓 DECISÕES JÁ RESOLVIDAS (as 10 perguntas do handoff anterior)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. **Fonte heYskY** — Space Grotesk (baseline no site). Fundador está ajustando os vetores do logo manualmente (proporção/espaçamento). Confirmar versão final quando pronta.
2. **Cor dos Y** — RESOLVIDO: ouro solar #F5B800.
3. **Domínio** — RESOLVIDO: tudo sob **podiumtec.com.br** (subpáginas /escambos/, /heysky/), exceto odontolarplus.com.br. Sem domínios próprios por ora.
4. **LGPD banner** — APROVADO pelo fundador; implementado em escambos+heysky. ⏳ Falta adicionar no podiumtec.com.br raiz (AquariOS).
5. **KYC EscambOS** — RESOLVIDO: CPF hash mínimo por lei BR (migration 69 aplicada).
6. **User backoffice** — RESOLVIDO: **ambos** (app mobile + web). Ainda não construído.
7. **APK** — verificar crédito EAS e **deixar build na fila** (pendente).
8. **ProteOS widget** — ElevenLabs = **chamada telefônica** (core business, gera aprendizado → bridge WhatsApp). Web = calculadora JS + redirect WhatsApp.
9. **Idiomas** — RESOLVIDO: PT-BR + EN na hero (feito em escambos/heysky).
10. **Investidores** — RESOLVIDO: hub /investidores.html (3 projetos) + landings públicas convivem. **Investidor é o lead principal** desta fase.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🎯 ESCOPO DA PRÓXIMA SESSÃO (em ordem de prioridade)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### P1 — Ativar o WhatsApp Voice Bridge (quando a verificação Meta sair)
- **Bloqueio externo:** número WhatsApp depende da verificação do Meta Business (em curso).
- Quando aprovar: colar no `/etc/hygeios-v2-sprint2.env` (server-side, NUNCA EXPO_PUBLIC):
  `WA_TOKEN`, `WA_PHONE_ID`, `WA_VERIFY_TOKEN`, `ELEVENLABS_API_KEY` (nova — ver P2).
- Apontar webhook Meta → `https://api.podiumtec.com.br/webhook/whatsapp` (já reachable por HTTPS).
- Reiniciar serviço, conferir `/wa/status` → whatsapp_configured:true.

### P2 — Rotacionar chave ElevenLabs exposta (chip já criado)
- `mobile/.env` tem `EXPO_PUBLIC_ELEVENLABS_API_KEY` → vaza no APK. Rotacionar + mover chamadas
  p/ server-side (proxy via VM, padrão que o bridge já usa). A chave NOVA serve o bridge (P1).

### P3 — Backoffice do usuário (mobile + web) — Q6
- Painel do dono do projeto EscambOS: leads (herme_leads) + status + canal + rastreio (cl_logistica_tracking) + iVi 4D.
- Developer backoffice já existe (/admin/backoffice) e agora tem dados (migrations aplicadas) — validar visualmente.

### P4 — SEO Meta/Google (refinar os 3 sites)
- Keyword research (WebSearch) → mapear H1/H2/CTA + Schema.org (FAQPage, Product, LocalBusiness, SoftwareApplication).
- AquariOS: "app saúde mental"/"bem-estar IA" · EscambOS: "renda extra"/"ganhar dinheiro em casa" · heYskY: "energia solar residencial"/"simulador solar".
- CTA alinhado à keyword da seção (não genérico).

### P5 — podiumtec.com.br raiz (AquariOS)
- Banner LGPD (Q4 pendente aqui) + seção "Baixe o App" (QR + instruções APK + link release) + dwell 5min/scroll infinito como nos outros 2.

### P6 — APK fresco (Q7)
- Verificar crédito EAS Free (reseta mensal); enfileirar build novo; trocar link nos sites se sair.

### P7 — Smoke test do app (celular já plugado USB debug)
- Metro via USB: adb reverse tcp:8081 tcp:8081 + 127.0.0.1:8081 (NÃO Expo Go — APK dev).
- Validar ProteOS voice (expo-audio) + iVi 4D vindo da api.podiumtec.com.br.

### P8 — heYskY: ElevenLabs agent de telefone
- Criar agent (consultoria solar) + colar ID em `docs/heysky/index.html` (`_ELEVENLABS_AGENT_ID`).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔒 DECISÕES IRREVERSÍVEIS — não reverter
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- LGPD: SHA-256 antes de gravar; CHECK contra texto claro (user_hash_dop / cpf_hash / wa_hash).
- ISSQN FORA — só PIS 1,65% + COFINS 7,60% (Lucro Real não-cumulativo). IFRS 15 split C&L↔parceiro.
- CerberOS tarpit = asyncio.sleep (defensivo, legal sob Lei 12.737/2012). NÃO contra-ataque.
- Segredos (HMAC/ADMIN/WA/ElevenLabs) = env vars no VM, NUNCA em código nem EXPO_PUBLIC.
- Páginas públicas NUNCA expõem: IP servidor, DRE real, código HVP, alvo IPO, endpoints internos, schema DB.
- Regra de ouro: Conceito → Aprovação → Código. Resposta ≠ aprovação.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🛠️ ACHADO TÉCNICO ABERTO (não-bloqueante)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **Rate-limit L3 atrás do nginx:** `cerber_shield._is_rate_limited` usa `request.client.host`,
  que atrás do nginx é sempre 127.0.0.1 → todo tráfego público divide UM bucket; incidentes hasham
  o IP do proxy. nginx já repassa `X-Forwarded-For`. Fix: middleware ler o 1º IP de XFF.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📌 REFERÊNCIAS RÁPIDAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- SSH: `ssh -i "C:\Users\DWOS\Desktop\AquariOS\ssh-key-2026-05-28.key" opc@137.131.158.242` (warnings post-quantum = ruído)
- Serviço: `hygeios-v2-sprint2` · venv `/home/opc/aquarios-hygeios-v2/venv` · env `/etc/hygeios-v2-sprint2.env`
- Re-rodar auditoria: `sudo bash -c 'set -a; . /etc/hygeios-v2-sprint2.env; set +a; venv/bin/python /home/opc/aquarios-hygeios-v2/cerber_audit.py'`
- Supabase: project agebsmjsjrmazbozphnh (CLI logado+linkado, db push funciona)
- ElevenLabs Lis (odontolar): agent_9901kt7rrbh0fcfsjpxgc4ddee6d · voz cgSgspJ2msm6clMCkdW9
- APK beta: github.com/fabianogleite-lab/aquarios/releases/download/v0.1.0-beta/app-debug.apk
- Commits da sessão: 2265129 (sites) · 9e27442 (bridge+rotina+mig70) · ebf6b2b (auditoria)
