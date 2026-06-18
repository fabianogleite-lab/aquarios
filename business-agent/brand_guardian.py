"""
Pacote D · D3 — brand_guardian (camada de APLICAÇÃO, alinhada ao EcumenicOS).
Move a "guarda médica" do DB p/ cá (decisão do fundador).

Diferenças CRÍTICAS vs. o brand_guardian do .zip (que CONTRADIZ o EcumenicOS):
  • NÃO bane "espiritual". Espiritual é dimensão do iVi (Físico/Mental/Espiritual/
    Social). A regra do .zip que removia "espiritual" em CH/NO/DE foi ELIMINADA.
  • Bane apenas claims médicos/Meta proibidos (produto é bem-estar, não médico —
    POLITICA_DE_PRIVACIDADE §2) e aplica salvaguardas culturais por país.

Governança de claims (HANDOFF §6): "curar a fragmentação" OK; "curar doença" NÃO.
"""
import re

# Claims de saúde banidos pela Meta + política não-médica do AquariOS.
BANNED_HEALTH = [
    "antes e depois", "cura garantida", "100% eficaz", "resultado garantido",
    "diagnóstico", "diagnostico", "prescrição", "prescricao",
    "cura para", "cura a doença", "cure sua doença", "tratamento médico",
]

# Substituições que preservam a mensagem de bem-estar sem claim médico.
SOFTEN = {
    r"curar a doença": "cuidar do bem-estar",
    r"\btratamento\b": "acompanhamento de bem-estar",
}

# Salvaguardas culturais por país (HANDOFF §6 + founder_vision + COUNTRY_MATRIX).
CULTURAL = {
    "TH": ["buda", "buddha"],            # sem imagem/uso de Buda em marketing
    "IR": ["bahá", "baha'i", "bahai", "bahá'í"],  # nunca mencionar Bahá'í
    "NG": [],                            # paridade Islã/Cristianismo — checagem manual de arte
}

# Idiomas RTL: conteúdo só aprova após auditoria de layout espelhado (gate).
RTL = {"IL", "IR", "he-IL", "fa-IR"}


def brand_guardian(texto: str, pais: str = "BR", asset_type: str = "text") -> dict:
    score, issues = 100, []
    t = texto or ""
    low = t.lower()

    for termo in BANNED_HEALTH:
        if termo in low:
            score = 0
            issues.append(f"BANIDO (claim de saúde): '{termo}'")

    for padrao, sub in SOFTEN.items():
        if re.search(padrao, t, flags=re.IGNORECASE):
            t = re.sub(padrao, sub, t, flags=re.IGNORECASE)
            score -= 10
            issues.append(f"Suavizado: '{padrao}' → '{sub}'")
            low = t.lower()

    for termo in CULTURAL.get(pais, []):
        if termo and termo in low:
            score -= 30
            issues.append(f"Sensibilidade cultural ({pais}): evitar '{termo}'")

    rtl_gate = pais in RTL  # bloqueia até QA de espelhamento (Onda 4)

    return {
        "approved": score >= 85 and not rtl_gate,
        "score": max(score, 0),
        "corrected": t,
        "issues": issues,
        "rtl_gate_pendente": rtl_gate,
    }
