"""N2 — tier Llama local (Ollama) da cascata F3.

Cache MISS -> antes de cair pro fallback (N3 playbook / N4 Claude, ainda não
implementados), tenta gerar via Llama local (Ollama) SE o caller pedir
(`usar_llama_local=True` em responder.py). Por padrão fica desligado — produção
(Oracle/Azure) não tem Ollama acessível, então nunca chama isto a menos que
configurado explicitamente.

Hoje só faz sentido em ambiente de dev (GPU do fundador) — ver INFRA_HARDWARE_MAP.md.

Configuração (env):
  OLLAMA_URL   default http://localhost:11434
  OLLAMA_MODEL default llama3:8b
"""

from __future__ import annotations

import os
from typing import Optional

import requests


def gerar(prompt: str, idioma: str = "pt") -> Optional[str]:
    """Chama o Ollama local. Devolve None em qualquer falha (timeout, conexão
    recusada, modelo ausente) — nunca propaga exceção pro caller (mesma
    degradação graciosa do humanizador.py)."""
    url = os.environ.get("OLLAMA_URL", "http://localhost:11434")
    modelo = os.environ.get("OLLAMA_MODEL", "llama3:8b")
    try:
        resp = requests.post(
            f"{url}/api/generate",
            json={"model": modelo, "prompt": prompt, "stream": False},
            timeout=(2, 60),  # connect curto (falha rápido se Ollama não estiver no ar); read generoso (cold-start carrega o modelo na VRAM, ~25s)
        )
        resp.raise_for_status()
        return resp.json().get("response") or None
    except (requests.RequestException, ValueError):
        return None
