#!/usr/bin/env python3
"""
dsar.py — Direitos do titular (LGPD Art.18) + Data Deletion Callback da Meta.

Fluxo Meta (App Dashboard > Data Deletion Request URL):
  POST form 'signed_request' → parse_signed_request() valida HMAC-SHA256
  → dsar_create() apaga os dados do titular nas tabelas Supabase
  → responde {"url": status_url, "confirmation_code": ticket}  (contrato Meta)

Identidade do titular: MESMO hash do lead_capture (sha256(fone E.164)[:16]) —
nunca circula número raw. DSAR_DRY_RUN=true por default: primeiro rode em
dry-run, valide o report, depois DSAR_DRY_RUN=false em produção.

Ticket persiste em cl_dsar_requests (service_role only — migration 20260702000001).
"""
import base64
import hashlib
import hmac
import json
import os
import uuid
from datetime import datetime

import httpx

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
DSAR_DRY_RUN = os.getenv("DSAR_DRY_RUN", "true").lower() == "true"
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "https://api.podiumtec.com.br")

# Tabelas que o business-agent grava, com a coluna que identifica o titular.
# Ao criar tabela nova com dado de titular Meta, ADICIONE aqui — é o mapa
# oficial de varredura do DSAR (LGPD Art.18 VI — eliminação).
DSAR_SCOPE: list[tuple[str, str]] = [
    ("leads", "phone_hash"),
]


def subject_hash_from_phone(phone: str) -> str:
    """Mesma normalização + hash do lead_capture.capture_lead — 1 identidade só."""
    phone_clean = "".join(ch for ch in str(phone) if ch.isdigit())
    if phone_clean.startswith("00"):
        phone_clean = phone_clean[2:]
    return hashlib.sha256(phone_clean.encode()).hexdigest()[:16]


def parse_signed_request(signed_request: str, app_secret: str) -> dict:
    """Valida o signed_request da Meta (HMAC-SHA256). Levanta ValueError se inválido."""
    if not app_secret:
        raise ValueError("META_APP_SECRET ausente — recusando signed_request (fail-closed)")
    try:
        sig_encoded, payload_encoded = signed_request.split(".", 1)
    except ValueError:
        raise ValueError("signed_request malformado")

    def _b64url(s: str) -> bytes:
        s += "=" * (-len(s) % 4)
        return base64.urlsafe_b64decode(s)

    sig = _b64url(sig_encoded)
    payload = json.loads(_b64url(payload_encoded))

    expected = hmac.new(app_secret.encode(), payload_encoded.encode(), hashlib.sha256).digest()
    if not hmac.compare_digest(sig, expected):
        raise ValueError("assinatura signed_request inválida")
    if payload.get("algorithm", "").upper() != "HMAC-SHA256":
        raise ValueError("algoritmo não suportado")
    return payload


async def _sb(method: str, path: str, **kw) -> httpx.Response:
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
    }
    headers.update(kw.pop("headers", {}))
    async with httpx.AsyncClient(timeout=15) as client:
        return await client.request(method, f"{SUPABASE_URL}/rest/v1/{path}", headers=headers, **kw)


async def dsar_create(subject_hash: str, source: str) -> dict:
    """
    Elimina os dados do titular em todas as tabelas do DSAR_SCOPE.
    Retorna {"ticket", "report", "dry_run"}. Nunca levanta — erros vão no report.
    """
    ticket = str(uuid.uuid4())
    report: dict = {}

    for table, col in DSAR_SCOPE:
        try:
            found = await _sb("GET", f"{table}?{col}=eq.{subject_hash}&select=id")
            count = len(found.json()) if found.status_code == 200 else 0
            if DSAR_DRY_RUN or count == 0:
                report[table] = {"found": count, "deleted": 0, "dry_run": DSAR_DRY_RUN}
                continue
            resp = await _sb("DELETE", f"{table}?{col}=eq.{subject_hash}",
                             headers={"Prefer": "return=representation"})
            deleted = len(resp.json()) if resp.status_code == 200 else 0
            report[table] = {"found": count, "deleted": deleted, "dry_run": False}
        except Exception as e:
            report[table] = {"error": str(e)}

    # Ticket auditável (90 dias, purge via job futuro). Falha de auditoria não
    # pode falhar o DSAR em si — a Meta espera o confirmation_code.
    try:
        await _sb("POST", "cl_dsar_requests", json={
            "ticket": ticket,
            "subject_hash": subject_hash,
            "source": source,
            "dry_run": DSAR_DRY_RUN,
            "report": report,
            "criado_em": datetime.utcnow().isoformat() + "Z",
        })
    except Exception as e:
        print(f"⚠️ DSAR ticket não persistido: {e}")

    # Evidência ISO A.8.10 (eliminação de informação) — nunca falha o fluxo
    try:
        from iso_evidence import log_iso_evidence
        await log_iso_evidence("A.8.10", "dsar_created", asset="cl_dsar_requests",
                               details={"ticket": ticket, "dry_run": DSAR_DRY_RUN})
    except Exception:
        pass

    print(f"🗑️ DSAR {ticket} subject={subject_hash} dry_run={DSAR_DRY_RUN} report={report}")
    return {"ticket": ticket, "report": report, "dry_run": DSAR_DRY_RUN,
            "status_url": f"{PUBLIC_BASE_URL}/dsar/status/{ticket}"}


async def dsar_status(ticket: str) -> dict:
    """Consulta pública do ticket (Meta exige a URL de status ao titular)."""
    try:
        resp = await _sb("GET", f"cl_dsar_requests?ticket=eq.{ticket}&select=ticket,dry_run,criado_em")
        rows = resp.json() if resp.status_code == 200 else []
        if rows:
            return {"ticket": ticket, "status": "completed", "requested_at": rows[0].get("criado_em")}
    except Exception:
        pass
    return {"ticket": ticket, "status": "unknown"}
