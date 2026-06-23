"""Extrai as linhas de cache prontas (com resposta REAL) da fonte privada e monta
um seed SQL VÁLIDO e CARREGÁVEL para `public.cache_semantico`.

Fonte (FORA do repo, privada): Desktop/Literatura/PROMPT PARA CACHE.txt
Saída: seed_cache_800.sql (neste diretório)

A fonte é um dump semi-SQL gerado por outra IA, com problemas REAIS:
- `hash_prompt`/`prompt_normalizado` são PLACEHOLDERS (ex.: 'a1b2c3'), não sha256;
- alguns registros estão TRUNCADOS/corrompidos (campo cortado no meio);
- comentários de seção (`-- ...`) e prosa solta entre os blocos INSERT;
- aspas simples NÃO escapadas dentro do JSON (quebrariam o psql).

Estratégia robusta (ancorada no `}'::jsonb`):
- casa SÓ registros bem-formados via regex de 10 campos; truncados/sujos são
  ignorados (e contados), nunca emitidos pela metade;
- RECALCULA hash_prompt e prompt_normalizado com o hash do runtime
  (`semantic_cache.hash_prompt`) — senão `get()` nunca dá HIT;
- VALIDA o JSON (`json.loads`) e RE-ESCAPA as aspas (`'`->`''`) na saída;
- 'RTX4060' -> 'LLAMA'; dedup por hash; ON CONFLICT DO NOTHING.
- NÃO copia a fonte; só as respostas já sintetizadas.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

# mesmo hash/normalizador do runtime (ponto único de verdade)
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from semantic_cache import hash_prompt, normalizar_prompt  # noqa: E402

FONTE = Path(r"C:\Users\DWOS\Desktop\Literatura\PROMPT PARA CACHE.txt")
SAIDA = Path(__file__).with_name("seed_cache_800.sql")
IDIOMA = "pt"  # todo o seed atual é PT; EN/ES entram via Llama (bootstrap, passo 3)

COLUNAS = (
    "hash_prompt, prompt_original, prompt_normalizado, resposta_cacheada, "
    "tokens_input, tokens_output, fonte_original, qualidade_score, criado_por, hits"
)

# Registro bem-formado, ancorado no terminador }'::jsonb e na cauda 'system', N).
# Campos sem aspas internas usam [^']*; o JSON usa \{.*?\} (não-guloso até }'::jsonb).
# Registros truncados (sem }'::jsonb) simplesmente NÃO casam -> ignorados.
REGISTRO = re.compile(
    r"\(\s*'[^']*',\s*"                  # field1: hash da fonte (DESCARTADO)
    r"'(?P<prompt>[^']*)',\s*"           # field2: prompt_original
    r"'[^']*',\s*"                       # field3: normalizado da fonte (DESCARTADO)
    r"'(?P<json>\{.*?\})'::jsonb,\s*"    # field4: resposta JSON
    r"(?P<tin>\d+),\s*(?P<tout>\d+),\s*" # tokens in/out
    r"'(?P<fonte>[^']*)',\s*"            # fonte_original
    r"(?P<score>[0-9.]+),\s*"            # qualidade_score
    r"'[^']*',\s*(?P<hits>\d+)\)",       # criado_por (sempre 'system') + hits
    re.S,
)


def _sql(s: str) -> str:
    """Escapa um valor para literal SQL (apenas a aspa simples)."""
    return s.replace("'", "''")


def main() -> int:
    if not FONTE.exists():
        print(f"[ERRO] fonte nao encontrada: {FONTE}", file=sys.stderr)
        return 1

    texto = FONTE.read_text(encoding="utf-8", errors="replace")

    vistos: set[str] = set()
    linhas: list[str] = []
    total = json_invalido = dup = 0

    for m in REGISTRO.finditer(texto):
        total += 1
        prompt = m.group("prompt").replace("''", "'")  # desescapa p/ hashear
        json_txt = m.group("json")
        try:
            json.loads(json_txt)  # valida o JSON; pula se quebrado
        except json.JSONDecodeError:
            json_invalido += 1
            continue
        h = hash_prompt(prompt, IDIOMA)
        if h in vistos:
            dup += 1
            continue
        vistos.add(h)
        norm = normalizar_prompt(prompt)
        fonte = "LLAMA" if m.group("fonte") == "RTX4060" else m.group("fonte")
        linhas.append(
            f"('{h}', '{_sql(prompt)}', '{_sql(norm)}', "
            f"'{_sql(json_txt)}'::jsonb, "
            f"{m.group('tin')}, {m.group('tout')}, '{_sql(fonte)}', "
            f"{m.group('score')}, 'system', {m.group('hits')})"
        )

    if not linhas:
        print("[ERRO] nenhum registro bem-formado reconhecido — formato da fonte mudou?", file=sys.stderr)
        return 2

    corpo = ",\n".join(linhas)
    sql = (
        "-- F1 SandeirOS — seed do cache (respostas REAIS, custo R$0).\n"
        "-- GERADO por extract_seed.py a partir de fonte privada (NAO commitar a fonte).\n"
        "-- hash_prompt/prompt_normalizado recalculados; JSON validado; aspas re-escapadas.\n"
        f"-- Registros: {len(linhas)} (casados {total} | json inválido {json_invalido} | dup {dup}).\n\n"
        f"INSERT INTO public.cache_semantico\n  ({COLUNAS})\nVALUES\n"
        f"{corpo}\n"
        "ON CONFLICT (hash_prompt) DO NOTHING;\n"
    )
    SAIDA.write_text(sql, encoding="utf-8")
    print(f"[OK] {len(linhas)} registros -> {SAIDA.name} "
          f"(casados {total}, json inválido {json_invalido}, dup {dup})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
