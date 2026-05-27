# 44 Eixos → 8 Módulos · Mapa Operacional

**Decisão D-09 (27/05/2026):** os 44 eixos do DEVPACK M-12 NÃO viram módulos próprios. São distribuídos como FEATURES dentro dos 8 módulos atuais. Questionários conversacionais do ProteOS guiam personas a descobrirem seu arcano SandeirOS (1 de 22).

**Princípio:** *o usuário interage com módulos · os eixos são as ferramentas internas · os arquétipos são a leitura simbólica oculta que HygeiOS faz dessa interação.*

---

## Camadas do Sistema (depois da decisão D-09)

```
┌──────────────────────────────────────────────────────────────────┐
│  CAMADA 4 — ARCANOS (oculto, SandeirOS)                          │
│  22 Major Arcana · is_public=false · HygeiOS lê, usuário não vê  │
└──────────────────────────────────────────────────────────────────┘
                              ↑
                              │ HygeiOS infere
                              │
┌──────────────────────────────────────────────────────────────────┐
│  CAMADA 3 — ARQUÉTIPOS MANIFESTOS (público, EcumenicOS)          │
│  10 universais: Buscador, Curador, Mestre, Guerreiro, Místico,   │
│  Criador, Ponte, Testemunho, Louco, Ancião                       │
└──────────────────────────────────────────────────────────────────┘
                              ↑
                              │ Questionários ProteOS
                              │ (conversação não-invasiva)
                              │
┌──────────────────────────────────────────────────────────────────┐
│  CAMADA 2 — EIXOS (44 funcionais, distribuídos)                  │
│  Cada eixo vive dentro de UM dos 8 módulos como feature          │
└──────────────────────────────────────────────────────────────────┘
                              ↑
                              │ Usuário toca/usa
                              │
┌──────────────────────────────────────────────────────────────────┐
│  CAMADA 1 — MÓDULOS (8 visíveis na UI)                           │
│  AeropagOS · PanaceIA · CerberOS · SandeirOS                     │
│  AsclepiOS · HermeOS · EteriOS · EcumenicOS                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Distribuição dos 44 Eixos

### 🏛 AeropagOS (gamificação · 8 eixos)
| Eixo DEVPACK | Função | Arcano Revelado |
|---|---|---|
| social-001 Perfil do Usuário | Identidade · jornada | Mago (1) — manifestação |
| social-005 Sistema de Reputação | Score IVI · confiança | Justiça (11) — causa/efeito |
| social-006 Indicações | Convites | Amantes (6) — escolha |
| social-007 Embaixadores | Líderes rotativos | Imperador (4) — autoridade |
| token-005 Governança DAO | Votação | Hierofante (5) — tradição |
| exp-001 Gamificação | Missões e badges | Carro (7) — vontade disciplinada |
| exp-002 NFTs de Conquista | Colecionáveis | Estrela (17) — esperança |
| exp-003 Avatar Personalizado | Identidade visual | Lua (18) — sombra/luz |

**Questionário-âncora:** *"Como você prefere ser reconhecido? Pela jornada, pela ajuda que oferece, ou pelo que constrói?"* → detecta Buscador/Curador/Criador

---

### 🛍 PanaceIA (marketplace · 8 eixos)
| Eixo DEVPACK | Função | Arcano Revelado |
|---|---|---|
| token-001 Token Ledger (TKN) | Contabilidade central | Roda da Fortuna (10) — ciclos |
| token-002 Token DCT (Blockchain) | DCT futuro · BYOK | Pendurado (12) — perspectiva |
| token-003 Staking | Rendimento passivo | Temperança (14) — equilíbrio |
| token-004 Yield Farming | Liquidez | Mago (1) — manifestar valor |
| token-006 Airdrop Manager | Distribuição | Imperatriz (3) — abundância |
| dados-005 Mercado de Dados | Compra/venda dados | Diabo (15) — apego material |
| dados-006 Oráculo de Preços | Feed externo | Sumo Sacerdote (5) — referência |
| util-008 Conector Zapier | No-code automação | Mago (1) — ferramenta |

**BYOK (decisão D-10):** tabela `panaceia_user_api_keys` criptografada via crypto.ts. Edge function `chat` aceita opcional `user_api_key` e roteia sem debitar TKN.

**Questionário-âncora:** *"Tokens são apenas dinheiro digital ou são uma linguagem de troca diferente?"* → revela relação com Diabo/Temperança

---

### 🔐 CerberOS (segurança · 5 eixos)
| Eixo DEVPACK | Função | Arcano Revelado |
|---|---|---|
| dados-001 Data Lake Core | Armazenamento | Torre (16) — proteção/colapso |
| dados-002 Data Mesh | Domínios isolados | Imperador (4) — soberania |
| dados-003 Anonimizador | LGPD | Sacerdotisa (2) — mistério/proteção |
| util-006 API Pública | Integração externa | Carro (7) — controle de fronteira |
| util-007 Webhooks | Automação reativa | Roda da Fortuna (10) — eventos |

**Questionário-âncora:** *"Você confia em ambientes abertos ou prefere fronteiras claras?"* → revela arquétipo Testemunho/Guerreiro

---

### 🔮 SandeirOS (engine simbólica · 4 eixos)
| Eixo DEVPACK | Função | Arcano Revelado |
|---|---|---|
| ia-004 Análise de Sentimentos | Detecção emocional | Lua (18) — inconsciente |
| ia-007 Composição Musical | Linguagem além de palavras | Estrela (17) — inspiração |
| ia-008 Renderização 3D | Visualização simbólica | Mundo (21) — integração |
| exp-004 Mundo Virtual | Wonder Night avançado | Louco (0) — primeiro passo |

**Função especial:** SandeirOS é o módulo que LÊ os 22 arcanos · todos os outros módulos REPORTAM dados para ele · ele orquestra a jornada arquetípica oculta.

**Questionário-âncora:** *"Quando você fecha os olhos, o que aparece primeiro: imagens, sons ou sensações?"* → calibra modalidade simbólica preferencial

---

### ⚕ AsclepiOS (saúde · 7 eixos)
| Eixo DEVPACK | Função | Arcano Revelado |
|---|---|---|
| ia-002 Visão Computacional | Análise de exames | Eremita (9) — discernimento |
| util-001 OCR Avançado | Extração de receitas | Justiça (11) — clareza |
| util-002 Calculadora IA | Nutrição/dosagem | Temperança (14) — proporção |
| util-003 Processador PDF | Documentos médicos | Hierofante (5) — referência |
| util-005 Planilha Inteligente | Tabelas longitudinais | Roda da Fortuna (10) — ciclos |
| dados-004 Curadoria de Qualidade | Validação clínica | Sacerdotisa (2) — sabedoria oculta |
| (Rapidoc — sub-módulo API) | Telemedicina externa | Estrela (17) — cura |

**Questionário-âncora:** *"Quando algo dói, você prefere entender por quê ou aliviar logo?"* → detecta Curador vs Guerreiro

---

### 💰 HermeOS (integrador · 5 eixos) — DECISÃO D-01 (Híbrido)
HermeOS = dashboard executivo de TODOS os módulos + alertas financeiros pessoais.

| Eixo DEVPACK | Função | Arcano Revelado |
|---|---|---|
| ia-005 Tradução Multilíngue | 13 países | Mundo (21) — conexão global |
| ia-006 Geração de Código | Para developers | Mago (1) — criação |
| util-004 Bloco de Notas IA | Anotações com IA | Hierofante (5) — registro |
| (Pipeline por país) | DEVPACK M-04 — funil cultural | Imperador (4) — território |
| (Google Reviews) | DEVPACK M-04 — trust signals | Julgamento (20) — reputação |

**Questionário-âncora:** *"O que você mais quer ver em um único lugar?"* → revela Mestre (sistemas) vs Ancião (síntese)

---

### 📡 EteriOS (wearables · 4 eixos)
| Eixo DEVPACK | Função | Arcano Revelado |
|---|---|---|
| ia-003 Processamento de Voz | Speech-to-text | Mago (1) — palavra criadora |
| exp-005 Realidade Aumentada | Overlay | Pendurado (12) — outra perspectiva |
| exp-007 Feedback Háptico | Vibração contextual | Roda da Fortuna (10) — pulsação |
| exp-008 Biometria | Sinais vitais IoT | Imperatriz (3) — corpo |

**Questionário-âncora:** *"Você prefere sentir, ver ou medir?"* → revela Místico/Testemunho/Mestre

---

### ☯ EcumenicOS (cultural · 3 eixos)
| Eixo DEVPACK | Função | Arcano Revelado |
|---|---|---|
| ia-001 Chat da Jornada | ProteOS Cultural Voice (já live) | Hierofante (5) — tradição |
| social-002 Feed de Atividades | Por tradição | Amantes (6) — comunhão |
| social-003 Mensageria P2P | Por cultura | Ponte (6 alternativo) — conexão |
| social-004 Grupos Temáticos | 13 tradições | Mundo (21) — pluralismo |
| social-008 Eventos Ao Vivo | Webinars culturais | Estrela (17) — celebração |

**Questionário-âncora:** *"Sua sabedoria favorita vem de livros, mestres ou da própria vida?"* → revela tradição EcumenicOS preferida

---

## Total verificado

| Módulo | Eixos atribuídos |
|---|---|
| AeropagOS | 8 |
| PanaceIA | 8 |
| CerberOS | 5 |
| SandeirOS | 4 |
| AsclepiOS | 7 (6 + Rapidoc API) |
| HermeOS | 5 (3 eixos + 2 features DEVPACK M-04) |
| EteriOS | 4 |
| EcumenicOS | 5 |
| **TOTAL** | **46** (44 eixos + Rapidoc + Pipeline + Google Reviews) |

> Nota: 2 eixos a mais porque DEVPACK M-04 (Pipeline por país, Google Reviews) e M-05 (Rapidoc) entram na conta como features distribuídas.

---

## Mapa Arquétipo Manifesto → 22 Arcanos SandeirOS

| Arquétipo Público | Arcano Primário | Arcano Sombra |
|---|---|---|
| Buscador | Eremita (9) | Pendurado (12) |
| Curador | Estrela (17) | Sacerdotisa (2) |
| Mestre | Hierofante (5) | Imperador (4) |
| Guerreiro | Carro (7) | Força (8) |
| Místico | Sacerdotisa (2) | Lua (18) |
| Criador | Mago (1) | Imperatriz (3) |
| Ponte | Amantes (6) | Mundo (21) |
| Testemunho | Justiça (11) | Eremita (9) |
| Louco | Louco (0) | Roda da Fortuna (10) |
| Ancião | Mundo (21) | Julgamento (20) |

**Arcanos órfãos** (não mapeados aos 10 manifestos):
- Torre (16) — emergente em crises (CerberOS pode invocar via `hygeios_cerberos_signals`)
- Diabo (15) — emergente em padrões de apego (HygeiOS flag via `user_violations`)
- Temperança (14) — emergente em balanceamento (`archetype_balance` action)

Esses 3 arcanos "órfãos" ficam reservados para INTERVENÇÕES — não fazem parte da identidade do usuário, mas são chamados quando o sistema detecta padrões específicos.

---

## Próximos Passos Operacionais

### Sprint S18 (pré-launch)
1. **Atualizar `aquarios_modules`** com `features` JSONB listando os eixos atribuídos a cada módulo
2. **Criar tabela `aquarios_eixo_questionnaires`** com perguntas-âncora por eixo
3. **Estender `user_archetype_journey`** com coluna `current_arcana` (22 arcanos) além de `current_archetype` (10 manifestos)
4. **Edge Function `proteos-questionnaire-orchestrator`** que injeta pergunta-âncora contextualmente em conversas
5. **HygeiOS arcana detection** — função SQL `hygeios_detect_arcana(user_id)` que lê interações + responses + arquétipo manifesto e infere arcano

### Sprint S19 (pós-launch)
6. Implementar 22 features físicas dos eixos prioritários (OCR, voz, calc IA, etc.)
7. SandeirOS UI: revelação gradual de arcano para usuário (com consentimento)
8. EcumenicOS expansion: tradições cruzando com arcanos

---

## Princípio inviolável

> **Os 22 arcanos NUNCA aparecem ao usuário como label.** O usuário interage com os 8 módulos. Vê 10 arquétipos manifestos quando relevante (settings, comunidades). HygeiOS lê os 22 arcanos em silêncio. ProteOS adapta voz baseada no arcano detectado, mas nunca o nomeia.

*Documento gerado em 27/05/2026 · Base: decisões D-01, D-09, D-10 + DEVPACK Master v4 + migrations 09/10*
