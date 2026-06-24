#!/bin/bash
# Deploy FastAPI no Container App Azure

set -e

RG="rg-aquarios-hygeios"
APP_NAME="aquarios-hygeios-api"
ACR="aquariosacr"
IMAGE="$ACR.azurecr.io/aquarios:latest"

echo "🔑 Configurando ACR credentials no Container App..."
ACR_PASS=$(az acr credential show --name $ACR --query passwords[0].value -o tsv)
ACR_USER=$(az acr credential show --name $ACR --query username -o tsv)

az containerapp update \
  --name $APP_NAME \
  --resource-group $RG \
  --image $IMAGE \
  --set-env-vars \
    SUPABASE_URL="https://agebsmjsjrmazbozphnh.supabase.co" \
    SUPABASE_SERVICE_ROLE_KEY="COLOCAR_AQUI" \
    PORT="8000" \
  --registry-login-server "$ACR.azurecr.io" \
  --registry-username "$ACR_USER" \
  --registry-password "$ACR_PASS" 2>&1 | grep -E "(updated|error)"

echo "✅ Container App deployado"
echo "URL: https://$(az containerapp show --name $APP_NAME -g $RG --query properties.configuration.ingress.fqdn -o tsv)"

echo "⏳ Aguardando app estar pronto (2min)..."
sleep 120

echo "🧪 Testando /health..."
URL=$(az containerapp show --name $APP_NAME -g $RG --query properties.configuration.ingress.fqdn -o tsv)
curl -s "https://$URL/health" | head -20

echo "✅ Deploy Azure completo!"
