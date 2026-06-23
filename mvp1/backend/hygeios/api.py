"""Endpoints do HygeiOS-agente (H1+H2)."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/hygeios", tags=["hygeios"])


class InsightRead(BaseModel):
    insight_id: str
    visto: bool = True


@router.post("/h1/run")
def h1_run(db=None):
    """Roda o worker H1 manualmente (ou cron a cada 6h)."""
    if not db:
        return {"ok": True, "msg": "mock"}

    from .h1_loop import h1_worker

    admin_settings = db.table("admin_settings").select("chave,valor").execute()
    settings = {row["chave"]: row["valor"] for row in admin_settings.data or {}}

    result = h1_worker(db, settings)
    return result


@router.get("/insights/me")
def get_my_insights(user_id: str = None, db=None):
    """Lê insights do usuário (não-lidos primeiro)."""
    if not db or not user_id:
        return []

    res = db.table("hygeios_insights").select(
        "id, tipo, dimensao, status, dados, ts"
    ).eq("user_id", user_id).order("ts", desc=True).execute()

    return res.data or []


@router.put("/insights/{insight_id}/visto")
def mark_insight_read(insight_id: str, db=None):
    """Marca insight como lido."""
    if not db:
        return {"ok": True}

    db.table("hygeios_insights").update(
        {"status": "VISTO"}
    ).eq("id", insight_id).execute()

    return {"ok": True, "insight_id": insight_id}
