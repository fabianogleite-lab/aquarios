"""Motor ARKHE — gera as pecas de feed (1080x1080) por pais a partir do template + i18n."""
import json
from pathlib import Path
from xml.sax.saxutils import escape

BASE_DIR = Path(__file__).resolve().parent
TEMPLATE_PATH = BASE_DIR / "templates" / "feed_1080.svg"
I18N_DIR = BASE_DIR / "i18n"
OUTPUT_DIR = BASE_DIR.parent / "pecas"

CANVAS = 1080
MARGIN = 80
AVAILABLE_WIDTH = CANVAS - 2 * MARGIN

HEADLINE_SIZE = 72
HEADLINE_LINE_HEIGHT = 84
HEADLINE_CHAR_RATIO = 0.56

BODY_SIZE = 34
BODY_LINE_HEIGHT = 48
BODY_CHAR_RATIO = 0.50

CTA_FONT_SIZE = 32
CTA_PADDING_X = 48
CTA_CHAR_RATIO = 0.56

PNG_AVAILABLE = True


def wrap_text(text, max_chars):
    words = text.split()
    lines, current = [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        if len(trial) <= max_chars or not current:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def build_tspans(text, font_size, line_height, char_ratio):
    max_chars = max(1, int(AVAILABLE_WIDTH / (font_size * char_ratio)))
    lines = wrap_text(text, max_chars)
    spans = []
    for i, line in enumerate(lines):
        dy = 0 if i == 0 else line_height
        spans.append(f'<tspan x="{MARGIN}" dy="{dy}">{escape(line)}</tspan>')
    return "\n    ".join(spans)


def build_cta(cta_text):
    text_width = len(cta_text) * CTA_FONT_SIZE * CTA_CHAR_RATIO
    pill_width = int(text_width + 2 * CTA_PADDING_X)
    return escape(cta_text), pill_width


def render(template, country_meta, variant_id, variant):
    cta_text, cta_width = build_cta(variant["cta"])
    svg = template
    svg = svg.replace("__HEADLINE_TSPANS__", build_tspans(variant["headline"], HEADLINE_SIZE, HEADLINE_LINE_HEIGHT, HEADLINE_CHAR_RATIO))
    svg = svg.replace("__BODY_TSPANS__", build_tspans(variant["body"], BODY_SIZE, BODY_LINE_HEIGHT, BODY_CHAR_RATIO))
    svg = svg.replace("__CTA_TEXT__", cta_text)
    svg = svg.replace("__CTA_WIDTH__", str(cta_width))
    svg = svg.replace("__PAIS__", escape(country_meta["pais"]))
    svg = svg.replace("__LOCALE__", country_meta["locale"])
    svg = svg.replace("__VARIANT__", variant_id)
    return svg


def svg_to_png(svg_path, png_path):
    global PNG_AVAILABLE
    if not PNG_AVAILABLE:
        return
    try:
        import cairosvg
        cairosvg.svg2png(url=str(svg_path), write_to=str(png_path), output_width=CANVAS, output_height=CANVAS)
    except Exception as exc:
        PNG_AVAILABLE = False
        print(f"\n[aviso] PNG indisponivel ({exc}). SVGs gerados normalmente;")
        print("        abra-os no navegador ou importe no Figma para visualizar/exportar PNG.\n")


def main():
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    i18n_files = sorted(I18N_DIR.glob("*.json"))
    if not i18n_files:
        raise SystemExit(f"Nenhum arquivo i18n encontrado em {I18N_DIR}")

    total = 0
    for i18n_path in i18n_files:
        country_code = i18n_path.stem
        country = json.loads(i18n_path.read_text(encoding="utf-8"))
        out_dir = OUTPUT_DIR / country_code
        out_dir.mkdir(parents=True, exist_ok=True)

        for variant_id, variant in country["variants"].items():
            svg = render(template, country, variant_id, variant)
            svg_path = out_dir / f"feed-{variant_id}.svg"
            svg_path.write_text(svg, encoding="utf-8")
            svg_to_png(svg_path, out_dir / f"feed-{variant_id}.png")
            total += 1
            print(f"  {country_code}/feed-{variant_id}.svg  [{country['locale']}] {variant['label']}: {variant['headline'][:48]}")

    print(f"\n{total} pecas geradas em {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
