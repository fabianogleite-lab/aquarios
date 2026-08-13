# HANDOFF ESPECIAL — Auditoria Completa do Panteão AquariOS
## Catálogo do Previsto × do Existente, desde o Momento Zero

**Modelo recomendado:** Claude Opus 5 (ou Claude Fable 5, se disponível no seu plano) — não Haiku, em nenhuma versão. Esta tarefa premia profundidade e completude sobre velocidade/custo.
**Esforço recomendado:** máximo (`max`/`xhigh`). Não há prazo. Correção e completude importam mais que economia de tokens.

---

## O que este documento NÃO é

Isto **não é** um handoff de continuidade de sessão como os `HANDOFF_*.md`/`STATUS_FINAL_*.md` espalhados na raiz do repositório — aqueles passam contexto operacional de uma sessão de trabalho pra próxima (o que ficou pendente, o que fazer em seguida). Este é um handoff de **auditoria histórica completa**: sua única tarefa é vasculhar tudo que já foi dito, decidido ou planejado sobre o AquariOS desde o início do projeto, e produzir um compêndio definitivo — o que foi previsto vs. o que existe de fato, agente por agente.

**Quem está lendo isto:** você, numa sessão nova, sem nenhum contexto das conversas anteriores sobre este projeto. Este documento é tudo que você tem — leia com atenção antes de agir.

---

## Missão

Fabiano quer estruturar você como o "cérebro central" do projeto AquariOS — o único lugar que sabe, com certeza, o que foi prometido em algum momento da vida do projeto e o que efetivamente existe em código hoje. Hoje isso não existe: o repositório tem dezenas de arquivos de handoff, status, sessão e planejamento, cada um documentando uma fatia do tempo, sem nenhum lugar que amarre tudo.

Seu trabalho é ler **tudo** — desde o primeiro commit até hoje — e catalogar cada "agente"/módulo/nome próprio do panteão AquariOS: `ProteOS`, `HygeiOS`, `CerberOS`, `SandeirOS`, `HermeOS`, `EteriOS`, `EcumenicOS`, `AsclepiOS`, `AlexandriOS`, `PanaceIA`, `AeropagOS`, `Beck Office`, e **qualquer outro nome que aparecer que não esteja nesta lista** — ela é um ponto de partida verificado até agora, não um teto. O histórico do projeto é maior do que já foi mapeado.

## Regra de ouro — leia isto duas vezes

**Você não decide o que é importante. Você cataloga.**

Se um nome de agente aparece uma única vez, num único parágrafo, num handoff de uma sessão qualquer — isso entra no catálogo. Se dois documentos descrevem o mesmo agente de formas contraditórias — registre a contradição, não escolha qual versão é "a certa". Se você achar um módulo mencionado que nunca apareceu em nenhum código — isso é uma entrada válida no catálogo, com status "só existe em texto". A pergunta que te orienta não é "isso é relevante?" — é **"isso foi dito, em algum lugar, alguma vez?"**.

## O que "mensagens desde o momento zero" significa na prática

Não existe acesso a transcrições brutas de chat — elas não são persistidas em arquivo. O que existe, e é sua fonte de verdade, é:

1. **Todo o histórico de commits** — `git log --all --oneline` desde o commit inicial; `git log -p` ou `git show` nos commits que criaram, renomearam ou descreveram agentes/módulos.
2. **Todo arquivo `.md` do repositório, sem exceção.** Isso inclui, mas não se limita a:
   - Todos os `HANDOFF_*.md`, `STATUS_FINAL_*.md`, `SESSION_*.md`, `REGISTRO_*.md`, `ESTRATEGIA_*.md`, `ESTUDO_*.md` na raiz
   - `mobile/docs/sessions/*.md` (de `SESSION_1_BRIEFING.md` até a mais recente)
   - `mobile/docs/*.md` (WHITE_PAPER, BLUEPRINT, AUDIT_MATRIX_DEVPACK_V4, COMPARATIVE_MANUAL_VS_DEVPACK, 44_EIXOS_DISTRIBUTION_MAP, HELP, etc.)
   - `S16_DECISIONS/*.md`
   - `marketing-global/**/*.md` (incluindo `marketing-global/agencia/`)
   - `legal/*.md`
   - `business-agent/*.md`
   - `escambos/docs/*` (HTML, mas com conteúdo relevante)
   - `mobile/data/divergencias.ts` (é TypeScript, mas é literalmente um registro estruturado de 25 divergências entre fontes — trate como documento de auditoria)
   - Qualquer `.md` que aparecer e não estiver nesta lista — ela é ponto de partida, não teto.
3. **Migrations SQL** (`mobile/supabase/migrations/*.sql`, `supabase/migrations/*.sql`) — a fonte mais confiável sobre o que foi *realmente* deployado. Schema de banco não mente sobre o que existe, mesmo quando a documentação mente ou está desatualizada.
4. **Código-fonte real**: `mobile/services/`, `mobile/hooks/`, `mobile/app/`, `mobile/config/`, `business-agent/*.py`, `shared/`.

---

## Metodologia — siga esta ordem, não pule etapas

### Fase 1 — Levantamento de nomes
Antes de catalogar qualquer coisa, faça um grep amplo pra montar a lista completa de nomes próprios do panteão: todo termo terminado em "OS" (`ProteOS`, `HygeiOS`, `CerberOS`, `SandeirOS`, `HermeOS`, `EteriOS`, `EcumenicOS`, `AsclepiOS`, `AlexandriOS`...), mais nomes sem "OS" que ainda assim são "motores"/"sistemas" (iVi Engine, Bardo Engine, Data Lake, PanaceIA, AeropagOS, 22 Arcanos/SandeirOS, Constituição AquariOS, IP Registry, HygeiOS Stages, EternalMaze, adm_ai gate, BYOK...). **Publique essa lista primeiro**, antes de detalhar qualquer agente — isso serve de checkpoint pra revisão antes de você investir tempo no detalhamento.

### Fase 2 — Um dossiê por nome
Para cada agente/módulo da lista da Fase 1, abra uma seção com:
- **Todas as menções encontradas** — arquivo, trecho citado literalmente (não parafraseado), e sessão/data quando existir.
- **O que existe em código hoje** — `arquivo:linha` real, com nota se foi testado/rodado ou só escrito e nunca exercitado.
- **Divergências** — quando duas fontes descrevem o mesmo agente de formas diferentes. Exemplo já confirmado nesta auditoria: `AsclepiOS` é simultaneamente "filtro de segurança de texto" (implementado, `mobile/services/asclepiOS.ts`) e "módulo médico inteligente" (hipotético, `status: coming_soon` no registry) — os dois coexistem sob o mesmo nome, em fontes diferentes.
- **Status final**: `implementado` | `parcial` | `só planejado` | `abandonado` (mencionado uma vez e nunca mais) | `conflitante` (duas descrições incompatíveis coexistindo).

### Fase 3 — Compêndio consolidado
Depois de todos os dossiês, monte um documento síntese: uma tabela única, um agente por linha, com status e referência à seção detalhada. É o resumo executivo — mas ele **complementa** o detalhe, nunca o substitui.

### Regras de execução
- **Trabalhe incrementalmente.** Vá escrevendo o catálogo num arquivo conforme avança — não segure tudo na memória pra escrever só no fim. Se a sessão for interrompida, o trabalho parcial já está salvo e commitado.
- **Use sub-agentes de exploração em paralelo** (Explore/general-purpose) pra dar conta do volume — mas cada sub-agente deve devolver citações exatas (arquivo + trecho), nunca resumos vagos sem fonte rastreável.
- **Nunca aceite um documento de planejamento como prova de que algo existe.** A única prova de "existe" é código real. Isso já pegou pelo menos um erro concreto nesta auditoria: vários módulos marcados `active` numa tela do app (`fitness`, `meditacao`, `longevidade`) não tinham nenhuma linha de código por trás — nem service, nem hook, nem tela com lógica própria.
- **Não pule arquivo nenhum por ele "parecer" repetitivo ou desatualizado.** É exatamente nos arquivos antigos e aparentemente redundantes que ficam as promessas esquecidas que este catálogo existe pra capturar.

---

## Ponto de partida — descobertas já verificadas (não substitui a revisão completa)

Estas descobertas já foram confirmadas com evidência de código numa sessão anterior de auditoria parcial. Use como semente pro dossiê de cada agente, mas **revise-as de novo** dentro do processo completo — não as aceite por herança sem checar a fonte.

- **ProteOS** é o único agente com LLM real rodando hoje, em dois backends divergentes: `mobile/supabase/functions/chat/index.ts` (chat do app, Deno) e `business-agent/main.py` + `business-agent/agents_graph.py` (WhatsApp, Python/LangGraph). Os prompts de segurança desses dois backends já divergiram uma vez (corrigido depois, extraído pra `business-agent/prompts.py`) — checar se o lado TS/app ainda tem prompt duplicado em vez de importado de fonte única.
- **AsclepiOS** = dois papéis sob o mesmo nome (ver Fase 2 acima).
- **CerberOS** — por muito tempo foi só `throw new Error('S16: not implemented')` em `mobile/services/cerberos.ts` (placeholder puro, 7 camadas nunca implementadas). Um escopo menor e real foi implementado depois em `business-agent/agents_graph.py` (`_cerberos_gate`): gate de autorização de módulo baseado em `shared/os_registry.json`, não uma defesa ativa de 7 camadas. Checar se `mobile/services/cerberos.ts` ainda está em placeholder — provavelmente sim.
- **`shared/os_registry.json`** — registry de "isso é invocável por agente hoje?", deliberadamente diferente de `mobile/config/modules-registry.ts` (que descreve visibilidade de card na UI). Confirmar se essa distinção ainda é respeitada ou se algum código passou a tratar os dois registries como intercambiáveis.
- **SandeirOS, HermeOS, EteriOS, EcumenicOS, PanaceIA, AeropagOS, Beck Office, AsclepiOS "clínico"** — sem nenhuma linha de código além do card de registry, na auditoria feita em 13/08/2026. Confirmar se algo mudou.
- **`preventiva`, `sono`, `estresse`, `energia`** — só aparecem como palavra-chave de matching dentro de heurísticas (`useIntentRouter.ts`, `useCommunityRouter.ts`), não como lógica de módulo própria.
- **`nutricao`** — é o único dos "módulos de bem-estar" com tela real e dado real no Supabase (`app/(app)/nutricao.tsx`, tabela `meals`), mas ainda sem função invocável por um agente.

---

## Onde salvar o resultado

Grave o compêndio em `auditoria/COMPENDIO_PANTEAO_AQUARIOS.md`, commitando incrementalmente conforme cada fase avança — não espere terminar tudo pra fazer o primeiro commit. Se o catálogo ficar extenso, divida em múltiplos arquivos dentro de `auditoria/` (um por fase, ou um por grupo de agentes), com um índice em `auditoria/COMPENDIO_PANTEAO_AQUARIOS.md` apontando pra cada um.

## O que você NÃO deve fazer

- **Não resuma pra caber num tamanho "razoável".** Se o catálogo ficar longo, ele fica longo.
- **Não filtre por "o que pareceria relevante para um leitor genérico".** O critério é só: "isso foi dito em algum lugar do histórico do AquariOS?"
- **Não escolha uma versão "vencedora"** quando duas fontes divergem sobre o mesmo agente — registre as duas, com suas fontes.
- **Não pare a auditoria por falta de tempo/contexto sem deixar isso explícito.** Se você tiver que parar no meio, registre claramente em `auditoria/COMPENDIO_PANTEAO_AQUARIOS.md` o que já foi coberto e o que falta, pra a próxima sessão continuar exatamente daí — não do zero.
