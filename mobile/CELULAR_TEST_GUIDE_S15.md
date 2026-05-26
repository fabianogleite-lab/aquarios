═══════════════════════════════════════════════════════════════════
S15 — TESTE COMPLETO NO CELULAR (COMUNIDADES)
═══════════════════════════════════════════════════════════════════

Status: Pronto para validação em device físico
Data: 24 Mai 2026
Celular: Motorola (USB debugging ativado)


═══════════════════════════════════════════════════════════════════
PARTE 1: VALIDAÇÃO DA TELA COMUNIDADES
═══════════════════════════════════════════════════════════════════

[ ] 1.1 — Navegação
  ├─ Abra AquariOS
  ├─ Toque em "Comunidades" (ícone 👥 Social na tab bar)
  ├─ Verifique: Tela carrega sem freeze
  └─ Esperado: Duas tabs visíveis: "📰 Posts" e "👥 Helpers"

[ ] 1.2 — Tab Posts (Padrão)
  ├─ Verifique lista vazia com mensagem "Nenhum post"
  ├─ Procure pelo botão FAB verde (+ inferior direito)
  └─ Esperado: Botão redondo com ícone + a 60px do canto inferior-direito

[ ] 1.3 — Tab Helpers
  ├─ Toque na tab "👥 Helpers"
  ├─ Verifique lista com avatares numerados
  └─ Esperado: Ranking de helpers (se houver dados no Supabase)


═══════════════════════════════════════════════════════════════════
PARTE 2: CRIAR POST (FLUXO COMPLETO)
═══════════════════════════════════════════════════════════════════

[ ] 2.1 — Abrir Modal de Novo Post
  ├─ Toque no botão FAB verde (+)
  ├─ Verifique: Modal se abre com keyboard
  └─ Esperado: Dois TextInputs (Título e Conteúdo)

[ ] 2.2 — Validação de Título
  ├─ Toque no campo "Título"
  ├─ Digite: "ola" (4 caracteres)
  ├─ Toque no botão "Publicar"
  └─ Esperado: Erro "Título deve ter pelo menos 10 caracteres"

[ ] 2.3 — Validação de Conteúdo
  ├─ Limpe o título
  ├─ Digite: "Tenho uma dúvida" (16 chars) no título
  ├─ Toque no campo "Conteúdo"
  ├─ Digite: "ajuda" (5 chars)
  ├─ Toque "Publicar"
  └─ Esperado: Erro "Conteúdo deve ter pelo menos 20 caracteres"

[ ] 2.4 — Validação de asclepiOS (Banned Phrases)
  ├─ Complete ambos os campos:
  │  ├─ Título: "Dúvida sobre meu corpo"
  │  └─ Conteúdo: "Olá zé do aperto, estou com dor no peito"
  ├─ Toque "Publicar"
  └─ Esperado: Erro "Conteúdo contém termos inadequados para esta categoria"
    (zé_do_aperto é banned para ZÉ_DO_APERTO persona)

[ ] 2.5 — Post Válido
  ├─ Limpe o conteúdo
  ├─ Digite nova resposta: "Estou sentindo dor no peito há 3 dias. O que fazer?"
  ├─ Toque "Publicar"
  └─ Esperado: Alert "Post publicado!" + Modal fecha + Post aparece na lista


═══════════════════════════════════════════════════════════════════
PARTE 3: VISUALIZAR POST DETALHADO
═══════════════════════════════════════════════════════════════════

[ ] 3.1 — Abrir Post
  ├─ Na lista de Posts, toque no card que criou
  └─ Esperado: Navegação para tela de detalhes do post

[ ] 3.2 — Conteúdo Post
  ├─ Verifique exibição:
  │  ├─ Título em negrito (maior)
  │  ├─ Conteúdo abaixo
  │  ├─ Contadores: "👁 1 views | 💬 0 replies"
  │  └─ Data/hora de criação
  └─ Esperado: Todos os campos visíveis e legíveis

[ ] 3.3 — View Count
  ├─ Volte e reabra o post
  ├─ Verifique o contador de views
  └─ Esperado: Views incrementou de 1 para 2


═══════════════════════════════════════════════════════════════════
PARTE 4: ADICIONAR RESPOSTA (REPLY)
═══════════════════════════════════════════════════════════════════

[ ] 4.1 — Input de Resposta
  ├─ Na tela de detalhes, role até o final
  ├─ Procure por TextInput com placeholder "Sua resposta..."
  ├─ Toque no input
  └─ Esperado: Keyboard aparece, input está focado

[ ] 4.2 — Validação de Resposta
  ├─ Digite: "ok" (2 chars)
  ├─ Toque no botão "Enviar" (ou ▶)
  └─ Esperado: Nenhuma resposta é enviada (validação mínima 20 chars)

[ ] 4.3 — Resposta Válida
  ├─ Digite: "Recomendo consultar um cardiologista para avaliar essa dor"
  ├─ Toque "Enviar"
  └─ Esperado: Alert "Resposta publicada!" + Input limpa

[ ] 4.4 — Ver Resposta na Lista
  ├─ Verifique se a resposta aparece acima do input
  ├─ Card deve mostrar:
  │  ├─ Avatar numerado (#1 ou similar)
  │  ├─ Conteúdo da resposta
  │  ├─ Timestamp relativo ("agora")
  │  └─ Botões de rating (👎 👌 👍)
  └─ Esperado: Resposta visível com layout correto


═══════════════════════════════════════════════════════════════════
PARTE 5: AVALIAÇÃO DE RESPOSTAS (RATING)
═══════════════════════════════════════════════════════════════════

[ ] 5.1 — Thumbs Down (👎)
  ├─ Toque no botão 👎 da resposta
  └─ Esperado: Botão muda de cor (indica seleção)

[ ] 5.2 — Thumbs Neutral (👌)
  ├─ Toque no botão 👌
  └─ Esperado: Rating muda de 👎 para 👌

[ ] 5.3 — Thumbs Up (👍)
  ├─ Toque no botão 👍
  └─ Esperado: Rating muda para 👍 + contador incrementa

[ ] 5.4 — Re-avaliar
  ├─ Toque novamente em 👎
  └─ Esperado: Rating muda de volta (upsert pattern atualiza)


═══════════════════════════════════════════════════════════════════
PARTE 6: VALIDAÇÃO SUPABASE
═══════════════════════════════════════════════════════════════════

Abra o Supabase dashboard: https://app.supabase.com
Projeto: agebsmjsjrmazbozphnh

[ ] 6.1 — Tabela community_posts
  ├─ Vá para: SQL Editor ou Table Editor
  ├─ Select * from community_posts
  ├─ Verifique: POST que criou está lá com:
  │  ├─ title, content preenchidos
  │  ├─ category = "SAÚDE" (detectado automaticamente)
  │  ├─ user_id = seu UUID
  │  ├─ view_count >= 2 (se abriu 2x)
  │  └─ created_at timestamp
  └─ Status: REGISTRADO

[ ] 6.2 — Tabela community_replies
  ├─ Select * from community_replies
  ├─ Verifique: RESPOSTA está lá com:
  │  ├─ post_id (referência ao post)
  │  ├─ content preenchido
  │  ├─ user_id
  │  └─ created_at
  └─ Status: REGISTRADO

[ ] 6.3 — Tabela community_ratings
  ├─ Select * from community_ratings
  ├─ Verifique: 3 registros (uma por cada rating que fez)
  │  ├─ reply_id referencia a resposta
  │  ├─ rating = -1, 0, 1 (valores das avaliações)
  │  └─ user_id
  └─ Status: REGISTRADO

[ ] 6.4 — Triggers e Stats
  ├─ Select * from community_helper_stats
  ├─ Verifique: Seu usuário tem:
  │  ├─ reply_count >= 1
  │  ├─ helpful_count >= 1 (incrementou com thumbs up)
  │  └─ average_rating = média de ratings
  └─ Status: CALCULADO


═══════════════════════════════════════════════════════════════════
PARTE 7: FLUXO SECUNDÁRIO — MÚLTIPLAS RESPOSTAS
═══════════════════════════════════════════════════════════════════

[ ] 7.1 — Adicionar Segunda Resposta (mesmo device)
  ├─ Na tela do post, role até o input
  ├─ Digite nova resposta diferente
  ├─ Toque "Enviar"
  └─ Esperado: Segunda resposta aparece na lista

[ ] 7.2 — Reply Count
  ├─ Na tela do post, procure pelo header
  ├─ Verifique: "💬 2 replies" (incrementou de 1)
  └─ Status: CORRETO

[ ] 7.3 — Avaliação Cruzada
  ├─ Rate primeira resposta com 👍
  ├─ Rate segunda resposta com 👎
  ├─ No Supabase, verifique 2 linhas em community_ratings
  └─ Status: AMBAS REGISTRADAS


═══════════════════════════════════════════════════════════════════
PARTE 8: PERSOALIZATION & ROUTING
═══════════════════════════════════════════════════════════════════

[ ] 8.1 — Intent Detection
  Crie um novo post com conteúdo relacionado a VITALIDADE:
  ├─ Título: "Como melhorar minha energia"
  ├─ Conteúdo: "Acordo muito cansado todos os dias"
  ├─ No Supabase, verifique: category = "VITALIDADE"
  └─ Status: CATEGORIA DETECTADA

[ ] 8.2 — Persona Matching
  Crie outro post com conteúdo relacionado a MEDITAÇÃO/RELAXAMENTO:
  ├─ Título: "Técnicas de meditação"
  ├─ Conteúdo: "Quero aprender a meditar para reduzir ansiedade"
  ├─ No Supabase, verifique: category = "BEM_ESTAR"
  └─ Status: CATEGORIA DETECTADA


═══════════════════════════════════════════════════════════════════
PARTE 9: EDGE FUNCTION VALIDATION
═══════════════════════════════════════════════════════════════════

No terminal, execute testes de API:

[ ] 9.1 — Test GET /community?action=get_helpers
```bash
curl -X GET "https://agebsmjsjrmazbozphnh.supabase.co/functions/v1/community?action=get_helpers" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```
Esperado: JSON com lista de helpers ordenados por rating


[ ] 9.2 — Verificar Rate Limiting
  ├─ Faça 15 requisições em rápida sucessão
  ├─ A 11ª deve retornar: {"success": false, "error": "Rate limit exceeded"}
  └─ Status: PROTEÇÃO ATIVA


═══════════════════════════════════════════════════════════════════
CHECKLIST FINAL
═══════════════════════════════════════════════════════════════════

UI/UX:
  [ ] Tela carrega sem erros
  [ ] Ambas as tabs (Posts e Helpers) funcionam
  [ ] FAB abre modal corretamente
  [ ] Validações funcionam
  [ ] Mensagens de erro são claras

Funcionalidade:
  [ ] Post é criado e aparece na lista
  [ ] View count incrementa ao abrir post
  [ ] Replies são adicionadas com sucesso
  [ ] Ratings funcionam (👎 👌 👍)
  [ ] Re-rating atualiza corretamente

Backend/Supabase:
  [ ] Dados aparecem em community_posts
  [ ] Dados aparecem em community_replies
  [ ] Dados aparecem em community_ratings
  [ ] Stats são atualizados automaticamente (triggers)
  [ ] Categories são detectadas corretamente

Edge Function:
  [ ] API responde sem erros
  [ ] Rate limiting está ativo
  [ ] Autenticação com JWT funciona

═══════════════════════════════════════════════════════════════════
PRÓXIMOS PASSOS (PÓS-TESTE)
═══════════════════════════════════════════════════════════════════

✅ Se tudo passou:
  1. Criar commit com tag v4.6.0-S15
  2. Deploy Edge Function: supabase functions deploy community
  3. Documentar resultados em session15_complete.md

⚠️ Se houver erros:
  1. Coletar screenshots dos erros
  2. Verificar console logs: adb logcat | grep -i aquarios
  3. Revisar stack traces no Supabase logs
  4. Voltar ao código e corrigir bugs

═══════════════════════════════════════════════════════════════════
