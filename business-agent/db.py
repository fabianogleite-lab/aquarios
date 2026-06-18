"""
Supabase REST helper (service_role) — Pacote D Business Agent.
O service_role bypassa RLS (deny-by-default da migration 30). Server-side apenas;
NUNCA expor SUPABASE_SERVICE_KEY ao cliente.
"""
import os
import httpx

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
BASE = f"{SUPABASE_URL}/rest/v1"
HEADERS = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}",
           "Content-Type": "application/json"}


class DB:
    async def insert(self, table: str, data: dict) -> dict:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.post(f"{BASE}/{table}", json=data,
                             headers={**HEADERS, "Prefer": "return=representation"})
            r.raise_for_status()
            rows = r.json()
            return rows[0] if rows else {}

    async def select_one(self, table: str, filters: dict):
        params = {k: f"eq.{v}" for k, v in filters.items()}
        params["limit"] = "1"
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(f"{BASE}/{table}", params=params, headers=HEADERS)
            r.raise_for_status()
            rows = r.json()
            return rows[0] if rows else None

    async def update(self, table: str, id_: str, data: dict):
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.patch(f"{BASE}/{table}", params={"id": f"eq.{id_}"}, json=data,
                              headers={**HEADERS, "Prefer": "return=representation"})
            r.raise_for_status()
            return r.json()

    async def find_or_create_cliente(self, canal: str, canal_id: str, payload: dict) -> dict:
        col = {"whatsapp": "wa_id", "instagram": "ig_id", "messenger": "messenger_id"}[canal]
        existing = await self.select_one("clientes", {col: canal_id})
        if existing:
            return existing
        return await self.insert("clientes", {col: canal_id, "pais": payload.get("pais", "BR")})

    async def get_or_create_conversa(self, cliente_id: str, canal: str, canal_id: str) -> dict:
        existing = await self.select_one("conversas", {"cliente_id": cliente_id, "canal": canal})
        if existing:
            return existing
        return await self.insert("conversas",
                                 {"cliente_id": cliente_id, "canal": canal, "canal_id": canal_id})

    async def count_conversas_recentes(self, cliente_id: str) -> int:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(f"{BASE}/conversas",
                            params={"cliente_id": f"eq.{cliente_id}", "select": "id"},
                            headers={**HEADERS, "Prefer": "count=exact"})
            return int(r.headers.get("content-range", "*/0").split("/")[-1] or 0)


db = DB()
