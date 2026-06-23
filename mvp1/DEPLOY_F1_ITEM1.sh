#!/bin/bash
# ✅ DEPLOY F1 SandeirOS — Item 1 Pronto
# Quando voltar: copie a password do Supabase dashboard e cole abaixo
#
# Local: Supabase → agebsmjsjrmazbozphnh → Settings → Database → Database password
# Copie a password (a parte entre os : após postgres.)

set -e

SUPABASE_PROJECT="agebsmjsjrmazbozphnh"
SUPABASE_POOLER_HOST="aws-1-sa-east-1.pooler.supabase.com"
SUPABASE_POOLER_PORT="5432"
SUPABASE_DB_USER="postgres"
SUPABASE_DB_NAME="postgres"

# Cole a password aqui (substitua SENHA_AQUI)
SUPABASE_DB_PASSWORD="adC?KMp2CX?t5tG"

if [ "$SUPABASE_DB_PASSWORD" = "SENHA_AQUI" ]; then
  echo "❌ ERRO: Substitua SENHA_AQUI pela password real do Supabase."
  exit 1
fi

DATABASE_URL="postgresql://${SUPABASE_DB_USER}:${SUPABASE_DB_PASSWORD}@${SUPABASE_POOLER_HOST}:${SUPABASE_POOLER_PORT}/${SUPABASE_DB_NAME}"

echo "📦 Aplicando migration F1 (cache_semantico)..."
psql "$DATABASE_URL" -f supabase/migrations/20260621060000_sandeiros_cache.sql

echo "📚 Carregando seed (404 respostas)..."
psql "$DATABASE_URL" -f backend/sandeiros/data/seed_cache_800.sql

echo "✅ Verificando..."
COUNT=$(psql "$DATABASE_URL" -t -c "select count(*) from public.cache_semantico;")
echo "Linhas no cache: $COUNT"

if [ "$COUNT" -eq 404 ]; then
  echo "🟢 SUCESSO! Item 1 deployado. Próximo: Item 2 (H0)"
  exit 0
else
  echo "🔴 ERRO: Esperava 404, mas encontrou $COUNT"
  exit 1
fi
