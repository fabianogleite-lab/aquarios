"""
business-agent/cerber_shield.py
CerberOS V1 — Defesa Ativa 7 Camadas
C&L Gestora CNPJ 41.191.506/0001-02 | LGPD Art. 46 | ANPD

Layers implementadas aqui:
  L3 — Rate limiting por IP (120 req/min)
  L6 — Heurística de payload (SQLi, XSS, path traversal, shell injection)
  L7 — Eternal Maze tarpit + decoy endpoints

L1 (TLS/nginx), L2 (HMAC), L4 (idempotência), L5 (Pydantic) → core_engine.py / nginx

Integração:
  from cerber_shield import register_cerber
  register_cerber(app)   # chame APÓS include_router (middleware fica mais externo)
"""
import asyncio
import hashlib
import logging
import os
import re
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

try:
    from supabase import create_client as _sb_create
    _sb = _sb_create(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])
except Exception:
    _sb = None

logger = logging.getLogger("cerberoscl")


# ── Layer 6: Padrões de ataque conhecidos ────────────────────────────────────
_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("SQLI_OR",        re.compile(r"'\s*OR\s*'", re.I)),
    ("SQLI_UNION",     re.compile(r"UNION\s+SELECT", re.I)),
    ("SQLI_DROP",      re.compile(r"DROP\s+TABLE", re.I)),
    ("XSS_SCRIPT",     re.compile(r"<script[\s>]", re.I)),
    ("PATH_TRAVERSAL", re.compile(r"\.\./\.\./|\.\.\\\.\.\\", re.I)),
    ("CMD_INJECTION",  re.compile(r"(?:exec|eval|system)\s*\(", re.I)),
    ("SHELL_INJECTION", re.compile(r"/bin/(?:sh|bash|dash)|cmd\.exe", re.I)),
    ("TEMPLATE_INJ",   re.compile(r"\{\{.*?\}\}|\$\{.*?\}")),
    # Prompt injection (LLM) — mesma L6, alvo diferente: o payload tenta
    # sequestrar o ProteOS, não o servidor (OWASP LLM01)
    ("PROMPT_INJ_OVERRIDE", re.compile(r"ignore\s+(all\s+)?(previous|above|prior)\s+instructions", re.I)),
    ("PROMPT_INJ_SYSPROMPT", re.compile(r"(reveal|show|print|repeat)\s+(your\s+)?(system\s+prompt|instructions)", re.I)),
    ("PROMPT_INJ_TOKENS",   re.compile(r"<\|[a-z_]+\|>", re.I)),
]

# ── PII na SAÍDA (LGPD): mascarar, nunca bloquear — resposta segue fluindo ───
_PII_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("CPF",      re.compile(r"\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b")),
    ("FONE_BR",  re.compile(r"\b\+?55\s?\(?\d{2}\)?\s?9?\d{4}-?\d{4}\b")),
]


def scrub_pii(text: str) -> str:
    """Mascara PII em texto de SAÍDA (respostas do ProteOS via WhatsApp etc.).
    Nunca levanta — no pior caso devolve o texto original."""
    try:
        for name, pattern in _PII_PATTERNS:
            if pattern.search(text):
                logger.warning("cerber[L6-out] PII mascarada: %s", name)
                text = pattern.sub("[dado removido]", text)
    except Exception:
        pass
    return text


# ── Upload guard (fotos de refeição etc.) — chame antes de persistir arquivo ─
_UPLOAD_ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
_UPLOAD_BLOCKED_EXT = (".exe", ".js", ".vbs", ".ps1", ".scr", ".bat", ".com", ".pif", ".jar")
_UPLOAD_MAX_MB = 10


def validate_upload(filename: str, content_type: str, size: int) -> Optional[str]:
    """Retorna o motivo da rejeição, ou None se o arquivo é aceitável."""
    if content_type not in _UPLOAD_ALLOWED_MIME:
        return f"mime_not_allowed:{content_type}"
    if filename.lower().endswith(_UPLOAD_BLOCKED_EXT):
        return "executable_blocked"
    if size > _UPLOAD_MAX_MB * 1024 * 1024:
        return "file_too_large"
    return None


def _detect_attack(body: bytes) -> Optional[str]:
    try:
        text = body.decode("utf-8", errors="ignore")
    except Exception:
        return "DECODE_FAIL"
    for name, pattern in _PATTERNS:
        if pattern.search(text):
            return name
    return None


# Endpoints que carregam payload de VOZ (áudio binário no STT, fala do assistente
# no TTS). A heurística de texto L6 (SQLi/XSS/template) não se aplica a esse
# conteúdo e geraria falso-positivo (bytes de áudio quase sempre casam TEMPLATE_INJ).
# L3 (rate-limit) e o JWT Supabase do voice_proxy seguem protegendo essas rotas.
_L6_EXEMPT_PREFIXES = ("/v1/tts", "/v1/stt")


# ── Layer 3: Rate limiter in-process ─────────────────────────────────────────
_rate: dict[str, list[float]] = {}
_RATE_LIMIT  = 120     # req/min por IP
_rate_ticks  = 0


def _is_rate_limited(ip: str) -> bool:
    global _rate_ticks
    _rate_ticks += 1
    if _rate_ticks % 2000 == 0:
        _gc_rate()

    now = datetime.now(timezone.utc).timestamp()
    bucket = _rate.setdefault(ip, [])
    _rate[ip] = [t for t in bucket if now - t < 60]
    _rate[ip].append(now)
    return len(_rate[ip]) > _RATE_LIMIT


def _gc_rate() -> None:
    now = datetime.now(timezone.utc).timestamp()
    stale = [ip for ip, ts in _rate.items() if not ts or now - max(ts) > 120]
    for ip in stale:
        del _rate[ip]


# ── LGPD: hash de IP antes de qualquer persistência ──────────────────────────
def _ip_hash(ip: str) -> str:
    return hashlib.sha256(ip.encode()).hexdigest()[:16]


# ── Layer 7: Eternal Maze tarpit ─────────────────────────────────────────────
async def _tarpit(delay_s: float) -> Response:
    """Mantém conexão aberta por delay_s segundos antes de responder."""
    await asyncio.sleep(delay_s)
    return JSONResponse({"status": "ok", "sync": True, "ts": datetime.utcnow().isoformat()})


# ── Incident logger → Supabase cl_cerber_incidents ───────────────────────────
async def _log_incident(ip_hash: str, threat_type: str, layer: int, severity: str) -> None:
    if not _sb:
        logger.warning("cerber: supabase offline — incidente não persistido")
        return
    try:
        _sb.table("cl_cerber_incidents").insert({
            "ip_hash":        ip_hash,
            "threat_type":    threat_type,
            "layer_triggered": layer,
            "severity":       severity,
        }).execute()
    except Exception as exc:
        logger.error("cerber: log falhou: %s", exc)


# ── Middleware ────────────────────────────────────────────────────────────────
class CerberShieldMiddleware(BaseHTTPMiddleware):
    """
    Intercepta cada requisição ANTES de chegar às rotas.
    L3 → rate limit → tarpit 5s
    L6 → payload heurística → tarpit 30s
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        ip   = request.client.host if request.client else "unknown"
        ip_h = _ip_hash(ip)

        # L3: rate limit
        if _is_rate_limited(ip):
            logger.warning("cerber[L3] rate-limit ip_hash=%s", ip_h)
            asyncio.create_task(_log_incident(ip_h, "RATE_LIMIT", 3, "HIGH"))
            return await _tarpit(5.0)

        # L6: payload heuristics (POST only) — exceto rotas de voz (payload binário/fala)
        if request.method == "POST" and not request.url.path.startswith(_L6_EXEMPT_PREFIXES):
            body    = await request.body()   # cacheado em request._body; call_next reutiliza
            pattern = _detect_attack(body)
            if pattern:
                logger.critical("cerber[L6] %s ip_hash=%s", pattern, ip_h)
                asyncio.create_task(_log_incident(ip_h, pattern, 6, "CRITICAL"))
                return await _tarpit(30.0)

        # 🔖 CARIMBO CerberOS (basal): request validada 1x na borda — daqui pra
        # dentro o núcleo confia e NÃO revalida segurança. Autorização de DADO
        # é outro plano (HygeiOS Data Gate), não se repete aqui.
        request.state.cerber_stamp = datetime.now(timezone.utc).isoformat()

        return await call_next(request)


# ── Layer 7: Decoy endpoints (honeypot traps) ─────────────────────────────────
router = APIRouter(tags=["CerberOS"])


@router.get("/.env")
@router.get("/wp-admin")
@router.get("/admin/config")
@router.get("/phpmyadmin")
@router.get("/api/admin/debug")
async def honeypot_decoy(request: Request) -> Response:
    """
    Endpoints que nenhum cliente legítimo deveria chamar.
    Qualquer acesso = scanner/exploit → tarpit 60s + log CRITICAL.
    """
    ip_h = _ip_hash(request.client.host if request.client else "unknown")
    path = str(request.url.path)
    logger.critical("cerber[L7] honeypot ip_hash=%s path=%s", ip_h, path)
    asyncio.create_task(_log_incident(ip_h, f"HONEYPOT:{path}", 7, "CRITICAL"))
    return await _tarpit(60.0)


# ── Registro público do status de ameaças (sem dados sensíveis) ──────────────
@router.get("/cerber/status")
async def cerber_status() -> dict:
    """Resumo de saúde do CerberOS — exposto internamente para o backoffice."""
    return {
        "layers_active":  [3, 6, 7],
        "rate_table_ips": len(_rate),
        "patterns_count": len(_PATTERNS),
        "tarpit_delay_l3": "5s",
        "tarpit_delay_l6": "30s",
        "tarpit_delay_l7": "60s",
        "supabase_ok":    _sb is not None,
    }


# ── Integração ────────────────────────────────────────────────────────────────
def register_cerber(app) -> None:
    """
    Registra CerberOS no app FastAPI.
    Chamar APÓS include_router para que o middleware envolva tudo.
    """
    app.add_middleware(CerberShieldMiddleware)
    app.include_router(router)
    logger.info("CerberOS shield active — L3 rate-limit · L6 heuristics · L7 eternal-maze")
