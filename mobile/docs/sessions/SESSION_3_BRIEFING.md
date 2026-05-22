# Sessão 3 — Nutrição + Comunidades + Wonder Night
## Modelo: Sonnet | Estimativa: 1 sessão completa

---

## Prompt para iniciar

```
Sessão 3 de 5 — AquariOS Phase 4.

ANTES DE TUDO: Leia estes arquivos na ordem:
1. mobile/docs/sessions/MASTER_PLAN.md
2. mobile/docs/sessions/SESSION_2_COMPLETE.md
3. mobile/docs/sessions/SESSION_3_BRIEFING.md

CONTEXTO: Sessões 1-2 implementaram Backend+Auth, ProteOS IA, Diário do Ser. Tudo funcionando.

TAREFA DESTA SESSÃO:
1. Módulo Nutrição
   - Log de refeições (breakfast/lunch/dinner/snack)
   - Campos: descrição, calorias, proteína, carbs, gordura
   - Dashboard diário com totais
   - Histórico semanal com gráfico simples
2. Módulo Comunidades
   - Lista de comunidades disponíveis
   - Entrar/sair de comunidade
   - Feed simples de posts por comunidade
   - Criar comunidade (admin)
3. Módulo Wonder Night
   - Lista de rituais noturnos predefinidos
   - Marcar ritual como concluído
   - Reflexão pós-ritual
   - Histórico de noites
4. Adicionar tabs/navegação para novos módulos
5. Testar tudo no celular

ENTREGA: Todos os 3 módulos funcionando com dados no Supabase.

AO FINALIZAR: Criar mobile/docs/sessions/SESSION_3_COMPLETE.md. Commit com tag session-3-complete.
```

---

## Detalhamento Técnico

### 1. Nutrição

**Navegação:** Adicionar tab ou acessar via Home cards.

**Tela principal (nutrition/index.tsx):**
```
├── Resumo do dia (calorias totais, macros em barras)
├── Lista de refeições do dia agrupadas por tipo
├── FAB "Registrar Refeição"
└── Swipe para histórico semanal
```

**Tela registrar (nutrition/log.tsx):**
```
├── Seletor tipo: ☀️ Café | 🍽 Almoço | 🌙 Jantar | 🍎 Lanche
├── Descrição da refeição (texto livre)
├── Campos numéricos: kcal, proteína(g), carbs(g), gordura(g)
├── Botão "Registrar"
└── Salva em nutrition_logs no Supabase
```

**Dashboard semanal:**
```
├── 7 barras verticais (Dom-Sáb) mostrando calorias
├── Média da semana
├── Meta vs real (se implementar metas)
└── Cores: verde (dentro), amarelo (perto), vermelho (acima)
```

### 2. Comunidades

**Tela lista (communities/index.tsx):**
```
├── Barra de busca
├── Grid de comunidades (imagem + nome + membros)
├── Badge "Membro" nas que participa
├── FAB "Criar Comunidade" (para admin/premium)
└── Toque abre feed da comunidade
```

**Tela comunidade (communities/[id].tsx):**
```
├── Header com imagem + descrição
├── Contador de membros
├── Botão Entrar/Sair
├── Feed de posts (simples: texto + autor + data)
├── Input para novo post
└── Dados via Supabase Realtime (updates ao vivo)
```

**Tabelas extras necessárias:**
```sql
CREATE TABLE public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view posts" ON public.community_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = community_posts.community_id
      AND user_id = auth.uid()
    )
  );
CREATE POLICY "Members can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = community_posts.community_id
      AND user_id = auth.uid()
    )
  );
```

### 3. Wonder Night

**Rituais predefinidos:**
```typescript
const RITUALS = [
  { id: 'gratitude', name: 'Gratidão', icon: '🙏', description: 'Liste 3 coisas pelas quais é grato hoje', duration: 5 },
  { id: 'breath', name: 'Respiração', icon: '🌬', description: '4-7-8: inspire 4s, segure 7s, expire 8s', duration: 10 },
  { id: 'journal', name: 'Escrita Noturna', icon: '✍️', description: 'Escreva livremente sobre o dia', duration: 10 },
  { id: 'release', name: 'Soltar o Dia', icon: '🍃', description: 'Visualize o dia se dissolvendo como folhas ao vento', duration: 5 },
  { id: 'intention', name: 'Intenção do Amanhã', icon: '🌅', description: 'Defina uma intenção clara para amanhã', duration: 3 },
];
```

**Tela principal (wonder-night/index.tsx):**
```
├── Saudação noturna ("Boa noite, Fabiano")
├── Lista de rituais com checkboxes
├── Ao completar ritual → tela de reflexão
├── Barra de progresso (rituais feitos / total)
├── Botão "Encerrar Noite" (salva tudo no Supabase)
└── Histórico: calendário com noites completadas
```

### 4. Navegação Atualizada

Reorganizar para 5 tabs ou usar navegação mista:
```
Tabs principais: Home | ProteOS | Diário | Mais
"Mais" abre menu com: Nutrição, Comunidades, Wonder Night, Config
```

### 5. Checklist de Teste

- [ ] Registrar refeição salva no Supabase
- [ ] Dashboard nutricional mostra totais corretos
- [ ] Listar comunidades funciona
- [ ] Entrar em comunidade registra membership
- [ ] Post em comunidade aparece no feed
- [ ] Rituais Wonder Night marcam como completo
- [ ] Reflexão pós-ritual salva no banco
- [ ] Navegação entre todos os módulos fluída
