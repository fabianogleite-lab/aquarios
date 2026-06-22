"""Shopify F1 — webhook de ordens/pagamentos (PanaceIA Fase 1)."""
from fastapi import APIRouter, Request, HTTPException
import os
import hmac
import hashlib

router = APIRouter(prefix="/shopify", tags=["shopify"])


def verify_shopify_webhook(request_headers: dict, body: bytes) -> bool:
    """Valida assinatura HMAC do Shopify."""
    shopify_secret = os.environ.get("SHOPIFY_API_SECRET", "")
    hmac_header = request_headers.get("X-Shopify-Hmac-SHA256", "")

    if not hmac_header or not shopify_secret:
        return False

    hash_obj = hmac.new(
        shopify_secret.encode(),
        body,
        hashlib.sha256
    )
    computed_hmac = hash_obj.digest().hex()
    return hmac.compare_digest(computed_hmac, hmac_header)


@router.post("/webhooks/order")
async def shopify_order_webhook(request: Request, db=None):
    """Webhook: Shopify envia ordem paga. Grava em skin_b_shopify_orders."""
    body = await request.body()

    if not verify_shopify_webhook(dict(request.headers), body):
        raise HTTPException(status_code=401, detail="Invalid HMAC")

    import json
    payload = json.loads(body)

    order_id = payload.get("id")
    customer_email = payload.get("email")
    total_price = int(float(payload.get("total_price", 0)) * 100)  # centavos
    status = "PAGO" if payload.get("financial_status") == "paid" else "PENDENTE"

    # Busca user_id pelo email
    if db:
        res = db.auth.users().select("id").eq("email", customer_email).execute()
        user_id = res.data[0]["id"] if res.data else None

        if user_id:
            db.table("skin_b_shopify_orders").insert({
                "user_id": user_id,
                "shopify_order_id": order_id,
                "valor_centavos": total_price,
                "status": status,
            }).execute()

    return {"ok": True, "order_id": order_id, "status": status}
