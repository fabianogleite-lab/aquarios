# Sessão 5 — Debug Final + Documentação + GitHub Release
## Modelo: Opus | Estimativa: 1 sessão completa

---

## Prompt para iniciar

```
Sessão 5 de 5 (FINAL) — AquariOS Phase 4.

ANTES DE TUDO: Leia estes arquivos na ordem:
1. mobile/docs/sessions/MASTER_PLAN.md
2. mobile/docs/sessions/SESSION_4_COMPLETE.md
3. mobile/docs/sessions/SESSION_5_BRIEFING.md

CONTEXTO: Sessões 1-4 completaram o app inteiro. Build production pronto.
Esta é a sessão FINAL — debug, documentação e entrega no GitHub.

TAREFA DESTA SESSÃO (nesta ordem exata):
1. DEBUG COMPLETO — testar cada feature, cada fluxo, cada edge case
2. WHITE PAPER — documento técnico/conceitual do AquariOS
3. BLUEPRINT — arquitetura técnica detalhada
4. README.md — documentação principal do repositório
5. HELP.md — guia do usuário
6. Organizar repositório GitHub para apresentação profissional
7. Criar release tag v4.2.0
8. Criar SESSION_5_COMPLETE.md + PHASE_4_COMPLETE.md

ENTREGA: Repositório GitHub pronto para apresentação profissional.

AO FINALIZAR: Tag final, push para GitHub, verificar que tudo está perfeito.
```

---

## Detalhamento Técnico

### 1. DEBUG COMPLETO

**Fluxo de teste sistemático:**

```
A. Autenticação
   - [ ] Registro com email válido → cria conta
   - [ ] Registro com email inválido → mostra erro
   - [ ] Registro com senha fraca → mostra erro
   - [ ] Login correto → entra no app
   - [ ] Login incorreto → mostra erro
   - [ ] Logout → volta para login
   - [ ] Reabrir app → mantém sessão
   - [ ] Token expirado → redireciona para login

B. ProteOS
   - [ ] Enviar mensagem → recebe resposta IA
   - [ ] Histórico carrega ao abrir
   - [ ] Múltiplas conversas
   - [ ] Mensagem longa não quebra layout
   - [ ] Sem internet → erro amigável
   - [ ] Resposta streaming funciona

C. Diário do Ser
   - [ ] Criar entrada → aparece na lista
   - [ ] Editar entrada → salva alteração
   - [ ] Deletar entrada → remove da lista
   - [ ] Mood selector funciona
   - [ ] Tags salvam corretamente
   - [ ] Busca filtra por texto
   - [ ] Lista ordena por data (recente primeiro)

D. Nutrição
   - [ ] Registrar refeição → aparece no dashboard
   - [ ] Totais do dia calculam correto
   - [ ] Seletor de tipo de refeição funciona
   - [ ] Campos numéricos aceitam apenas números
   - [ ] Histórico semanal mostra dados corretos

E. Comunidades
   - [ ] Lista de comunidades carrega
   - [ ] Entrar em comunidade → atualiza badge
   - [ ] Sair de comunidade → remove badge
   - [ ] Criar post → aparece no feed
   - [ ] Feed mostra posts de outros membros

F. Wonder Night
   - [ ] Rituais listam corretamente
   - [ ] Checkbox marca/desmarca
   - [ ] Reflexão pós-ritual salva
   - [ ] Histórico mostra noites anteriores
   - [ ] "Encerrar Noite" salva tudo

G. Geral
   - [ ] Navegação entre todas as telas fluída
   - [ ] Back button funciona em todas as telas
   - [ ] Splash screen carrega e transiciona
   - [ ] Ícone do app correto
   - [ ] Performance: sem lag, sem jank
   - [ ] Memória: app não cresce indefinidamente
```

### 2. WHITE PAPER (docs/WHITE_PAPER.md)

Estrutura:
```markdown
# AquariOS — White Paper
## Sistema Operacional Pessoal

### Resumo Executivo
- O que é o AquariOS
- Problema que resolve
- Proposta de valor única

### Visão
- Consciência como tecnologia
- O humano como sistema operacional
- Integração mente-corpo-espírito-dados

### Módulos
- ProteOS: IA pessoal com memória e contexto
- Diário do Ser: autoconhecimento estruturado
- Nutrição: consciência alimentar quantificada
- Comunidades: crescimento coletivo
- Wonder Night: rituais de fechamento do dia

### Tecnologia
- Stack técnico
- Arquitetura
- Segurança e privacidade
- Escalabilidade

### Modelo de Negócio
- Free tier: funcionalidades básicas
- Premium ($9.99/mês): IA avançada, comunidades ilimitadas
- Enterprise: para coaches e terapeutas

### Roadmap
- v4.2 (atual): MVP completo
- v5.0: Wearables integration
- v6.0: Marketplace de rituais
- v7.0: API aberta para integrações

### Equipe
- Fabiano Gomes Leite — Fundador, Arkhe Labs
```

### 3. BLUEPRINT (docs/BLUEPRINT.md)

Estrutura:
```markdown
# AquariOS — Blueprint Técnico

### Arquitetura
- Diagrama de componentes (ASCII art)
- Fluxo de dados
- Dependências entre módulos

### Stack
- Frontend: React Native 0.81 + Expo SDK 54
- Router: expo-router v6 (file-based)
- State: Zustand
- Backend: Supabase (PostgreSQL)
- Auth: Supabase Auth
- IA: Claude Haiku via Edge Functions
- Build: EAS Build

### Schema do Banco
- ERD (diagrama entidade-relacionamento em ASCII)
- Tabelas e relações
- RLS policies

### API Endpoints
- Edge Functions documentadas
- Request/Response schemas

### Estrutura de Diretórios
- Árvore completa com descrição de cada arquivo

### Padrões de Código
- TypeScript strict
- Componentes funcionais
- Zustand para state
- Tema centralizado
- Error boundaries

### Deploy
- Build pipeline
- Environment variables
- Play Store submission
```

### 4. README.md (raiz do projeto)

```markdown
# ⚗ AquariOS
> Sistema Operacional Pessoal

[Screenshot do app]

## Sobre
Breve descrição...

## Funcionalidades
Lista com emojis...

## Instalação
Passo a passo para dev...

## Stack
Badges das tecnologias...

## Estrutura do Projeto
Árvore simplificada...

## Contribuindo
Guidelines...

## Licença
MIT ou proprietária...

## Autor
Fabiano Gomes Leite — Arkhe Labs
```

### 5. HELP.md (docs/HELP.md)

```markdown
# AquariOS — Guia do Usuário

## Primeiros Passos
- Como criar conta
- Primeiro login
- Tour pelo app

## ProteOS
- Como conversar
- Dicas para melhores respostas
- Limitações

## Diário do Ser
- Como criar uma reflexão
- Usando humores e tags
- Buscando entradas antigas

## Nutrição
- Registrando refeições
- Entendendo o dashboard
- Metas nutricionais

## Comunidades
- Encontrando comunidades
- Participando
- Criando sua comunidade

## Wonder Night
- O que são rituais
- Como completar uma noite
- Construindo consistência

## FAQ
- Perguntas frequentes

## Suporte
- Email: fabianogleite@hotmail.com
```

### 6. GitHub Release

```bash
# Organizar repositório
# .gitignore atualizado
# Remover arquivos desnecessários (build logs, temp files)

# Tag final
git tag -a v4.2.0 -m "AquariOS v4.2.0 — Full release"
git push origin v4.2.0

# GitHub Release (via gh CLI)
gh release create v4.2.0 \
  --title "AquariOS v4.2.0 — Sistema Operacional Pessoal" \
  --notes "First complete release..."
```

### 7. Checklist Final

- [ ] Todos os bugs corrigidos
- [ ] White Paper completo e revisado
- [ ] Blueprint técnico preciso
- [ ] README atrativo e informativo
- [ ] HELP claro para usuário leigo
- [ ] .gitignore limpo (sem node_modules, .env, builds)
- [ ] Repositório sem arquivos sensíveis
- [ ] Tag v4.2.0 criada
- [ ] Release no GitHub
- [ ] PHASE_4_COMPLETE.md criado
