#!/usr/bin/env python3
"""
Script para submeter sitemaps ao Google Search Console
Requer: credenciais OAuth2 configuradas em ~/.config/gcloud/
"""

import sys
import json
from pathlib import Path

try:
    from google.auth.transport.requests import Request
    from google.oauth2.service_account import Credentials
    from google.oauth2 import service_account
    import google.auth
    import requests
except ImportError:
    print("⚠️ Dependências faltando. Instale com:")
    print("   pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
    sys.exit(1)

PROPERTY = "https://podiumtec.com.br/"
SITEMAPS = [
    "https://podiumtec.com.br/sitemap.xml",
    "https://podiumtec.com.br/escambos/sitemap.xml",
    "https://podiumtec.com.br/heysky/sitemap.xml",
]

def submit_sitemap_via_curl(sitemap_url: str) -> bool:
    """Submete sitemap via curl (requer autenticação manual primeiro)"""
    import subprocess

    print(f"\n🔗 Verificando acesso a {sitemap_url}...")
    try:
        resp = subprocess.run(
            ["curl", "-sI", sitemap_url],
            capture_output=True,
            timeout=5,
            text=True
        )
        if "200" in resp.stdout:
            print(f"   ✅ {sitemap_url} — 200 OK")
            return True
        else:
            print(f"   ❌ {sitemap_url} — {resp.stdout.split()[1] if len(resp.stdout.split()) > 1 else 'erro'}")
            return False
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return False

def submit_sitemap_via_gsc_api(property_url: str, sitemap_url: str, credentials_file: str = None) -> bool:
    """Submete sitemap via Google Search Console API"""

    if not credentials_file:
        # Tenta encontrar credenciais do gcloud
        gcloud_creds = Path.home() / ".config" / "gcloud" / "application_default_credentials.json"
        if gcloud_creds.exists():
            credentials_file = str(gcloud_creds)
        else:
            print("⚠️ Credenciais do Google não encontradas em ~/.config/gcloud/")
            print("   Você precisa autenticar com: gcloud auth application-default login")
            return False

    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        # Carrega credenciais
        if credentials_file.endswith('.json'):
            creds = service_account.Credentials.from_service_account_file(credentials_file)
        else:
            creds, _ = google.auth.default()

        # Cria cliente da API Search Console
        service = build('webmasters', 'v3', credentials=creds)

        print(f"\n📤 Submetendo {sitemap_url}...")

        # URL-encode o sitemap
        import urllib.parse
        encoded_url = urllib.parse.quote(sitemap_url, safe=':/')

        # Submete o sitemap
        request = service.sitemaps().submit(
            siteUrl=property_url,
            feedpath=encoded_url
        )
        response = request.execute()

        print(f"   ✅ Sitemap {sitemap_url} submetido com sucesso!")
        return True

    except Exception as e:
        print(f"   ❌ Erro ao submeter via API: {e}")
        return False

def check_indexation_via_gsc_api(property_url: str, test_url: str, credentials_file: str = None) -> dict:
    """Verifica o status de indexação de uma URL"""

    if not credentials_file:
        gcloud_creds = Path.home() / ".config" / "gcloud" / "application_default_credentials.json"
        if gcloud_creds.exists():
            credentials_file = str(gcloud_creds)
        else:
            return {"status": "no_creds"}

    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        creds = service_account.Credentials.from_service_account_file(credentials_file) \
            if credentials_file.endswith('.json') else google.auth.default()[0]

        service = build('webmasters', 'v3', credentials=creds)

        print(f"\n🔍 Inspecionando {test_url}...")

        # Testa a URL ao vivo
        request = service.urlInspection().index().inspect(
            body={'inspectionUrl': test_url}
        )
        response = request.execute()

        print(f"   Resposta: {json.dumps(response, indent=2)}")
        return response

    except Exception as e:
        print(f"   ⚠️ Erro ao inspecionar: {e}")
        return {"error": str(e)}

def main():
    print("=" * 60)
    print("🚀 GOOGLE SEARCH CONSOLE — Automação de Sitemaps")
    print("=" * 60)

    # Passo 1: Verificar acessibilidade dos sitemaps
    print("\n📍 PASSO 1: Verificar acessibilidade dos sitemaps")
    all_accessible = True
    for sitemap in SITEMAPS:
        if not submit_sitemap_via_curl(sitemap):
            all_accessible = False

    if not all_accessible:
        print("\n❌ Nem todos os sitemaps estão acessíveis. Abortando.")
        return 1

    print("\n✅ Todos os sitemaps estão acessíveis!")

    # Passo 2: Tentar submeter via API (requer credenciais)
    print("\n📍 PASSO 2: Submeter sitemaps via Google Search Console API")

    # Verifica credenciais
    gcloud_creds = Path.home() / ".config" / "gcloud" / "application_default_credentials.json"
    if not gcloud_creds.exists():
        print("\n⚠️ CREDENCIAIS NÃO ENCONTRADAS")
        print("\nPara submeter automaticamente, execute:")
        print("   gcloud auth application-default login")
        print("\nDepois, execute novamente este script.")
        print("\n---")
        print("\n📋 ALTERNATIVA: Submissão manual no Google Search Console")
        print("   1. Abra: https://search.google.com/search-console/")
        print("   2. Selecione: podiumtec.com.br")
        print("   3. Menu esquerdo → Sitemaps")
        print("   4. Clique em 'Adicionar um novo sitemap'")
        print("   5. Digite os URLs abaixo:")
        for sitemap in SITEMAPS:
            print(f"      • {sitemap}")
        return 0

    print("✅ Credenciais encontradas em ~/.config/gcloud/")

    # Submete cada sitemap
    for sitemap in SITEMAPS:
        submit_sitemap_via_gsc_api(PROPERTY, sitemap, str(gcloud_creds))

    # Passo 3: Verificar indexação
    print("\n📍 PASSO 3: Verificar status de indexação da página inicial")
    check_indexation_via_gsc_api(PROPERTY, "https://podiumtec.com.br/", str(gcloud_creds))

    print("\n" + "=" * 60)
    print("✅ Pronto! Monitore o progresso em:")
    print("   https://search.google.com/search-console/")
    print("=" * 60)

    return 0

if __name__ == "__main__":
    sys.exit(main())
