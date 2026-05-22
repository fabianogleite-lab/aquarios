#!/usr/bin/env python3
"""
Deploy Edge Function via Supabase Management API
Nao requer login interativo
"""

import requests
import json
import sys
import os

# Fix encoding para Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def read_function_code():
    """Le o conteudo da Edge Function"""
    path = "supabase/functions/chat/index.ts"
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def deploy():
    """Faz o deploy via API Management do Supabase"""

    # Configuracoes
    PROJECT_ID = "agebsmjsjrmazbozphnh"
    FUNCTION_NAME = "chat"

    # Service Role Key (tem permissao para deployar funcoes)
    # Esta chave esta no seu Supabase Dashboard > Project Settings > API
    SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZWJzbWpzanJtYXpibnpwaG5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNjQwNzA1MiwiZXhwIjoxNzMxOTU5MDUyfQ.SQlXJlZDz5g-z0YYm_8YqKiQh_Lh8z5Z7R2G4h3J5K8"

    print("\n" + "="*50)
    print("[*] Deploy via Supabase Management API")
    print("="*50 + "\n")

    # Ler o codigo da funcao
    print("[*] Lendo codigo da Edge Function...")
    try:
        code = read_function_code()
        print(f"    OK - {len(code)} bytes\n")
    except Exception as e:
        print(f"[!] Erro ao ler arquivo: {e}\n")
        return False

    # Preparar payload
    print("[*] Preparando payload...")
    payload = {
        "name": FUNCTION_NAME,
        "slug": FUNCTION_NAME,
        "body": code,
    }
    print("    OK - Payload pronto\n")

    # Fazer o deploy
    print("[*] Enviando para Supabase...")
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }

    url = f"https://api.supabase.com/v1/projects/{PROJECT_ID}/functions"

    try:
        # Tenta criar a funcao (POST)
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=30
        )

        if response.status_code in [200, 201, 202]:
            print(f"    OK - Status {response.status_code}")
            print(f"    Resposta: {response.text[:200]}\n")
            return True
        elif response.status_code == 409:
            # Funcao ja existe, tentar atualizar (PUT)
            print(f"    Funcao ja existe, atualizando...")
            url_update = f"{url}/{FUNCTION_NAME}"
            response = requests.put(
                url_update,
                json=payload,
                headers=headers,
                timeout=30
            )
            if response.status_code in [200, 201, 202]:
                print(f"    OK - Atualizado Status {response.status_code}\n")
                return True
            else:
                print(f"    [!] Erro {response.status_code}: {response.text}\n")
                return False
        else:
            print(f"    [!] Erro {response.status_code}")
            print(f"    Resposta: {response.text}\n")
            return False
    except Exception as e:
        print(f"    [!] Erro na requisicao: {e}\n")
        return False

if __name__ == "__main__":
    print("\n[*] AquariOS - Deploy Edge Function via API\n")

    if deploy():
        print("="*50)
        print("[OK] Deploy concluido com sucesso!")
        print("="*50)
        print("\n[*] ProteOS Chat esta pronto para usar!")
        print("    Teste no app mobile digitando uma mensagem no Chat.\n")
        sys.exit(0)
    else:
        print("="*50)
        print("[!] Erro no deploy")
        print("="*50 + "\n")
        sys.exit(1)
