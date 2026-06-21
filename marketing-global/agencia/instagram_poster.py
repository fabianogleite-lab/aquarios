#!/usr/bin/env python3
"""
instagram_poster.py — Auto-publish peças em Instagram via Graph API
SVG → PNG → Compress → POST IG Feed
"""
import base64
import io
import os
from pathlib import Path

import httpx
from PIL import Image

PAGE_ACCESS_TOKEN = os.getenv("PAGE_ACCESS_TOKEN", "")
PAGE_ID = os.getenv("PAGE_ID", "")

PECAS_DIR = Path(__file__).parent / "pecas"
OUTPUT_DIR = Path(__file__).parent / ".output_ig"

async def svg_to_png(svg_path: str, output_path: str, width: int = 1080, height: int = 1080) -> bool:
    """
    Converte SVG → PNG usando librsvg ou cairosvg

    Args:
        svg_path: caminho do SVG
        output_path: caminho de saída PNG
        width, height: dimensões finais

    Returns:
        True se sucesso
    """
    try:
        import cairosvg

        cairosvg.svg2png(url=svg_path, write_to=output_path, output_width=width, output_height=height)
        return True
    except ImportError:
        try:
            # Fallback: usar ImageMagick via subprocess (não ideal, mas funciona)
            import subprocess

            subprocess.run(
                ["convert", svg_path, "-resize", f"{width}x{height}", output_path],
                check=True,
            )
            return True
        except Exception:
            print(f"⚠️ Falha ao converter {svg_path} — instale: pip install cairosvg")
            return False

async def compress_image(png_path: str, output_path: str, quality: int = 85) -> bool:
    """Comprime PNG para Instagram (max 1MB)"""
    try:
        img = Image.open(png_path)
        img.save(output_path, "JPEG", quality=quality, optimize=True)

        size_kb = os.path.getsize(output_path) / 1024
        if size_kb > 1024:
            print(f"⚠️ Imagem ainda grande ({size_kb:.0f}KB) — reduzindo quality")
            return await compress_image(png_path, output_path, quality=quality - 10)

        return True
    except Exception as e:
        print(f"❌ Erro ao comprimir: {e}")
        return False

async def post_to_instagram(
    image_path: str,
    caption: str,
    country: str = "BR",
    hashtags: str = "#AquariOS #BemEstar",
) -> dict:
    """
    Posta imagem em Instagram via Graph API

    Args:
        image_path: caminho da imagem final (JPEG)
        caption: texto da legenda
        country: país (para tracking)
        hashtags: hashtags por país

    Returns:
        {"status": "posted", "post_id": "...", "url": "..."} ou {"error": "..."}
    """

    if not PAGE_ACCESS_TOKEN or not PAGE_ID:
        return {"error": "PAGE_ACCESS_TOKEN ou PAGE_ID não configurados"}

    # Lê imagem
    with open(image_path, "rb") as f:
        image_data = f.read()

    # Cria media
    async with httpx.AsyncClient() as client:
        # Step 1: Create media object
        create_resp = await client.post(
            f"https://graph.instagram.com/v18.0/{PAGE_ID}/media",
            data={
                "image_url": f"data:image/jpeg;base64,{base64.b64encode(image_data).decode()}",
                "caption": f"{caption}\n\n{hashtags}\n\n🔗 aquarios.app",
                "media_type": "IMAGE",
                "access_token": PAGE_ACCESS_TOKEN,
            },
            timeout=30,
        )

        if create_resp.status_code != 200:
            return {"error": f"Instagram API error: {create_resp.text}"}

        media_id = create_resp.json()["id"]
        print(f"✅ Media criada: {media_id}")

        # Step 2: Publish (schedule or immediate)
        pub_resp = await client.post(
            f"https://graph.instagram.com/v18.0/{PAGE_ID}/media_publish",
            data={"creation_id": media_id, "access_token": PAGE_ACCESS_TOKEN},
            timeout=30,
        )

        if pub_resp.status_code != 200:
            return {"error": f"Publish failed: {pub_resp.text}"}

        post_id = pub_resp.json()["id"]
        return {
            "status": "posted",
            "post_id": post_id,
            "url": f"https://instagram.com/p/{post_id}",
            "country": country,
        }

async def batch_publish(country: str = "BR", dry_run: bool = True) -> list:
    """
    Publica todas as peças de um país em lote

    Args:
        country: ISO2 (BR, US, PT, NG, PE, VE)
        dry_run: se True, só testa (não publica)

    Returns:
        [{"status": "posted", "post_id": "...", "url": "..."}, ...]
    """

    country_dir = PECAS_DIR / country.lower()
    if not country_dir.exists():
        return [{"error": f"Diretório não encontrado: {country_dir}"}]

    svg_files = list(country_dir.glob("*.svg"))
    results = []

    for svg_file in svg_files:
        print(f"\n📸 Processando: {svg_file.name}")

        # SVG → PNG
        png_path = OUTPUT_DIR / f"{svg_file.stem}.png"
        OUTPUT_DIR.mkdir(exist_ok=True)

        if not await svg_to_png(str(svg_file), str(png_path)):
            results.append({"error": f"Falha ao converter {svg_file.name}"})
            continue

        # PNG → JPEG (compressed)
        jpg_path = OUTPUT_DIR / f"{svg_file.stem}.jpg"
        if not await compress_image(str(png_path), str(jpg_path)):
            results.append({"error": f"Falha ao comprimir {svg_file.name}"})
            continue

        # Post to Instagram
        if dry_run:
            print(f"   [DRY RUN] Postaria em IG: {svg_file.name}")
            results.append({"status": "dry_run", "file": svg_file.name})
        else:
            result = await post_to_instagram(
                str(jpg_path),
                caption=f"[{country}] {svg_file.stem}",
                country=country,
            )
            results.append(result)

    return results

# CLI
if __name__ == "__main__":
    import asyncio
    import sys

    country = sys.argv[1] if len(sys.argv) > 1 else "BR"
    dry_run = "--live" not in sys.argv

    results = asyncio.run(batch_publish(country, dry_run))
    for r in results:
        if "error" in r:
            print(f"❌ {r['error']}")
        elif r.get("status") == "posted":
            print(f"✅ Publicado: {r['url']}")
        elif r.get("status") == "dry_run":
            print(f"📝 [DRY RUN] {r['file']}")
