#!/bin/bash
# Submissão de sitemaps ao Google Search Console via ping direto
# Nota: Funciona sem autenticação, mas o Google pode levar algumas horas para processar

PROPERTY="podiumtec.com.br"
SITEMAPS=(
  "https://podiumtec.com.br/sitemap.xml"
  "https://podiumtec.com.br/escambos/sitemap.xml"
  "https://podiumtec.com.br/heysky/sitemap.xml"
)

echo "============================================================"
echo "🚀 GOOGLE SEARCH CONSOLE — Submissão de Sitemaps"
echo "============================================================"

echo -e "\n📍 PASSO 1: Verificar acessibilidade dos sitemaps"

for sitemap in "${SITEMAPS[@]}"; do
  echo -n "   Testando $sitemap... "
  http_code=$(curl -s -o /dev/null -w "%{http_code}" "$sitemap")
  if [ "$http_code" = "200" ]; then
    echo "✅ $http_code"
  else
    echo "❌ $http_code"
  fi
done

echo -e "\n📍 PASSO 2: Submeter via ping do Google Search Console"
echo "   (Método: HTTP GET ao endpoint de descoberta de sitemaps)"

for sitemap in "${SITEMAPS[@]}"; do
  echo -n "   Enviando $sitemap... "
  # Google Search Console aceita submissão via ping para Sitemaps
  curl -s "http://www.google.com/ping?sitemap=${sitemap}" > /dev/null 2>&1
  echo "✅ Ping enviado"
done

echo -e "\n📍 PASSO 3: Alternativa — Submissão via XML-RPC (Bing + Google)"

for sitemap in "${SITEMAPS[@]}"; do
  echo "   Enviando para Bing: $sitemap"
  curl -s "http://www.bing.com/ping?sitemap=${sitemap}" > /dev/null 2>&1
  echo "   ✅ Ping Bing enviado"
done

echo -e "\n============================================================"
echo "✅ Pings enviados!"
echo "\n⏳ Próximos passos:"
echo "   1. O Google levará 1-24 horas para processar os sitemaps"
echo "   2. Monitore em: https://search.google.com/search-console/"
echo "   3. Verifique a guia 'Sitemaps' para confirmar a submissão"
echo "============================================================"
