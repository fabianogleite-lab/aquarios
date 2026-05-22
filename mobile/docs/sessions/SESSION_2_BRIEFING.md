# Sessão 2 — ProteOS IA + Diário do Ser
## Modelo: Sonnet | Estimativa: 1 sessão completa

---

## Prompt para iniciar

```
Sessão 2 de 5 — AquariOS Phase 4.

ANTES DE TUDO: Leia estes arquivos na ordem:
1. mobile/docs/sessions/MASTER_PLAN.md
2. mobile/docs/sessions/SESSION_1_COMPLETE.md
3. mobile/docs/sessions/SESSION_2_BRIEFING.md

CONTEXTO: Sessão 1 implementou Supabase + Auth. Login/registro funcionando.

TAREFA DESTA SESSÃO:
1. ProteOS Chat com IA real (Claude Haiku via Anthropic API)
   - Mensagens salvas no Supabase (chat_messages)
   - Histórico de conversas persistente
   - System prompt com personalidade AquariOS
   - Streaming de resposta (typewriter effect)
2. Diário do Ser completo
   - CRUD de reflexões salvas no Supabase (diario_entries)
   - Seletor de humor (mood)
   - Tags por entrada
   - Lista cronológica com busca
3. Testar ambos módulos no celular via Expo Go

ENTREGA: ProteOS conversando com IA real + Diário salvando no banco.

AO FINALIZAR: Criar mobile/docs/sessions/SESSION_2_COMPLETE.md. Commit com tag session-2-complete.
```

---

## Detalhamento Técnico

### 1. ProteOS — Chat com Claude Haiku

**Edge Function no Supabase** (para não expor API key no app):

Criar `supabase/functions/chat/index.ts`:
```typescript
// Edge function que recebe mensagem do user e retorna resposta do Claude
// - Recebe: { message, conversation_id, history[] }
// - Chama Anthropic API com Claude Haiku
// - System prompt define personalidade ProteOS
// - Retorna resposta da IA
// - Salva ambas mensagens no banco
```

**System Prompt do ProteOS:**
```
Você é ProteOS, o assistente IA pessoal do AquariOS — Sistema Operacional Pessoal.
Você é caloroso, profundo e prático. Fala português brasileiro.
Seu criador é Fabiano Gomes Leite, fundador da Arkhe Labs.
Você ajuda o usuário com autoconhecimento, produtividade e bem-estar.
Você tem acesso ao histórico de conversas e ao diário do ser do usuário.
Seja conciso mas profundo. Use metáforas quando apropriado.
Nunca invente dados sobre o usuário — pergunte se não sabe.
```

**Estrutura no app:**
```
app/(app)/proteos.tsx
├── Lista de mensagens (FlatList)
├── Input de texto + botão enviar
├── Indicador de "digitando..."
├── Histórico carregado do Supabase ao abrir
└── Nova mensagem → Edge Function → resposta IA → salva banco
```

### 2. Diário do Ser — CRUD Completo

**Tela principal:**
```
app/(app)/diario.tsx
├── FAB "Nova Reflexão" (floating action button)
├── Lista de entradas (mais recente primeiro)
├── Cada card mostra: data, humor, preview do texto, tags
├── Toque abre entrada completa
├── Swipe left = deletar (com confirmação)
└── Barra de busca no topo
```

**Tela de nova entrada:**
```
app/(app)/diario-new.tsx
├── Pergunta inspiradora aleatória no topo
├── TextInput multiline para reflexão
├── Seletor de humor: 😊 😐 😔 😤 🤔 ✨
├── Input de tags (separadas por vírgula)
├── Botão "Salvar Reflexão"
└── Salva no Supabase → volta para lista
```

### 3. Variáveis de Ambiente Necessárias

```
EXPO_PUBLIC_SUPABASE_URL=xxx          (já existe da S1)
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx     (já existe da S1)
ANTHROPIC_API_KEY=sk-ant-xxx          (na Edge Function, não no app)
```

### 4. Checklist de Teste

- [ ] Enviar mensagem no ProteOS recebe resposta da IA
- [ ] Histórico de chat persiste ao fechar/reabrir
- [ ] System prompt define tom correto
- [ ] Criar nova entrada no diário salva no Supabase
- [ ] Entradas aparecem na lista após salvar
- [ ] Mood e tags salvam corretamente
- [ ] Deletar entrada funciona
- [ ] Busca filtra entradas
