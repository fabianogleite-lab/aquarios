"""Migra os FAQs locais (mobile/config/faqs.json) -> tabela alexandrios_kb (Supabase).

Roda uma vez, manual. NÃO apaga o JSON local (fica como fallback offline do app).
Os FAQs atuais são todos de SAÚDE/SUS voltados ao USUÁRIO -> publico='usuario'.
Conteúdo de admin/integrador entra via seed SQL (20260622000006_alexandrios_seed_3publicos.sql).

⚠️ A tabela real (migration 20260524120547 + reconcile 20260622000005) tem:
  id UUID PK (auto) · slug TEXT NOT NULL UNIQUE · persona · category · question · answer ·
  related_faqs TEXT[] · tone · qualis_level (CHECK A1|A2|B1|B2|B3|B4|C|general|NULL) · publico · anchor.
Por isso NÃO mandamos `id` (UUID gerado pelo banco) e dedupe por `slug` (= id do FAQ).

Uso:
    SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... python backend/alexandrios/migrate_faqs.py
"""

from __future__ import annotations

import json
import os
import sys

_FAQS = os.path.join(
    os.path.dirname(__file__), "..", "..", "mobile", "config", "faqs.json"
)

# CHECK constraint da coluna qualis_level na tabela real.
_QUALIS_OK = {"A1", "A2", "B1", "B2", "B3", "B4", "C", "general"}


def _rows():
    with open(os.path.abspath(_FAQS), "r", encoding="utf-8") as f:
        data = json.load(f)
    out = []
    for faq in data.get("faqs", []):
        qualis = faq.get("qualisLevel")
        if qualis not in _QUALIS_OK:  # respeita o CHECK; valor inválido -> NULL
            qualis = None
        out.append(
            {
                # slug = id do FAQ (único). NÃO mandamos `id` (UUID gerado pelo banco).
                "slug": faq["id"],
                "publico": "usuario",
                "persona": faq.get("persona"),
                "category": faq.get("category", "SUPORTE"),
                "question": faq["question"],
                "answer": faq["answer"],
                "related_faqs": faq.get("relatedFAQs", []),
                "tone": faq.get("tone"),
                "qualis_level": qualis,
                "is_canonical": faq.get("isCanonical", True),
                "anchor": faq.get("anchor"),  # FAQs de saúde do usuário: normalmente None
            }
        )
    return out


def main():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")
    rows = _rows()
    print(f"{len(rows)} FAQs lidos de {os.path.abspath(_FAQS)}")
    if not url or not key:
        print("SUPABASE_URL/SERVICE_ROLE_KEY ausentes — dry-run (nada enviado).")
        print("Exemplo do 1o registro:", json.dumps(rows[0], ensure_ascii=False)[:200])
        return 0
    from supabase import create_client

    db = create_client(url, key)
    # dedupe idempotente por slug (coluna UNIQUE).
    db.table("alexandrios_kb").upsert(rows, on_conflict="slug").execute()
    print(f"[OK] upsert de {len(rows)} registros (publico=usuario) em alexandrios_kb.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
