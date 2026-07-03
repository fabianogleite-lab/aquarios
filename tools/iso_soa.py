#!/usr/bin/env python3
"""
iso_soa.py — gera SoA_auto.md (Declaração de Aplicabilidade) a partir das
evidências em cl_iso_evidence + cl_cerber_incidents (Supabase).

Roda no GitHub Action iso-autopilot (nightly) e local:
    SUPABASE_URL=... SUPABASE_SERVICE_KEY=... python tools/iso_soa.py

Exit 1 se algum controle está STALE/MISSING — o Action sinaliza sem bloquear.
"""
import os
import sys
from datetime import datetime, timezone

import requests

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

# controle -> (nome, tabela, filtro, idade máxima da última evidência em dias)
CONTROL_MAP = {
    "A.5.15": ("Controle de acesso", "cl_iso_evidence", "control_id=eq.A.5.15", 30),
    "A.8.7":  ("Proteção contra malware", "cl_iso_evidence", "control_id=eq.A.8.7", 30),
    "A.8.10": ("Eliminação de informação (DSAR)", "cl_dsar_requests", "", 90),
    "A.8.15": ("Registro de eventos", "cl_cerber_incidents", "", 7),
    "A.8.24": ("Uso de criptografia", "cl_iso_evidence", "control_id=eq.A.8.24", 30),
}
TS_COL = {"cl_cerber_incidents": "created_at"}  # demais usam criado_em


def latest(table: str, filt: str) -> str | None:
    col = TS_COL.get(table, "criado_em")
    q = f"{SUPABASE_URL}/rest/v1/{table}?select={col}&order={col}.desc&limit=1"
    if filt:
        q += f"&{filt}"
    r = requests.get(q, headers={"apikey": SUPABASE_SERVICE_KEY,
                                 "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"}, timeout=15)
    rows = r.json() if r.status_code == 200 else []
    return rows[0][col] if rows else None


def main() -> int:
    now = datetime.now(timezone.utc)
    lines = ["# Declaração de Aplicabilidade — auto-gerada",
             f"\nGerado em: {now.isoformat()}\n",
             "| Controle | Nome | Última evidência | Idade (d) | Status |",
             "|---|---|---|---|---|"]
    bad = 0
    for cid, (name, table, filt, max_age) in CONTROL_MAP.items():
        try:
            last = latest(table, filt)
        except Exception as e:
            last = None
            print(f"warn: {cid}: {e}", file=sys.stderr)
        if last:
            dt = datetime.fromisoformat(last.replace("Z", "+00:00"))
            age = (now - dt).days
            status = "OK" if age <= max_age else "STALE"
        else:
            age, status = "-", "MISSING"
        if status != "OK":
            bad += 1
        lines.append(f"| {cid} | {name} | {last or '-'} | {age} | {status} |")

    with open("SoA_auto.md", "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    ok = len(CONTROL_MAP) - bad
    print(f"SoA_auto.md gerado — {ok}/{len(CONTROL_MAP)} controles OK")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
