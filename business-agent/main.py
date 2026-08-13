#!/usr/bin/env python3
"""
main.py — FastAPI webhook de Meta integrado com ProteOS global
WhatsApp/IG/Messenger → routing → campaign_engine → ProteOS → Supabase

Run: uvicorn main:app --host 0.0.0.0 --port 8000
"""
import asyncio
import hashlib
import hmac
import json
import logging
import os
from typing import Optional

import httpx
from anthropic import Anthropic, APIStatusError
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse

import lead_capture
import routing
from campaign_engine import engine as campaign_engine
from cerber_shield import register_cerber
from prompts import PROTEOS_PROMPT
from voice_proxy import register_voice

logger = logging.getLogger("cl.proteos")

# agents_graph.py (LangGraph: tool-calling + gate CerberOS + memória por
# thread_id) precisa de langgraph/langchain-anthropic instalados — degrada
# graciosamente pro proteos_reply() legado se o ambiente de deploy ainda
# não tiver essas deps (ver requirements.txt).
try:
    import agents_graph as _agents_graph
except ImportError as exc:
    logger.warning("agents_graph indisponível (%s) — usando proteos_reply legado", exc)
    _agents_graph = None

app = FastAPI(title="AquariOS Meta Webhook")

# Config
VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN", "aquarios_webhook_verify")
APP_SECRET = os.getenv("META_APP_SECRET", "")
ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN", "")
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# Cliente único reaproveitado entre requests (conexões mantidas vivas).
_anthropic = Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None

WA_API = f"https://graph.facebook.com/v22.0/{PHONE_NUMBER_ID}/messages"

# ─────────────────────────────────────────────────────────────
# WEBHOOK VERIFICATION (Meta exige challenge na primeira vez)
# ─────────────────────────────────────────────────────────────

@app.get("/webhook/whatsapp")
async def webhook_verify(request: Request):
    """Meta faz GET com challenge — você responde com o token"""
    challenge = request.query_params.get("hub.challenge")
    verify_token = request.query_params.get("hub.verify_token")

    if verify_token != VERIFY_TOKEN:
        return JSONResponse({"error": "Invalid verify token"}, status_code=403)

    return Response(content=challenge, media_type="text/plain")

# ─────────────────────────────────────────────────────────────
# WEBHOOK RECEIVER (Meta envia eventos aqui)
# ─────────────────────────────────────────────────────────────

def extract_message_text(payload: dict) -> Optional[str]:
    """Extrai o texto da mensagem do payload WhatsApp"""
    try:
        msg = payload["entry"][0]["changes"][0]["value"]["messages"][0]
        if msg.get("type") == "text":
            return msg["text"]["body"]
    except (KeyError, IndexError, TypeError):
        pass
    return None


def _wa_hash(phone: str) -> str:
    """SHA-256 do telefone — nunca persistir/logar o número em texto claro
    (LGPD, mesmo padrão de whatsapp_voice_bridge.py). Usado como thread_id
    do checkpointer do agents_graph.py — identifica a conversa sem guardar
    o número."""
    return hashlib.sha256(str(phone).encode()).hexdigest()


async def get_proteos_reply(user_message: str, lang: str, thread_id: str) -> str:
    """Ponto único de resposta do ProteOS no webhook do WhatsApp.

    Tenta agents_graph.reply() primeiro — tool-calling (search_faq), gate
    CerberOS e memória entre mensagens via thread_id (SHA-256 do telefone).
    graph.invoke() é síncrono (bloqueante); roda numa thread separada
    (asyncio.to_thread) pra não travar o event loop do FastAPI enquanto
    espera a API da Anthropic. Se agents_graph não estiver disponível
    (deps não instaladas) ou a chamada falhar em runtime, cai pro
    proteos_reply() legado — sem tools, sem memória, mas sempre funcional.
    """
    if _agents_graph is not None:
        try:
            return await asyncio.to_thread(_agents_graph.reply, thread_id, user_message, lang)
        except Exception as exc:
            logger.error("agents_graph falhou, caindo pro fallback legado: %s", exc)
    return await proteos_reply(user_message, lang)


async def proteos_reply(user_message: str, lang: str) -> str:
    """Fallback legado: 1 chamada direta ao Claude, sem tools e sem
    memória entre mensagens. Usado quando agents_graph.py não está
    disponível ou falha em runtime (ver get_proteos_reply acima).

    Prompt caching: PROTEOS_PROMPT é idêntico em toda chamada (não varia por
    usuário/idioma), então é o candidato natural a cache_control — o
    breakpoint no fim do bloco de system cacheia esse prefixo entre
    conversas diferentes. Nota: claude-haiku-4-5 exige prefixo mínimo de
    ~4096 tokens para cachear; PROTEOS_PROMPT sozinho (~600 tokens) fica
    abaixo disso — a marcação é inofensiva (não cacheia nada até o prefixo
    crescer o suficiente).
    """
    if not _anthropic:
        return "ProteOS indisponível no momento. Tente novamente em breve."
    try:
        resp = _anthropic.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            system=[{
                "type": "text",
                "text": PROTEOS_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }],
            messages=[{"role": "user", "content": user_message}],
        )
        logger.info(
            "proteos cache: read=%s write=%s input=%s",
            resp.usage.cache_read_input_tokens,
            resp.usage.cache_creation_input_tokens,
            resp.usage.input_tokens,
        )
        return next((b.text for b in resp.content if b.type == "text"), "")
    except APIStatusError as exc:
        logger.error("Anthropic erro: %s %s", exc.status_code, str(exc)[:200])
        return "ProteOS indisponível no momento. Tente novamente em breve."


async def send_whatsapp_reply(to: str, message: str) -> bool:
    """Envia mensagem de texto de volta ao remetente via WhatsApp Cloud API"""
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            WA_API,
            headers={
                "Authorization": f"Bearer {ACCESS_TOKEN}",
                "Content-Type": "application/json",
            },
            json={
                "messaging_product": "whatsapp",
                "to": to,
                "type": "text",
                "text": {"body": message},
            },
        )
    if resp.status_code == 200:
        print(f"✅ Resposta enviada para {to[:6]}***")
        return True
    print(f"❌ Erro reply: {resp.status_code} {resp.text[:200]}")
    return False


def verify_webhook_signature(body: bytes, signature: str) -> bool:
    """Valida assinatura HMAC (segurança Meta)"""
    expected = "sha256=" + hmac.new(
        APP_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(signature, expected)

@app.post("/webhook/whatsapp")
async def webhook_receive(request: Request):
    """
    Recebe eventos Meta (message, delivery, read, etc)

    Flow:
    1. Valida assinatura
    2. Detecta canal (WhatsApp/IG/Messenger)
    3. Extrai ID do remetente
    4. Captura lead em Supabase
    5. Detecta país/idioma via routing
    6. Seleciona campanha/ton
    7. Manda resposta ProteOS
    """

    body = await request.body()

    # 1. Valida assinatura
    signature = request.headers.get("x-hub-signature-256", "")
    if not verify_webhook_signature(body, signature):
        print("❌ Assinatura inválida — webhook rejeitado")
        return JSONResponse({"error": "Invalid signature"}, status_code=403)

    # 2. Parse payload
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        return JSONResponse({"error": "Invalid JSON"}, status_code=400)

    # 3. Detecta canal
    channel = routing.detect_channel(payload)
    print(f"📞 Canal detectado: {channel}")

    # 4. Extrai ID do remetente
    sender_id = routing.extract_id(payload, channel)
    if not sender_id:
        print("⚠️ Sender ID não extraído — pulando")
        return JSONResponse({"status": "skipped"}, status_code=200)

    # 5. Detecta país via DDI
    country_iso = routing.country_from_phone(sender_id) if channel == "whatsapp" else None
    print(f"📱 SENDER_ID: {sender_id}")
    print(f"🌍 País detectado: {country_iso or 'desconhecido'}")

    # 6. Captura lead em Supabase (async)
    try:
        lead = await lead_capture.capture_lead(payload, channel)
        print(f"✅ Lead capturado: {lead.get('lead_id')}")
    except Exception as e:
        print(f"⚠️ Erro ao capturar lead: {e}")

    # 7. Seleciona campanha
    campaign = campaign_engine.get_campaign(country_iso or "BR", channel)
    if campaign:
        print(f"🎯 Campanha: {campaign['tema']}")

    # 8. Gera e envia resposta ProteOS
    if channel == "whatsapp" and sender_id:
        user_text = extract_message_text(payload)
        lang = campaign["idioma"] if campaign else "pt"

        if user_text:
            print(f"💬 Mensagem do usuário: {user_text[:60]}")
            response_msg = await get_proteos_reply(user_text, lang, thread_id=_wa_hash(sender_id))
        else:
            # Evento sem texto (status, reação, áudio) — boas-vindas estático
            response_msg = campaign["bem_vindo"] if campaign else "Bem-vindo ao AquariOS!"

        # BR: wa_id vem sem o 9 (12 dígitos); adiciona o 9 para bater com a lista validada
        to = sender_id
        if to.startswith("55") and len(to) == 12:
            to = to[:4] + "9" + to[4:]
        await send_whatsapp_reply(to, response_msg)

    return JSONResponse({"status": "ok"}, status_code=200)

# ─────────────────────────────────────────────────────────────
# UTILITY ENDPOINTS
# ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy", "service": "AquariOS Meta Webhook"}

@app.get("/config")
async def config():
    """Mostra config (tokens omitidos)"""
    return {
        "business_id": os.getenv("BUSINESS_ACCOUNT_ID"),
        "page_id": os.getenv("PAGE_ID"),
        "webhook_verify_token": "***",
        "countries": list(routing.COUNTRIES.keys()),
        "channels": ["whatsapp", "instagram", "messenger"],
    }

# ─────────────────────────────────────────────────────────────
# VOICE PROXY (ElevenLabs server-side) + CERBEROS (defesa ativa)
# voice ANTES de cerber: rotas precisam existir antes do middleware
# envolver tudo (cerber_shield.py:14-15, voice_proxy.py:32-34)
# ─────────────────────────────────────────────────────────────
register_voice(app)
register_cerber(app)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
