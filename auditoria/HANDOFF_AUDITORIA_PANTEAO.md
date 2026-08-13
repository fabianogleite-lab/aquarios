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

Não existe acesso a transcrições brutas de chat — elas não são persistidas em arquivo. Sua fonte de verdade é o corpus documental e de código do repositório inteiro, desde o primeiro commit — a lista exata de onde procurar está organizada como as 6 sessões de trabalho, na seção de Metodologia abaixo. Duas fontes merecem nota à parte por não serem óbvias:

- `escambos/docs/*` é HTML, não Markdown, mas tem conteúdo relevante — não pule por causa da extensão.
- `mobile/data/divergencias.ts` é TypeScript, mas é literalmente um registro estruturado de 25 divergências entre fontes já catalogadas antes — trate como documento de auditoria, não como código.

---

## Metodologia — siga esta ordem, não pule etapas

O corpus é grande demais pra processar de uma vez sem perder profundidade. O trabalho é dividido em **6 sessões numeradas** (cada uma cobrindo um grupo de fontes), e **dentro de cada sessão você lê o material 2 vezes**, com um propósito diferente em cada leitura. Uma sessão só termina depois das 2 leituras — não são leituras intercambiáveis, cada uma tem um trabalho próprio.

### Passo 0 — Levantamento preliminar de nomes (antes da Sessão 1)
Faça um grep amplo pelo repositório inteiro pra montar a lista inicial de nomes próprios do panteão: todo termo terminado em "OS" (`ProteOS`, `HygeiOS`, `CerberOS`, `SandeirOS`, `HermeOS`, `EteriOS`, `EcumenicOS`, `AsclepiOS`, `AlexandriOS`...), mais nomes sem "OS" que ainda assim são "motores"/"sistemas" (iVi Engine, Bardo Engine, Data Lake, PanaceIA, AeropagOS, 22 Arcanos, Constituição AquariOS, IP Registry, HygeiOS Stages, EternalMaze, adm_ai gate, BYOK...). Essa lista é o ponto de partida das categorias do catálogo — **não é um teto**: qualquer sessão pode adicionar um nome novo a qualquer momento.

### As 6 sessões

1. **Documentos-raiz** — `HANDOFF_*.md`, `STATUS_FINAL_*.md`, `REGISTRO_*.md`, `ESTRATEGIA_*.md`, `ESTUDO_IPO_*.md`, `DASHBOARD.md`, `COMPLETE_ROADMAP_TO_PLAYSTORE.md`, `AUDITORIA_21_TABELAS_PUBLICAS.md`, `MAPA_AQUARIOS_x_15_PRINCIPIOS_META.md`, e qualquer outro `.md` solto na raiz.
2. **Sessões de desenvolvimento do app** — `mobile/docs/sessions/*.md` (de `SESSION_1_BRIEFING.md` até a mais recente, incluindo `MASTER_PLAN.md` e `PHASE_4_COMPLETE.md`).
3. **Governança e arquitetura declarada** — `mobile/docs/*.md` fora de `sessions/` (WHITE_PAPER, BLUEPRINT, AUDIT_MATRIX_DEVPACK_V4, COMPARATIVE_MANUAL_VS_DEVPACK, 44_EIXOS_DISTRIBUTION_MAP, HELP, ARCHITECTURE_WEB_PAYMENTS) + `S16_DECISIONS/*.md`.
4. **Negócio, marketing e legal** — `marketing-global/**/*.md`, `legal/*.md`, `business-agent/*.md`.
5. **Verdade objetiva: git + banco** — `git log --all --oneline` completo; `git log -p`/`git show` nos commits que criam/renomeiam agentes; `mobile/supabase/migrations/*.sql`; `supabase/migrations/*.sql`. Schema de banco e histórico de commit não mentem sobre o que foi de fato feito, mesmo quando a documentação mente ou está desatualizada.
6. **Código-fonte real** — `mobile/services/`, `mobile/hooks/`, `mobile/app/`, `mobile/config/`, `business-agent/*.py`, `shared/`.

Se mesmo uma sessão sozinha for grande demais pro seu contexto, sub-divida ela (por data, por subpasta) — mas a regra das 2 leituras se aplica a cada subdivisão também, não só à sessão como um todo.

### Dentro de cada sessão: 2 leituras com propósitos diferentes

**1ª leitura — captura e classificação.** Percorra o material da sessão. Para cada menção de agente/módulo encontrada, registre: arquivo, trecho citado literalmente (não parafraseado), sessão/data quando existir — e já classifique essa entrada sob o agente correspondente no catálogo, no arquivo de saída (não deixe pra classificar depois de memória). Se aparecer um nome que não está na lista do Passo 0, adicione-o ali mesmo.

**2ª leitura — verificação e detecção de loop.** Releia o mesmo material da sessão. Pra cada entrada já classificada na 1ª leitura, pergunte: *"essa classificação estava certa?"* e *"esse trecho é sobre um agente só, ou é uma junção de dois ou mais?"*. Um trecho é um **loop** quando o mesmo evento, decisão ou pedaço de código amarra dois (ou mais) agentes ao mesmo tempo — exemplo real já confirmado: "CerberOS bloqueia uma chamada de tool do ProteOS" é ao mesmo tempo uma entrada de CerberOS (o que ele faz) e de ProteOS (o que ficou impedido de fazer). Quando identificar um loop:
- A entrada completa (citação + evidência) fica sob o agente mais central ao evento — normalmente quem *age*, não quem só é afetado — mas documente por que escolheu esse.
- Em cada outro agente envolvido, adicione um **sub-item de referência cruzada**, curto: `🔁 Loop com [Agente Principal] — <descrição de uma linha>. Ver seção de [Agente Principal].`
- **A referência cruzada é obrigatória, mesmo sendo só uma linha.** Nunca deixe um agente de fora de um loop que o envolve só porque a citação completa já está registrada em outro lugar — a regra de ouro ("nada fica de fora") vale pra cada categoria que o trecho toca, não só pra uma.

Corrija na 2ª leitura qualquer classificação errada da 1ª — a 1ª leitura é rascunho vivo, a 2ª é o que fica.

### Consolidação final — depois das 6 sessões

1. Junte os dossiês parciais de cada sessão num dossiê único por agente. Um mesmo agente normalmente vai ter entradas vindas de sessões diferentes — ex.: uma promessa na Sessão 1 (handoff), uma decisão de arquitetura na Sessão 3 (governança), e a implementação real (ou a ausência dela) na Sessão 6 (código).
2. Essa é a fase que resolve os **loops entre sessões**: se a Sessão 1 registrou uma promessa sobre um agente e a Sessão 6 achou (ou não achou) o código correspondente, una essas duas entradas explicitamente no dossiê final do agente, apontando se a promessa foi cumprida, ficou parcial, ou nunca saiu do papel.
3. Gere a tabela síntese final: um agente por linha, status consolidado, e uma coluna contando em quantos loops (com quais outros agentes) ele aparece.
4. Cada dossiê final de agente deve trazer, junto com suas entradas próprias, a lista de sub-itens `🔁 Loop com...` recebidos de outras seções — isso é o que garante que um agente que só aparece "de raspão" em menções de outros ainda tenha uma seção completa e navegável.

### Regras de execução (valem pra todas as sessões)
- **Trabalhe incrementalmente.** Vá escrevendo o catálogo no arquivo de saída conforme avança cada leitura — não segure tudo na memória pra escrever só no fim. Se o trabalho for interrompido, o que já foi feito está salvo e commitado.
- **Commit ao final de cada sessão** (não só ao final de tudo) — isso te dá 6 checkpoints, não 1.
- **Use sub-agentes de exploração em paralelo** (Explore/general-purpose) pra dar conta do volume dentro de uma sessão — mas cada sub-agente deve devolver citações exatas (arquivo + trecho), nunca resumos vagos sem fonte rastreável, e ainda assim passa pelas 2 leituras (o sub-agente pode fazer a 1ª, mas a 2ª — verificação e detecção de loop — exige visão do conjunto, então normalmente cabe a você, não a um sub-agente isolado).
- **Nunca aceite um documento de planejamento como prova de que algo existe.** A única prova de "existe" é código real. Isso já pegou pelo menos um erro concreto nesta auditoria: vários módulos marcados `active` numa tela do app (`fitness`, `meditacao`, `longevidade`) não tinham nenhuma linha de código por trás — nem service, nem hook, nem tela com lógica própria.
- **Não pule arquivo nenhum por ele "parecer" repetitivo ou desatualizado.** É exatamente nos arquivos antigos e aparentemente redundantes que ficam as promessas esquecidas que este catálogo existe pra capturar.

---

## Ponto de partida — descobertas já verificadas (não substitui a revisão completa)

Estas descobertas já foram confirmadas com evidência de código numa sessão anterior de auditoria parcial. Use como semente pro dossiê de cada agente, mas **revise-as de novo** dentro do processo completo — não as aceite por herança sem checar a fonte.

- **ProteOS** é o único agente com LLM real rodando hoje, em dois backends divergentes: `mobile/supabase/functions/chat/index.ts` (chat do app, Deno) e `business-agent/main.py` + `business-agent/agents_graph.py` (WhatsApp, Python/LangGraph). Os prompts de segurança desses dois backends já divergiram uma vez (corrigido depois, extraído pra `business-agent/prompts.py`) — checar se o lado TS/app ainda tem prompt duplicado em vez de importado de fonte única.
- **AsclepiOS** = dois papéis diferentes sob o mesmo nome — não é um caso de loop (não é um trecho cruzando categorias), é o próprio nome tendo sido reaproveitado pra duas coisas distintas. Registre os dois papéis como entradas separadas dentro da mesma seção `AsclepiOS`, cada um com sua fonte.
- **CerberOS** — por muito tempo foi só `throw new Error('S16: not implemented')` em `mobile/services/cerberos.ts` (placeholder puro, 7 camadas nunca implementadas). Um escopo menor e real foi implementado depois em `business-agent/agents_graph.py` (`_cerberos_gate`): gate de autorização de módulo baseado em `shared/os_registry.json`, não uma defesa ativa de 7 camadas. Checar se `mobile/services/cerberos.ts` ainda está em placeholder — provavelmente sim.
- **`shared/os_registry.json`** — registry de "isso é invocável por agente hoje?", deliberadamente diferente de `mobile/config/modules-registry.ts` (que descreve visibilidade de card na UI). Confirmar se essa distinção ainda é respeitada ou se algum código passou a tratar os dois registries como intercambiáveis.
- **SandeirOS, HermeOS, EteriOS, EcumenicOS, PanaceIA, AeropagOS, Beck Office, AsclepiOS "clínico"** — sem nenhuma linha de código além do card de registry, na auditoria feita em 13/08/2026. Confirmar se algo mudou.
- **`preventiva`, `sono`, `estresse`, `energia`** — só aparecem como palavra-chave de matching dentro de heurísticas (`useIntentRouter.ts`, `useCommunityRouter.ts`), não como lógica de módulo própria.
- **`nutricao`** — é o único dos "módulos de bem-estar" com tela real e dado real no Supabase (`app/(app)/nutricao.tsx`, tabela `meals`), mas ainda sem função invocável por um agente.

---

## Onde salvar o resultado

Grave o compêndio em `auditoria/COMPENDIO_PANTEAO_AQUARIOS.md`, commitando ao final de cada uma das 6 sessões — não espere terminar tudo pra fazer o primeiro commit. Se o catálogo ficar extenso, divida em múltiplos arquivos dentro de `auditoria/` (um por sessão, ou um por grupo de agentes), com um índice em `auditoria/COMPENDIO_PANTEAO_AQUARIOS.md` apontando pra cada um.

## O que você NÃO deve fazer

- **Não resuma pra caber num tamanho "razoável".** Se o catálogo ficar longo, ele fica longo.
- **Não filtre por "o que pareceria relevante para um leitor genérico".** O critério é só: "isso foi dito em algum lugar do histórico do AquariOS?"
- **Não escolha uma versão "vencedora"** quando duas fontes divergem sobre o mesmo agente — registre as duas, com suas fontes.
- **Não pare a auditoria por falta de tempo/contexto sem deixar isso explícito.** Se você tiver que parar no meio, registre claramente em `auditoria/COMPENDIO_PANTEAO_AQUARIOS.md` o que já foi coberto e o que falta, pra a próxima sessão continuar exatamente daí — não do zero.
