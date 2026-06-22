"""Skin B — Tool Bus + 1-toque + Shopify (B2B "salvar operação")."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/skin-b", tags=["skin-b"])


class ToolRequest(BaseModel):
    tool: str  # email|whatsapp|calendar
    user_id: str
    dados: dict  # {"to": "...", "subject": "...", "body": "..."}


class ConfirmacaoRequest(BaseModel):
    task_id: str
    confirmado: bool


@router.post("/tools/executar")
def executar_tool(req: ToolRequest, db=None):
    """Executa tool (email/whatsapp/calendar). Retorna task_id pra 1-toque."""
    if req.tool == "email":
        from tools.email_adapter import send_email
        result = send_email(req.dados["to"], req.dados["subject"], req.dados["body"])

    elif req.tool == "whatsapp":
        from tools.messaging_adapter import send_whatsapp
        result = send_whatsapp(req.dados["phone"], req.dados["message"])

    elif req.tool == "calendar":
        # TODO: integrar Google Calendar / Apple Calendar via OAuth
        result = {"ok": False, "error": "calendar não implementado"}

    else:
        raise HTTPException(status_code=400, detail=f"Tool {req.tool} desconhecida")

    if not result.get("ok"):
        return {"ok": False, "error": result.get("error")}

    # Grava task aguardando confirmação (1-toque)
    task_id = "task_" + str(req.tool) + "_" + str(hash(str(result)))[-8:]
    if db:
        db.table("skin_b_confirmacoes").insert({
            "task_id": task_id,
            "user_id": req.user_id,
            "tool": req.tool,
            "payload": req.dados,
            "status": "AGUARDANDO_CONFIRMACAO",
        }).execute()

    return {"ok": True, "task_id": task_id, "requer_confirmacao": True}


@router.post("/confirmacao/{task_id}")
def confirmar_task(task_id: str, req: ConfirmacaoRequest, db=None):
    """1-toque: confirma ou rejeita a execução."""
    if not db:
        return {"ok": True}

    db.table("skin_b_confirmacoes").update({
        "status": "CONFIRMADO" if req.confirmado else "REJEITADO"
    }).eq("task_id", task_id).execute()

    return {"ok": True, "task_id": task_id, "status": "CONFIRMADO" if req.confirmado else "REJEITADO"}
