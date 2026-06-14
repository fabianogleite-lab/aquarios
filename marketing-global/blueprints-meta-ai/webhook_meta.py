"""
Blueprint Meta AI (12/Jun/2026) — webhook Cloud API de REFERÊNCIA.
NÃO é código de produção: a implementação real é business-agent/ (entregas B+D).

⚠️ 5 problemas a corrigir antes de qualquer port (análise 12/Jun):
1. APP_SECRET hardcoded no código → viola handoff §4 (secrets só em .env).
   O business-agent já valida HMAC lendo de env, com compare_digest.
2. Redis como infra nova só p/ dedupe → desnecessário na VM B1s (1GiB, 3
   serviços). Decisão D: dedupe transacional via UNIQUE em
   mensagens.meta_message_id (migration 30, Supabase) + ON CONFLICT DO NOTHING.
3. BUG: dedupe de statuses por id descarta delivered/read — o MESMO WAMID
   emite sent→delivered→read; dedupe correto é por (id, status).
4. BUG: marca "processed" ANTES de processar — se handle_message falhar, o
   retry da Meta é descartado e a mensagem se perde. Marcar APÓS sucesso.
5. BUG: GET /webhook declara hub_mode/hub_verify_token — os params reais da
   Meta têm PONTO (hub.mode, hub.verify_token, hub.challenge) → exige
   Query(alias="hub.mode") etc.; como está, a verificação da Meta FALHA.

Adaptações adicionais:
- Disclosure IA em Redis volátil (TTL 30d) → requisito LEGAL: registrar em
  optins/consent_versions (migration 30) + evento no trail GaiOS (mig 31).
- /delete-data não valida o signed_request nem persiste em delete_requests
  (migration 30) — ambos obrigatórios.

O VALOR deste material são os números oficiais (200≤20s, retries ~24h, WAMID,
tiers, disclosure 1ª msg+perfil, deletion ≤7 dias) — registrados em
marketing-global/PERGUNTAS_META_AI_12JUN.md.
Código abaixo = verbatim como entregue pela Meta AI.
"""

import hmac, hashlib, time, json
from fastapi import FastAPI, Request, Header, BackgroundTasks
from fastapi.responses import JSONResponse
import redis

app = FastAPI()
r = redis.Redis(host='localhost', port=6379, db=0)
APP_SECRET = "SEU_APP_SECRET_META"

def verify_signature(payload: bytes, signature: str) -> bool:
    expected = hmac.new(APP_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)

@app.post("/webhook")
async def webhook(request: Request, background_tasks: BackgroundTasks, x_hub_signature_256: str = Header(None)):
    body = await request.body()

    # A3 - validação oficial
    if not verify_signature(body, x_hub_signature_256):
        return JSONResponse(status_code=403, content={"error": "invalid signature"})

    data = json.loads(body)

    # A1 - responde em <20s, processa async
    background_tasks.add_task(process_webhook, data)

    return JSONResponse(status_code=200, content={"status": "ok"})

async def process_webhook(data):
    for entry in data.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})

            # A2 - deduplicação por message_id
            for msg in value.get("messages", []):
                msg_id = msg.get("id")
                if r.get(f"processed:{msg_id}"):
                    continue  # já processado (retry)

                r.setex(f"processed:{msg_id}", 86400, "1")  # TTL 24h

                # processa mensagem aqui
                await handle_message(msg, value.get("metadata", {}))

            # status updates usam mesmo ID
            for status in value.get("statuses", []):
                status_id = status.get("id")
                if not r.get(f"processed:{status_id}"):
                    r.setex(f"processed:{status_id}", 86400, "1")
                    await handle_status(status)

async def handle_message(msg, metadata):
    # B5 - disclosure IA na primeira mensagem
    phone = msg.get("from")
    if not r.get(f"disclosed:{phone}"):
        await send_message(phone, "🤖 Respostas geradas por IA. Digite SAIR para parar.")
        r.setex(f"disclosed:{phone}", 2592000, "1")  # 30 dias

    # sua lógica aqui
    pass

async def handle_status(status):
    # log para auditoria
    pass

@app.get("/webhook")
async def verify(hub_mode: str, hub_verify_token: str, hub_challenge: str):
    if hub_mode == "subscribe" and hub_verify_token == "SEU_VERIFY_TOKEN":
        return int(hub_challenge)
    return JSONResponse(status_code=403, content={})

# C9 - data deletion callback
@app.post("/delete-data")
async def delete_data(request: Request):
    data = await request.form()
    signed_request = data.get("signed_request", "")
    # decode e processa
    return JSONResponse({
        "url": "https://seusite.com/deletion-status",
        "confirmation_code": f"del_{int(time.time())}"
    })

async def send_message(to: str, text: str):
    # implemente chamada para WhatsApp Cloud API
    pass
