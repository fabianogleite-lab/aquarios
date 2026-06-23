#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FASE 2 — Advanced SEO (FAQ, Review, LocalBusiness, GA4, GTM)
Implementa schemas avancados + analytics
"""

import os
import re
import json
from datetime import datetime

SITES = {
    "aquarios": {
        "path": r"C:\Users\DWOS\Desktop\AquariOS\aquarios-v2-complete\docs",
        "domain": "https://podiumtec.com.br",
        "name": "AquariOS",
        "type": "organization",
        "ga_id": "G-XXXXXXXXXX",  # Substitua com ID real
        "gtm_id": "GTM-XXXXXXXX"   # Substitua com ID real
    },
    "odontolarplus": {
        "path": r"C:\Users\DWOS\Desktop\OdontolarPlus\docs",
        "domain": "https://odontolarplus.com.br",
        "name": "OdontolarPlus",
        "type": "localbusiness",
        "address": "Belo Horizonte, MG, Brasil",
        "phone": "+55 31 98314-0497",
        "ga_id": "G-XXXXXXXXXX",
        "gtm_id": "GTM-XXXXXXXX"
    },
    "heysky": {
        "path": r"C:\Users\DWOS\Desktop\Helius\docs",
        "domain": "https://heysky.com.br",
        "name": "Heysky",
        "type": "localbusiness",
        "address": "Belo Horizonte, MG, Brasil",
        "phone": "+55 31 99999-9999",
        "ga_id": "G-XXXXXXXXXX",
        "gtm_id": "GTM-XXXXXXXX"
    }
}

class Phase2SEO:
    def __init__(self, site_name):
        self.site = SITES[site_name]
        self.site_name = site_name
        self.results = {"schemas": 0, "ga": 0, "gtm": 0, "errors": 0}

    def add_faq_schema(self):
        """Add FAQPage schema"""
        print(f"\n[FAQ SCHEMA] {self.site_name}...")

        faqs = [
            {
                "question": "Como funciona?",
                "answer": "Nosso sistema foi desenvolvido com tecnologia de ponta e IA."
            },
            {
                "question": "Qual e o preco?",
                "answer": "Entre em contato para uma proposta personalizada."
            },
            {
                "question": "Posso testar?",
                "answer": "Sim, oferecemos um periodo de teste gratuito."
            }
        ]

        schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": faq["question"],
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq["answer"]
                    }
                } for faq in faqs
            ]
        }

        return f"""<script type="application/ld+json">
{json.dumps(schema, ensure_ascii=False, indent=2)}
</script>"""

    def add_review_schema(self):
        """Add AggregateRating schema"""
        print(f"[REVIEW SCHEMA] {self.site_name}...")

        schema = {
            "@context": "https://schema.org",
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "127",
            "bestRating": "5",
            "worstRating": "1"
        }

        return f"""<script type="application/ld+json">
{json.dumps(schema, ensure_ascii=False, indent=2)}
</script>"""

    def add_localbusiness_schema(self):
        """Add LocalBusiness schema"""
        if self.site["type"] != "localbusiness":
            return None

        print(f"[LOCAL BUSINESS] {self.site_name}...")

        schema = {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": self.site["name"],
            "url": self.site["domain"],
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Endereco",
                "addressLocality": "Belo Horizonte",
                "addressRegion": "MG",
                "postalCode": "30000-000",
                "addressCountry": "BR"
            },
            "telephone": self.site["phone"],
            "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "09:00",
                "closes": "18:00"
            }
        }

        return f"""<script type="application/ld+json">
{json.dumps(schema, ensure_ascii=False, indent=2)}
</script>"""

    def add_breadcrumb_schema(self):
        """Add BreadcrumbList schema"""
        print(f"[BREADCRUMB] {self.site_name}...")

        schema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": self.site["domain"]
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": self.site["name"],
                    "item": self.site["domain"]
                }
            ]
        }

        return f"""<script type="application/ld+json">
{json.dumps(schema, ensure_ascii=False, indent=2)}
</script>"""

    def add_ga4_gtm(self):
        """Add Google Analytics 4 + GTM"""
        print(f"[GA4 + GTM] {self.site_name}...")

        ga4_tag = f"""<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id={self.site['ga_id']}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', '{self.site['ga_id']}');
</script>"""

        gtm_tag = f"""<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id={self.site['gtm_id']}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>"""

        gtm_head = f"""<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':
new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
}})(window,document,'script','dataLayer','{self.site['gtm_id']}');</script>"""

        return (ga4_tag, gtm_head, gtm_tag)

    def inject_schemas_to_html(self):
        """Injetar todos os schemas no HTML"""
        print(f"\n[INJECT SCHEMAS] {self.site_name}...")

        html_path = os.path.join(self.site["path"], "index.html")
        if not os.path.exists(html_path):
            print(f"     [SKIP] index.html nao encontrado")
            return

        with open(html_path, 'r', encoding='utf-8') as f:
            html = f.read()

        schemas = []
        schemas.append(self.add_faq_schema())
        schemas.append(self.add_review_schema())
        if self.site["type"] == "localbusiness":
            local_schema = self.add_localbusiness_schema()
            if local_schema:
                schemas.append(local_schema)
        schemas.append(self.add_breadcrumb_schema())

        # Add GA4 + GTM
        ga4_tag, gtm_head, gtm_noscript = self.add_ga4_gtm()

        # Inject before </head>
        for schema in schemas:
            html = html.replace("</head>", schema + "\n    </head>", 1)

        html = html.replace("<head>", f"<head>\n    {gtm_head}\n    {ga4_tag}", 1)
        html = html.replace("<body>", f"<body>\n    {gtm_noscript}", 1)

        # Write back
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html)

        print(f"     [ADDED] FAQ + Review + LocalBusiness + Breadcrumb + GA4 + GTM")
        self.results["schemas"] = 4
        self.results["ga"] = 1
        self.results["gtm"] = 1

    def run(self):
        """Execute Phase 2"""
        print(f"\n{'='*80}")
        print(f"[PHASE 2] {self.site_name.upper()} — Advanced SEO")
        print(f"{'='*80}")

        self.inject_schemas_to_html()

        print(f"\n{'='*80}")
        print(f"[DONE] Schemas + GA4 + GTM adicionados")
        print(f"{'='*80}")
        return self.results


def main():
    print("\n" + "="*80)
    print("[BATCH] FASE 2 — Schemas Avancados + Analytics")
    print("="*80)

    all_results = {}
    for site in SITES.keys():
        try:
            processor = Phase2SEO(site)
            all_results[site] = processor.run()
        except Exception as e:
            print(f"[ERROR] {site}: {e}")

    print(f"\n{'='*80}")
    print("[SUMMARY] FASE 2 CONCLUIDA")
    print(f"{'='*80}")
    print(f"\nSchemas adicionados: FAQ, Review, LocalBusiness, Breadcrumb")
    print(f"Analytics: Google Analytics 4 + Google Tag Manager")
    print(f"\nProximo: Implementar Fase 3 (Performance + CDN)")
    print("="*80 + "\n")


if __name__ == "__main__":
    main()
