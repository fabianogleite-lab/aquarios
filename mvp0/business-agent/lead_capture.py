#!/usr/bin/env python3
"""
lead_capture.py — Captura leads de Meta (WhatsApp/IG/Messenger)
Webhook → Supabase leads table (LGPD-safe: phone_hash, sem número raw)
"""
import hashlib
import json
import os
from datetime import datetime

import httpx
from routing import country_from_phone, country_info

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

async def capture_lead(payload: dict, channel: str) -> dict:
    """
    Extrai leads de payload Meta e grava em Supabase

    Args:
        payload: webhook payload de Meta (WhatsApp/IG/Messenger)
        channel: 'whatsapp' | 'instagram' | 'messenger'

    Returns:
        {
            "lead_id": "uuid",
            "phone_hash": "sha256(phone)",
            "pais": "BR",
            "canal": "whatsapp",
            "onda": 1,
            "criado_em": "2026-06-17T12:34:56Z"
        }
    """

    try:
        # Extract phone
        if channel == "whatsapp":
            phone = payload["entry"][0]["changes"][0]["value"]["messages"][0]["from"]
        elif channel == "instagram":
            phone = payload["entry"][0]["messaging"][0]["sender"]["id"]
        elif channel == "messenger":
            phone = payload["entry"][0]["messaging"][0]["sender"]["id"]
        else:
            return {"error": "unknown_channel"}

        # Normalize E.164
        phone_clean = "".join(ch for ch in str(phone) if ch.isdigit())
        if phone_clean.startswith("00"):
            phone_clean = phone_clean[2:]

        # Hash phone (LGPD: never store raw number in logs)
        phone_hash = hashlib.sha256(phone_clean.encode()).hexdigest()[:16]

        # Detect country
        country_iso = country_from_phone(phone_clean)
        if not country_iso:
            country_iso = "BR"  # fallback

        country = country_info(country_iso)
        onda = country.get("wave", 1) if country else 1

        # Insert into Supabase
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{SUPABASE_URL}/rest/v1/leads",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "phone_hash": phone_hash,
                    "pais": country_iso,
                    "canal": channel,
                    "onda": onda,
                    "criado_em": datetime.utcnow().isoformat() + "Z",
                },
            )

            if resp.status_code not in (200, 201):
                return {"error": f"supabase_error: {resp.status_code}"}

            lead = resp.json()
            if isinstance(lead, list):
                lead = lead[0] if lead else {}

            return {
                "lead_id": lead.get("id"),
                "phone_hash": phone_hash,
                "pais": country_iso,
                "canal": channel,
                "onda": onda,
                "criado_em": lead.get("criado_em"),
            }

    except Exception as e:
        return {"error": str(e)}

async def bulk_capture_from_payload(payload: dict, channel: str) -> list:
    """Captura múltiplos leads de um payload (ex: conversas em grupo)"""
    leads = []
    try:
        if channel == "whatsapp":
            messages = payload["entry"][0]["changes"][0]["value"].get("messages", [])
            for msg in messages:
                lead = await capture_lead(payload, channel)
                if "error" not in lead:
                    leads.append(lead)
        else:
            lead = await capture_lead(payload, channel)
            if "error" not in lead:
                leads.append(lead)
    except Exception as e:
        print(f"❌ Erro ao capturar leads: {e}")

    return leads
