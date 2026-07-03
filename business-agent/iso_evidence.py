#!/usr/bin/env python3
"""
iso_evidence.py — grava 1 evidência de controle ISO 27001 em cl_iso_evidence.

Regra de ouro: falha de auditoria NUNCA derruba o fluxo principal — toda
exceção é engolida (mesma postura do _log_incident do cerber_shield).

Uso:
    from iso_evidence import log_iso_evidence
    await log_iso_evidence("A.8.10", "dsar_created", asset="cl_dsar_requests",
                           details={"ticket": ticket, "dry_run": True})
"""
import os
from typing import Optional

import httpx

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")


async def log_iso_evidence(control_id: str, event: str, asset: str = "", details: Optional[dict] = None) -> bool:
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return False
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.post(
                f"{SUPABASE_URL}/rest/v1/cl_iso_evidence",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json",
                },
                json={"control_id": control_id, "event": event, "asset": asset,
                      "details": details or {}},
            )
        return resp.status_code in (200, 201)
    except Exception:
        return False
