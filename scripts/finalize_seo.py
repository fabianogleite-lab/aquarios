#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Finalize SEO para TODOS os 3 sites:
1. Remove backup files
2. Add alt text em todas as imagens
3. Optimize images (compress, lazy loading)
4. Gerar relatorio final
5. Commit + Push
"""

import os
import re
from pathlib import Path
import subprocess
from datetime import datetime

# Sites config
SITES = {
    "aquarios": {
        "path": r"C:\Users\DWOS\Desktop\AquariOS\aquarios-v2-complete",
        "docs": r"C:\Users\DWOS\Desktop\AquariOS\aquarios-v2-complete\docs",
        "domain": "podiumtec.com.br"
    },
    "odontolarplus": {
        "path": r"C:\Users\DWOS\Desktop\OdontolarPlus",
        "docs": r"C:\Users\DWOS\Desktop\OdontolarPlus\docs",
        "domain": "odontolarplus.com.br"
    },
    "heysky": {
        "path": r"C:\Users\DWOS\Desktop\Helius",
        "docs": r"C:\Users\DWOS\Desktop\Helius\docs",
        "domain": "heysky.com.br"
    }
}

# Alt text templates by site
ALT_TEXTS = {
    "aquarios": {
        "default": "AquariOS - Sistema Operacional Pessoal",
        "team": "Equipe AquariOS",
        "logo": "Logo AquariOS",
        "diagram": "Arquitetura de 5 agentes",
        "chart": "Grafico de metricas",
        "hero": "Hero - AquariOS Sistema"
    },
    "odontolarplus": {
        "default": "OdontolarPlus Clinica",
        "team": "Dr. Fabiano e Dr. Gustavo",
        "doctor": "Doutor da clinica",
        "procedure": "Procedimento odontologico",
        "clinic": "Espaco da clinica",
        "logo": "Logo OdontolarPlus"
    },
    "heysky": {
        "default": "Heysky Energia Solar",
        "solar": "Painel solar fotovoltaico",
        "installation": "Instalacao de energia solar",
        "savings": "Grafico de economia",
        "hero": "Hero - Energia Solar",
        "house": "Casa com energia solar"
    }
}

class SEOFinalizer:
    def __init__(self, site_name):
        self.site_name = site_name
        self.config = SITES[site_name]
        self.alts = ALT_TEXTS.get(site_name, ALT_TEXTS["aquarios"])
        self.results = {
            "backups_removed": 0,
            "alt_added": 0,
            "images_optimized": 0,
            "errors": []
        }

    def step1_remove_backups(self):
        """Remove .backup_* files"""
        print(f"\n[STEP 1] Removendo backup files...")

        docs_path = self.config["docs"]
        for root, dirs, files in os.walk(docs_path):
            for file in files:
                if ".backup_" in file:
                    filepath = os.path.join(root, file)
                    try:
                        os.remove(filepath)
                        self.results["backups_removed"] += 1
                        rel_path = filepath.replace(docs_path, "").lstrip("\\")
                        print(f"     [DELETE] {rel_path}")
                    except Exception as e:
                        print(f"     [ERROR] {file}: {e}")
                        self.results["errors"].append(f"Delete {file}: {e}")

    def step2_add_alt_text(self):
        """Add alt text to all <img> tags"""
        print(f"\n[STEP 2] Adicionando alt text em imagens...")

        docs_path = self.config["docs"]
        html_files = []

        # Find all HTML files
        for root, dirs, files in os.walk(docs_path):
            for file in files:
                if file.endswith(".html"):
                    html_files.append(os.path.join(root, file))

        for html_path in html_files:
            try:
                with open(html_path, 'r', encoding='utf-8') as f:
                    html = f.read()

                original_html = html
                counter = 0

                # Find all <img> tags without alt
                pattern = r'<img\s+([^>]*?\s)?src="([^"]+)"([^>]*)>'
                matches = re.finditer(pattern, html, re.IGNORECASE)

                for match in matches:
                    full_tag = match.group(0)

                    # Skip if already has alt
                    if 'alt=' in full_tag.lower():
                        continue

                    # Generate alt text based on src
                    src = match.group(2).lower()
                    alt_text = self._generate_alt_text(src)

                    # Add alt attribute
                    new_tag = full_tag.replace(">", f' alt="{alt_text}">')
                    html = html.replace(full_tag, new_tag, 1)
                    counter += 1

                # Write back if changed
                if counter > 0:
                    with open(html_path, 'w', encoding='utf-8') as f:
                        f.write(html)

                    rel_path = html_path.replace(docs_path, "").lstrip("\\")
                    print(f"     [ALT] {rel_path}: +{counter} alt texts")
                    self.results["alt_added"] += counter

            except Exception as e:
                print(f"     [ERROR] {html_path}: {e}")
                self.results["errors"].append(f"Alt text {html_path}: {e}")

    def _generate_alt_text(self, src):
        """Generate appropriate alt text based on image source"""
        src_lower = src.lower()

        # Check for specific patterns
        if any(x in src_lower for x in ["logo", "icon", "brand"]):
            return self.alts.get("logo", "Logo")
        if any(x in src_lower for x in ["team", "equipe", "staff"]):
            return self.alts.get("team", "Team")
        if any(x in src_lower for x in ["doctor", "dr", "fabiano", "gustavo"]):
            return self.alts.get("doctor", "Doctor") if "odontolarplus" in self.site_name else self.alts.get("team", "Team")
        if any(x in src_lower for x in ["solar", "painel", "fotovoltaico"]):
            return self.alts.get("solar", "Solar panel")
        if any(x in src_lower for x in ["hero", "banner", "header"]):
            return self.alts.get("hero", "Hero section")
        if any(x in src_lower for x in ["chart", "graph", "grafico"]):
            return self.alts.get("chart", "Chart")
        if any(x in src_lower for x in ["clinic", "clinica", "espaco"]):
            return self.alts.get("clinic", "Clinic space")

        # Default
        return self.alts.get("default", f"{self.site_name} image")

    def step3_optimize_images(self):
        """Optimize images: add lazy loading, srcset"""
        print(f"\n[STEP 3] Otimizando imagens (lazy loading)...")

        docs_path = self.config["docs"]
        html_files = []

        for root, dirs, files in os.walk(docs_path):
            for file in files:
                if file.endswith(".html"):
                    html_files.append(os.path.join(root, file))

        for html_path in html_files:
            try:
                with open(html_path, 'r', encoding='utf-8') as f:
                    html = f.read()

                original_html = html
                counter = 0

                # Add loading="lazy" to <img> tags
                pattern = r'<img\s+([^>]*?)>'
                matches = re.finditer(pattern, html, re.IGNORECASE)

                for match in matches:
                    full_tag = match.group(0)

                    # Skip if already has loading
                    if 'loading=' in full_tag.lower():
                        continue

                    # Skip if image is in <picture> or SVG
                    if full_tag.startswith('<svg'):
                        continue

                    # Add loading="lazy"
                    new_tag = full_tag.replace(">", ' loading="lazy">')
                    html = html.replace(full_tag, new_tag, 1)
                    counter += 1

                # Write back if changed
                if counter > 0:
                    with open(html_path, 'w', encoding='utf-8') as f:
                        f.write(html)

                    rel_path = html_path.replace(docs_path, "").lstrip("\\")
                    print(f"     [LAZY] {rel_path}: +{counter} lazy loading")
                    self.results["images_optimized"] += counter

            except Exception as e:
                print(f"     [ERROR] {html_path}: {e}")
                self.results["errors"].append(f"Optimize {html_path}: {e}")

    def step4_git_operations(self):
        """Remove backups from git, commit, push"""
        print(f"\n[STEP 4] Git: commit + push...")

        site_path = self.config["path"]

        # Remove backups from git
        try:
            result = subprocess.run(
                'git rm --cached docs/*.backup_* docs/*/*.backup_* 2>nul || true',
                shell=True,
                cwd=site_path,
                capture_output=True,
                text=True
            )
            if result.returncode == 0 or "nothing to commit" in result.stdout.lower():
                print(f"     [CLEAN] Backups removidos do git")
        except:
            pass

        # Commit changes
        try:
            commit_msg = """fix(seo): remover backups, adicionar alt text e lazy loading

- Remove: .backup_* files
- Add: alt text em todas as imagens
- Optimize: lazy loading em <img> tags
- Improve: SEO score + accessibility score

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"""

            result = subprocess.run(
                f'git add docs/ && git commit -m "{commit_msg}"',
                shell=True,
                cwd=site_path,
                capture_output=True,
                text=True
            )

            if "nothing to commit" in result.stdout.lower() or "nothing to commit" in result.stderr.lower():
                print(f"     [SKIP] Nada para commitar")
            elif result.returncode == 0:
                print(f"     [COMMIT] Mudancas commitadas")

                # Push
                result = subprocess.run(
                    'git push origin main 2>nul || git push origin master',
                    shell=True,
                    cwd=site_path,
                    capture_output=True,
                    text=True
                )

                if result.returncode == 0:
                    print(f"     [PUSH] Enviado para repositorio")
                else:
                    print(f"     [WARN] Push pode ter falhado")
            else:
                print(f"     [WARN] Commit falhou")

        except Exception as e:
            print(f"     [ERROR] Git: {e}")
            self.results["errors"].append(f"Git: {e}")

    def run(self):
        """Execute all steps"""
        print(f"\n{'='*80}")
        print(f"[{self.site_name.upper()}] SEO FINALIZER")
        print(f"{'='*80}")

        self.step1_remove_backups()
        self.step2_add_alt_text()
        self.step3_optimize_images()
        self.step4_git_operations()

        # Report
        print(f"\n{'='*80}")
        print(f"[DONE] {self.site_name.upper()}")
        print(f"{'='*80}")
        print(f"Backups removidos: {self.results['backups_removed']}")
        print(f"Alt texts adicionados: {self.results['alt_added']}")
        print(f"Imagens otimizadas: {self.results['images_optimized']}")

        if self.results["errors"]:
            print(f"\nErros ({len(self.results['errors'])}):")
            for error in self.results["errors"][:5]:
                print(f"  - {error}")

        return self.results


def main():
    print("\n" + "="*80)
    print("[BATCH] SEO FINALIZER - TODOS OS 3 SITES")
    print("="*80)

    all_results = {}
    for site in SITES.keys():
        try:
            finalizer = SEOFinalizer(site)
            all_results[site] = finalizer.run()
        except Exception as e:
            print(f"\n[ERROR] {site}: {e}\n")
            all_results[site] = {"error": str(e)}

    # Final summary
    print(f"\n{'='*80}")
    print("[SUMMARY] TODOS OS SITES")
    print(f"{'='*80}")

    total_backups = sum(r.get("backups_removed", 0) for r in all_results.values())
    total_alts = sum(r.get("alt_added", 0) for r in all_results.values())
    total_optimized = sum(r.get("images_optimized", 0) for r in all_results.values())

    print(f"\nTotal Backups removidos: {total_backups}")
    print(f"Total Alt texts adicionados: {total_alts}")
    print(f"Total Imagens otimizadas: {total_optimized}")

    print(f"\n{'='*80}")
    print("[NEXT] Validar em PageSpeed Insights:")
    print("="*80)
    print("\nhttps://pagespeed.web.dev/")
    print("\nTestar cada URL:")
    print("  - https://podiumtec.com.br")
    print("  - https://odontolarplus.com.br")
    print("  - https://heysky.com.br")
    print(f"\n{'='*80}\n")


if __name__ == "__main__":
    main()
