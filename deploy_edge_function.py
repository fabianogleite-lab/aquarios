#!/usr/bin/env python3
"""
Deploy Edge Function para Supabase
Uso: python deploy_edge_function.py
"""

import subprocess
import sys
import os

# Fix encoding para Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def run_command(cmd, description):
    """Executa comando e mostra o resultado"""
    print(f"\n{'='*50}")
    print(f">> {description}")
    print(f"{'='*50}\n")

    result = subprocess.run(cmd, shell=True, capture_output=False, text=True)
    return result.returncode == 0

def main():
    print("\n" + "="*50)
    print("[*] AquariOS - Deploy Edge Function")
    print("="*50 + "\n")

    # Mudar para diretório do projeto
    project_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_dir)

    # Passo 1: Login
    if not run_command(
        "npx supabase login",
        "Passo 1/2: Login no Supabase (abre navegador)"
    ):
        print("\n[!] Erro no login. Abortando.")
        sys.exit(1)

    # Passo 2: Deploy
    if not run_command(
        "npx supabase functions deploy chat --project-ref agebsmjsjrmazbozphnh",
        "Passo 2/2: Deployando Edge Function 'chat'"
    ):
        print("\n[!] Erro no deploy. Abortando.")
        sys.exit(1)

    print("\n" + "="*50)
    print("[OK] Deploy finalizado com sucesso!")
    print("="*50)
    print("\n[*] ProteOS Chat está pronto para usar!")
    print("    Teste no app mobile digitando uma mensagem no Chat.\n")

if __name__ == "__main__":
    main()
