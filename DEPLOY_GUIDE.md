# 🚀 Deploy da Edge Function - ProteOS Chat

A Edge Function `supabase/functions/chat/index.ts` precisa ser deployada no Supabase para o ProteOS funcionar.

## ✅ Opção 1: Deploy Automático (Recomendado)

**Windows:**
```bash
python deploy_edge_function.py
```

Ou:
```bash
DEPLOY_EDGE_FUNCTION.bat
```

**Mac/Linux:**
```bash
python3 deploy_edge_function.py
```

---

## ⚙️ Opção 2: Deploy Manual via CLI

Se prefere fazer manualmente:

```bash
# 1. Login (abre navegador)
supabase login

# 2. Deploy a função
supabase functions deploy chat --project-ref agebsmjsjrmazbozphnh
```

---

## 📝 Opção 3: Deploy via Supabase Dashboard

Se ainda tiver problemas com CLI:

1. Vá para: https://supabase.com/dashboard/project/agebsmjsjrmazbozphnh/functions
2. Clique em "Create Function"
3. Nomeie: `chat`
4. Cole o conteúdo de: `supabase/functions/chat/index.ts`
5. Salve as variáveis de ambiente:
   ```
   ANTHROPIC_API_KEY=REDACTED
   ```
6. Clique "Deploy"

---

## ✔️ Verificar Deploy

Após o deploy, teste no app:

1. Abra o app no celular (Expo Go)
2. Vá para aba **Chat** (ProteOS)
3. Envie uma mensagem (ex: "Oi ProteOS")
4. Deve receber uma resposta em 2-5 segundos

Se receber erro "Edge Function returned non-2xx", significa que a função ainda não foi deployada ou há erro nela.

---

## 🆘 Troubleshooting

**Erro: "Access token not provided"**
- Solução: Execute `supabase login` primeiro

**Erro: "Function not found"**
- Solução: Verifique se o deploy realmente completou (pode levar 10-30s)

**Erro: "Edge Function returned non-2xx"**
- Solução: Verifique os logs da Edge Function no Supabase Dashboard
