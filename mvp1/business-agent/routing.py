"""
Pacote D · roteamento global compartilhado (CLI metactl + pipeline do agente).

Resolve o que o agente precisa para ser GLOBAL, sem decidir runtime:
  - country_from_phone : DDI E.164 -> ISO2  (fonte: COUNTRY_MATRIX.md, 13 países MVP)
  - country_info       : ISO2 -> locale/idioma/moeda/gateway/onda/RTL
  - reply_language     : ISO2 -> idioma de resposta (fallback DEFAULT_REPLY_LANG)
  - detect_channel     : payload Meta -> whatsapp | instagram | messenger
  - extract_id         : payload Meta -> id do remetente (WA/IG/Messenger)

Telefonia é fato objetivo; QUAIS países estão ATIVOS é decisão de runtime
(`compliance_por_pais` no Supabase) — aqui só resolvemos o país, não o gate.

NOTA: `detect_channel`/`extract_id` vivem aqui de propósito — são o lar canônico
dessa lógica. O pipeline (`main.py`) deve passar a importá-las daqui (remove as
cópias locais, mono-canal) no bloco de wiring.
"""

# Idioma de resposta quando o país é DESCONHECIDO (DDI fora dos 13 / canal sem id).
# Mercado de lançamento = BR; trocar aqui se a política mudar. NÃO confundir com o
# bug "tudo vira BR no compliance" — o gate de compliance trata país desconhecido
# como bloqueado; isto aqui é só o idioma do texto de fallback.
DEFAULT_REPLY_LANG = "pt"

# E.164 country calling codes -> ISO2 (só os 13 do MVP; +65 Singapura partilha a
# linha 9 da matriz com HK). Match por prefixo mais longo (3 > 2 > 1 dígitos).
CALLING_CODES = {
    "1": "US", "41": "CH", "47": "NO", "51": "PE", "55": "BR",
    "58": "VE", "65": "SG", "66": "TH", "82": "KR", "98": "IR",
    "234": "NG", "351": "PT", "852": "HK", "972": "IL",
}

# ISO2 -> dados do país. Fonte: COUNTRY_MATRIX.md (S33 aprovado, 10/Jun/2026).
COUNTRIES = {
    "BR": {"locale": "pt-BR", "lang": "pt",      "currency": "BRL", "gateway": "stripe",   "wave": 1, "rtl": False},
    "US": {"locale": "en-US", "lang": "en",      "currency": "USD", "gateway": "stripe",   "wave": 1, "rtl": False},
    "PT": {"locale": "pt-PT", "lang": "pt",      "currency": "EUR", "gateway": "stripe",   "wave": 1, "rtl": False},
    "NG": {"locale": "en-NG", "lang": "en",      "currency": "NGN", "gateway": "paystack", "wave": 1, "rtl": False},
    "PE": {"locale": "es-PE", "lang": "es",      "currency": "PEN", "gateway": "stripe",   "wave": 1, "rtl": False},
    "VE": {"locale": "es-VE", "lang": "es",      "currency": "VES", "gateway": "free",     "wave": 1, "rtl": False},
    "NO": {"locale": "nb-NO", "lang": "nb",      "currency": "NOK", "gateway": "stripe",   "wave": 2, "rtl": False},
    "CH": {"locale": "de-CH", "lang": "de",      "currency": "CHF", "gateway": "stripe",   "wave": 2, "rtl": False},
    "KR": {"locale": "ko-KR", "lang": "ko",      "currency": "KRW", "gateway": "stripe",   "wave": 3, "rtl": False},
    "TH": {"locale": "th-TH", "lang": "th",      "currency": "THB", "gateway": "stripe",   "wave": 3, "rtl": False},
    "HK": {"locale": "zh-HK", "lang": "zh-Hant", "currency": "HKD", "gateway": "stripe",   "wave": 3, "rtl": False},
    "SG": {"locale": "zh-HK", "lang": "zh-Hant", "currency": "SGD", "gateway": "stripe",   "wave": 3, "rtl": False},
    "IL": {"locale": "he-IL", "lang": "he",      "currency": "ILS", "gateway": "stripe",   "wave": 4, "rtl": True},
    "IR": {"locale": "fa-IR", "lang": "fa",      "currency": "IRR", "gateway": "free",     "wave": 4, "rtl": True},
}

# Disclosure de IA (AI_DISCLOSURE §2) no idioma do usuário. Idiomas já cobertos
# em mobile/i18n (pt/en/es); demais caem no fallback até a localização (Onda 2+).
WELCOME = {
    "pt": "Você está conversando com o ProteOS, IA de bem-estar do AquariOS (não médico). Como posso te apoiar hoje?",
    "en": "You're chatting with ProteOS, AquariOS's well-being AI (not a medical service). How can I support you today?",
    "es": "Estás hablando con ProteOS, la IA de bienestar de AquariOS (no es un servicio médico). ¿Cómo puedo ayudarte hoy?",
}


def normalize_e164(phone: str) -> str:
    """Devolve só os dígitos do número (remove '+', espaços, '00' internacional)."""
    if not phone:
        return ""
    digits = "".join(ch for ch in str(phone) if ch.isdigit())
    if digits.startswith("00"):
        digits = digits[2:]
    return digits


def country_from_phone(phone: str):
    """DDI E.164 -> ISO2 por prefixo mais longo. None se fora dos 13 do MVP."""
    digits = normalize_e164(phone)
    if not digits:
        return None
    for n in (3, 2, 1):
        if digits[:n] in CALLING_CODES:
            return CALLING_CODES[digits[:n]]
    return None


def country_info(iso2):
    """ISO2 -> dict do país (ou None se fora dos 13)."""
    return COUNTRIES.get((iso2 or "").upper())


def reply_language(iso2) -> str:
    """ISO2 -> idioma de resposta; fallback DEFAULT_REPLY_LANG se país desconhecido."""
    info = country_info(iso2)
    return info["lang"] if info else DEFAULT_REPLY_LANG


def welcome_text(lang: str) -> str:
    """Disclosure de IA no idioma; cai no fallback se idioma ainda não localizado."""
    return WELCOME.get(lang, WELCOME[DEFAULT_REPLY_LANG])


def detect_channel(payload: dict) -> str:
    """payload Meta -> canal, pelo campo 'object' do webhook (robusto)."""
    obj = (payload or {}).get("object", "")
    if obj == "whatsapp_business_account":
        return "whatsapp"
    if obj == "instagram":
        return "instagram"
    if obj == "page":
        return "messenger"
    # fallback: WhatsApp tem 'messages' em changes[].value
    try:
        if "messages" in payload["entry"][0]["changes"][0]["value"]:
            return "whatsapp"
    except (KeyError, IndexError, TypeError):
        pass
    return "messenger"


def extract_id(payload: dict, channel: str):
    """payload Meta -> id do remetente. Suporta WA, IG e Messenger (lacuna #3)."""
    try:
        if channel == "whatsapp":
            return payload["entry"][0]["changes"][0]["value"]["messages"][0]["from"]
        # IG e Messenger usam a estrutura 'messaging[].sender.id'
        return payload["entry"][0]["messaging"][0]["sender"]["id"]
    except (KeyError, IndexError, TypeError):
        return None
