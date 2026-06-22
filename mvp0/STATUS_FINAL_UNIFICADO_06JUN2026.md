# 🔄 STATUS FINAL UNIFICADO — Convergência S24/S25
## AquariOS · 07/06/2026 · Trilhas 1-5 fechadas, Trilha 6 bloqueada (servidor inacessível — aguardando ação no Console Oracle)

**Este documento é um DELTA — não recomeça do zero.** Assume `STATUS_FINAL_UNIFICADO_27MAY2026.md`
como baseline e registra só o que mudou desde então + o plano daqui pra frente. Pra
histórico completo de qualquer item, siga as referências — esse é o ponto: enxuto agora,
rastreável sempre.

---

## 1. O que mudou desde 27/05

### Sites & presença digital (02-06/06)
- AquariOS no ar em `podiumtec.com.br` — site completo (7 seções, 5 agentes, waitlist,
  parceiros), nav institucional, download de APK beta, proteção de IP, página de
  investidores com roadmap até IPO (`7049da9`, `281a2a2`, `751c62c`, `a14d666`)
- HTTPS resolvido em **podiumtec.com.br** e **odontolarplus.com.br** (apex+www, Let's
  Encrypt + Enforce HTTPS)
- Chatbot ElevenLabs ("Lis") integrado em odontolarplus — falta só colar o prompt PT-BR
  no painel (já redigido em `ELEVENLABS_ODONTOLAR.md`)
- E-mail corporativo 80% pronto (ImprovMX + Brevo SMTP) — falta DNS no registro.br
- Dashboard com 6 ferramentas diárias + home dashboard-driven (`6aca8bb`)
- i18n da home traduzível PT/EN/ES (`fc12337`)

### Fechamento de dívidas técnicas — Sessão 24 (06-07/06)
- 3 commits na branch `feat/s24-build-tools`: RLS read hardening (`77480da` — fecha ciclo
  migrations 17/18/23), `upsert_bot_persona` (`242ce5c` — 4 iterações até alinhar com o
  schema real de `community_posts`), unificação da fórmula Social do iVi (`171cb71` —
  fecha "Conflito 2")
- PR [#9](https://github.com/fabianogleite-lab/aquarios/pull/9) aberta — bundla os 5
  commits da branch
- Trigêmeos operacional/instalação validados (Oracle/AWS/Alibaba) — ver §2

### Higiene git (esta sessão — Trilha 1)
- PR [#1](https://github.com/fabianogleite-lab/aquarios/pull/1) **mergeada** (`06e7e45e`)
- PR [#4](https://github.com/fabianogleite-lab/aquarios/pull/4) **fechada** com comentário
  explicativo — achado: 31/32 arquivos do changeset já existiam em `main` por outro
  caminho (PRs #5-8); o único exclusivo (`faqEngine.ts`) é um placeholder vazio

### Arquitetura documentada (esta sessão — Trilhas 3 e 4)
- [`mobile/docs/ARCHITECTURE_HYGEIOS_V2.md`](mobile/docs/ARCHITECTURE_HYGEIOS_V2.md) —
  síntese A+B+C (Python substitui motor iVi/analytics, complementa auth/RLS via Supabase,
  `.py` vira spec/cola) + decisão de deploy "terceira via" (git + dependências travadas)
- Escopo pronto pra 2 das 3 dívidas críticas do MEMORY.md: `calculate_ivi` 3D→4D (função
  já dormente — troca é `CREATE OR REPLACE` de baixo risco) e unificação de nomes de
  dimensão (4 gerações coexistindo, mapeadas ponto a ponto)

---

## 2. Arquitetura validada — duas camadas, propositalmente sem se misturar

A confusão que gerou retrabalho na S24 foi tentar encaixar a distribuição operacional
dentro do plano de réplica geográfica (ou vice-versa). São duas camadas paralelas, cada
uma respondendo a uma pergunta diferente:

| Camada | Responde | Distribuição (validada 06/06) | Detalhe completo |
|---|---|---|---|
| **Operacional** ("trigêmeos") | Onde cada módulo *roda/mora* | 🔵 Oracle = HygeiOS + CerberOS + Core/Compartilhado · 🟣 AWS = ProteOS + SandeirOS · 🟨 Alibaba = Comunidades + AeropagOS + PanaceIA | `scope_modular_aquarios.md` |
| **Backup/replicação** (tri-cloud) | Quem *assume* se outro cair | AWS = PRIMARY (Americas/EU) · Oracle = SECONDARY (failover global) · Alibaba = TERTIARY (Ásia-Pacífico) — réplica triplex completa | `STATUS_FINAL_UNIFICADO_27MAY2026.md` §S18 |

O detalhe que fecha o entendimento de vez: **os mesmos 3 provedores aparecem nas duas
tabelas com papéis diferentes** — ex.: Oracle "mora" o HygeiOS na camada operacional, mas
vira "secundário global de failover" na camada de backup. Não é contradição — é a mesma
infraestrutura fazendo dois trabalhos que não se tocam.

---

## 3. As 6 trilhas — status nesta convergência

| # | Trilha | Entregou | Status |
|---|---|---|---|
| 1 | Higiene git | Merge da PR#1, fechamento da PR#4 | ✅ feito nesta sessão |
| 2 | Fechar gaps de entendimento | Narrativa Migration 11 (infra de pagamento dormente), cruzamento previsto×roadmap, check de OTA (esqueleto não-funcional) | ✅ feito |
| 3 | Arquitetura HygeiOS v2 | `ARCHITECTURE_HYGEIOS_V2.md` — síntese A+B+C + "terceira via" documentadas | ✅ feito |
| 4 | Preparar (sem executar) as 3 dívidas críticas | `calculate_ivi` 3D→4D mapeado, rename de dimensões mapeado — PR#4 já resolvida de graça pela Trilha 1 | ✅ feito |
| 5 | Convergência | Este documento | ✅ você está lendo |
| 6 | Realizar a "terceira via" | Reconhecimento + início do deploy (git+lockfile) no Oracle VM | ⛔ bloqueada — sinal recebido ("confirmo"), reconhecimento feito (servidor "zerado": git ausente, RAM real de 498Mi já trocando swap em repouso — mais apertada que o esperado); 1º passo (`dnf install git`) saturou o servidor além do esperado e ele **não voltou a responder por SSH** depois de 20+ minutos — não é mais "lento", é sintoma de esgotamento de memória que não se autorrecupera. Indiquei checar o **Console da Oracle Cloud** (acesso out-of-band, independente de SSH/rede do SO); nada em risco — servidor estava vazio, nada implantado ainda. Aguardando seu retorno sobre como prosseguir |

---

## 4. Sequência de deploy confirmada

> Trilhas 1-5 (paralelas, sem ordem entre si) → **Trilha 6** (monta de fato o mecanismo
> git+lockfile no Oracle VM) → upload geral pro servidor

Com 1-5 fechadas, a Trilha 6 foi autorizada ("confirmo") e começou a rodar — mas trombou
num obstáculo de infraestrutura (servidor saturado e inacessível por SSH) que está fora do
meu alcance resolver sozinho. O portão real agora não é mais "pode começar?", e sim "como
seguir com o servidor travado?" — ver linha "Decidir o destino do servidor travado" no §5.

---

## 5. O que falta

| Item | Tipo | Status |
|---|---|---|
| **Trilha 6** — montar o deploy git+lockfile no Oracle VM | Execução de risco | ⛔ **Bloqueada — precisa de você.** `dnf install git` saturou o servidor (RAM real de 498Mi, já sob pressão em repouso) e ele não voltou a responder por SSH muito além do tempo esperado — sinal de esgotamento de memória, não de lentidão passageira. **Ação sugerida:** checar o **Console da Oracle Cloud** (acesso out-of-band — não depende de SSH nem da rede do SO) pra ver o estado real e, se preciso, reiniciar a instância. Risco da operação: baixo — o servidor está vazio, nada foi implantado, não há nada a perder |
| **Decidir o destino do servidor travado** — checar Console Oracle vs. seguir tentando reconectar | Decisão sua | 🆕 Pendência aberta nesta sessão — perguntei e você ainda não respondeu (a conversa migrou pra outras tarefas antes da resposta). Não vou tomar essa decisão sozinho porque envolve acesso a um sistema fora do alcance do meu SSH |
| **Classificar AlexandriOS** — sistema de Help Engine fora do modelo de 5 agentes | Decisão de arquitetura/produto | 🆕 Achado 07/06 (varredura de estrutura de arquivos) — `mobile/services/alexandrios.ts` é sucessor nomeado e registrado do antigo `faqEngine.ts`, **item 25 do Intellectual Property Registry (Lei 9.610)**, citado no Manual V1.0512 como o "help engine" canônico. Decidir se vira 6º agente formal no `AQUARIOS_LIVRO.md` ou fica como subsistema do ProteOS — registrado em `scope_modular_aquarios.md` |
| **Classificar 2 telas sem agente claro** (`divergencias.tsx`, `wonder-night.tsx`) | Decisão de produto | 🆕 Achado 07/06 — não batem com nenhum dos 9 módulos UX nem dos 5 agentes conhecidos; hipóteses (não confirmadas, sem urgência) registradas em `scope_modular_aquarios.md` §"A classificar" |
| **Limpeza de 3 arquivos órfãos/residuais** (`mobile/src/App.jsx`, `mobile/mobile/docs/EXECUTE_S12_SQL.md`, `mobile/memory/session19_handoff.md`) | Cleanup — baixa prioridade | 🆕 Achado 07/06 na varredura de estrutura — candidatos a remoção/realocação (código não referenciado, doc duplicado dentro de pasta aninhada `mobile/mobile/`, handoff de sessão fora do sistema de memória oficial). Sem urgência; registrado pra não se perder |
| **Executar** `calculate_ivi` 3D→4D | Execução (baixo risco — função dormente, sem caller) | Escopo pronto (Trilha 4) — aguardando sinal |
| **Executar** unificação de nomes de dimensão | Execução (4 pontos mapeados) | Escopo pronto (Trilha 4) — aguardando sinal |
| **Reestimativa Multi-Skin** (13 skins propostos pro MVP) | Análise | ⚠️ Não fiz ainda — o handoff original listava como 4ª entrada desta convergência, mas ficou fora do escopo de 5 seções que você aprovou pra este documento. Registro aqui pra não se perder: é follow-up natural — roda isolado ou abre a próxima sessão |
| **OTA / expo-updates** no app mobile | Configuração | Backlog — achado da Trilha 2 (esqueleto não-funcional: sem `url` no `app.json`, sem `expo-updates` instalado, sem `channel` nos profiles do `eas.json`). Mesmo princípio da "terceira via" (atualizar só o delta), peça mobile ainda em aberto |

---

*Convergência gerada nesta sessão (07/06/2026) a partir das Trilhas 1, 2, 3 e 4 fechadas.
Documento anterior: `STATUS_FINAL_UNIFICADO_27MAY2026.md` — continua valendo como baseline
de governança e do plano tri-cloud.*

**Atualizações pós-geração (mesma sessão, 07/06):** este documento deixou de ser só uma
foto e passou a registrar o **estado real da execução da Trilha 6** (§3, §4, §5) à medida
que ela rodou e travou — incluindo o incidente do servidor Oracle, ainda em aberto. Ele
também ganhou **3 pendências novas** (§5) que vieram de uma varredura de estrutura de
arquivos pedida à parte (fora do escopo das 6 trilhas): a classificação do AlexandriOS,
2 telas sem agente claro e 3 arquivos candidatos a limpeza — todas detalhadas e
cross-referenciadas em `scope_modular_aquarios.md`, que recebeu a mesma atualização.
