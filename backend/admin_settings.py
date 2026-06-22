"""Leitura/escrita de configurações dinâmicas no admin."""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["admin"])


class SettingUpdate(BaseModel):
    chave: str
    valor: str


@router.get("/settings")
def get_settings(db=None):
    """Lê todas as settings (app lê na startup)."""
    if not db:
        return {"recorrencia_dias": 7, "recorrencia_vezes": 3, "carimbo_automat": False}

    res = db.table("admin_settings").select("chave,valor").execute()
    return {row["chave"]: row["valor"] for row in res.data or []}


@router.put("/settings/{chave}")
def update_setting(chave: str, body: SettingUpdate, db=None):
    """Admin atualiza uma setting."""
    if not db:
        return {"ok": True, "msg": "mock"}

    db.table("admin_settings").update({"valor": body.valor}).eq("chave", chave).execute()
    return {"ok": True, "chave": chave, "novo_valor": body.valor}
