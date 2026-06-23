#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Add sitemap.xml + robots.txt para OdontolarPlus e Heysky
"""

import os
from datetime import datetime

SITES = {
    "odontolarplus": {
        "path": r"C:\Users\DWOS\Desktop\OdontolarPlus\docs",
        "domain": "https://odontolarplus.com.br",
        "pages": ["index.html"],
        "priority": "1.0"
    },
    "heysky": {
        "path": r"C:\Users\DWOS\Desktop\Helius\docs",
        "domain": "https://heysky.com.br",
        "pages": ["index.html"],
        "priority": "1.0"
    }
}

SITEMAP_TEMPLATE = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}
</urlset>
"""

URL_TEMPLATE = """    <url>
        <loc>{url}</loc>
        <lastmod>{date}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>{priority}</priority>
    </url>"""

ROBOTS_TEMPLATE = """User-agent: *
Allow: /
Crawl-delay: 1

User-agent: Googlebot
Crawl-delay: 0

Sitemap: {domain}/sitemap.xml
"""

def create_sitemap(site_name, config):
    """Create sitemap.xml"""
    print(f"\n[SITEMAP] {site_name}...")

    urls = []
    date = datetime.now().strftime("%Y-%m-%d")

    for page in config["pages"]:
        if page == "index.html":
            url = config["domain"] + "/"
        else:
            url = config["domain"] + "/" + page

        urls.append(URL_TEMPLATE.format(
            url=url,
            date=date,
            priority=config["priority"]
        ))

    sitemap_content = SITEMAP_TEMPLATE.format(urls="\n".join(urls))

    sitemap_path = os.path.join(config["path"], "sitemap.xml")
    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write(sitemap_content)

    print(f"     [CREATED] {sitemap_path}")

def create_robots(site_name, config):
    """Create robots.txt"""
    print(f"[ROBOTS] {site_name}...")

    robots_content = ROBOTS_TEMPLATE.format(domain=config["domain"])

    robots_path = os.path.join(config["path"], "robots.txt")
    with open(robots_path, 'w', encoding='utf-8') as f:
        f.write(robots_content)

    print(f"     [CREATED] {robots_path}")

def main():
    print("\n" + "="*80)
    print("[BATCH] Adicionar sitemap.xml + robots.txt")
    print("="*80)

    for site_name, config in SITES.items():
        print(f"\n[{site_name.upper()}]")
        create_sitemap(site_name, config)
        create_robots(site_name, config)

    print(f"\n{'='*80}")
    print("[DONE] Sitemap + Robots criados para ambos os sites")
    print(f"{'='*80}")
    print("\nProximo: git add + commit + push em cada repositorio")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()
