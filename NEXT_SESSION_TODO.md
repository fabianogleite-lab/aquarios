# 📋 MVP1 — Próxima Sessão (Continue daqui)

**Status:** MVP1 99% pronto. Falta só rodar 3 comandos + testar.

## ✅ Já feito
- F1 cache: 404 linhas no Supabase ✓
- H1 loop: código pronto (admin_settings)
- Item 3 Skin B: email + WhatsApp + Shopify ✓
- Azure infra: Container App + ACR ✓
- main.py: todos routers wired ✓

## ⏳ Faltando (15 min)

### 1️⃣ Verificar/completar build Docker
```bash
# Se build ainda estiver rodando:
az acr build --registry aquariosacr --image aquarios:latest C:\Users\DWOS\Desktop\AquariOS\aquarios-v2-complete

# Verificar quando pronto:
az acr repository show-tags --name aquariosacr --repository aquarios
# Esperado: latest
```

### 2️⃣ Deploy no Container App
```bash
bash WATCH_BUILD_AND_DEPLOY.sh
# Ele monitora e faz deploy automaticamente
```

### 3️⃣ Setar credencial Supabase no Container App (Azure Portal)
- Ir para: Azure Portal → rg-aquarios-hygeios → aquarios-hygeios-api
- Environment variables → editar SUPABASE_SERVICE_ROLE_KEY
- Valor: pedir ao fundador ou ver em Supabase Dashboard → Settings → API

### 4️⃣ Testar
```bash
FQDN=$(az containerapp show --name aquarios-hygeios-api -g rg-aquarios-hygeios --query properties.configuration.ingress.fqdn -o tsv)
curl https://$FQDN/health
```

## Endpoints prontos para testar
- `GET /health` — status
- `GET /` — root
- `GET /admin/settings` — todas as configs
- `POST /sandeiros/responder` — cache HIT/MISS
- `GET /hygeios/insights/me` — insights do usuário
- `POST /hygeios/h1/run` — rodar H1 manualmente
- `POST /skin-b/tools/executar` — email/whatsapp
- `POST /shopify/webhooks/order` — webhook Shopify

## Próximas fases após deploy OK
- **Item 4:** SLOs (p95 latência, hit rate, crash-free, bateria)
- **Item 5:** AlexandriOS (FAQ bot)
- **Failover:** Oracle VM como primário, Azure backup

## Credenciais salvas
- Supabase: agebsmjsjrmazbozphnh
- Azure app: aquarios-hygeios-api.icystone-7ee8586d.brazilsouth.azurecontainerapps.io
- ACR: aquariosacr.azurecr.io
- Oracle IP: 137.131.158.242 (offline, precisa ligar)

---
**Quando voltar: rode Item 1-2 acima. Se tudo OK, avança pra Item 4.**
