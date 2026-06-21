#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Create OG:Images (1200x630px) for social media sharing
Uses photos from FOTOS CLINICA/seleção folder
"""

import os
from PIL import Image, ImageDraw, ImageFont
import random

SOURCE_FOLDER = r"C:\Users\DWOS\Desktop\FOTOS CLINICA\seleção"
OUTPUT_FOLDER = r"C:\Users\DWOS\Desktop\AquariOS\aquarios-v2-complete\docs"
OG_WIDTH = 1200
OG_HEIGHT = 630

# Map each page to a unique design
PAGES = {
    "og-aquarios.png": {
        "title": "AquariOS",
        "subtitle": "Sistema Operacional Pessoal",
        "color": (124, 92, 191)  # Primary purple
    },
    "og-engenharia.png": {
        "title": "Engenharia",
        "subtitle": "Arquitetura de 5 Agentes",
        "color": (91, 141, 239)  # Mental blue
    },
    "og-investidores.png": {
        "title": "Investidores",
        "subtitle": "3 Projetos Inovadores",
        "color": (82, 201, 138)  # Social green
    },
    "og-backoffice.png": {
        "title": "Backoffice",
        "subtitle": "Gerenciamento Integrado",
        "color": (224, 123, 84)  # Physical orange
    },
    "og-privacy.png": {
        "title": "Privacidade",
        "subtitle": "Seus Dados Protegidos",
        "color": (124, 92, 191)  # Primary purple
    },
    "og-terms.png": {
        "title": "Termos",
        "subtitle": "Condicoes de Uso",
        "color": (91, 141, 239)  # Mental blue
    },
    "og-deletion.png": {
        "title": "Exclusao",
        "subtitle": "Direito ao Esquecimento",
        "color": (82, 201, 138)  # Social green
    },
    "og-escambos.png": {
        "title": "EscambOS",
        "subtitle": "Marketplace de Trocas",
        "color": (224, 123, 84)  # Physical orange
    },
    "og-heysky.png": {
        "title": "Heysky",
        "subtitle": "Energia Solar",
        "color": (245, 184, 0)  # Gold
    }
}

def get_random_photo():
    """Pick a random photo from seleção folder"""
    photos = [f for f in os.listdir(SOURCE_FOLDER) if f.lower().endswith(('.jpg', '.jpeg'))]
    if not photos:
        raise FileNotFoundError(f"No JPG files found in {SOURCE_FOLDER}")
    return os.path.join(SOURCE_FOLDER, random.choice(photos))

def create_og_image(filename, config):
    """Create OG image with background photo and overlay text"""
    print(f"\n[CREATE] {filename}")

    # Load random background photo
    bg_path = get_random_photo()
    print(f"   [BG] {os.path.basename(bg_path)}")

    try:
        # Open and resize background
        bg = Image.open(bg_path).convert("RGB")

        # Resize to 1200x630 (fill)
        bg.thumbnail((OG_WIDTH, OG_HEIGHT), Image.Resampling.LANCZOS)

        # Create final image with background
        final = Image.new("RGB", (OG_WIDTH, OG_HEIGHT), (237, 234, 228))  # bg color

        # Paste background centered
        offset = (
            (OG_WIDTH - bg.width) // 2,
            (OG_HEIGHT - bg.height) // 2
        )
        final.paste(bg, offset)

        # Create overlay (gradient effect with semi-transparent dark)
        overlay = Image.new("RGBA", (OG_WIDTH, OG_HEIGHT), (26, 31, 46, 180))
        final = Image.alpha_composite(final.convert("RGBA"), overlay).convert("RGB")

        # Add text
        draw = ImageDraw.Draw(final)

        # Try to use a nice font (fallback to default)
        try:
            title_font = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 96)
            subtitle_font = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 48)
        except:
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()

        # Draw title
        title = config["title"]
        title_bbox = draw.textbbox((0, 0), title, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_x = (OG_WIDTH - title_width) // 2
        title_y = 200

        draw.text(
            (title_x, title_y),
            title,
            fill=(255, 255, 255),
            font=title_font
        )

        # Draw subtitle
        subtitle = config["subtitle"]
        subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
        subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
        subtitle_x = (OG_WIDTH - subtitle_width) // 2
        subtitle_y = title_y + 120

        draw.text(
            (subtitle_x, subtitle_y),
            subtitle,
            fill=config["color"],
            font=subtitle_font
        )

        # Draw brand line
        draw.line(
            [(100, OG_HEIGHT - 100), (OG_WIDTH - 100, OG_HEIGHT - 100)],
            fill=config["color"],
            width=3
        )

        # Draw "podiumtec.com.br"
        try:
            brand_font = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 32)
        except:
            brand_font = ImageFont.load_default()

        brand_text = "podiumtec.com.br"
        brand_bbox = draw.textbbox((0, 0), brand_text, font=brand_font)
        brand_width = brand_bbox[2] - brand_bbox[0]
        brand_x = (OG_WIDTH - brand_width) // 2
        brand_y = OG_HEIGHT - 70

        draw.text(
            (brand_x, brand_y),
            brand_text,
            fill=(255, 255, 255),
            font=brand_font
        )

        # Save to docs/
        output_path = os.path.join(OUTPUT_FOLDER, filename)
        final.save(output_path, "JPEG", quality=90, optimize=True)

        # Get file size
        size_kb = os.path.getsize(output_path) / 1024
        print(f"   [SAVE] {output_path} ({size_kb:.1f}KB)")

        return True

    except Exception as e:
        print(f"   [ERROR] {e}")
        return False

def main():
    print("="*80)
    print("[START] OG:Images Creator (1200x630px)")
    print("="*80)

    if not os.path.exists(SOURCE_FOLDER):
        print(f"[ERROR] Source folder not found: {SOURCE_FOLDER}")
        return

    if not os.path.exists(OUTPUT_FOLDER):
        print(f"[ERROR] Output folder not found: {OUTPUT_FOLDER}")
        return

    # Create all OG images
    success_count = 0
    for filename, config in PAGES.items():
        if create_og_image(filename, config):
            success_count += 1

    # Report
    print("\n" + "="*80)
    print(f"[DONE] {success_count}/{len(PAGES)} OG images created")
    print("="*80)
    print("\nNext steps:")
    print("1. git add docs/og-*.jpg")
    print("2. git commit -m 'feat(seo): adicionar OG images (1200x630)'")
    print("3. git push origin main")
    print("\nValidar em:")
    print("   https://developers.facebook.com/tools/debug/")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()
