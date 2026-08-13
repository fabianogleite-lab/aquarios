"""
business-agent/test_webhook_integration.py
Testa o webhook /webhook/whatsapp ponta a ponta via FastAPI TestClient —
sem chamar a API da Anthropic nem a Graph API do Meta de verdade (mocka
get_proteos_reply e send_whatsapp_reply). Cobre a fiação feita ao ligar
agents_graph.py no webhook:
  - assinatura HMAC válida processa e chama o fluxo certo
  - assinatura inválida é rejeitada (403)
  - thread_id enviado pro agents_graph é o SHA-256 do telefone, nunca o
    número em texto claro (LGPD)
  - se agents_graph.reply() falhar em runtime, get_proteos_reply cai pro
    proteos_reply() legado sem derrubar o webhook

Rodar: pytest test_webhook_integration.py -v
"""
import hashlib
import hmac
import json

import main
from fastapi.testclient import TestClient


def _signed_payload(phone: str, text: str, secret: str):
    payload = {
        "object": "whatsapp_business_account",
        "entry": [{
            "changes": [{
                "value": {
                    "messages": [{"from": phone, "type": "text", "text": {"body": text}}]
                }
            }]
        }],
    }
    body = json.dumps(payload).encode()
    sig = "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return body, sig


def test_valid_signature_routes_through_agents_graph(monkeypatch):
    monkeypatch.setattr(main, "APP_SECRET", "segredo-de-teste")

    calls = {}

    async def fake_get_proteos_reply(user_message, lang, thread_id):
        calls["thread_id"] = thread_id
        calls["user_message"] = user_message
        return "resposta simulada"

    async def fake_send_whatsapp_reply(to, message):
        calls["sent_to"] = to
        calls["sent_message"] = message
        return True

    monkeypatch.setattr(main, "get_proteos_reply", fake_get_proteos_reply)
    monkeypatch.setattr(main, "send_whatsapp_reply", fake_send_whatsapp_reply)

    body, sig = _signed_payload("5511999998888", "Como agendo no SUS?", "segredo-de-teste")
    client = TestClient(main.app)
    resp = client.post(
        "/webhook/whatsapp",
        content=body,
        headers={"x-hub-signature-256": sig, "content-type": "application/json"},
    )

    assert resp.status_code == 200
    assert calls["user_message"] == "Como agendo no SUS?"
    assert calls["sent_message"] == "resposta simulada"
    assert calls["sent_to"] == "5511999998888"


def test_thread_id_is_sha256_not_raw_phone(monkeypatch):
    monkeypatch.setattr(main, "APP_SECRET", "segredo-de-teste")
    captured = {}

    async def fake_get_proteos_reply(user_message, lang, thread_id):
        captured["thread_id"] = thread_id
        return "ok"

    async def fake_send_whatsapp_reply(to, message):
        return True

    monkeypatch.setattr(main, "get_proteos_reply", fake_get_proteos_reply)
    monkeypatch.setattr(main, "send_whatsapp_reply", fake_send_whatsapp_reply)

    phone = "5511999998888"
    body, sig = _signed_payload(phone, "oi", "segredo-de-teste")
    client = TestClient(main.app)
    client.post(
        "/webhook/whatsapp",
        content=body,
        headers={"x-hub-signature-256": sig, "content-type": "application/json"},
    )

    thread_id = captured["thread_id"]
    assert thread_id != phone
    assert phone not in thread_id
    assert len(thread_id) == 64  # SHA-256 hex
    assert thread_id == hashlib.sha256(phone.encode()).hexdigest()


def test_invalid_signature_is_rejected():
    main.APP_SECRET = "segredo-de-teste"
    body, _ = _signed_payload("5511999998888", "oi", "segredo-de-teste")
    client = TestClient(main.app)
    resp = client.post(
        "/webhook/whatsapp",
        content=body,
        headers={"x-hub-signature-256": "sha256=assinatura-errada", "content-type": "application/json"},
    )
    assert resp.status_code == 403


def test_get_proteos_reply_falls_back_when_graph_raises(monkeypatch):
    """Se agents_graph.reply() falhar em runtime (ex.: API key ausente/inválida),
    get_proteos_reply cai pro proteos_reply() legado em vez de propagar o erro."""
    import asyncio

    async def fake_legacy(user_message, lang):
        return "resposta do fallback legado"

    def fake_reply_que_falha(thread_id, user_message, lang="pt"):
        raise RuntimeError("Anthropic authentication failed")

    monkeypatch.setattr(main, "proteos_reply", fake_legacy)
    monkeypatch.setattr(main._agents_graph, "reply", fake_reply_que_falha)

    resultado = asyncio.run(main.get_proteos_reply("oi", "pt", thread_id="abc123"))
    assert resultado == "resposta do fallback legado"


def test_get_proteos_reply_uses_legacy_when_graph_unavailable(monkeypatch):
    """Se agents_graph não estiver instalado (_agents_graph is None), usa
    proteos_reply() direto, sem tentar importar nada."""
    import asyncio

    async def fake_legacy(user_message, lang):
        return "legado direto"

    monkeypatch.setattr(main, "_agents_graph", None)
    monkeypatch.setattr(main, "proteos_reply", fake_legacy)

    resultado = asyncio.run(main.get_proteos_reply("oi", "pt", thread_id="abc123"))
    assert resultado == "legado direto"
