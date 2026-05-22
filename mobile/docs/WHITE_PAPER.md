# AquariOS - White Paper

## Sistema Operacional Pessoal

**Versao:** 4.2.0
**Autor:** Fabiano Gomes Leite
**Organizacao:** Arkhe Labs
**Data:** Maio 2026

---

## Resumo Executivo

AquariOS e um sistema operacional pessoal que integra inteligencia artificial, autoconhecimento e bem-estar em uma unica plataforma mobile. O app combina um assistente IA conversacional, diario reflexivo estruturado, tracking nutricional, rede social de crescimento coletivo e rituais noturnos de transformacao.

O problema central que o AquariOS resolve e a fragmentacao das ferramentas de desenvolvimento pessoal. Hoje, uma pessoa que busca autoconhecimento precisa de um app para meditacao, outro para diario, outro para nutricao, outro para comunidade. O AquariOS unifica tudo isso com um fio condutor: consciencia como tecnologia.

---

## Visao

### Consciencia como Tecnologia

O AquariOS parte de uma premissa: o ser humano e o sistema operacional mais complexo que existe. Assim como um computador precisa de um OS para orquestrar hardware e software, o ser humano precisa de ferramentas para orquestrar mente, corpo, espirito e dados.

### O Humano como Sistema Operacional

Cada modulo do AquariOS corresponde a uma funcao do "sistema operacional humano":

- **ProteOS** (Kernel) — O nucleo de processamento. Uma IA que conversa, lembra e evolui com o usuario.
- **Diario do Ser** (Logs) — Registro estruturado de pensamentos, emocoes e descobertas.
- **Nutricao** (Hardware Monitor) — Monitoramento do combustivel do corpo.
- **Comunidades** (Network) — Conexao com outros seres em jornada semelhante.
- **Wonder Night** (Shutdown Ritual) — O processo de encerramento consciente do dia.

### Integracao Mente-Corpo-Espirito-Dados

O diferencial do AquariOS nao e ser mais um app de bem-estar. E a integracao. O ProteOS tem acesso ao contexto do diario, da nutricao e dos rituais. Ele pode perceber padroes que o proprio usuario nao ve: "Notei que nos dias em que voce registra humor 'triste', voce tambem pula o cafe da manha. Quer explorar essa conexao?"

---

## Modulos

### ProteOS - Assistente IA Pessoal

ProteOS e o coracao do AquariOS. Um assistente conversacional que:

- Conversa em linguagem natural sobre qualquer tema
- Mantem historico persistente de conversas
- Responde com empatia e profundidade
- Funciona como um espelho reflexivo, nao um oraculo

**Tecnologia:** Respostas contextuais com persistencia via Supabase. Arquitetura preparada para integracao com Claude Haiku via Edge Functions.

### Diario do Ser - Autoconhecimento Estruturado

O Diario do Ser transforma reflexao em dados estruturados:

- **Conteudo livre** — Escreva o que quiser, sem formato obrigatorio
- **Humor** — 6 estados emocionais rastreados (feliz, neutro, triste, irritado, pensativo, inspirado)
- **Tags** — Categorize suas reflexoes para busca futura
- **Perguntas inspiradoras** — Prompts aleatorios para quebrar o bloqueio criativo
- **Compartilhamento** — Publique reflexoes no feed da comunidade

### Nutricao - Consciencia Alimentar Quantificada

Tracking nutricional com foco em consciencia, nao em dieta:

- **Dashboard visual** — Aneis de progresso para calorias, proteina, carboidratos e gordura
- **4 tipos de refeicao** — Cafe da manha, almoco, lanche e jantar
- **Metas personalizaveis** — Defina seus proprios objetivos nutricionais
- **Macro tracking** — Proteina, carboidratos e gordura por refeicao

### Comunidades - Crescimento Coletivo

Uma rede social minimalista focada em crescimento:

- **Perfis** — Username e display name
- **Follow/Unfollow** — Siga pessoas em jornada semelhante
- **Feed** — Timeline de reflexoes compartilhadas do Diario
- **Likes** — Apoie as reflexoes de outros
- **Notificacoes** — Saiba quem te seguiu ou curtiu suas reflexoes
- **Busca** — Encontre usuarios por username

### Wonder Night - Rituais de Transformacao

Experiencias coletivas de conexao e bem-estar:

- **Eventos** — Lista de experiencias disponiveis com data e descricao
- **Countdown** — Contagem regressiva em tempo real ate o evento
- **Ingressos** — Sistema de compra e codigo de acesso
- **Acesso** — Link direto para entrar no evento

---

## Tecnologia

### Stack

| Camada | Tecnologia | Versao |
|--------|-----------|--------|
| Frontend | React Native | 0.81.5 |
| Framework | Expo SDK | 54 |
| Router | expo-router | v6 |
| State | Zustand | 4.5 |
| Backend | Supabase (PostgreSQL) | - |
| Auth | Supabase Auth | - |
| Build | EAS Build | - |
| Distribuicao | Google Play Store | - |

### Arquitetura

O AquariOS segue uma arquitetura client-heavy com backend-as-a-service:

- **Frontend unico** — Todo o codigo roda no dispositivo do usuario
- **Supabase como backend** — PostgreSQL, Auth, Realtime e Storage em um unico servico
- **Sem servidor proprio** — Zero infra para manter
- **RLS (Row Level Security)** — Cada usuario so acessa seus proprios dados

### Seguranca e Privacidade

- **Autenticacao** — Email/senha via Supabase Auth com refresh token automatico
- **RLS** — Policies no PostgreSQL garantem isolamento de dados por usuario
- **Sem dados no bundle** — Chaves sensiveis ficam em variaveis de ambiente, nao no codigo
- **HTTPS** — Toda comunicacao com o Supabase e criptografada
- **Sessao persistente** — Token armazenado em AsyncStorage com refresh automatico

### Escalabilidade

- **Supabase** escala horizontalmente (PostgreSQL + CDN)
- **Expo Updates** permite atualizacoes OTA sem re-publicar na store
- **Edge Functions** preparam o caminho para logica server-side quando necessario

---

## Modelo de Negocio

### Free Tier
- ProteOS com respostas basicas
- Diario do Ser completo
- Nutricao completa
- Comunidades (seguir ate 20 pessoas)
- Wonder Night (visualizar eventos)

### Premium (R$ 29,90/mes)
- ProteOS com IA avancada (Claude Haiku)
- Comunidades ilimitadas
- Wonder Night com compra de ingressos
- Insights automaticos entre modulos
- Exportacao de dados

### Enterprise (sob consulta)
- Para coaches, terapeutas e organizacoes
- Dashboard de acompanhamento de clientes
- API para integracoes
- White-label customizavel

---

## Roadmap

### v4.2.0 (Atual) - MVP Completo
- 5 modulos funcionais
- Autenticacao completa
- Persistencia em nuvem
- UI polida com tema centralizado e animacoes
- Build Android (APK + AAB)

### v5.0 - Inteligencia
- Integracao real com Claude Haiku via Edge Functions
- ProteOS com memoria de longo prazo
- Insights automaticos cruzando dados entre modulos
- Notificacoes push

### v6.0 - Expansao
- Wearables (Apple Watch, Fitbit) para dados de saude
- Marketplace de rituais para Wonder Night
- Meditacoes guiadas com IA
- Integracao com calendarios

### v7.0 - Plataforma
- API aberta para integradores
- SDK para desenvolvedores criarem modulos
- Gamificacao e streaks
- Comunidades tematicas com moderacao

---

## Equipe

**Fabiano Gomes Leite** — Fundador e Desenvolvedor
Arkhe Labs

---

*AquariOS - Consciencia como tecnologia.*
