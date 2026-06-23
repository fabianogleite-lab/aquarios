# 🚀 MVP1 Deploy Final Checklist (22/Jun/2026)

## Status Atual
- ✅ Código: H3 convergência pronto (main.py com todos routers)
- ✅ Azure infra: Container App + ACR criados
- 🔄 Docker build: em progresso (local + ACR)

## Checklist Deploy

### 1️⃣ Verificar Docker Image
```bash
docker images | grep aquarios
# Esperado: aquariosacr.azurecr.io/aquarios:latest
```

### 2️⃣ Login ACR + Push
```bash
az acr login --name aquariosacr
docker push aquariosacr.azurecr.io/aquarios:latest
```

### 3️⃣ Update Container App com credenciais Supabase
```bash
az containerapp update \
  --name aquarios-hygeios-api \
  --resource-group rg-aquarios-hygeios \
  --image aquariosacr.azurecr.io/aquarios:latest \
  --set-env-vars \
    SUPABASE_URL="https://agebsmjsjrmazbozphnh.supabase.co" \
    SUPABASE_SERVICE_ROLE_KEY="seu_service_key_aqui" \
    PORT="8000"
```

### 4️⃣ Obter URL do Container App
```bash
az containerapp show \
  --name aquarios-hygeios-api \
  --resource-group rg-aquarios-hygeios \
  --query properties.configuration.ingress.fqdn \
  -o tsv
```

### 5️⃣ Testar Endpoints
```bash
# Health
curl https://FQDN/health

# Admin Settings
curl https://FQDN/admin/settings

# SandeirOS Cache
curl -X POST https://FQDN/sandeiros/responder \
  -H "Content-Type: application/json" \
  -d '{"prompt": "SWOT Nubank", "idioma": "pt"}'

# HygeiOS Insights
curl https://FQDN/hygeios/insights/me?user_id=UUID
```

## Credenciais Necessárias

- **SUPABASE_SERVICE_ROLE_KEY**: 
  - Local: `C:\Users\DWOS\Desktop\AquariOS\aquarios-v2-complete\supabase/.temp/pooler-url`
  - Ou: Supabase Dashboard → Settings → API → Service Role

## Próximas Fases (após deploy OK)
- Item 4: SLOs (telemetria)
- Item 5: AlexandriOS (ajuda)
- Failover: ligar Oracle VM como primário
