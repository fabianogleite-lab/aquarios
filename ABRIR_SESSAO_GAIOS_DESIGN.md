# ▶️ ABRIR PRÓXIMA SESSÃO: GaiOS — Consolidação no MVP1 (+ backup Azure)
> ⚠️ Este doc **SUPERA** a versão anterior ("design do trail/migration" — escopo estreito demais).
> **GaiOS já foi DEFINIDO** (árvore canônica, 23/Jun). A próxima fase é **CONSOLIDAR tudo-que-é-GaiOS** (= todo o código/sistema) no `mvp1/` + backup Azure, pra ter **controle total código→sistema** antes de rodar o MVP2.

## O que mudou (ler primeiro)
- **GaiOS = o sistema/substrato ≡ AquariOS-código** (não é só "trail/governança"). Árvore canônica + apanhado completo em **`APANHADO_GAIOS_ALINHAMENTO_MVP2.md`** (raiz) e memória `project_cerberos`.
- O **trail WORM / migration de auditoria** continua existindo, mas é só **UMA sub-função de governança DENTRO do GaiOS** — não o cerne.
- **Árvore canônica** (resumo): GaiOS ⊃ NÚCLEO[ProteOS·HygeiOS(1º hub)·CerberOS(núcleo)·SandeirOS(2º hub: 140 subagentes + EcumenicOS interno + 22 arcanos)] + FACES[AsclepiOS=saúde·HermeOS·EteriOS·AlexandriOS·AeropagOS⊃Comunidades] + ECONOMIA[PanaceIA→TKN]. Fora: EscambOS/OdontolarPlus/heYskY = exemplos enterprise.

## CONTEXTO herdado (não refazer)
- **Fix #1** (`META_APP_SECRET`) de-hardcodeado local; **rotação na Meta = pendente (fundador)**; histórico `2044d13` entra no rewrite de sigilo pendente.
- Decisões travadas: **Defender + Sentinel no MVP1** (gated "cria"+budget) · **selos por-ente** · **Synapse/ADLS/AI Search/Cosmos fora**.
- **CerberOS+Hardening** (execução presencial/redeploy) **ainda pendente** → `ABRIR_SESSAO_CERBEROS_HARDENING.md`.

## EXECUTAR — Consolidação GaiOS no MVP1
1. **Inventariar tudo-que-é-GaiOS** = todo o código do sistema (núcleo ProteOS/HygeiOS/CerberOS/SandeirOS + faces + economia), usando a árvore canônica como mapa.
2. **Aplicar o filtro importante×não** de `ESCOPO_ARVORE_MVP1.md` / `ESCOPO_DETALHADO_MVP1.md` ao recorte GaiOS.
3. **Consolidar no `mvp1/`** (dual-write: mvp0 baseline + mvp1 ativo, como já decidido).
4. **Resolver as confusões** do apanhado (LIVRO defasado · migrations duplicadas · `ARCHITECTURE_HYGEIOS_V2` só na branch · `44_EIXOS` superado · PanaceIA papel duplo · código `backend/hygeios/`).
5. **Backup Azure Blob** do `mvp1/` (container `mvp1-backup`, assinatura CEL) — ⚠️ exige **criar storage account** = billable/gated ("cria" + budget alert).

## 🚫 TRAVAS (não violar)
- **Nada de push** (sigilo de histórico pendente — `security_sigilo_leak_repo_docs`).
- **Azure faturável** (storage account / Defender / Sentinel) só com **"cria" + budget alert**.
- **Formalizar GaiOS no `AQUARIOS_LIVRO.md` = ADIADO** pelo fundador ("não precisa por agora") — **não fazer ainda**.
- **Rebuild/redeploy** do Container App = presencial (sessão CerberOS+Hardening).
- **Sigilo humanizador**: codinomes neutros; nunca nomear livros/autores.
