"""
ranking_endpoint.py — Endpoint /v1/rank para o HygeiOS FastAPI
Adicionar ao Oracle VM (api.podiumtec.com.br) para custo zero de rating/ranking.

Deploy: copiar este arquivo para o VM e registrar o router no main FastAPI app.
  scp ranking_endpoint.py opc@137.131.158.242:~/hygeios/
  # depois em main.py: app.include_router(ranking_router)
"""
from __future__ import annotations
import hashlib
import logging
import os
from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from hvp_shared import AttentionSignal, get_engine, RankedItem

logger = logging.getLogger("hygeios.ranking")
ranking_router = APIRouter(prefix="/v1", tags=["ranking"])


# ── Schemas de entrada/saída ──────────────────────────────────────────────────

class SignalIn(BaseModel):
    item_id: str
    dwell_ms: int
    clicks: int = 0
    category: str = "geral"
    scroll_velocity: float = 0.0

class RankRequest(BaseModel):
    project: str                     # "escambos" | "odontolar" | "heysky"
    user_id: Optional[str] = None    # será mascarado via SHA-256 antes de qualquer log
    items: list[dict[str, Any]]      # [{"id": "prod_001", ...}, ...]
    signals: list[SignalIn]

class RankedItemOut(BaseModel):
    item_id: str
    rank: int
    engagement_score: float
    intent_class: str
    dominant_dimension: str
    dwell_ms: int

class RankResponse(BaseModel):
    project: str
    user_hash: str                   # SHA-256 — nunca PII em disco
    ranked: list[RankedItemOut]
    engine_version: str = "hvp-1.0"


# ── Endpoint ─────────────────────────────────────────────────────────────────

@ranking_router.post("/rank", response_model=RankResponse)
async def rank_items(req: RankRequest) -> RankResponse:
    """
    Rankeia itens por score HVP de atenção.
    Compartilhado entre EscambOS, OdontolarPlus e HeySky.
    Custo de infra = zero (HygeiOS VM já existente).
    """
    try:
        engine = get_engine(req.project)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Garante que user_id nunca vaza nos logs
    user_hash = hashlib.sha256(
        (req.user_id or "anonimo").encode()
    ).hexdigest()[:24]

    # Converte signals para AttentionSignal
    signals_by_item: dict[str, list[AttentionSignal]] = {}
    for s in req.signals:
        sig = AttentionSignal(
            item_id=s.item_id,
            dwell_ms=s.dwell_ms,
            clicks=s.clicks,
            category=s.category,
            scroll_velocity=s.scroll_velocity,
        )
        signals_by_item.setdefault(s.item_id, []).append(sig)

    ranked: list[RankedItem] = engine.rank(req.items, signals_by_item)

    logger.info(
        "rank ok project=%s user=%s items=%d top=%s score=%.1f",
        req.project, user_hash, len(req.items),
        ranked[0].item_id if ranked else "—",
        ranked[0].engagement_score if ranked else 0,
    )

    return RankResponse(
        project=req.project,
        user_hash=user_hash,
        ranked=[
            RankedItemOut(
                item_id=r.item_id,
                rank=r.rank,
                engagement_score=r.engagement_score,
                intent_class=r.intent_class,
                dominant_dimension=r.dominant_dimension,
                dwell_ms=r.dwell_ms,
            )
            for r in ranked
        ],
    )


# ── Endpoint de health (zero custo, sem DB) ───────────────────────────────────

@ranking_router.get("/rank/health")
async def rank_health():
    return {"status": "ok", "engine": "hvp-1.0", "projects": ["escambos", "odontolar", "heysky"]}
