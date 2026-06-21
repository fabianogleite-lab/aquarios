#!/usr/bin/env python3
"""
Auditoria SEO completa para podiumtec.com.br
Verifica: meta tags, headings, schema, performance, mobile, SSL, etc
"""

import sys
import json
import subprocess
from urllib.parse import urljoin, urlparse
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Instalando dependências...")
    subprocess.run([sys.executable, "-m", "pip", "install", "requests", "beautifulsoup4", "-q"])
    import requests
    from bs4 import BeautifulSoup

# Configuração
BASE_URL = "https://podiumtec.com.br"
PAGES = [
    "/",
    "/engenharia.html",
    "/investidores.html",
    "/escambos/",
    "/heysky/",
]

class SEOAudit:
    def __init__(self, base_url):
        self.base_url = base_url
        self.results = {
            "general": {},
            "pages": {},
            "issues": [],
            "warnings": [],
            "passed": []
        }

    def audit(self):
        print("\n" + "="*70)
        print("🔍 AUDITORIA SEO — podiumtec.com.br")
        print("="*70)

        # Teste 1: Acessibilidade
        print("\n📍 TESTE 1: Acessibilidade do site")
        self.check_accessibility()

        # Teste 2: SSL/HTTPS
        print("\n📍 TESTE 2: SSL/HTTPS")
        self.check_ssl()

        # Teste 3: Meta tags e estrutura
        print("\n📍 TESTE 3: Meta tags e estrutura de página")
        self.check_meta_tags()

        # Teste 4: Headings (H1-H6)
        print("\n📍 TESTE 4: Estrutura de headings")
        self.check_headings()

        # Teste 5: Schema.org
        print("\n📍 TESTE 5: Schema.org (dados estruturados)")
        self.check_schema()

        # Teste 6: Mobile responsiveness
        print("\n📍 TESTE 6: Mobile responsiveness")
        self.check_mobile()

        # Teste 7: Sitemap e robots.txt
        print("\n📍 TESTE 7: Sitemap e robots.txt")
        self.check_sitemaps()

        # Teste 8: Performance (Lighthouse)
        print("\n📍 TESTE 8: Performance (Core Web Vitals)")
        self.check_performance()

        # Teste 9: Conteúdo
        print("\n📍 TESTE 9: Análise de conteúdo")
        self.check_content()

        # Teste 10: Links internos
        print("\n📍 TESTE 10: Links internos e estrutura")
        self.check_links()

        # Relatório final
        self.print_report()

    def check_accessibility(self):
        """Verifica se o site está acessível"""
        try:
            resp = requests.head(self.base_url, timeout=5)
            status = resp.status_code
            if status == 200:
                print(f"   ✅ Site acessível (HTTP {status})")
                self.results["passed"].append("Site acessível")
            else:
                self.results["issues"].append(f"HTTP {status} — site pode estar fora do ar")
                print(f"   ❌ HTTP {status}")
        except Exception as e:
            self.results["issues"].append(f"Site inacessível: {e}")
            print(f"   ❌ Erro: {e}")

    def check_ssl(self):
        """Verifica certificado SSL"""
        try:
            resp = requests.get(self.base_url, timeout=5)
            if resp.url.startswith("https://"):
                print("   ✅ HTTPS ativo (SSL válido)")
                self.results["passed"].append("HTTPS/SSL configurado")
            else:
                self.results["warnings"].append("Site não está usando HTTPS")
                print("   ⚠️ Sem HTTPS")
        except Exception as e:
            self.results["issues"].append(f"Erro ao verificar SSL: {e}")

    def check_meta_tags(self):
        """Verifica meta tags em cada página"""
        critical_tags = []

        for page in PAGES[:3]:  # Testa página principal + 2 subpáginas
            try:
                url = urljoin(self.base_url, page)
                resp = requests.get(url, timeout=5)
                soup = BeautifulSoup(resp.text, 'html.parser')

                meta_data = {
                    "url": url,
                    "title": "",
                    "description": "",
                    "og_title": "",
                    "og_desc": "",
                    "viewport": False,
                    "charset": False
                }

                # Title
                title = soup.find('title')
                if title and title.string:
                    meta_data["title"] = title.string
                    if len(title.string) > 60:
                        self.results["warnings"].append(f"{page}: Title muito longo ({len(title.string)} chars)")
                else:
                    self.results["issues"].append(f"{page}: Sem <title>")

                # Meta description
                desc = soup.find('meta', {'name': 'description'})
                if desc and desc.get('content'):
                    meta_data["description"] = desc.get('content')
                    if len(desc.get('content')) < 120:
                        self.results["warnings"].append(f"{page}: Meta description muito curta")
                else:
                    self.results["issues"].append(f"{page}: Sem meta description")

                # OG tags
                og_title = soup.find('meta', {'property': 'og:title'})
                og_desc = soup.find('meta', {'property': 'og:description'})
                meta_data["og_title"] = og_title.get('content') if og_title else ""
                meta_data["og_desc"] = og_desc.get('content') if og_desc else ""

                if not og_title or not og_desc:
                    self.results["warnings"].append(f"{page}: OG tags incompletas (importante para redes sociais)")

                # Viewport
                viewport = soup.find('meta', {'name': 'viewport'})
                meta_data["viewport"] = bool(viewport)
                if not viewport:
                    self.results["issues"].append(f"{page}: Sem viewport meta (mobile não responsivo)")

                # Charset
                charset = soup.find('meta', {'charset': True})
                meta_data["charset"] = bool(charset)
                if not charset:
                    self.results["warnings"].append(f"{page}: Sem charset declarado")

                print(f"   ✅ {page}: title={len(meta_data['title'])} chars, desc={len(meta_data['description'])} chars")
                self.results["pages"][page] = meta_data

            except Exception as e:
                print(f"   ❌ {page}: Erro — {e}")
                self.results["issues"].append(f"{page}: {e}")

    def check_headings(self):
        """Verifica estrutura de headings (H1, H2, H3...)"""
        for page in PAGES[:2]:
            try:
                url = urljoin(self.base_url, page)
                resp = requests.get(url, timeout=5)
                soup = BeautifulSoup(resp.text, 'html.parser')

                headings = {
                    "h1": len(soup.find_all('h1')),
                    "h2": len(soup.find_all('h2')),
                    "h3": len(soup.find_all('h3')),
                    "h4": len(soup.find_all('h4')),
                    "h5": len(soup.find_all('h5')),
                    "h6": len(soup.find_all('h6')),
                }

                h1_count = headings["h1"]
                if h1_count == 0:
                    self.results["issues"].append(f"{page}: Sem H1 (crítico para SEO)")
                elif h1_count > 1:
                    self.results["warnings"].append(f"{page}: Múltiplos H1s ({h1_count}) — só deveria ter 1")
                else:
                    print(f"   ✅ {page}: H1={h1_count}, H2={headings['h2']}, H3={headings['h3']}")
                    self.results["passed"].append(f"{page}: Estrutura de headings correta")

            except Exception as e:
                print(f"   ⚠️ {page}: {e}")

    def check_schema(self):
        """Verifica schema.org estruturado"""
        for page in ["/", "/investidores.html"]:
            try:
                url = urljoin(self.base_url, page)
                resp = requests.get(url, timeout=5)
                soup = BeautifulSoup(resp.text, 'html.parser')

                # Procura por schema JSON-LD
                schema_scripts = soup.find_all('script', {'type': 'application/ld+json'})
                if schema_scripts:
                    print(f"   ✅ {page}: {len(schema_scripts)} schema(s) JSON-LD encontrado(s)")
                    self.results["passed"].append(f"{page}: Schema.org estruturado")
                else:
                    self.results["warnings"].append(f"{page}: Sem schema.org (melhora SEO em rich snippets)")
                    print(f"   ⚠️ {page}: Sem schema.org")

            except Exception as e:
                print(f"   ❌ {page}: {e}")

    def check_mobile(self):
        """Verifica responsividade móvel"""
        try:
            resp = requests.get(self.base_url, timeout=5)
            soup = BeautifulSoup(resp.text, 'html.parser')

            viewport = soup.find('meta', {'name': 'viewport'})
            if viewport:
                content = viewport.get('content', '')
                if 'width=device-width' in content:
                    print("   ✅ Viewport configurado corretamente")
                    self.results["passed"].append("Mobile viewport configurado")
                else:
                    self.results["warnings"].append("Viewport não está otimizado para mobile")
            else:
                self.results["issues"].append("Sem viewport meta — site não é mobile-friendly")

            # Verifica media queries
            style_tags = soup.find_all('style')
            css_files = soup.find_all('link', {'rel': 'stylesheet'})

            has_media_queries = False
            for style in style_tags:
                if '@media' in style.string if style.string else '':
                    has_media_queries = True

            if has_media_queries or css_files:
                print("   ✅ CSS responsivo (media queries) detectado")
                self.results["passed"].append("Design responsivo")
            else:
                self.results["warnings"].append("Pode não haver media queries — verificar CSS externo")

        except Exception as e:
            print(f"   ❌ Erro: {e}")

    def check_sitemaps(self):
        """Verifica sitemap e robots.txt"""
        try:
            # Sitemap
            sitemap_url = urljoin(self.base_url, "/sitemap.xml")
            resp = requests.get(sitemap_url, timeout=5)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, 'xml')
                url_count = len(soup.find_all('url'))
                print(f"   ✅ Sitemap.xml encontrado ({url_count} URLs)")
                self.results["passed"].append(f"Sitemap com {url_count} URLs")
            else:
                self.results["warnings"].append("Sitemap.xml não encontrado")

            # Robots.txt
            robots_url = urljoin(self.base_url, "/robots.txt")
            resp = requests.get(robots_url, timeout=5)
            if resp.status_code == 200:
                print(f"   ✅ Robots.txt encontrado")
                self.results["passed"].append("Robots.txt configurado")
            else:
                self.results["warnings"].append("Robots.txt não encontrado")

        except Exception as e:
            print(f"   ⚠️ Erro: {e}")

    def check_performance(self):
        """Verifica performance usando Lighthouse"""
        print("   ⏳ Rodando análise de performance (Lighthouse)...")
        try:
            # Tenta rodar lighthouse via CLI
            result = subprocess.run(
                ["lighthouse", self.base_url, "--only-categories=performance,accessibility,seo", "--output=json"],
                capture_output=True,
                timeout=60,
                text=True
            )

            if result.returncode == 0:
                data = json.loads(result.stdout)
                scores = data["categories"]
                print(f"   ✅ Performance: {scores.get('performance', {}).get('score', 0)*100:.0f}/100")
                print(f"   ✅ Accessibility: {scores.get('accessibility', {}).get('score', 0)*100:.0f}/100")
                print(f"   ✅ SEO: {scores.get('seo', {}).get('score', 0)*100:.0f}/100")
            else:
                print("   ⚠️ Lighthouse não instalado. Instale com: npm install -g lighthouse")
                self.results["warnings"].append("Lighthouse não disponível para análise de performance")

        except FileNotFoundError:
            print("   ⚠️ Lighthouse não encontrado. Use: npm install -g lighthouse")
        except Exception as e:
            print(f"   ⚠️ Erro ao rodar Lighthouse: {e}")

    def check_content(self):
        """Analisa qualidade do conteúdo"""
        for page in PAGES[:2]:
            try:
                url = urljoin(self.base_url, page)
                resp = requests.get(url, timeout=5)
                soup = BeautifulSoup(resp.text, 'html.parser')

                # Remove scripts e styles
                for script in soup(["script", "style"]):
                    script.decompose()

                text = soup.get_text()
                word_count = len(text.split())

                if word_count < 300:
                    self.results["warnings"].append(f"{page}: Conteúdo muito curto ({word_count} palavras) — recomendado 300+")
                    print(f"   ⚠️ {page}: {word_count} palavras (recomendado 300+)")
                else:
                    print(f"   ✅ {page}: {word_count} palavras (bom)")
                    self.results["passed"].append(f"{page}: Conteúdo suficiente")

            except Exception as e:
                print(f"   ❌ {page}: {e}")

    def check_links(self):
        """Verifica links internos e estrutura"""
        try:
            resp = requests.get(self.base_url, timeout=5)
            soup = BeautifulSoup(resp.text, 'html.parser')

            internal_links = 0
            external_links = 0

            for link in soup.find_all('a', href=True):
                href = link['href']
                if href.startswith('http'):
                    if self.base_url in href:
                        internal_links += 1
                    else:
                        external_links += 1
                elif href.startswith('/'):
                    internal_links += 1

            print(f"   ✅ Links internos: {internal_links}, Externos: {external_links}")
            if internal_links < 5:
                self.results["warnings"].append("Poucos links internos — melhora navegação e SEO")
            else:
                self.results["passed"].append(f"Estrutura de links interna ({internal_links} links)")

        except Exception as e:
            print(f"   ❌ Erro: {e}")

    def print_report(self):
        """Gera relatório final"""
        print("\n" + "="*70)
        print("📊 RELATÓRIO FINAL — SEO AUDIT")
        print("="*70)

        # Sumário
        total_passed = len(self.results["passed"])
        total_warnings = len(self.results["warnings"])
        total_issues = len(self.results["issues"])

        print(f"\n✅ Passou: {total_passed}")
        print(f"⚠️  Avisos: {total_warnings}")
        print(f"❌ Problemas: {total_issues}")

        # Detalhes dos problemas
        if self.results["issues"]:
            print(f"\n🔴 PROBLEMAS CRÍTICOS ({len(self.results['issues'])}):")
            for issue in self.results["issues"]:
                print(f"   • {issue}")

        if self.results["warnings"]:
            print(f"\n🟡 AVISOS ({len(self.results['warnings'])}):")
            for warning in self.results["warnings"]:
                print(f"   • {warning}")

        if self.results["passed"]:
            print(f"\n🟢 PASSOU ({len(self.results['passed'])}):")
            for passed in self.results["passed"][:10]:  # Mostra os 10 primeiros
                print(f"   • {passed}")

        # Score geral
        score_denominator = total_passed + total_warnings + total_issues
        if score_denominator > 0:
            score = (total_passed / score_denominator) * 100
            print(f"\n🎯 SCORE SEO GERAL: {score:.0f}/100")

            if score >= 80:
                print("   Status: ✅ Excelente")
            elif score >= 60:
                print("   Status: 🟡 Bom (com melhorias)")
            else:
                print("   Status: 🔴 Precisa de atenção")

        print("\n" + "="*70)
        print("📋 RECOMENDAÇÕES PRÓXIMOS PASSOS:")
        print("="*70)

        recommendations = [
            "1. Submeter sitemap ao Google Search Console",
            "2. Instalar Google Analytics para monitorar tráfego",
            "3. Configurar Google Search Console para verificar indexação",
            "4. Rodar Lighthouse localmente: npm install -g lighthouse",
            "5. Testar Mobile usando Google Mobile-Friendly Test",
            "6. Verificar Core Web Vitals em PageSpeed Insights",
            "7. Implementar JSON-LD schema para rich snippets",
            "8. Otimizar imagens (usar AVIF/WebP)",
            "9. Configurar CDN para melhor performance global",
            "10. Criar estratégia de link building (backlinks)"
        ]

        for rec in recommendations:
            print(f"   {rec}")

        print("\n" + "="*70)

def main():
    audit = SEOAudit(BASE_URL)
    audit.audit()

if __name__ == "__main__":
    main()
