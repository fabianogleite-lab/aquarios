#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SEO Tags + OG Images para TODOS os sites
Use: python3 seo_multi_site.py [site]
     site: aquarios | odontolarplus | heysky | all
"""

import os
import re
import sys
from datetime import datetime
from pathlib import Path
import shutil
from PIL import Image, ImageDraw, ImageFont
import random
import json

# ============================================================================
# CONFIGURACAO POR SITE
# ============================================================================

SITES_CONFIG = {
    "aquarios": {
        "name": "AquariOS",
        "docs_path": r"C:\Users\DWOS\Desktop\AquariOS\aquarios-v2-complete\docs",
        "photos_path": r"C:\Users\DWOS\Desktop\FOTOS CLINICA\seleção",
        "domain": "https://podiumtec.com.br",
        "pages": {
            "index.html": {
                "description": "Assistente pessoal de saude com IA. 4 dimensoes e iVi.",
                "og_title": "AquariOS — Sistema Operacional Pessoal",
                "og_description": "Assistente pessoal de saude com IA. 4 dimensoes e iVi.",
                "color": (124, 92, 191)  # Purple
            }
        }
    },
    "odontolarplus": {
        "name": "OdontolarPlus",
        "docs_path": r"C:\Users\DWOS\Desktop\OdontolarPlus\docs",
        "photos_path": r"C:\Users\DWOS\Desktop\FOTOS CLINICA\seleção",
        "domain": "https://odontolarplus.com.br",
        "pages": {
            "index.html": {
                "description": "Clinica de odontologia com tecnologia. Implantes, alinhadores, estetica.",
                "og_title": "OdontolarPlus — Sua Clinica Odontologica",
                "og_description": "Implantes, alinhadores, protese. Dr. Fabiano e Dr. Gustavo.",
                "color": (224, 123, 84)  # Orange
            }
        }
    },
    "heysky": {
        "name": "Heysky",
        "docs_path": r"C:\Users\DWOS\Desktop\Helius\docs",
        "photos_path": r"C:\Users\DWOS\Desktop\FOTOS CLINICA\seleção",
        "domain": "https://heysky.com.br",
        "pages": {
            "index.html": {
                "description": "Energia solar fotovoltaica em BH. Economize ate 95% na conta de luz.",
                "og_title": "Heysky — Energia Solar",
                "og_description": "Energia solar inteligente. Economize ate 95% na sua conta de luz.",
                "color": (245, 184, 0)  # Gold
            }
        }
    }
}

# ============================================================================
# FUNCOES PRINCIPAIS
# ============================================================================

class SEOMultiSite:
    def __init__(self, site_name):
        if site_name not in SITES_CONFIG:
            raise ValueError(f"Site desconhecido: {site_name}")

        self.site_name = site_name
        self.config = SITES_CONFIG[site_name]
        self.docs_path = self.config["docs_path"]
        self.domain = self.config["domain"]
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.results = {"success": 0, "errors": 0}

    def add_seo_tags(self):
        """Adicionar meta tags, OG, canonical, schema"""
        print(f"\n[1/2] Adicionando SEO tags...")

        for page_name, page_config in self.config["pages"].items():
            filepath = os.path.join(self.docs_path, page_name)
            if not os.path.exists(filepath):
                print(f"     [SKIP] {page_name} nao encontrado")
                continue

            print(f"     [PROCESS] {page_name}")

            # Ler HTML
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()

            # Backup
            backup = f"{filepath}.backup_{self.timestamp}"
            shutil.copy2(filepath, backup)

            # Meta description
            if not re.search(r'<meta\s+name=["\']?description', html, re.IGNORECASE):
                desc_tag = f'<meta name="description" content="{page_config["description"]}">'
                html = re.sub(
                    r'(<title>[^<]*</title>)',
                    r'\1\n    ' + desc_tag,
                    html,
                    count=1,
                    flags=re.IGNORECASE
                )

            # OG tags
            if not re.search(r'<meta\s+property=["\']?og:title', html, re.IGNORECASE):
                og_tags = f'''<meta property="og:title" content="{page_config['og_title']}">
    <meta property="og:description" content="{page_config['og_description']}">
    <meta property="og:image" content="{self.domain}/og-{page_name.replace('.html', '')}.png">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{self.domain}/{page_name}">'''
                html = re.sub(
                    r'(<title>[^<]*</title>)',
                    r'\1\n    ' + og_tags,
                    html,
                    count=1,
                    flags=re.IGNORECASE
                )

            # Canonical
            if not re.search(r'<link\s+rel=["\']?canonical', html, re.IGNORECASE):
                canonical = f'<link rel="canonical" href="{self.domain}/{page_name}">'
                html = re.sub(
                    r'(</head>)',
                    '    ' + canonical + '\n    ' + r'\1',
                    html,
                    count=1,
                    flags=re.IGNORECASE
                )

            # Schema.org
            if not re.search(r'<script\s+type=["\']?application/ld\+json', html, re.IGNORECASE):
                schema = {
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": page_config["og_title"],
                    "description": page_config["description"],
                    "url": f"{self.domain}/{page_name}"
                }
                schema_json = json.dumps(schema, ensure_ascii=False, indent=2)
                schema_tag = f'<script type="application/ld+json">\n{schema_json}\n</script>'
                html = re.sub(
                    r'(</head>)',
                    '    ' + schema_tag + '\n    ' + r'\1',
                    html,
                    count=1,
                    flags=re.IGNORECASE
                )

            # Salvar
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)

            self.results["success"] += 1
            print(f"          [DONE] Meta + OG + Canonical + Schema")

    def create_og_images(self):
        """Criar 9 OG images (1200x630)"""
        print(f"\n[2/2] Criando OG images (1200x630px)...")

        if not os.path.exists(self.config["photos_path"]):
            print(f"     [SKIP] Pasta de fotos nao encontrada")
            return

        for page_name in self.config["pages"].keys():
            og_filename = f"og-{page_name.replace('.html', '')}.png"
            og_path = os.path.join(self.docs_path, og_filename)

            print(f"     [CREATE] {og_filename}")

            try:
                # Pick random photo
                photos = [f for f in os.listdir(self.config["photos_path"])
                         if f.lower().endswith(('.jpg', '.jpeg'))]
                if not photos:
                    raise FileNotFoundError("Nenhuma foto disponivel")

                photo_path = os.path.join(self.config["photos_path"], random.choice(photos))

                # Load and resize
                bg = Image.open(photo_path).convert("RGB")
                bg.thumbnail((1200, 630), Image.Resampling.LANCZOS)

                # Create OG image
                final = Image.new("RGB", (1200, 630), (237, 234, 228))
                offset = ((1200 - bg.width) // 2, (630 - bg.height) // 2)
                final.paste(bg, offset)

                # Overlay
                overlay = Image.new("RGBA", (1200, 630), (26, 31, 46, 180))
                final = Image.alpha_composite(final.convert("RGBA"), overlay).convert("RGB")

                # Text
                draw = ImageDraw.Draw(final)
                try:
                    title_font = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 80)
                    brand_font = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 28)
                except:
                    title_font = ImageFont.load_default()
                    brand_font = ImageFont.load_default()

                # Title
                title = self.config["name"]
                title_bbox = draw.textbbox((0, 0), title, font=title_font)
                title_x = (1200 - (title_bbox[2] - title_bbox[0])) // 2
                draw.text((title_x, 250), title, fill=(255, 255, 255), font=title_font)

                # Brand
                brand = self.domain.replace("https://", "")
                brand_bbox = draw.textbbox((0, 0), brand, font=brand_font)
                brand_x = (1200 - (brand_bbox[2] - brand_bbox[0])) // 2
                draw.text((brand_x, 550), brand, fill=(255, 255, 255), font=brand_font)

                # Save
                final.save(og_path, "JPEG", quality=90, optimize=True)
                size_kb = os.path.getsize(og_path) / 1024
                print(f"          [SAVED] {size_kb:.1f}KB")
                self.results["success"] += 1

            except Exception as e:
                print(f"          [ERROR] {e}")
                self.results["errors"] += 1

    def run(self):
        """Execute all steps"""
        print("="*80)
        print(f"[{self.site_name.upper()}] SEO Automation")
        print("="*80)

        self.add_seo_tags()
        self.create_og_images()

        # Report
        print(f"\n{'='*80}")
        print(f"[DONE] {self.results['success']} operacoes bem-sucedidas")
        print(f"{'='*80}\n")


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    site_arg = sys.argv[1] if len(sys.argv) > 1 else "all"

    sites_to_process = []
    if site_arg == "all":
        sites_to_process = list(SITES_CONFIG.keys())
    elif site_arg in SITES_CONFIG:
        sites_to_process = [site_arg]
    else:
        print(f"[ERROR] Site desconhecido: {site_arg}")
        print(f"Opcoes: {', '.join(SITES_CONFIG.keys())} | all")
        sys.exit(1)

    print("\n" + "="*80)
    print(f"[BATCH] Processando {len(sites_to_process)} site(s)")
    print("="*80)

    for site in sites_to_process:
        try:
            processor = SEOMultiSite(site)
            processor.run()
        except Exception as e:
            print(f"[ERROR] {site}: {e}\n")

    print("\n" + "="*80)
    print("[PROXIMO] Para cada site:")
    print("="*80)
    print("1. cd [site_path]")
    print("2. git add docs/")
    print("3. git commit -m 'feat(seo): adicionar tags e OG images'")
    print("4. git push origin main")
    print("="*80 + "\n")
