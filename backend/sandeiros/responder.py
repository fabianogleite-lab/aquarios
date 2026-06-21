"""Lógica do endpoint /sandeiros/responder — separada do FastAPI (testável sem web).

F1: N1 cache (hash-exato). MISS -> sinaliza que a cascata N2-N4 entra no F3.
F2 (opcional): se `humanizar=True`, aplica o Motor de Humanização sobre o output
bruto (degrada graciosamente sem os hl*_*.json — nunca derruba a resposta do cache).
"""

from __future__ import annotations

from typing import Optional

from .semantic_cache import SemanticCache


def responder(
    cache: SemanticCache,
    prompt: str,
    idioma: str = "pt",
    categoria: Optional[str] = None,
    historico: Optional[list] = None,
    humanizar: bool = False,
) -> dict:
    """Resolve um prompt pelo SandeirOS.

    HIT  -> {fonte:'CACHE', custo_tokens:0, output:..., [humanizado:...]}
    MISS -> {fonte:'MISS',  custo_tokens:0, output:None, cascata:'pendente_F3'}
    """
    prompt = (prompt or "").strip()
    if not prompt:
        return {"fonte": "ERRO", "output": None, "detail": "prompt vazio"}

    hit = cache.get(prompt, idioma=idioma, categoria=categoria)
    if hit is None:
        return {
            "fonte": "MISS",
            "output": None,
            "custo_tokens": 0,
            "cascata": "pendente_F3",  # N2 Llama / N3 playbook / N4 Claude entram no F3
        }

    resposta = {
        "fonte": "CACHE",
        "custo_tokens": 0,
        "output": hit["output"],
        "fonte_original": hit.get("fonte_original"),
    }
    if humanizar:
        # F2: import tardio (módulo opcional). Qualquer falha vira metadado,
        # nunca exceção — a resposta do cache tem que sair de qualquer jeito.
        try:
            from . import humanizador
            resposta["humanizado"] = humanizador.humanizar(hit["output"], prompt, historico)
        except Exception as e:  # noqa: BLE001 — degradação proposital
            resposta["humanizado_erro"] = str(e)
    return resposta
