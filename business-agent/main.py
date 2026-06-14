"""
Pacote D · D2 — Business Agent do ProteOS (FastAPI-nativo, SEM n8n).
Orquestração: webhook Meta -> verify -> enriquecer -> compliance -> insert ->
IA -> brand_guardian -> envio (retry 3x) | Slack (HumanLayer) | /delete-data.
Roda na VM Oracle (api.podiumtec.com.br) sob systemd. Ver README.md.

Garantias exigidas:
  • verify token no GET /webhook
  • assinatura X-Hub-Signature-256 no POST /webhook
  • ACK < 20s (processa em BackgroundTasks; nunca segura o webhook)
  • retry 3x com backoff no envio à Meta
"""
import os, hmac, hashlib, base64, json, time, asyncio, logging
from fastapi import FastAPI, Request, BackgroundTasks, HTTPException, Form
from fastapi.responses import JSONResponse, PlainTextResponse

from db import db
from compliance import check_country
from brand_guardian import brand_guardian

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("business-agent")
app = FastAPI(title="AquariOS Business Agent", version="0.1.0-D2")

META_APP_SECRET   = os.getenv("META_APP_SECRET", "")
META_VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN", "")
META_TOKEN        = os.getenv("META_TOKEN", "")
PHONE_ID          = os.getenv("PHONE_ID", "")
SLACK_WEBHOOK     = os.getenv("SLACK_APPROVAL_URL", "")
PUBLIC_BASE       = os.getenv("PUBLIC_BASE", "https://podiumtec.com.br")
WA_BUSINESS_PHONE = os.getenv("WA_BUSINESS_PHONE", "5511999999999")
GRAPH             = "https://graph.facebook.com/v21.0"
MAX_RETRIES       = 3


# ============================ segurança ============================
def verify_meta_signature(raw: bytes, header: str) -> bool:
    if not header or not header.startswith("sha256="):
        return False
    expected = hmac.new(META_APP_SECRET.encode(), raw, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header.split("=", 1)[1])


def _b64url(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def verify_signed_request(signed: str):
    """Meta data-deletion signed_request (EXCLUSAO Anexo A.2)."""
    try:
        sig_b64, payload_b64 = signed.split(".", 1)
    except ValueError:
        return None
    expected = hmac.new(META_APP_SECRET.encode(), payload_b64.encode(), hashlib.sha256).digest()
    if not hmac.compare_digest(expected, _b64url(sig_b64)):
        return None
    return json.loads(_b64url(payload_b64))


# ============================ webhook ============================
@app.get("/webhook")
async def webhook_verify(request: Request):
    q = request.query_params
    if q.get("hub.mode") == "subscribe" and q.get("hub.verify_token") == META_VERIFY_TOKEN:
        return PlainTextResponse(q.get("hub.challenge", ""))
    raise HTTPException(403, "verify token mismatch")


@app.post("/webhook")
async def webhook_receive(request: Request, bg: BackgroundTasks):
    raw = await request.body()
    if not verify_meta_signature(raw, request.headers.get("X-Hub-Signature-256", "")):
        raise HTTPException(403, "invalid signature")
    payload = json.loads(raw or b"{}")
    await db.insert("business_agent_logs", {"evento": "webhook.received", "payload": payload})
    bg.add_task(processar_mensagem, payload)        # ACK já; processa depois (< 20s)
    return JSONResponse({"status": "received"})


# ============================ pipeline ============================
async def processar_mensagem(payload: dict):
    try:
        canal = detectar_canal(payload)
        canal_id = extrair_id(payload, canal)
        if not canal_id:
            return
        cliente = await db.find_or_create_cliente(canal, canal_id, payload)

        # compliance (D2): país ativo na onda? Irã = bloqueio OFAC.
        gate = await check_country(cliente.get("pais", "BR"))
        if not gate["ativo"]:
            log.warning("país não ativo (%s): %s", cliente.get("pais"), gate.get("motivo"))
            return

        contexto = await enriquecer_contexto(cliente)
        conversa = await db.get_or_create_conversa(cliente["id"], canal, canal_id)
        await db.insert("mensagens", {"conversa_id": conversa["id"], "direcao": "in",
                                      "tipo": "text", "conteudo": payload})

        resposta = await ia_gerar_resposta(contexto, payload)

        # guarda de conteúdo (D3) no outbound — claims de saúde/cultura
        guard = brand_guardian(resposta["texto"], cliente.get("pais", "BR"))
        if not guard["approved"]:
            return await pedir_aprovacao_slack(
                {"tipo": "conteudo_reprovado", "issues": guard["issues"],
                 "texto": resposta["texto"], "risco": 90}, contexto)
        resposta["texto"] = guard["corrected"]

        if resposta.get("precisa_aprovacao"):
            return await pedir_aprovacao_slack(resposta, contexto)

        await enviar_resposta_meta(conversa, resposta, contexto)
    except Exception as e:  # noqa: BLE001
        log.exception("falha no pipeline")
        await db.insert("business_agent_logs",
                        {"evento": "pipeline.error", "erro": str(e), "payload": payload})


def detectar_canal(p: dict) -> str:
    try:
        if "messages" in p["entry"][0]["changes"][0]["value"]:
            return "whatsapp"
    except (KeyError, IndexError, TypeError):
        pass
    return "instagram" if "instagram" in str(p).lower() else "messenger"


def extrair_id(p: dict, canal: str):
    try:
        if canal == "whatsapp":
            return p["entry"][0]["changes"][0]["value"]["messages"][0]["from"]
    except (KeyError, IndexError, TypeError):
        return None
    return None


async def enriquecer_contexto(cliente: dict) -> dict:
    n = await db.count_conversas_recentes(cliente["id"])
    return {**cliente, "conversas_24h": n, "janela_aberta": n > 0}


async def ia_gerar_resposta(contexto: dict, payload: dict) -> dict:
    # TODO: plugar ProteOS (Anthropic direct — project_meta_agent_strategy).
    # Disclosure de IA (AI_DISCLOSURE §2) entra no template de boas-vindas
    # disparado pela pipeline_stages.acao_automatica = 'enviar_disclosure_ia'.
    t0 = time.time()
    txt = ("Você está conversando com o ProteOS, IA de bem-estar do AquariOS "
           "(não médico). Como posso te apoiar hoje?")
    return {"texto": txt, "precisa_aprovacao": False, "latencia": int((time.time() - t0) * 1000)}


async def enviar_resposta_meta(conversa: dict, resposta: dict, contexto: dict, tentativa: int = 1):
    import httpx
    url = f"{GRAPH}/{PHONE_ID}/messages"
    body = {"messaging_product": "whatsapp", "to": contexto.get("wa_id"),
            "text": {"body": resposta["texto"]}}
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.post(url, json=body, headers={"Authorization": f"Bearer {META_TOKEN}"})
            r.raise_for_status()
        mid = r.json().get("messages", [{}])[0].get("id")
        await db.insert("mensagens", {"conversa_id": conversa["id"], "direcao": "out",
                                      "tipo": "text", "conteudo": body, "meta_message_id": mid,
                                      "status_meta": "sent", "latencia_ms": resposta.get("latencia")})
    except Exception as e:  # noqa: BLE001
        if tentativa < MAX_RETRIES:
            await asyncio.sleep(2 ** tentativa)     # backoff: 2s, 4s
            return await enviar_resposta_meta(conversa, resposta, contexto, tentativa + 1)
        await db.insert("business_agent_logs", {"evento": "meta.send.failed", "erro": str(e)})


async def pedir_aprovacao_slack(acao: dict, contexto: dict):
    import httpx
    row = await db.insert("aprovacoes_slack", {
        "acao": acao.get("tipo", "?"), "payload": acao,
        "custo_estimado_usd": acao.get("custo", 0), "risco_score": acao.get("risco", 50),
        "status": "pendente"})
    if SLACK_WEBHOOK:
        card = {"text": "🤖 AquariOS precisa aprovação", "blocks": [
            {"type": "section", "text": {"type": "mrkdwn",
             "text": f"*Ação:* {acao.get('tipo')}\n*Cliente:* {contexto.get('nome')} "
                     f"({contexto.get('pais')})\n*Risco:* {acao.get('risco', 50)}/100"}},
            {"type": "actions", "elements": [
                {"type": "button", "text": {"type": "plain_text", "text": "✅ Aprovar"},
                 "style": "primary", "value": f"aprovar_{row['id']}", "action_id": "aprovar"},
                {"type": "button", "text": {"type": "plain_text", "text": "❌ Reprovar"},
                 "style": "danger", "value": f"reprovar_{row['id']}", "action_id": "reprovar"}]}]}
        async with httpx.AsyncClient(timeout=10) as c:
            await c.post(SLACK_WEBHOOK, json=card)
    return {"aguardando_aprovacao": True, "id": row["id"]}


# ============================ /delete-data (EXCLUSAO Anexo A) ============================
@app.post("/delete-data")
async def delete_data(signed_request: str = Form(...)):
    data = verify_signed_request(signed_request)
    if data is None:
        raise HTTPException(400, "invalid signed_request")
    wa_id = data.get("user_id")
    row = await db.insert("delete_requests",
                          {"origem": "meta", "wa_id": wa_id, "status": "recebido", "detalhes": data})
    code = row["confirmation_code"]
    return {"url": f"{PUBLIC_BASE}/delete-status?code={code}", "confirmation_code": code}


@app.get("/delete-status")
async def delete_status(code: str):
    row = await db.select_one("delete_requests", {"confirmation_code": code})
    if not row:
        raise HTTPException(404, "code not found")
    return {"confirmation_code": code, "status": row["status"], "recebido_ts": row["recebido_ts"]}


# ============================ Slack interactivity ============================
@app.post("/slack/interactivity")
async def slack_interactivity(payload: str = Form(...)):
    data = json.loads(payload)
    acao, aprovacao_id = data["actions"][0]["value"].split("_", 1)
    status = "aprovado" if acao == "aprovar" else "reprovado"
    await db.update("aprovacoes_slack", aprovacao_id,
                    {"status": status, "decidido_por": data.get("user", {}).get("username")})
    return {"text": f"Decisão registrada: {status}"}


# ============================ widget opt-in (D4) ============================
@app.post("/widget/optin")
async def widget_optin(request: Request):
    body = await request.json()
    pais = body.get("pais", "BR")
    gate = await check_country(pais)
    if not gate["ativo"]:
        raise HTTPException(403, f"país {pais} fora da onda ativa")
    cliente = await db.find_or_create_cliente("whatsapp", body.get("phone_e164", ""), body)
    for tipo in ("B_bemestar", "C_marketing"):       # CONSENTIMENTO §2 — só os marcados
        if body.get(tipo):
            await db.insert("optins", {
                "cliente_id": cliente["id"], "phone_e164": body.get("phone_e164"), "tipo": tipo,
                "consent_text": body.get("consent_text", ""), "consent_version": body.get("consent_version"),
                "ip_address": request.client.host, "source": body.get("source", "widget"),
                "language": body.get("language"), "checkbox_checked": True})
    await db.insert("widget_interactions", {
        "cliente_id": cliente["id"], "evento": "optin_check", "referrer": body.get("referrer"),
        "utm_source": body.get("utm_source"), "utm_medium": body.get("utm_medium"),
        "utm_campaign": body.get("utm_campaign"), "pais": pais,
        "ip_address": request.client.host, "user_agent": request.headers.get("user-agent")})
    return {"redirect": f"https://wa.me/{WA_BUSINESS_PHONE}?text=Ola%20ProteOS"}


@app.get("/")
async def health():
    return {"service": "aquarios-business-agent", "status": "ok", "block": "D2"}
