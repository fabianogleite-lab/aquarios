"""F2 — Motor de Humanização (HL): 4 camadas técnicas aplicadas em sequência
sobre a resposta bruta de qualquer fonte (cache/Llama/playbook/Claude).

Camadas (codinomes neutros — NÃO descrever a origem em código/comentário):
  C1 Diagnóstico de Intervalo Temporal  (camada1_intervalo)  -> hl1_intervalo_300.json
  C2 Contexto Triádico                  (camada2_triade)     -> hl2_triade_80.json
  C3 Filtro de Equilíbrio Linguístico   (camada3_equilibrio) -> hl3_equilibrio_70.json
  C4 Reenquadramento por Gatilho        (camada4_reframe)    -> hl4_reframe_22.json

🔒 Os arquivos hl*_*.json NÃO ficam no repo (são gitignored). São colocados
manualmente na VM (data/). Se ausentes, cada camada degrada graciosamente
(retorna o texto sem quebrar) — o motor continua funcionando só sem o enriquecimento.

Correções aplicadas (fix#3/#4 do blueprint):
- as camadas rodam em sequência REAL (não achatadas);
- eixo fraco da C2 = min() do histórico REAL do usuário (não random);
- insatisfação (gatilho da C4) é contada nos turnos do USUÁRIO, não do agente.
"""

from __future__ import annotations

import json
import os
import re
from typing import Any, Optional

_DATA = os.path.join(os.path.dirname(__file__), "data")

_MARCADORES_FUTURO = ("vai acontecer", "medo", "ansiedade", "ansioso", "preocup", "e se", "futuro", "preparar")
_MARCADORES_PASSADO = ("foi", "fiz", "culpa", "arrepend", "deveria", "errei", "passado")
_MARCADORES_INSATISFACAO = ("nao entendi", "não entendi", "nao ajud", "não ajud", "nao foi", "não foi", " mas ", "de novo", "continua")

_EIXOS = ("pessoal", "relacional", "coletivo")


def _carregar(nome: str) -> Any:
    """Carrega um arquivo de dados HL; se ausente (gitignored/não deployado), devolve None."""
    caminho = os.path.join(_DATA, nome)
    try:
        with open(caminho, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def _texto(resposta: Any) -> str:
    """Extrai o texto da resposta bruta (jsonb {'texto': ...} ou string)."""
    if isinstance(resposta, dict):
        return str(resposta.get("texto", resposta))
    return str(resposta)


# ── C1 — Diagnóstico de Intervalo Temporal ─────────────────────────────
def camada1_intervalo(resposta_bruta: Any, pergunta: str) -> dict:
    base = _carregar("hl1_intervalo_300.json")
    p = pergunta.lower()
    if any(m in p for m in _MARCADORES_PASSADO) and not any(m in p for m in _MARCADORES_FUTURO):
        modo = "RETROSPECTIVO"
    else:
        modo = "PROSPECTIVO"  # padrão
    texto = _texto(resposta_bruta)
    pratica = None
    if base:
        candidatos = [n for n in base if n.get("modo") == modo] or base
        if candidatos:
            pratica = candidatos[0].get("pratica") or candidatos[0].get("pratica_90s")
    return {"texto": texto, "modo": modo, "pratica": pratica}


# ── C2 — Contexto Triádico ─────────────────────────────────────────────
def _eixo_fraco(historico: Optional[list]) -> str:
    if not historico:
        return "pessoal"
    cont = {e: 0 for e in _EIXOS}
    for turno in historico:
        eixo = (turno or {}).get("eixo")
        if eixo in cont:
            cont[eixo] += 1
    return min(cont, key=cont.get)


def camada2_triade(estado: dict, historico: Optional[list]) -> dict:
    base = _carregar("hl2_triade_80.json")
    eixo = _eixo_fraco(historico)
    acao = None
    if base:
        no = next((n for n in base if n.get("eixo") == eixo), None)
        if no:
            acao = no.get("acao_5min") or no.get("acao")
    estado["eixo_fraco"] = eixo
    estado["acao_5min"] = acao
    return estado


# ── C3 — Filtro de Equilíbrio Linguístico ──────────────────────────────
def camada3_equilibrio(estado: dict) -> dict:
    base = _carregar("hl3_equilibrio_70.json")
    texto = estado["texto"]
    # regras de fallback (anti-absolutismo) caso os dados não estejam presentes
    regras = [(r"\bvocê deve\b", "experimente"), (r"\btem que\b", "pode testar"),
              (r"\bsempre\b", "muitas vezes"), (r"\bnunca\b", "raramente")]
    if base:
        regras = [(r.get("de"), r.get("para")) for r in base if r.get("de") and r.get("para")] or regras
    for de, para in regras:
        texto = re.sub(de, para, texto, flags=re.IGNORECASE)
    estado["texto"] = texto
    return estado


# ── C4 — Reenquadramento por Gatilho ───────────────────────────────────
def insatisfacao(historico: Optional[list]) -> int:
    """Conta marcadores de insatisfação SÓ nos turnos do USUÁRIO (fix#3)."""
    if not historico:
        return 0
    n = 0
    for turno in historico:
        if (turno or {}).get("papel") != "usuario":
            continue
        msg = (turno.get("texto") or "").lower()
        if any(m in msg for m in _MARCADORES_INSATISFACAO):
            n += 1
    return n


def camada4_reframe(estado: dict, score_insatisfacao: int) -> dict:
    if score_insatisfacao < 2:
        return estado  # não dispara
    base = _carregar("hl4_reframe_22.json")
    if base:
        import random
        no = random.choice(base)  # reenquadramento (espelho), não previsão
        espelho = no.get("pergunta_espelho") or no.get("reframe")
        if espelho:
            estado["reframe"] = espelho
    return estado


# ── Pipeline ───────────────────────────────────────────────────────────
def humanizar(resposta_bruta: Any, pergunta: str, historico: Optional[list] = None) -> dict:
    """Aplica C1→C2→C3→C4 em sequência. Devolve o estado humanizado.
    A montagem do texto final fica no ProteOS (apresentação)."""
    estado = camada1_intervalo(resposta_bruta, pergunta)
    estado = camada2_triade(estado, historico)
    estado = camada3_equilibrio(estado)
    estado = camada4_reframe(estado, insatisfacao(historico))
    return estado
