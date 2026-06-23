# Edge Function `/community`

Backend serverless para Comunidades Q&A.

## Deployment

### Método 1: Supabase CLI (Recomendado)

```bash
cd supabase/functions/community
supabase functions deploy community
```

### Método 2: Dashboard

1. Abrir Supabase Dashboard
2. Ir para Edge Functions
3. Clicar em "Create Function"
4. Nome: `community`
5. Copiar `index.ts` inteiro
6. Deploy

## API Endpoints

### 1. Create Post

```
POST /functions/v1/community?action=create_post
Authorization: Bearer <JWT_TOKEN>

Body:
{
  "title": "Meu título",
  "content": "Meu conteúdo...",
  "category": "SAÚDE"
}

Response:
{
  "success": true,
  "data": { id, user_id, title, content, ... }
}
```

### 2. Create Reply

```
POST /functions/v1/community?action=create_reply
Authorization: Bearer <JWT_TOKEN>

Body:
{
  "postId": "uuid",
  "content": "Minha resposta..."
}

Response:
{
  "success": true,
  "data": { id, post_id, user_id, content, ... }
}
```

### 3. Get Top Helpers

```
POST /functions/v1/community?action=get_helpers
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "helpers": [
    { user_id, reply_count, average_rating, helpful_count },
    ...
  ]
}
```

### 4. Rate Reply

```
POST /functions/v1/community?action=rate_reply
Authorization: Bearer <JWT_TOKEN>

Body:
{
  "replyId": "uuid",
  "rating": 5
}

Response:
{
  "success": true
}
```

## Rate Limiting

- **Limite**: 10 requisições por minuto por user_id
- **Header de erro**: 429 (Too Many Requests)

## Uso no Mobile

```typescript
import { useCommunityAPI } from '../../hooks/useCommunityAPI';

export function MyComponent() {
  const { createPost, createReply, getHelpers } = useCommunityAPI();

  const handlePublish = async () => {
    const result = await createPost(title, content, category);
    if (result.success) {
      console.log('Post criado:', result.data);
    } else {
      console.error('Erro:', result.error);
    }
  };

  return ...;
}
```

## Notas

- Todas as requisições precisam de JWT válido
- Rate limiting é per user_id (10 req/min)
- Responses sempre JSON
- CORS habilitado para all origins

## Melhorias Futuras

- [ ] Logs estruturados
- [ ] Métricas de uso
- [ ] Cache de helpers ranking
- [ ] Validação mais rigorosa
- [ ] Webhook para notificações

---

Deployed: S15 Fase 3
Last update: 24 maio 2026
