"""Tool: Mensageria (WhatsApp via voice_proxy)."""
import os


def send_whatsapp(phone: str, message: str, media_url: str = None) -> dict:
    """Envia mensagem WhatsApp (reutiliza voice_proxy.py existente)."""
    # Já existe: business-agent/voice_proxy.py
    # Aqui só orquestramos pra Tool Bus

    from business_agent.voice_proxy import send_whatsapp_message

    try:
        result = send_whatsapp_message(phone, message, media_url)
        return {"ok": True, "phone": phone, "message_id": result.get("id")}
    except Exception as e:
        return {"ok": False, "error": str(e)}
