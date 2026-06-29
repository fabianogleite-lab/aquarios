"""F1 — endpoint HTTP do SandeirOS (POST /sandeiros/responder).

Wire-in na VM Oracle: no main.py do FastAPI, adicionar duas linhas:

    from sandeiros.api import router as sandeiros_router
    app.include_router(sandeiros_router)

O cliente Supabase é criado SOB DEMANDA a partir do ambiente
(SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY). Sem credencial -> 503 claro,
sem derrubar o app no import (importar este módulo nunca exige rede/credencial).
"""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .responder import responder
from .semantic_cache import SemanticCache

router = APIRouter(prefix="/sandeiros", tags=["sandeiros"])


class ResponderIn(BaseModel):
    prompt: str
    idioma: str = "pt"
    categoria: Optional[str] = None
    historico: Optional[list] = None
    humanizar: bool = False
    usar_llama_local: bool = False


class RegistrarIn(BaseModel):
    prompt: str
    idioma: str = "pt"
    categoria: Optional[str] = None
    funcao: Optional[str] = None
    resposta: str
    fonte: str = "CLAUDE"
    tokens_input: int = 0
    tokens_output: int = 0


@lru_cache(maxsize=1)
def _cache() -> SemanticCache:
    """Singleton do cliente Supabase + SemanticCache. Levanta se faltar credencial
    (lru_cache NÃO memoriza exceção, então tenta de novo quando o env aparecer)."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes no ambiente")
    from supabase import create_client

    return SemanticCache(create_client(url, key))


@router.post("/responder")
def responder_endpoint(body: ResponderIn) -> dict:
    try:
        cache = _cache()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    return responder(
        cache,
        prompt=body.prompt,
        idioma=body.idioma,
        categoria=body.categoria,
        historico=body.historico,
        humanizar=body.humanizar,
        usar_llama_local=body.usar_llama_local,
    )


@router.post("/registrar")
def registrar_endpoint(body: RegistrarIn) -> dict:
    """Fecha o ciclo MISS->Claude->cache: chamado pelo cliente (edge function `chat`)
    depois de uma resposta vinda do Claude, pra próxima chamada igual virar HIT.
    Subagente Bob (Operador do Cache Semântico) é o responsável conceitual por este passo."""
    try:
        cache = _cache()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    cache.set(
        prompt=body.prompt,
        idioma=body.idioma,
        categoria=body.categoria,
        funcao=body.funcao,
        resposta=body.resposta,
        fonte=body.fonte,
        tokens_input=body.tokens_input,
        tokens_output=body.tokens_output,
    )
    return {"ok": True, "registrado_por": "bob"}


@router.get("/health")
def health() -> dict:
    """Liveness + se o cache tem credencial configurada (não toca a rede)."""
    try:
        _cache()
        cred = True
    except RuntimeError:
        cred = False
    return {"ok": True, "modulo": "sandeiros", "fase": "F1", "cache_credenciado": cred}
