#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import json
from datetime import datetime

BASE_URL = 'https://podiumtec.com.br'
PAGES = ['/', '/engenharia.html', '/investidores.html']

print("\n" + "="*80)
print("SEO AUDIT COMPLETO - podiumtec.com.br")
print("="*80)

critical = []
warnings = []
success = []

# [1] Meta Tags
print("\n[1] META TAGS (Title, Description)")
for page in PAGES:
    try:
        url = urljoin(BASE_URL, page)
        resp = requests.get(url, timeout=5)
        soup = BeautifulSoup(resp.text, 'html.parser')

        title = soup.find('title')
        desc = soup.find('meta', {'name': 'description'})

        title_len = len(title.string) if title and title.string else 0
        desc_len = len(desc.get('content')) if desc else 0

        if title_len == 0:
            critical.append(f"{page}: SEM TITLE TAG")
            print(f"  X {page}: SEM TITLE (CRITICO)")
        elif title_len > 60:
            warnings.append(f"{page}: Title muito longo ({title_len})")
            print(f"  ! {page}: Title {title_len} chars (ideal 50-60)")
        else:
            success.append(f"{page}: Title correto")
            print(f"  + {page}: Title OK ({title_len} chars)")

        if desc_len == 0:
            critical.append(f"{page}: SEM META DESCRIPTION")
            print(f"    X SEM DESCRIPTION (CRITICO)")
        elif desc_len < 120:
            warnings.append(f"{page}: Description curta")
            print(f"    ! Description {desc_len} chars (ideal 150+)")
        else:
            success.append(f"{page}: Description OK")
            print(f"    + Description OK ({desc_len} chars)")

    except Exception as e:
        print(f"  ERRO: {page} - {e}")

# [2] Headings
print("\n[2] HEADINGS (H1-H6)")
for page in PAGES[:2]:
    try:
        url = urljoin(BASE_URL, page)
        resp = requests.get(url, timeout=5)
        soup = BeautifulSoup(resp.text, 'html.parser')

        h1_count = len(soup.find_all('h1'))
        h2_count = len(soup.find_all('h2'))

        if h1_count == 0:
            critical.append(f"{page}: SEM H1")
            print(f"  X {page}: SEM H1 (CRITICO)")
        elif h1_count > 1:
            warnings.append(f"{page}: {h1_count} H1s (deve ter 1)")
            print(f"  ! {page}: {h1_count} H1s (deve ter apenas 1)")
        else:
            success.append(f"{page}: Headings correto")
            print(f"  + {page}: H1=1, H2={h2_count} (OK)")

    except Exception as e:
        print(f"  ERRO: {e}")

# [3] Open Graph Tags
print("\n[3] OPEN GRAPH TAGS (Redes Sociais)")
for page in PAGES[:2]:
    try:
        url = urljoin(BASE_URL, page)
        resp = requests.get(url, timeout=5)
        soup = BeautifulSoup(resp.text, 'html.parser')

        og_title = soup.find('meta', {'property': 'og:title'})
        og_desc = soup.find('meta', {'property': 'og:description'})
        og_image = soup.find('meta', {'property': 'og:image'})

        if og_title and og_desc and og_image:
            success.append(f"{page}: OG tags completo")
            print(f"  + {page}: OG tags OK")
        else:
            missing = []
            if not og_title: missing.append('og:title')
            if not og_desc: missing.append('og:description')
            if not og_image: missing.append('og:image')
            warnings.append(f"{page}: Faltam OG tags: {', '.join(missing)}")
            print(f"  ! {page}: Faltam {', '.join(missing)}")

    except Exception as e:
        print(f"  ERRO: {e}")

# [4] Schema.org JSON-LD
print("\n[4] SCHEMA.ORG (JSON-LD)")
schema_found = False
for page in PAGES[:2]:
    try:
        url = urljoin(BASE_URL, page)
        resp = requests.get(url, timeout=5)
        soup = BeautifulSoup(resp.text, 'html.parser')

        schemas = soup.find_all('script', {'type': 'application/ld+json'})
        if schemas:
            schema_found = True
            print(f"  + {page}: {len(schemas)} schema(s) JSON-LD")
            success.append(f"{page}: Schema.org implementado")
        else:
            warnings.append(f"{page}: Sem schema.org")
            print(f"  ! {page}: Sem schema.org")

    except Exception as e:
        print(f"  ERRO: {e}")

if not schema_found:
    warnings.append("Nenhuma pagina com schema.org - implementar para rich snippets")

# [5] Mobile Responsiveness
print("\n[5] MOBILE RESPONSIVENESS")
try:
    resp = requests.get(BASE_URL, timeout=5)
    soup = BeautifulSoup(resp.text, 'html.parser')

    viewport = soup.find('meta', {'name': 'viewport'})
    if viewport and 'width=device-width' in viewport.get('content', ''):
        success.append("Mobile viewport otimizado")
        print("  + Viewport meta tag OK")
    else:
        if not viewport:
            critical.append("Sem viewport - site nao e mobile-friendly")
            print("  X Sem viewport meta (CRITICO)")
        else:
            warnings.append("Viewport nao otimizado")
            print("  ! Viewport incompleto")
except Exception as e:
    print(f"  ERRO: {e}")

# [6] Sitemap e Robots.txt
print("\n[6] SITEMAP E ROBOTS.TXT")
try:
    sitemap = requests.get(urljoin(BASE_URL, '/sitemap.xml'), timeout=5)
    if sitemap.status_code == 200:
        success.append("Sitemap.xml presente")
        print("  + Sitemap.xml encontrado")
    else:
        critical.append("Sitemap.xml nao encontrado")
        print("  X Sitemap.xml nao encontrado")

    robots = requests.get(urljoin(BASE_URL, '/robots.txt'), timeout=5)
    if robots.status_code == 200:
        success.append("Robots.txt presente")
        print("  + Robots.txt encontrado")
    else:
        warnings.append("Robots.txt nao encontrado")
        print("  ! Robots.txt nao encontrado")
except Exception as e:
    print(f"  ERRO: {e}")

# [7] Content Quality
print("\n[7] QUALIDADE DE CONTEUDO (Word Count)")
for page in PAGES[:2]:
    try:
        url = urljoin(BASE_URL, page)
        resp = requests.get(url, timeout=5)
        soup = BeautifulSoup(resp.text, 'html.parser')

        for script in soup(['script', 'style']):
            script.decompose()

        text = soup.get_text()
        words = len(text.split())

        if words < 300:
            warnings.append(f"{page}: Conteudo muito curto")
            print(f"  ! {page}: {words} palavras (ideal 300+)")
        elif words > 3000:
            warnings.append(f"{page}: Conteudo muito longo")
            print(f"  ! {page}: {words} palavras (considere dividir)")
        else:
            success.append(f"{page}: Conteudo adequado")
            print(f"  + {page}: {words} palavras (OK)")

    except Exception as e:
        print(f"  ERRO: {e}")

# [8] SSL/HTTPS
print("\n[8] SSL/HTTPS")
try:
    resp = requests.get(BASE_URL, timeout=5)
    if resp.url.startswith('https://'):
        success.append("HTTPS ativo")
        print("  + HTTPS ativo e forcado")
    else:
        critical.append("Site nao usa HTTPS")
        print("  X Sem HTTPS (CRITICO)")
except Exception as e:
    print(f"  ERRO: {e}")

# [9] Canonical Tags
print("\n[9] CANONICAL TAGS")
canonical_found = False
for page in PAGES[:2]:
    try:
        url = urljoin(BASE_URL, page)
        resp = requests.get(url, timeout=5)
        soup = BeautifulSoup(resp.text, 'html.parser')

        canonical = soup.find('link', {'rel': 'canonical'})
        if canonical:
            canonical_found = True
            print(f"  + {page}: Canonical tag presente")
        else:
            print(f"  ! {page}: Sem canonical tag")

    except Exception as e:
        print(f"  ERRO: {e}")

if not canonical_found:
    warnings.append("Faltam canonical tags - recomendado adicionar")

# [10] Alt Text em Imagens
print("\n[10] ALT TEXT EM IMAGENS")
for page in PAGES[:2]:
    try:
        url = urljoin(BASE_URL, page)
        resp = requests.get(url, timeout=5)
        soup = BeautifulSoup(resp.text, 'html.parser')

        images = soup.find_all('img')
        alt_missing = sum(1 for img in images if not img.get('alt'))

        if images:
            pct = ((len(images) - alt_missing) / len(images)) * 100
            if alt_missing == 0:
                print(f"  + {page}: 100% das imagens com alt text")
                success.append(f"{page}: Alt text completo")
            else:
                print(f"  ! {page}: {alt_missing}/{len(images)} imagens sem alt ({pct:.0f}%)")
                warnings.append(f"{page}: Faltam alt text")

    except Exception as e:
        print(f"  ERRO: {e}")

# RELATORIO FINAL
print("\n" + "="*80)
print("RESUMO EXECUTIVO")
print("="*80)

total = len(success) + len(warnings) + len(critical)
score = (len(success) / total * 100) if total > 0 else 0

print(f"\n✓ Passou: {len(success)}")
print(f"⚠ Avisos: {len(warnings)}")
print(f"✗ Criticos: {len(critical)}")

if critical:
    print(f"\n[CRITICO] Problemas que DEVEM ser resolvidos:")
    for item in critical:
        print(f"  ! {item}")

if warnings:
    print(f"\n[AVISO] Melhorias recomendadas ({len(warnings)}):")
    for item in warnings[:10]:
        print(f"  ~ {item}")

print(f"\n" + "="*80)
print(f"SCORE SEO: {score:.0f}/100")
print("="*80)

if score >= 80:
    status = "EXCELENTE"
elif score >= 60:
    status = "BOM (com melhorias)"
elif score >= 40:
    status = "REGULAR"
else:
    status = "CRITICO"

print(f"Status: {status}")

print("\n[ACOES IMEDIATAS]")
print("="*80)
if critical:
    print("1. RESOLVER TODOS OS PROBLEMAS CRITICOS ACIMA")
print("2. Submeter sitemap ao Google Search Console")
print("3. Monitorar em: https://search.google.com/search-console/")
print("4. Usar PageSpeed Insights: https://pagespeed.web.dev/")
print("5. Verificar Core Web Vitals no Search Console")
print("="*80 + "\n")
