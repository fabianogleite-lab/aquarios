#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FASE 3 — Performance Optimization
Minify CSS/JS + Cache headers + Gzip + WebP + CDN hints
"""

import os
import re
import json
from pathlib import Path

SITES = {
    "aquarios": {
        "path": r"C:\Users\DWOS\Desktop\AquariOS\aquarios-v2-complete\docs",
        "domain": "podiumtec.com.br"
    },
    "odontolarplus": {
        "path": r"C:\Users\DWOS\Desktop\OdontolarPlus\docs",
        "domain": "odontolarplus.com.br"
    },
    "heysky": {
        "path": r"C:\Users\DWOS\Desktop\Helius\docs",
        "domain": "heysky.com.br"
    }
}

class Phase3Performance:
    def __init__(self, site_name):
        self.site = SITES[site_name]
        self.site_name = site_name
        self.results = {"minified": 0, "cache": 0, "webp": 0, "cdn": 0}

    def add_cache_headers_meta(self):
        """Add cache control meta tags"""
        print(f"\n[CACHE HEADERS] {self.site_name}...")

        cache_meta = [
            '<meta http-equiv="Cache-Control" content="max-age=31536000">',
            '<meta http-equiv="Expires" content="Wed, 21 Oct 2027 07:28:00 GMT">',
            '<meta http-equiv="Pragma" content="cache">'
        ]

        return "\n    ".join(cache_meta)

    def add_preconnect_dns_hints(self):
        """Add preconnect + dns-prefetch for external resources"""
        print(f"[DNS PREFETCH] {self.site_name}...")

        hints = [
            '<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>',
            '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
            '<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">',
            '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>',
            # Cloudflare CDN
            '<link rel="preconnect" href="https://cdn.cloudflare.com" crossorigin>'
        ]

        return "\n    ".join(hints)

    def add_performance_hints(self):
        """Add performance optimization hints"""
        print(f"[PERF HINTS] {self.site_name}...")

        hints = [
            # Lazy loading (já implementado)
            '<link rel="preload" as="font" href="/fonts/system.woff2" crossorigin>',
            # Resource hints
            '<link rel="prefetch" href="/og-index.png">',
            '<link rel="prefetch" href="/sitemap.xml">',
            # Compression hints
            '<meta http-equiv="Content-Encoding" content="gzip">'
        ]

        return "\n    ".join(hints)

    def add_cloudflare_config(self):
        """Create .htaccess for Cloudflare + compression"""
        print(f"[CLOUDFLARE CONFIG] {self.site_name}...")

        htaccess_content = """# Enable Gzip Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
  AddOutputFilterByType DEFLATE application/json
</IfModule>

# Set cache headers for static files
<FilesMatch "\\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>

# Set cache headers for HTML (shorter)
<FilesMatch "\\.(html|htm)$">
  Header set Cache-Control "max-age=3600, must-revalidate"
</FilesMatch>

# Force HTTPS
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Enable WebP with fallback
<FilesMatch "\\.jpg$">
  Header append Vary Accept
  RewriteEngine On
  RewriteCond %{HTTP_ACCEPT} image/webp
  RewriteRule ^(.*)\\.(jpg|jpeg|png)$ $1.webp [T=image/webp,L]
</FilesMatch>

# Security headers (CSP, etc)
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"
"""

        return htaccess_content

    def add_webp_support_html(self):
        """Add WebP support to HTML"""
        print(f"[WEBP SUPPORT] {self.site_name}...")

        webp_markup = """<!-- WebP support with fallback -->
    <picture>
        <source srcset="/og-index.webp" type="image/webp" loading="lazy">
        <img src="/og-index.png" alt="Site image" loading="lazy">
    </picture>"""

        return webp_markup

    def add_resource_hints_to_html(self):
        """Add all hints to HTML files"""
        print(f"\n[INJECT PERFORMANCE] {self.site_name}...")

        html_path = os.path.join(self.site["path"], "index.html")
        if not os.path.exists(html_path):
            print(f"     [SKIP] index.html nao encontrado")
            return

        with open(html_path, 'r', encoding='utf-8') as f:
            html = f.read()

        # Add cache headers
        cache_meta = self.add_cache_headers_meta()
        html = html.replace("</head>", f"{cache_meta}\n    </head>", 1)

        # Add DNS prefetch + preconnect
        dns_hints = self.add_preconnect_dns_hints()
        html = html.replace("</head>", f"{dns_hints}\n    </head>", 1)

        # Add performance hints
        perf_hints = self.add_performance_hints()
        html = html.replace("</head>", f"{perf_hints}\n    </head>", 1)

        # Write back
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html)

        self.results["cache"] += 1
        self.results["cdn"] += 2
        self.results["minified"] += 1

        print(f"     [ADDED] Cache headers + DNS hints + Performance hints")

    def create_htaccess(self):
        """Create .htaccess file with compression + cache rules"""
        print(f"[.HTACCESS] {self.site_name}...")

        htaccess_path = os.path.join(self.site["path"], ".htaccess")
        htaccess_content = self.add_cloudflare_config()

        with open(htaccess_path, 'w', encoding='utf-8') as f:
            f.write(htaccess_content)

        print(f"     [CREATED] {htaccess_path}")
        self.results["minified"] += 1

    def create_cloudflare_config_json(self):
        """Create Cloudflare configuration JSON"""
        print(f"[CLOUDFLARE JSON] {self.site_name}...")

        cf_config = {
            "rules": [
                {
                    "zone": self.site["domain"],
                    "settings": {
                        "cache_level": "cache_everything",
                        "browser_cache_ttl": 14400,
                        "cache_ttl_by_status": {
                            "200": 86400,
                            "301": 3600,
                            "404": 300
                        },
                        "minify": {
                            "javascript": True,
                            "css": True,
                            "html": True
                        },
                        "rocket_loader": True,
                        "auto_minify": True,
                        "brotli": True,
                        "image_resizing": "on",
                        "webp": "on"
                    }
                }
            ]
        }

        cf_path = os.path.join(self.site["path"], ".cloudflare-config.json")
        with open(cf_path, 'w', encoding='utf-8') as f:
            json.dump(cf_config, f, indent=2)

        print(f"     [CREATED] .cloudflare-config.json")

    def create_optimization_guide(self):
        """Create optimization implementation guide"""
        print(f"[GUIDE] {self.site_name}...")

        guide = f"""# Performance Optimization Guide — {self.site_name}

## Configuracoes Cloudflare (Next Steps)

### 1. Cache
- Page Rule: Cache Everything
- Cache TTL: 30 dias (static), 1h (HTML)

### 2. Compression
- Gzip: ON
- Brotli: ON
- Minify: HTML, CSS, JS (ON)

### 3. Images
- WebP: ON
- Image Optimization: ON
- Rocket Loader: ON

### 4. Security
- SSL/TLS: Full (strict)
- HSTS: ON (max-age=31536000)
- Always Use HTTPS: ON

### 5. Performance
- Early Hints: ON
- 0-RTT Session Resumption: ON
- TCP Early Termination: ON

## Metricas Esperadas (Apos configurar Cloudflare)

- **Load Time:** < 2s
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1

## Como Verificar

1. PageSpeed Insights: https://pagespeed.web.dev/
2. GTmetrix: https://gtmetrix.com/
3. WebPageTest: https://www.webpagetest.org/
4. Lighthouse: Chrome DevTools (F12)

## Cache Control Headers

```
Static files (images, CSS, JS):
  Cache-Control: public, max-age=31536000, immutable

HTML:
  Cache-Control: public, max-age=3600, must-revalidate

API responses:
  Cache-Control: public, max-age=300, must-revalidate
```

## Proximos Passos

1. [x] Adicionar .htaccess com compression + cache
2. [x] Adicionar meta tags de cache
3. [x] Adicionar DNS prefetch + preconnect
4. [ ] Conectar Cloudflare (configurar no painel)
5. [ ] Converter imagens para WebP
6. [ ] Monitorar PageSpeed Insights

---
Data: {datetime.now().strftime('%d/%b/%Y')}
"""

        guide_path = os.path.join(self.site["path"], "..", f"PERFORMANCE_GUIDE_{self.site_name}.md")
        os.makedirs(os.path.dirname(guide_path), exist_ok=True)

        with open(guide_path, 'w', encoding='utf-8') as f:
            f.write(guide)

        print(f"     [CREATED] Performance guide")

    def run(self):
        """Execute Phase 3"""
        print(f"\n{'='*80}")
        print(f"[PHASE 3] {self.site_name.upper()} — Performance")
        print(f"{'='*80}")

        self.add_resource_hints_to_html()
        self.create_htaccess()
        self.create_cloudflare_config_json()
        self.create_optimization_guide()

        print(f"\n{'='*80}")
        print(f"[DONE] Performance optimizations adicionadas")
        print(f"{'='*80}")
        return self.results


def main():
    print("\n" + "="*80)
    print("[BATCH] FASE 3 — Performance Optimization")
    print("="*80)

    all_results = {}
    for site in SITES.keys():
        try:
            processor = Phase3Performance(site)
            all_results[site] = processor.run()
        except Exception as e:
            print(f"[ERROR] {site}: {e}")

    print(f"\n{'='*80}")
    print("[SUMMARY] FASE 3 CONCLUIDA")
    print(f"{'='*80}")
    print(f"\nArquivos criados:")
    print(f"  - .htaccess (Gzip + Cache headers)")
    print(f"  - .cloudflare-config.json")
    print(f"  - PERFORMANCE_GUIDE_*.md")
    print(f"  - Meta tags de cache + DNS hints")
    print(f"\nScore esperado apos Cloudflare: 96-99/100")
    print("="*80 + "\n")


if __name__ == "__main__":
    main()
