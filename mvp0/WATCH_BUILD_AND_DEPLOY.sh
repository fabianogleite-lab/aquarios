#!/bin/bash
# Monitora ACR build e faz deploy quando imagem estiver pronta

RG="rg-aquarios-hygeios"
APP_NAME="aquarios-hygeios-api"
ACR="aquariosacr"
IMAGE="$ACR.azurecr.io/aquarios:latest"

echo "⏳ Aguardando imagem Docker no ACR..."

for i in {1..60}; do
  if az acr repository show-tags --name $ACR --repository aquarios 2>/dev/null | grep -q latest; then
    echo "✅ Imagem pronta!"
    break
  fi
  echo "  ... tentativa $i/60"
  sleep 10
done

echo "🔐 Configurando ACR credentials..."
ACR_PASS=$(az acr credential show --name $ACR --query passwords[0].value -o tsv)
ACR_USER=$(az acr credential show --name $ACR --query username -o tsv)

echo "🚀 Deployando Container App..."
az containerapp update \
  --name $APP_NAME \
  --resource-group $RG \
  --image $IMAGE \
  --set-env-vars \
    SUPABASE_URL="https://agebsmjsjrmazbozphnh.supabase.co" \
    SUPABASE_SERVICE_ROLE_KEY="COLOCAR_AQUI_DEPOIS" \
    PORT="8000" \
  --registry-login-server "$ACR.azurecr.io" \
  --registry-username "$ACR_USER" \
  --registry-password "$ACR_PASS" 2>&1 | tail -5

FQDN=$(az containerapp show --name $APP_NAME -g $RG --query properties.configuration.ingress.fqdn -o tsv)
echo "URL: https://$FQDN"

echo "⏳ Aguardando app estar pronto (2min)..."
sleep 120

echo "🧪 Testando /health..."
curl -s "https://$FQDN/health" | head -30

echo "✅ Deploy Azure concluído!"
