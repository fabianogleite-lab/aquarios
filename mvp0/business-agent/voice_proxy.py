"""
business-agent/voice_proxy.py
Proxy de VOZ ElevenLabs server-side p/ o app ProteOS — C&L Gestora CNPJ 41.191.506/0001-02

PORQUÊ ESTE MÓDULO EXISTE
  A chave ElevenLabs JAMAIS pode ir no bundle do app: variáveis EXPO_PUBLIC_* são
  embutidas no APK e qualquer um que descompile o pacote extrai a chave e gasta
  créditos (TTS/STT são pagos por uso). A solução é o app NUNCA falar com a
  ElevenLabs direto — ele chama ESTES endpoints, e a chave vive só aqui no
  servidor (/etc/hygeios-v2-sprint2.env). Mesmo padrão do whatsapp_voice_bridge.py.

ENDPOINTS
  POST /v1/tts          json  {text, voice_id?, model_id?, voice_settings?} → audio/mpeg (bytes)
  POST /v1/stt          multipart  file=<áudio>, language_code=<opcional>    → {"text": "..."}
  GET  /v1/voice/status saúde (sem segredos)

ABUSO / AUTORIZAÇÃO
  Mover a chave p/ o servidor não basta: um endpoint aberto vira "relay" que
  qualquer um usa p/ gastar nossos créditos. Por isso exigimos o JWT do usuário
  Supabase (Authorization: Bearer <access_token>), verificado contra
  {SUPABASE_URL}/auth/v1/user. Só usuário logado do AquariOS consome voz.
  Toggle: VOICE_REQUIRE_AUTH (default "true"; fail-closed se Supabase indisponível).
  Limites de tamanho evitam abuso de custo (texto/áudio gigante).
  Fica ATRÁS do CerberOS (L3 rate-limit 120/min/IP) → registrar ANTES de register_cerber.
  Obs.: cerber_shield isenta /v1/tts e /v1/stt da heurística de texto L6 (payload de voz).

CREDENCIAIS (env server-side, JAMAIS EXPO_PUBLIC_*)
  ELEVENLABS_API_KEY  (obrigatória; sem ela o módulo carrega INERTE → 503)
  EL_VOICE_ID (default cgSgspJ2msm6clMCkdW9), EL_TTS_MODEL (eleven_flash_v2_5), EL_STT_MODEL (scribe_v1)
  SUPABASE_URL, SUPABASE_SERVICE_KEY (p/ verificar o JWT do usuário)

INTEGRAÇÃO (main.py) — ANTES do register_cerber:
  from voice_proxy import register_voice
  register_voice(app)
"""
import hashlib
import logging
import os
import time
from typing import Optional

import httpx
from fastapi import APIRouter, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.responses import Response

logger = logging.getLogger("cl.voice_proxy")

# ── Config ────────────────────────────────────────────────────────────────────
EL_KEY        = os.getenv("ELEVENLABS_API_KEY", "")
EL_VOICE_ID   = os.getenv("EL_VOICE_ID", "cgSgspJ2msm6clMCkdW9")
EL_TTS_MODEL  = os.getenv("EL_TTS_MODEL", "eleven_flash_v2_5")
EL_STT_MODEL  = os.getenv("EL_STT_MODEL", "scribe_v1")

SUPABASE_URL         = os.getenv("SUPABASE_URL", "https://agebsmjsjrmazbozphnh.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
REQUIRE_AUTH         = os.getenv("VOICE_REQUIRE_AUTH", "true").lower() == "true"

# Limites de custo (ElevenLabs cobra por caractere no TTS e por upload no STT)
MAX_TTS_CHARS = int(os.getenv("VOICE_MAX_TTS_CHARS", "2000"))
MAX_STT_BYTES = int(os.getenv("VOICE_MAX_STT_BYTES", str(15 * 1024 * 1024)))  # 15 MB

_EL   = "https://api.elevenlabs.io/v1"
EL_OK = bool(EL_KEY)

# ── Cache de verificação de JWT (evita bater no Supabase a cada chamada) ───────
_AUTH_TTL = 60.0
_auth_cache: dict[str, float] = {}  # sha256(token) -> expiry_ts


def _verify_user(authorization: Optional[str]) -> None:
    """Valida o JWT de usuário Supabase. Lança HTTPException se inválido/ausente."""
    if not REQUIRE_AUTH:
        return
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Authorization Bearer <supabase_access_token> obrigatório")
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(401, "Token vazio")

    th  = hashlib.sha256(token.encode()).hexdigest()
    now = time.time()
    exp = _auth_cache.get(th)
    if exp and exp > now:
        return
    if len(_auth_cache) > 4096:           # GC simples p/ não crescer sem limite
        _auth_cache.clear()

    # fail-closed: sem como verificar, não libera
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise HTTPException(503, "Verificação de usuário indisponível no servidor")
    try:
        r = httpx.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"Authorization": f"Bearer {token}", "apikey": SUPABASE_SERVICE_KEY},
            timeout=10,
        )
    except Exception as exc:
        logger.error("verify_user falhou: %s", exc)
        raise HTTPException(503, "Falha ao verificar usuário")
    if r.status_code != 200:
        raise HTTPException(401, "Sessão inválida ou expirada")
    _auth_cache[th] = now + _AUTH_TTL


# ── Rotas ─────────────────────────────────────────────────────────────────────
router = APIRouter(tags=["Voice Proxy"])


@router.post("/v1/tts")
async def tts(request: Request, authorization: Optional[str] = Header(None)):
    """Texto → voz (MP3). O app envia só o texto; a chave fica no servidor."""
    if not EL_OK:
        raise HTTPException(503, "ElevenLabs não configurado no servidor")
    _verify_user(authorization)

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(422, "JSON inválido")

    text = (body.get("text") or "").strip()
    if not text:
        raise HTTPException(422, "campo 'text' obrigatório")
    if len(text) > MAX_TTS_CHARS:
        raise HTTPException(413, f"texto excede {MAX_TTS_CHARS} caracteres")

    voice_id = body.get("voice_id") or EL_VOICE_ID
    payload  = {"text": text, "model_id": body.get("model_id") or EL_TTS_MODEL}
    if isinstance(body.get("voice_settings"), dict):
        payload["voice_settings"] = body["voice_settings"]

    try:
        r = httpx.post(
            f"{_EL}/text-to-speech/{voice_id}",
            headers={"xi-api-key": EL_KEY, "accept": "audio/mpeg",
                     "content-type": "application/json"},
            params={"output_format": "mp3_44100_128"},
            json=payload,
            timeout=60,
        )
        r.raise_for_status()
    except httpx.HTTPStatusError as exc:
        logger.error("TTS upstream %s: %s", exc.response.status_code, exc.response.text[:200])
        raise HTTPException(502, "Falha no TTS")
    except Exception as exc:
        logger.error("TTS falhou: %s", exc)
        raise HTTPException(502, "Falha no TTS")

    return Response(content=r.content, media_type="audio/mpeg")


@router.post("/v1/stt")
async def stt(
    file: UploadFile = File(...),
    language_code: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None),
):
    """Áudio → texto (Scribe). O app sobe o áudio; a chave fica no servidor."""
    if not EL_OK:
        raise HTTPException(503, "ElevenLabs não configurado no servidor")
    _verify_user(authorization)

    audio = await file.read()
    if not audio:
        raise HTTPException(422, "arquivo de áudio vazio")
    if len(audio) > MAX_STT_BYTES:
        raise HTTPException(413, "áudio muito grande")

    data = {"model_id": EL_STT_MODEL}
    if language_code:
        data["language_code"] = language_code

    try:
        r = httpx.post(
            f"{_EL}/speech-to-text",
            headers={"xi-api-key": EL_KEY},
            data=data,
            files={"file": (file.filename or "audio", audio, file.content_type or "audio/m4a")},
            timeout=60,
        )
        r.raise_for_status()
    except httpx.HTTPStatusError as exc:
        logger.error("STT upstream %s: %s", exc.response.status_code, exc.response.text[:200])
        raise HTTPException(502, "Falha no STT")
    except Exception as exc:
        logger.error("STT falhou: %s", exc)
        raise HTTPException(502, "Falha no STT")

    return {"text": (r.json() or {}).get("text", "").strip()}


@router.get("/v1/voice/status")
async def voice_status():
    """Saúde do proxy de voz (sem segredos)."""
    return {
        "elevenlabs_configured": EL_OK,
        "require_auth":          REQUIRE_AUTH,
        "tts_model":             EL_TTS_MODEL,
        "stt_model":             EL_STT_MODEL,
        "voice_id_set":          bool(EL_VOICE_ID),
        "max_tts_chars":         MAX_TTS_CHARS,
    }


def register_voice(app) -> None:
    app.include_router(router)
    logger.info("Voice proxy: /v1/tts · /v1/stt · /v1/voice/status (EL=%s auth=%s)",
                EL_OK, REQUIRE_AUTH)
