#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SEO Tags Automation Script
Adiciona automaticamente: meta descriptions, OG tags, canonical tags, schema.org
"""

import os
import re
from datetime import datetime
from pathlib import Path
import shutil

BASE_PATH = r"C:\Users\DWOS\Desktop\AquariOS\aquarios-v2-complete\docs"
DOMAIN = "https://podiumtec.com.br"

# Definição de metadata para cada página
PAGES_CONFIG = {
    "index.html": {
        "title": "AquariOS — Sistema Operacional Pessoal",
        "description": "Assistente pessoal de saúde com IA. 4 dimensões e iVi — a fórmula científica da qualidade de vida.",
        "og_title": "AquariOS — Sistema Operacional Pessoal",
        "og_description": "Assistente pessoal de saúde com IA. 4 dimensões (Físico, Mental, Espiritual, Social) e iVi.",
        "og_image": "https://podiumtec.com.br/og-aquarios.png",
        "og_type": "website",
        "url": DOMAIN + "/",
        "schema_type": "Organization"
    },
    "engenharia.html": {
        "title": "Engenharia e Arquitetura — podiumtec.com.br",
        "description": "Tecnologia de ponta: HygeiOS v2, ProteOS, CerberOS. 9 módulos em 5 agentes inteligentes.",
        "og_title": "Engenharia e Arquitetura — podiumtec.com.br",
        "og_description": "Arquitetura de 5 agentes: ProteOS (interface), HygeiOS (dados), CerberOS (core), PanaceIA (corporate), SandeirOS (interno).",
        "og_image": "https://podiumtec.com.br/og-engenharia.png",
        "og_type": "website",
        "url": DOMAIN + "/engenharia.html",
        "schema_type": "WebPage"
    },
    "investidores.html": {
        "title": "Investidores — AquariOS, EscambOS, heYskY",
        "description": "Hub de investimentos em três projetos inovadores: AquariOS (saúde), EscambOS (marketplace), heYskY (energia).",
        "og_title": "Investidores — Três Oportunidades Inovadoras",
        "og_description": "AquariOS, EscambOS e heYskY: saúde, marketplace e energia solar. Oportunidades de investimento.",
        "og_image": "https://podiumtec.com.br/og-investidores.png",
        "og_type": "website",
        "url": DOMAIN + "/investidores.html",
        "schema_type": "CollectionPage"
    },
    "backoffice.html": {
        "title": "Backoffice — Gerenciamento Integrado",
        "description": "Dashboard de controle central para ProteOS, HygeiOS e operações. Monitoramento de usuários, dados e performance.",
        "og_title": "Backoffice — Gerenciamento Integrado",
        "og_description": "Dashboard central para gerenciar ProteOS, HygeiOS, CerberOS e operações do sistema.",
        "og_image": "https://podiumtec.com.br/og-backoffice.png",
        "og_type": "website",
        "url": DOMAIN + "/backoffice.html",
        "schema_type": "WebPage"
    },
    "privacy-policy.html": {
        "title": "Política de Privacidade — podiumtec.com.br",
        "description": "Política de privacidade de dados para AquariOS, EscambOS e heYskY. Proteção e conformidade LGPD.",
        "og_title": "Política de Privacidade",
        "og_description": "Como protegemos seus dados em AquariOS. Conformidade LGPD e segurança.",
        "og_image": "https://podiumtec.com.br/og-privacy.png",
        "og_type": "website",
        "url": DOMAIN + "/privacy-policy.html",
        "schema_type": "WebPage"
    },
    "terms.html": {
        "title": "Termos de Serviço — podiumtec.com.br",
        "description": "Termos de serviço e condições de uso para AquariOS, EscambOS e heYskY.",
        "og_title": "Termos de Serviço",
        "og_description": "Condições de uso e termos de serviço. Leia antes de usar.",
        "og_image": "https://podiumtec.com.br/og-terms.png",
        "og_type": "website",
        "url": DOMAIN + "/terms.html",
        "schema_type": "WebPage"
    },
    "deletion.html": {
        "title": "Solicitação de Exclusão de Dados",
        "description": "Formulário para solicitar exclusão de seus dados conforme LGPD. Acesso rápido ao direito ao esquecimento.",
        "og_title": "Solicitar Exclusão de Dados",
        "og_description": "Exercer seu direito ao esquecimento. Exclusão de dados LGPD.",
        "og_image": "https://podiumtec.com.br/og-deletion.png",
        "og_type": "website",
        "url": DOMAIN + "/deletion.html",
        "schema_type": "WebPage"
    },
    "escambos/index.html": {
        "title": "EscambOS — Marketplace de Trocas e Serviços",
        "description": "Marketplace inovador de trocas e serviços com economia P2P. Sem intermediários, seguro e verificado.",
        "og_title": "EscambOS — Marketplace de Trocas",
        "og_description": "Troque serviços, produtos e experiências. Economia P2P segura e verificada.",
        "og_image": "https://podiumtec.com.br/og-escambos.png",
        "og_type": "website",
        "url": DOMAIN + "/escambos/",
        "schema_type": "WebPage"
    },
    "heysky/index.html": {
        "title": "Heysky — Energia Solar Inteligente",
        "description": "Energia solar fotovoltaica em Belo Horizonte e região. Economia real na sua conta de luz. Franquia Power Mais.",
        "og_title": "Heysky — Energia Solar",
        "og_description": "Economize até 95% na conta de luz. Instalação em 2 dias. Financiamento em 120x.",
        "og_image": "https://podiumtec.com.br/og-heysky.png",
        "og_type": "website",
        "url": DOMAIN + "/heysky/",
        "schema_type": "WebPage"
    }
}

class SEOAutomation:
    def __init__(self):
        self.results = {
            "success": [],
            "warnings": [],
            "errors": [],
            "total": 0
        }
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    def backup_file(self, filepath):
        """Cria backup do arquivo original"""
        backup_path = f"{filepath}.backup_{self.timestamp}"
        shutil.copy2(filepath, backup_path)
        return backup_path

    def read_html(self, filepath):
        """Lê arquivo HTML"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            self.results["errors"].append(f"{filepath}: Erro ao ler - {e}")
            return None

    def write_html(self, filepath, content):
        """Escreve arquivo HTML"""
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except Exception as e:
            self.results["errors"].append(f"{filepath}: Erro ao escrever - {e}")
            return False

    def has_meta_tag(self, html, name):
        """Verifica se meta tag existe"""
        pattern = f'<meta\\s+name=["\']?{name}'
        return bool(re.search(pattern, html, re.IGNORECASE))

    def has_og_tag(self, html, property_name):
        """Verifica se OG tag existe"""
        pattern = f'<meta\\s+property=["\']?og:{property_name}'
        return bool(re.search(pattern, html, re.IGNORECASE))

    def has_canonical(self, html):
        """Verifica se canonical tag existe"""
        return bool(re.search(r'<link\s+rel=["\']?canonical', html, re.IGNORECASE))

    def has_schema(self, html):
        """Verifica se schema JSON-LD existe"""
        return bool(re.search(r'<script\s+type=["\']?application/ld\+json', html, re.IGNORECASE))

    def insert_after_title(self, html, content):
        """Insere conteúdo após tag <title>"""
        pattern = r'(<title>[^<]*</title>)'
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            end_pos = match.end()
            return html[:end_pos] + '\n    ' + content + html[end_pos:]
        return html

    def insert_before_closing_head(self, html, content):
        """Insere conteúdo antes de </head>"""
        pattern = r'(</head>)'
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            start_pos = match.start()
            return html[:start_pos] + '    ' + content + '\n    ' + html[start_pos:]
        return html

    def generate_og_tags(self, config):
        """Gera tags Open Graph"""
        return f'''<meta property="og:title" content="{config['og_title']}">
    <meta property="og:description" content="{config['og_description']}">
    <meta property="og:image" content="{config['og_image']}">
    <meta property="og:type" content="{config['og_type']}">
    <meta property="og:url" content="{config['url']}">'''

    def generate_canonical(self, url):
        """Gera canonical tag"""
        return f'<link rel="canonical" href="{url}">'

    def generate_schema(self, config):
        """Gera schema.org JSON-LD"""
        schema_type = config.get("schema_type", "WebPage")

        if schema_type == "Organization":
            schema = {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "podiumtec.com.br",
                "url": DOMAIN,
                "description": config["description"],
                "sameAs": [
                    "https://www.linkedin.com/company/podiumtec",
                    "https://www.instagram.com/aquarios.app"
                ]
            }
        elif schema_type == "CollectionPage":
            schema = {
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                "name": config["og_title"],
                "description": config["description"],
                "mainEntity": [
                    {
                        "@type": "Product",
                        "name": "AquariOS",
                        "description": "Sistema Operacional Pessoal para saúde integral",
                        "url": DOMAIN + "/"
                    },
                    {
                        "@type": "Product",
                        "name": "EscambOS",
                        "description": "Marketplace de trocas e serviços",
                        "url": DOMAIN + "/escambos/"
                    },
                    {
                        "@type": "Product",
                        "name": "Heysky",
                        "description": "Energia solar inteligente",
                        "url": DOMAIN + "/heysky/"
                    }
                ]
            }
        else:
            schema = {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": config["og_title"],
                "description": config["description"],
                "url": config["url"]
            }

        import json
        schema_str = json.dumps(schema, ensure_ascii=False, indent=2)
        return f'<script type="application/ld+json">\n{schema_str}\n</script>'

    def process_page(self, relative_path, config):
        """Processa uma página HTML"""
        filepath = os.path.join(BASE_PATH, relative_path)

        if not os.path.exists(filepath):
            self.results["errors"].append(f"{relative_path}: Arquivo não encontrado")
            return

        print(f"\n[FILE] Processando: {relative_path}")

        # Ler HTML
        html = self.read_html(filepath)
        if not html:
            return

        # Fazer backup
        backup = self.backup_file(filepath)
        print(f"   [BACKUP] {backup}")

        changes_made = []

        # 1. Verificar/adicionar meta description
        if not self.has_meta_tag(html, "description"):
            meta_desc = f'<meta name="description" content="{config["description"]}">'
            html = self.insert_after_title(html, meta_desc)
            changes_made.append("Meta description adicionada")
            print("   [+] Meta description")
        else:
            print("   [OK] Meta description ja existe")

        # 2. Verificar/adicionar OG tags
        if not self.has_og_tag(html, "title"):
            og_tags = self.generate_og_tags(config)
            html = self.insert_after_title(html, og_tags)
            changes_made.append("OG tags adicionadas")
            print("   [+] OG tags")
        else:
            print("   [OK] OG tags ja existem")

        # 3. Verificar/adicionar canonical
        if not self.has_canonical(html):
            canonical = self.generate_canonical(config["url"])
            html = self.insert_before_closing_head(html, canonical)
            changes_made.append("Canonical tag adicionada")
            print("   [+] Canonical tag")
        else:
            print("   [OK] Canonical tag ja existe")

        # 4. Verificar/adicionar schema JSON-LD
        if not self.has_schema(html):
            schema = self.generate_schema(config)
            html = self.insert_before_closing_head(html, schema)
            changes_made.append("Schema.org JSON-LD adicionado")
            print("   [+] Schema.org")
        else:
            print("   [OK] Schema.org ja existe")

        # Escrever arquivo
        if self.write_html(filepath, html):
            self.results["success"].append({
                "file": relative_path,
                "changes": changes_made
            })
            print(f"   [DONE] Salvo com sucesso ({len(changes_made)} mudancas)")
        else:
            return

        self.results["total"] += 1

    def run(self):
        """Executa automação em todas as páginas"""
        print("="*80)
        print("[START] SEO TAGS AUTOMATION — podiumtec.com.br")
        print("="*80)

        for page, config in PAGES_CONFIG.items():
            self.process_page(page, config)

        # Relatório final
        self.print_report()

    def print_report(self):
        """Imprime relatório final"""
        print("\n" + "="*80)
        print("[REPORT] RELATORIO FINAL")
        print("="*80)

        print(f"\n[OK] Páginas processadas: {self.results['total']}")
        print(f"[!] Avisos: {len(self.results['warnings'])}")
        print(f"[X] Erros: {len(self.results['errors'])}")

        if self.results["errors"]:
            print("\n[ERROS]")
            for error in self.results["errors"]:
                print(f"  - {error}")

        if self.results["success"]:
            print(f"\n[SUCCESS] {len(self.results['success'])} paginas atualizadas:")
            for item in self.results["success"]:
                print(f"\n  [FILE] {item['file']}")
                for change in item["changes"]:
                    print(f"     [+] {change}")

        print("\n" + "="*80)
        print("[NEXT] PROXIMOS PASSOS:")
        print("="*80)
        print("\n1. Verificar as mudanças: git diff docs/")
        print("2. Fazer commit: git add docs/ && git commit -m 'feat(seo): adicionar meta tags'")
        print("3. Fazer push: git push origin main")
        print("4. Validar no Search Console: https://search.google.com/search-console/")
        print("5. Testar estrutura: https://search.google.com/structured-data/testing-tool")
        print("\n" + "="*80 + "\n")

# Executar
if __name__ == "__main__":
    automation = SEOAutomation()
    automation.run()
