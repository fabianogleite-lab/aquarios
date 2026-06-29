# ivi_v2.py — rotas /api/v2/ivi/* migradas do serviço separado aquarios-hygeios-v2
# (consolidação 29/Jun: elimina o 3o processo Python no Oracle, sem trazer
# boto3/duckdb/web3 que só serviam o pipeline S3 não usado pelo app real).
# Reusa o mesmo padrão REST do lead_capture.py (httpx + PostgREST), sem o
# pacote `supabase` pra não inflar dependências.
import os
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ivi_motor import IVIData, calc_ivi, get_ivi_level

router = APIRouter(prefix="/api/v2", tags=["ivi"])

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")


async def _count(client: httpx.AsyncClient, table: str, user_id: str, since: datetime) -> int:
    resp = await client.get(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers={
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Prefer": "count=exact",
        },
        params={"select": "id", "user_id": f"eq.{user_id}", "created_at": f"gte.{since.isoformat()}"},
    )
    resp.raise_for_status()
    content_range = resp.headers.get("content-range", "*/0")
    return int(content_range.split("/")[-1] or 0)


async def _dates(client: httpx.AsyncClient, table: str, user_id: str, since: datetime) -> list[str]:
    resp = await client.get(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers={"apikey": SUPABASE_SERVICE_KEY, "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"},
        params={"select": "created_at", "user_id": f"eq.{user_id}", "created_at": f"gte.{since.isoformat()}"},
    )
    resp.raise_for_status()
    return [row["created_at"][:10] for row in resp.json()]


async def _fetch_telemetry(user_id: str) -> IVIData:
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Supabase não configurado — checar SUPABASE_SERVICE_KEY no .env")

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    ninety_ago = now - timedelta(days=90)

    async with httpx.AsyncClient(timeout=10) as client:
        meals_today = await _count(client, "meals", user_id, today_start)
        meals_week = await _count(client, "meals", user_id, week_ago)
        diary_week = await _count(client, "diario_entries", user_id, week_ago)
        try:
            wonder_month = await _count(client, "wonder_night_purchases", user_id, month_ago)
        except Exception:
            wonder_month = 0
        posts_month = await _count(client, "community_posts", user_id, month_ago)
        diary_dates = await _dates(client, "diario_entries", user_id, ninety_ago)
        meal_dates = await _dates(client, "meals", user_id, ninety_ago)

    month_ago_str = month_ago.date().isoformat()
    diary_unique_days = len({d for d in diary_dates if d >= month_ago_str})

    all_days = sorted(set(diary_dates + meal_dates), reverse=True)
    streak = 0
    if all_days:
        today_str = now.date().isoformat()
        yesterday_str = (now.date() - timedelta(days=1)).isoformat()
        if all_days[0] in (today_str, yesterday_str):
            for i, day in enumerate(all_days):
                if day == (now.date() - timedelta(days=i)).isoformat():
                    streak += 1
                else:
                    break

    return IVIData(
        meals_today=meals_today,
        meals_week=meals_week,
        diary_week=diary_week,
        diary_unique_days=diary_unique_days,
        wonder_month=wonder_month,
        posts_month=posts_month,
        streak=streak,
    )


@router.get("/health")
def ivi_health():
    return {
        "status": "ok",
        "version": "2.0.0-consolidado",
        "supabase_ok": bool(SUPABASE_URL and SUPABASE_SERVICE_KEY),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


class IVIRequest(BaseModel):
    meals_today: int = 0
    meals_week: int = 0
    diary_week: int = 0
    diary_unique_days: int = 0
    wonder_month: int = 0
    posts_month: int = 0
    streak: int = 0


@router.post("/ivi/calculate")
def calculate_ivi(req: IVIRequest):
    data = IVIData(**req.model_dump())
    scores = calc_ivi(data)
    level = get_ivi_level(scores.overall)
    return {
        "scores": {"fisico": scores.fisico, "mental": scores.mental,
                   "espiritual": scores.espiritual, "social": scores.social,
                   "overall": scores.overall},
        "level": level,
        "formula_version": "V2.0604",
        "pesos": {"fisico": 0.35, "mental": 0.30, "espiritual": 0.20, "social": 0.15},
    }


@router.get("/ivi/{user_id}")
async def get_ivi_for_user(user_id: str):
    try:
        data = await _fetch_telemetry(user_id)
    except RuntimeError as e:
        raise HTTPException(503, str(e))
    scores = calc_ivi(data)
    level = get_ivi_level(scores.overall)
    return {
        "user_id": user_id,
        "scores": {"fisico": scores.fisico, "mental": scores.mental,
                   "espiritual": scores.espiritual, "social": scores.social,
                   "overall": scores.overall},
        "level": level,
        "raw_inputs": data.__dict__,
        "formula_version": "V2.0604",
    }
