"""
business-agent/core_engine.py
C&L Gestora de Recursos Limitada — CNPJ 41.191.506/0001-02
Gateway de ingestão · Retry worker · Backoffice admin
Lucro Real não-cumulativo: PIS 1,65% + COFINS 7,60%
"""
import asyncio
import hashlib
import hmac
import json
import logging
import os
import pathlib
import sys
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, FastAPI, Header, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel

# HVP engine — import plano em Oracle VM (flat), fallback estruturado em dev
try:
    from hvp_shared import get_engine
except ImportError:
    sys.path.insert(0, str(pathlib.Path(__file__).parent.parent / "escambos" / "core"))
    from hvp_shared import get_engine  # type: ignore

# Supabase — degrada graciosamente se env vars ausentes
try:
    from supabase import create_client as _sb_create
    _sb = _sb_create(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])
except Exception:
    _sb = None

logger = logging.getLogger("cl.core_engine")

# ── Config ────────────────────────────────────────────────────────────────────
_HMAC_SECRET = os.getenv("HMAC_SECRET", "").encode()
_ADMIN_TOKEN  = os.getenv("ADMIN_TOKEN", "")

# Backoff exponencial: 10s→30s→90s→270s→810s (~14 min total, 5 tentativas)
_BACKOFF_S = [10, 30, 90, 270, 810]

# Idempotência in-process (substituir por Redis TTL 3600s em prod escalada)
_seen: set[str] = set()


# ── Models ────────────────────────────────────────────────────────────────────
class PayloadTotal(BaseModel):
    id: str
    tipo: str          # TELEMETRIA_MOBI_JAVA | AMAZON_ORDER_DISPATCHED
    user_id: str
    order_id: Optional[str]   = None
    valor_pedido: Optional[float] = None
    dwell_time_ms: Optional[int]  = None
    clicks: Optional[int]         = None
    scroll_velocity: Optional[float] = None


# ── HMAC ─────────────────────────────────────────────────────────────────────
def _check_hmac(body: bytes, sig: str) -> bool:
    if not _HMAC_SECRET:
        raise RuntimeError("HMAC_SECRET env var não configurado")
    digest = hmac.new(_HMAC_SECRET, body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest, sig)


# ── Core processor ────────────────────────────────────────────────────────────
async def _process(payload: PayloadTotal) -> None:
    user_hash = hashlib.sha256(payload.user_id.encode()).hexdigest()

    if payload.tipo == "TELEMETRIA_MOBI_JAVA":
        engine = get_engine("escambos")
        score  = engine.score(
            dwell_ms=payload.dwell_time_ms or 0,
            clicks=payload.clicks or 0,
        )
        assertividade = engine.classify_intent(score)
        if _sb:
            _sb.table("escambos_hvp_signals").insert({
                "user_hash_dop":  user_hash,
                "dwell_ms":       payload.dwell_time_ms or 0,
                "clicks":         payload.clicks or 0,
                "scroll_velocity": payload.scroll_velocity or 0.0,
                "assertividade":  assertividade,
            }).execute()
        logger.info("HVP %s score=%.4f %s", user_hash[:8], score, assertividade)

    elif payload.tipo == "AMAZON_ORDER_DISPATCHED":
        comissao = round((payload.valor_pedido or 0.0) * 0.10, 2)
        if _sb:
            _sb.table("cl_fiscal_nfse").insert({
                "order_id":      payload.order_id or payload.id,
                "user_hash_dop": user_hash,
                "valor_comissao": comissao,
                "pis_apurado":   round(comissao * 0.0165, 4),
                "cofins_apurado": round(comissao * 0.0760, 4),
            }).execute()
            _sb.table("cl_logistica_tracking").insert({
                "order_id":          payload.order_id or payload.id,
                "user_hash_dop":     user_hash,
                "status_transporte": "coletado",
                "transportadora":    "amazon",
            }).execute()
        logger.info("Fiscal order=%s comissao=%.2f", payload.order_id, comissao)


# ── Retry worker — exponential backoff ───────────────────────────────────────
async def _worker_with_retry(payload: PayloadTotal) -> None:
    for attempt, delay in enumerate(_BACKOFF_S):
        try:
            await _process(payload)
            return
        except Exception as exc:
            logger.error(
                "tentativa %d/%d falhou id=%s: %s",
                attempt + 1, len(_BACKOFF_S), payload.id, exc,
            )
            if attempt < len(_BACKOFF_S) - 1:
                await asyncio.sleep(delay)
    logger.critical("DESCARTADO após %d tentativas: id=%s", len(_BACKOFF_S), payload.id)


# ── Router ────────────────────────────────────────────────────────────────────
router = APIRouter(tags=["C&L Gateway"])


@router.post("/v1/ingestao", status_code=202)
async def gateway_ingestao(
    request: Request,
    background_tasks: BackgroundTasks,
    x_escambos_signature: str = Header(...),
):
    """Gateway de ingestão: HMAC → idempotência → retry worker assíncrono."""
    raw = await request.body()

    if not _check_hmac(raw, x_escambos_signature):
        raise HTTPException(status_code=401, detail="Assinatura HMAC inválida.")

    payload = PayloadTotal(**json.loads(raw))

    if payload.id in _seen:
        return {"status": "IGNORADO", "motivo": "duplicidade"}
    _seen.add(payload.id)

    background_tasks.add_task(_worker_with_retry, payload)
    return {"status": "ACEITO", "id": payload.id}


@router.get("/admin/backoffice", response_class=HTMLResponse)
async def backoffice(authorization: str = Header(default="")):
    """Backoffice admin — protegido por Bearer token (ADMIN_TOKEN env var)."""
    if not _ADMIN_TOKEN or authorization != f"Bearer {_ADMIN_TOKEN}":
        raise HTTPException(status_code=401, detail="Acesso negado.")

    crm, dre, rank = [], [], []
    if _sb:
        crm  = _sb.table("vw_crm_pipeline").select("*").limit(50).execute().data or []
        dre  = _sb.table("vw_dre_simplificado").select("*").limit(12).execute().data or []
        rank = _sb.table("vw_ranking_marketplace").select("*").limit(20).execute().data or []

    receita  = sum(float(r.get("receita_bruta") or 0) for r in dre)
    deducoes = sum(
        float(r.get("total_pis") or 0) + float(r.get("total_cofins") or 0)
        for r in dre
    )
    liquido = sum(float(r.get("receita_liquida") or 0) for r in dre)

    crm_rows = "".join(
        f"<tr><td>{r.get('projeto_nome','—')}</td><td>{r.get('plano','—')}</td>"
        f"<td>{r.get('lead_classificacao','—')}</td><td>{r.get('lead_status','—')}</td>"
        f"<td>{r.get('canal_contato','—')}</td></tr>"
        for r in crm
    ) or "<tr><td colspan='5'>Nenhum projeto ativo.</td></tr>"

    rank_rows = "".join(
        f"<tr><td>{r.get('titulo','—')}</td><td>{r.get('tipo','—')}</td>"
        f"<td>{r.get('hvp_intensity','0')}</td><td>{r.get('total_sinais','0')}</td></tr>"
        for r in rank
    ) or "<tr><td colspan='4'>Aguardando sinais HVP.</td></tr>"

    html = f"""<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>C&L Backoffice</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Segoe UI',Arial,sans-serif;background:#f4f6f9;color:#2c3e50;padding:24px}}
.wrap{{max-width:1200px;margin:auto;background:#fff;border-radius:10px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,.07)}}
h1{{font-size:18px;border-bottom:3px solid #2c3e50;padding-bottom:10px;margin-bottom:8px}}
.sub{{font-size:12px;color:#95a5a6;margin-bottom:20px}}
h2{{font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:#7f8c8d;
    margin:24px 0 8px;border-left:4px solid #2c3e50;padding-left:8px}}
.cards{{display:flex;gap:16px;margin-bottom:24px}}
.card{{flex:1;padding:16px;border-radius:6px;background:#fafafa;border-top:4px solid #2c3e50}}
.card b{{font-size:11px;text-transform:uppercase;color:#7f8c8d;display:block;margin-bottom:6px}}
.card span{{font-size:22px;font-weight:700}}
table{{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:8px}}
th,td{{padding:10px;text-align:left;border-bottom:1px solid #e8ecef}}
th{{background:#2c3e50;color:#fff;font-weight:600}}
tr:hover td{{background:#f8f9fa}}
</style></head>
<body><div class="wrap">
<h1>Carvalho &amp; Leite — Backoffice</h1>
<p class="sub">Lucro Real · PIS 1,65% + COFINS 7,60% · {datetime.utcnow().strftime('%d/%m/%Y %H:%M')} UTC</p>
<div class="cards">
  <div class="card" style="border-top-color:#2ecc71">
    <b>Receita Bruta (comissões)</b><span>R$ {receita:,.2f}</span>
  </div>
  <div class="card" style="border-top-color:#e74c3c">
    <b>PIS + COFINS apurados</b><span>R$ {deducoes:,.2f}</span>
  </div>
  <div class="card" style="border-top-color:#3498db">
    <b>Receita Líquida</b><span>R$ {liquido:,.2f}</span>
  </div>
</div>
<h2>CRM Pipeline — Herme</h2>
<table>
  <tr><th>Projeto</th><th>Plano</th><th>Score Lead</th><th>Status</th><th>Canal</th></tr>
  {crm_rows}
</table>
<h2>Ranking HVP — EscambOS</h2>
<table>
  <tr><th>Produto</th><th>Tipo</th><th>Intensidade HVP</th><th>Sinais</th></tr>
  {rank_rows}
</table>
</div></body></html>"""

    return HTMLResponse(content=html)


# ── Error handlers (registrar via register_handlers(app) em main.py) ─────────
def register_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def _val(req: Request, exc: RequestValidationError):
        logger.warning("422 borda: %s", exc.errors())
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"status": "REJEITADO_BORDA", "detalhes": exc.errors()},
        )

    @app.exception_handler(HTTPException)
    async def _http(req: Request, exc: HTTPException):
        logger.error("HTTP %s: %s", exc.status_code, exc.detail)
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status":   "ERRO",
                "codigo":   exc.status_code,
                "mensagem": exc.detail,
                "ts":       datetime.utcnow().isoformat(),
            },
        )
