"""AlexandriOS — endpoints da ajuda (GET /alexandrios/*).

Wire no main.py:
    from backend.alexandrios.api import router as alexandrios_router
    app.include_router(alexandrios_router)

Cliente Supabase criado sob demanda do ambiente (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
Sem credencial -> 503 claro (não derruba o app; o mobile cai pro faqs.json local).
"""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/alexandrios", tags=["alexandrios"])

PUBLICOS = {"usuario", "admin", "integrador"}


@lru_cache(maxsize=1)
def _db():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes no ambiente")
    from supabase import create_client

    return create_client(url, key)


@router.get("/search")
def search(
    q: str = "",
    publico: str = "usuario",
    persona: Optional[str] = None,
    category: Optional[str] = None,
    anchor: Optional[str] = None,
) -> dict:
    """Busca na base de ajuda. `publico` filtra usuario|admin|integrador;
    `anchor` puxa a ajuda contextual de uma tela/módulo (o '?' de cada fase)."""
    try:
        db = _db()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    query = db.table("alexandrios_kb").select(
        "id, publico, persona, category, question, answer, related_faqs, tone, anchor"
    )
    if publico in PUBLICOS:
        query = query.eq("publico", publico)
    if persona:
        query = query.eq("persona", persona)
    if category:
        query = query.eq("category", category)
    if anchor:
        query = query.eq("anchor", anchor)

    res = query.execute()
    rows = res.data or []
    if q:
        ql = q.lower()
        rows = [r for r in rows if ql in (r.get("question", "") + r.get("answer", "")).lower()]
    return {"total": len(rows), "publico": publico, "resultados": rows}


@router.get("/health")
def health() -> dict:
    try:
        _db()
        cred = True
    except RuntimeError:
        cred = False
    return {"ok": True, "modulo": "alexandrios", "kb_credenciado": cred}
