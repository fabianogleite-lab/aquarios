"""F1 — bootstrap do cache (ordem de carga, §11 do ESCOPO).

Roda 1x. Para F1, executa só o que NÃO depende de GPU. Os passos que exigem
a RTX 4060 online ficam documentados como TODO (não executados aqui).

Ordem:
  1. Aplicar a migration (tabela) — via supabase/psql (fora deste script).
  2. Carregar `data/seed_cache_800.sql` — ~respostas REAIS, idioma='pt', custo R$0.
  3. (trilíngue) Gerar EN/ES do seed — TODO: via Llama quando a RTX estiver online.
  4. Diff `todos_prompts.json` × seed já carregado (por prompt_normalizado) → remove coberto.
  5. `demandas_top_1000.json` (permutações) → popular via playbook (determinístico). TODO F2/F3.
  6. Lote remanescente do passo 4 → SÓ com a RTX 4060 online (Llama). NÃO rodar offline.
"""

from __future__ import annotations

import os

SEED_SQL = os.path.join(os.path.dirname(__file__), "data", "seed_cache_800.sql")


def instrucoes_carga() -> str:
    """F1 não aplica nada em produção. Retorna o passo-a-passo de carga manual."""
    return (
        "F1 — aplicar manualmente (precisa de credencial Supabase/psql):\n"
        "  1) supabase db push   # aplica 20260621060000_sandeiros_cache.sql\n"
        f"  2) psql $DATABASE_URL -f {SEED_SQL}   # carrega o seed\n"
        "  3) select count(*) from public.cache_semantico;  # conferir\n"
    )


def diff_prompts_nao_cobertos(todos_prompts: list[dict], hashes_no_cache: set[str]) -> list[dict]:
    """Passo 4: devolve só os prompts que ainda NÃO têm resposta no cache.
    `hashes_no_cache` = conjunto de prompt_normalizado já presentes."""
    from .semantic_cache import normalizar_prompt

    remanescente = []
    for item in todos_prompts:
        chave = normalizar_prompt(item.get("objetivo") or item.get("prompt") or "")
        if chave and chave not in hashes_no_cache:
            remanescente.append(item)
    return remanescente


# TODO (aguarda RTX 4060 online — NÃO rodar com GPU offline):
#   - gerar_traducoes_en_es(seed)      → Llama
#   - popular_lote_remanescente(...)   → Llama
# TODO (F2/F3): popular demandas sintéticas via playbook determinístico.

if __name__ == "__main__":
    print(instrucoes_carga())
