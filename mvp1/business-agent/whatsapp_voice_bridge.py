"""
business-agent/whatsapp_voice_bridge.py
Ponte de VOZ WhatsApp ↔ ElevenLabs — C&L Gestora CNPJ 41.191.506/0001-02

O que faz (o "core business" da chamada por voz):
  • A conversa ENTRA pelo WhatsApp (webhook Meta Cloud API).
  • Áudio do cliente  → ElevenLabs STT (Scribe)      → TRANSCRITO e registrado.
  • Texto do cliente  → registrado direto.
  • Texto do NOSSO lado (chatbot OU operador humano) → ElevenLabs TTS → enviado
    como VOZ no WhatsApp + a transcrição em texto. Ambos os lados ficam transcritos.

Transparência de IA (AI_DISCLOSURE): no 1º contato enviamos welcome_text() do
routing.py, no idioma do DDI do cliente.

LGPD: o telefone NUNCA é persistido em texto claro — só SHA-256 (wa_hash).
Retenção de transcrição p/ aprendizado é gated por consentimento.

Credenciais (env, server-side — JAMAIS no bundle público EXPO_PUBLIC_*):
  WA_TOKEN, WA_PHONE_ID, WA_VERIFY_TOKEN, WA_API_VER (default v21.0)
  ELEVENLABS_API_KEY, EL_VOICE_ID, EL_TTS_MODEL (default eleven_flash_v2_5), EL_STT_MODEL (scribe_v1)
  SUPABASE_URL, SUPABASE_SERVICE_KEY
Sem credenciais o módulo carrega INERTE (rotas existem, nada é enviado).

Integração (main.py), DEPOIS dos outros include_router e ANTES do CerberOS:
  from whatsapp_voice_bridge import register_wa
  register_wa(app)
"""
import hashlib
import logging
import os
from typing import Optional

import httpx
from fastapi import APIRouter, BackgroundTasks, Request
from fastapi.responses import JSONResponse, PlainTextResponse

# Roteamento global compartilhado (DDI→país, idioma, disclosure de IA)
try:
    from routing import country_from_phone, reply_language, welcome_text, extract_id, detect_channel
except ImportError:  # deploy flat na VM
    import sys, pathlib
    sys.path.insert(0, str(pathlib.Path(__file__).parent))
    from routing import country_from_phone, reply_language, welcome_text, extract_id, detect_channel  # type: ignore

logger = logging.getLogger("cl.wa_bridge")

# ── Config ────────────────────────────────────────────────────────────────────
WA_TOKEN        = os.getenv("WA_TOKEN", "")
WA_PHONE_ID     = os.getenv("WA_PHONE_ID", "")
WA_VERIFY_TOKEN = os.getenv("WA_VERIFY_TOKEN", "")
WA_API_VER      = os.getenv("WA_API_VER", "v21.0")

EL_KEY        = os.getenv("ELEVENLABS_API_KEY", "")
EL_VOICE_ID   = os.getenv("EL_VOICE_ID", "cgSgspJ2msm6clMCkdW9")
EL_TTS_MODEL  = os.getenv("EL_TTS_MODEL", "eleven_flash_v2_5")
EL_STT_MODEL  = os.getenv("EL_STT_MODEL", "scribe_v1")

_GRAPH = "https://graph.facebook.com"
_EL    = "https://api.elevenlabs.io/v1"

WA_OK = bool(WA_TOKEN and WA_PHONE_ID)
EL_OK = bool(EL_KEY)

# Supabase — degrada graciosamente se ausente
try:
    from supabase import create_client as _sb_create
    _sb = _sb_create(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])
except Exception:
    _sb = None

# Contatos já saudados nesta vida do processo (evita repetir disclosure toda msg).
# Em produção escalada: mover p/ tabela/Redis. wa_hash, nunca telefone.
_greeted: set[str] = set()


# ── LGPD ──────────────────────────────────────────────────────────────────────
def _wa_hash(phone: str) -> str:
    return hashlib.sha256(str(phone).encode()).hexdigest()


def _log(wa_hash: str, project: str, direction: str, modality: str,
         transcript: str, lang: str, consent: bool = False) -> None:
    if not _sb:
        return
    try:
        _sb.table("wa_conversation_log").insert({
            "wa_hash":    wa_hash,
            "project":    project,
            "direction":  direction,
            "modality":   modality,
            "transcript": transcript,
            "lang":       lang,
            "consent":    consent,
        }).execute()
    except Exception as exc:
        logger.error("wa_log falhou: %s", exc)


# ── ElevenLabs ────────────────────────────────────────────────────────────────
def _stt(audio: bytes, mime: str) -> str:
    """Áudio → texto (Scribe). String vazia se indisponível/erro."""
    if not EL_OK:
        return ""
    try:
        r = httpx.post(
            f"{_EL}/speech-to-text",
            headers={"xi-api-key": EL_KEY},
            data={"model_id": EL_STT_MODEL},
            files={"file": ("audio", audio, mime or "audio/ogg")},
            timeout=60,
        )
        r.raise_for_status()
        return (r.json() or {}).get("text", "").strip()
    except Exception as exc:
        logger.error("STT falhou: %s", exc)
        return ""


def _tts(text: str, voice_id: Optional[str] = None) -> bytes:
    """Texto → MP3 (voz). Bytes vazios se indisponível/erro."""
    if not EL_OK or not text:
        return b""
    try:
        r = httpx.post(
            f"{_EL}/text-to-speech/{voice_id or EL_VOICE_ID}",
            headers={"xi-api-key": EL_KEY, "accept": "audio/mpeg",
                     "content-type": "application/json"},
            params={"output_format": "mp3_44100_128"},
            json={"text": text, "model_id": EL_TTS_MODEL},
            timeout=60,
        )
        r.raise_for_status()
        return r.content
    except Exception as exc:
        logger.error("TTS falhou: %s", exc)
        return b""


# ── WhatsApp Cloud API ────────────────────────────────────────────────────────
def _wa_headers() -> dict:
    return {"Authorization": f"Bearer {WA_TOKEN}"}


def _wa_media_bytes(media_id: str) -> tuple[bytes, str]:
    """Baixa mídia recebida (2 passos: pega URL, depois baixa). (bytes, mime)."""
    try:
        meta = httpx.get(f"{_GRAPH}/{WA_API_VER}/{media_id}",
                         headers=_wa_headers(), timeout=30).json()
        url = meta.get("url")
        if not url:
            return b"", ""
        resp = httpx.get(url, headers=_wa_headers(), timeout=60)
        return resp.content, resp.headers.get("content-type", "audio/ogg")
    except Exception as exc:
        logger.error("download mídia falhou: %s", exc)
        return b"", ""


def _wa_upload_audio(mp3: bytes) -> str:
    """Sobe MP3 e retorna media_id."""
    try:
        r = httpx.post(
            f"{_GRAPH}/{WA_API_VER}/{WA_PHONE_ID}/media",
            headers=_wa_headers(),
            data={"messaging_product": "whatsapp", "type": "audio/mpeg"},
            files={"file": ("voz.mp3", mp3, "audio/mpeg")},
            timeout=60,
        )
        r.raise_for_status()
        return (r.json() or {}).get("id", "")
    except Exception as exc:
        logger.error("upload áudio falhou: %s", exc)
        return ""


def _wa_send(payload: dict) -> bool:
    try:
        r = httpx.post(
            f"{_GRAPH}/{WA_API_VER}/{WA_PHONE_ID}/messages",
            headers={**_wa_headers(), "content-type": "application/json"},
            json={"messaging_product": "whatsapp", **payload},
            timeout=30,
        )
        r.raise_for_status()
        return True
    except Exception as exc:
        logger.error("envio WA falhou: %s", exc)
        return False


def _wa_send_text(to: str, text: str) -> bool:
    return _wa_send({"to": to, "type": "text", "text": {"body": text}})


def _wa_send_audio(to: str, media_id: str) -> bool:
    return _wa_send({"to": to, "type": "audio", "audio": {"id": media_id}})


# ── API pública: NOSSO texto → VOZ (chatbot ou operador humano) ───────────────
def send_voice(to: str, text: str, project: str = "heysky",
               voice_id: Optional[str] = None, consent: bool = False) -> dict:
    """
    Envia texto do nosso lado como VOZ (TTS) + a transcrição em texto, e registra.
    Usado tanto pela resposta do chatbot quanto por texto escrito pelo operador.
    """
    wa_hash = _wa_hash(to)
    lang    = reply_language(country_from_phone(to))
    sent_voice = False

    mp3 = _tts(text, voice_id)
    if mp3:
        media_id = _wa_upload_audio(mp3)
        if media_id:
            sent_voice = _wa_send_audio(to, media_id)
    # transcrição em texto acompanha a voz (cliente lê e ouve)
    _wa_send_text(to, text)
    _log(wa_hash, project, "outbound", "voice" if sent_voice else "text", text, lang, consent)
    return {"voice": sent_voice, "wa_hash": wa_hash[:12], "lang": lang}


# ── Processamento de mensagem recebida (em background) ────────────────────────
def _process_inbound(payload: dict) -> None:
    if detect_channel(payload) != "whatsapp":
        return
    frm = extract_id(payload, "whatsapp")
    if not frm:
        return
    wa_hash = _wa_hash(frm)
    lang    = reply_language(country_from_phone(frm))

    try:
        msg = payload["entry"][0]["changes"][0]["value"]["messages"][0]
    except (KeyError, IndexError, TypeError):
        return

    mtype = msg.get("type")
    transcript, modality = "", "text"

    if mtype in ("audio", "voice"):
        modality = "voice"
        media_id = (msg.get(mtype) or {}).get("id")
        if media_id:
            audio, mime = _wa_media_bytes(media_id)
            transcript = _stt(audio, mime) if audio else ""
    elif mtype == "text":
        transcript = (msg.get("text") or {}).get("body", "")
    else:
        transcript = f"[{mtype}]"

    # registra a fala do cliente (transcrita)
    _log(wa_hash, "heysky", "inbound", modality, transcript, lang, consent=False)
    logger.info("WA in %s [%s] %s: %s", wa_hash[:8], modality, lang, transcript[:60])

    # 1º contato → disclosure de IA (AI_DISCLOSURE §2) no idioma do cliente, por VOZ
    if wa_hash not in _greeted:
        _greeted.add(wa_hash)
        if WA_OK:
            send_voice(frm, welcome_text(lang), project="heysky")

    # A geração da resposta do chatbot é um seam: quando o cérebro (ProteOS/Claude)
    # estiver plugado, chamar send_voice(frm, resposta, ...). Por ora o operador
    # responde via POST /wa/reply (texto → voz). WA_AUTO_REPLY ativa um eco mínimo.
    if os.getenv("WA_AUTO_REPLY", "false").lower() == "true" and transcript and WA_OK:
        send_voice(frm, _stub_reply(transcript, lang), project="heysky")


def _stub_reply(text: str, lang: str) -> str:
    """Placeholder até o cérebro (ProteOS) ser plugado. NÃO é a IA final."""
    return {
        "pt": "Recebi sua mensagem. Um especialista vai te responder em instantes.",
        "en": "Got your message. A specialist will reply shortly.",
        "es": "Recibí tu mensaje. Un especialista te responderá en breve.",
    }.get(lang, "Recebi sua mensagem.")


# ── Rotas ─────────────────────────────────────────────────────────────────────
router = APIRouter(tags=["WhatsApp Voice Bridge"])


@router.get("/webhook/whatsapp")
async def wa_verify(request: Request):
    """Verificação do webhook (Meta envia hub.challenge na configuração)."""
    p = request.query_params
    if p.get("hub.mode") == "subscribe" and p.get("hub.verify_token") == WA_VERIFY_TOKEN and WA_VERIFY_TOKEN:
        return PlainTextResponse(p.get("hub.challenge", ""))
    return JSONResponse({"status": "forbidden"}, status_code=403)


@router.post("/webhook/whatsapp")
async def wa_inbound(request: Request, background_tasks: BackgroundTasks):
    """Recebe mensagens; responde 200 rápido e processa em background."""
    try:
        payload = await request.json()
    except Exception:
        return {"status": "ignored"}
    background_tasks.add_task(_process_inbound, payload)
    return {"status": "received"}


@router.post("/wa/reply")
async def wa_reply(request: Request):
    """
    NOSSO lado escreve texto → vira VOZ no WhatsApp do cliente + transcrição.
    Body: { "to": "<E.164>", "text": "...", "project": "heysky", "consent": false }
    """
    body = await request.json()
    to   = body.get("to", "")
    text = body.get("text", "")
    if not to or not text:
        return JSONResponse({"error": "to e text obrigatórios"}, status_code=422)
    if not WA_OK:
        return JSONResponse({"error": "WhatsApp não configurado (WA_TOKEN/WA_PHONE_ID)"}, status_code=503)
    return send_voice(to, text, body.get("project", "heysky"),
                      body.get("voice_id"), bool(body.get("consent", False)))


@router.get("/wa/status")
async def wa_status():
    """Saúde do bridge (sem segredos)."""
    return {
        "whatsapp_configured":   WA_OK,
        "elevenlabs_configured": EL_OK,
        "supabase_ok":           _sb is not None,
        "tts_model":             EL_TTS_MODEL,
        "stt_model":             EL_STT_MODEL,
        "voice_id_set":          bool(EL_VOICE_ID),
        "auto_reply":            os.getenv("WA_AUTO_REPLY", "false"),
    }


def register_wa(app) -> None:
    app.include_router(router)
    logger.info("WhatsApp voice bridge: /webhook/whatsapp · /wa/reply · /wa/status "
                "(WA=%s EL=%s)", WA_OK, EL_OK)
