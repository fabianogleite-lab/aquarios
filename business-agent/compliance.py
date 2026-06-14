"""
Pacote D · gate de compliance (D2) — país ativo na onda + opt-in.
NÃO é guarda de conteúdo/saúde (isso é o D3 brand_guardian). Aqui: allowlist por
Onda (compliance_por_pais) e bloqueio DURO do Irã no MVP (gate OFAC — COUNTRY_MATRIX
decisão 1). Nenhum país fora da onda seedada opera.
"""
from db import db

IRAN = {"IR", "fa-IR", "fa"}


async def check_country(pais: str) -> dict:
    if pais in IRAN:
        # Onda 4, condicionado a parecer OFAC. Bloqueio absoluto no MVP.
        return {"ativo": False, "motivo": "OFAC_gate", "pais": pais}
    cfg = await db.select_one("compliance_por_pais", {"pais": pais})
    if not cfg:
        return {"ativo": False, "motivo": "pais_fora_da_onda", "pais": pais}
    return {"ativo": bool(cfg.get("ativo")), "config": cfg, "pais": pais,
            "gateway": cfg.get("gateway_pagamento"),
            "marketing_optin_obrigatorio": cfg.get("marketing_optin_obrigatorio", True)}


async def check_optin(cliente: dict, tipo: str = "C_marketing") -> bool:
    """Marketing (C) exige opt-in marcado e não revogado (CONSENTIMENTO §2/§6)."""
    row = await db.select_one("optins",
                              {"cliente_id": cliente["id"], "tipo": tipo, "checkbox_checked": "true"})
    return bool(row) and not row.get("revogado_ts")
