"""Main FastAPI — H3 convergência (SandeirOS F1/F2 + HygeiOS H1/H2 + Skin B)."""
from fastapi import FastAPI
import os

app = FastAPI(title="AquariOS MVP1", version="1.0")

# ============ F1/F2 SandeirOS ============
from backend.sandeiros.api import router as sandeiros_router
app.include_router(sandeiros_router)

# ============ H1/H2 HygeiOS ============
from backend.hygeios.api import router as hygeios_router
app.include_router(hygeios_router)

# ============ Admin Settings ============
from backend.admin_settings import router as admin_router
app.include_router(admin_router)

# ============ Skin B (Tool Bus + Shopify) ============
from backend.skin_b_api import router as skin_b_router
app.include_router(skin_b_router)

from backend.shopify_webhook import router as shopify_router
app.include_router(shopify_router)

# ============ AlexandriOS (ajuda: usuario/admin/integrador) ============
from backend.alexandrios.api import router as alexandrios_router
app.include_router(alexandrios_router)

# ============ Health ============
@app.get("/health")
def health():
    return {
        "ok": True,
        "version": "1.0",
        "modules": ["sandeiros", "hygeios", "admin", "skin-b", "shopify", "alexandrios"],
    }

@app.get("/")
def root():
    return {"msg": "AquariOS MVP1 online"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
