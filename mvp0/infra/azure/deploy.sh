#!/bin/bash
# Deploy Azure infra + FastAPI

set -e

echo "🏗️  Inicializando Terraform..."
cd "$(dirname "$0")"
terraform init

echo "📊 Planejando..."
terraform plan -out=plan.tfplan

echo "✅ Aplicando infra..."
terraform apply plan.tfplan

echo "🔑 Extraindo credenciais..."
DB_CONN=$(terraform output -raw db_connection_string)
APP_URL=$(terraform output -raw app_url)

echo "📦 DB: $DB_CONN"
echo "🌐 APP: https://$APP_URL"

echo "⏳ Aguardando Container App estar pronto..."
sleep 30

echo "✅ Azure pronto! Próximo: deploy FastAPI"
