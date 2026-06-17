"""
tests/cerber_audit.py — Auditoria de Estresse & Segurança padronizada CerberOS
C&L Gestora CNPJ 41.191.506/0001-02

Exercita cada camada do CerberOS e confirma que o stack subiu correto e seguro.
Roda NO VM (precisa de HMAC_SECRET + SUPABASE_* do /etc/hygeios-v2-sprint2.env).

Uso:
  sudo bash -c 'set -a; . /etc/hygeios-v2-sprint2.env; set +a; \
    /home/opc/aquarios-hygeios-v2/venv/bin/python cerber_audit.py'

Camadas:
  Correção — /api/v2/health · /v1/rank/health · /wa/status · /cerber/status → 200
  L2 HMAC  — assinatura válida → 202 · inválida → 401
  L4 Idem  — payload repetido → IGNORADO
  L6 Heur  — payload com SQLi → tarpit (conexão segurada)
  L7 Honey — GET /.env → tarpit (conexão segurada)
  L3 Rate  — rajada > limite → throttle/tarpit engaja
  Trilha   — incidentes gravados em cl_cerber_incidents (vw_cerber_report_24h)
"""
import asyncio
import hashlib
import hmac
import json
import os
import time
import uuid
from datetime import datetime, timezone

import httpx

BASE   = os.getenv("AUDIT_TARGET", "http://localhost:8001")
SECRET = os.getenv("HMAC_SECRET", "").encode()

_results: list[dict] = []


def rec(layer: str, name: str, ok: bool, detail: str) -> None:
    _results.append({"layer": layer, "check": name, "pass": ok, "detail": detail})
    mark = "PASS" if ok else "FAIL"
    print(f"  [{mark}] {layer:<10} {name:<26} {detail}")


def _sign(payload: dict) -> tuple[str, str]:
    body = json.dumps(payload, separators=(",", ":"))
    sig = hmac.new(SECRET, body.encode(), hashlib.sha256).hexdigest()
    return body, sig


async def check_health(c: httpx.AsyncClient) -> None:
    print("\n── Correção: endpoints subiram ──")
    eps = ["/api/v2/health", "/v1/rank/health", "/wa/status", "/cerber/status"]
    for ep in eps:
        try:
            t = time.perf_counter()
            r = await c.get(BASE + ep, timeout=10)
            ms = (time.perf_counter() - t) * 1000
            rec("HEALTH", ep, r.status_code == 200, f"{r.status_code} · {ms:.0f}ms")
        except Exception as exc:
            rec("HEALTH", ep, False, f"erro: {exc}")


async def check_l2(c: httpx.AsyncClient) -> None:
    print("\n── L2: gateway HMAC ──")
    payload = {"id": f"audit_{uuid.uuid4().hex[:10]}", "tipo": "TELEMETRIA_MOBI_JAVA",
               "user_id": hashlib.sha256(b"audit_user").hexdigest(),
               "dwell_time_ms": 1500, "clicks": 3}
    body, sig = _sign(payload)
    try:
        r = await c.post(BASE + "/v1/ingestao", content=body,
                         headers={"Content-Type": "application/json", "X-Escambos-Signature": sig},
                         timeout=10)
        rec("L2-HMAC", "assinatura válida", r.status_code in (200, 202), f"{r.status_code} (esperado 202)")
    except Exception as exc:
        rec("L2-HMAC", "assinatura válida", False, f"erro: {exc}")

    try:
        r = await c.post(BASE + "/v1/ingestao", content=body,
                         headers={"Content-Type": "application/json", "X-Escambos-Signature": "assinatura_falsa"},
                         timeout=10)
        rec("L2-HMAC", "assinatura inválida", r.status_code == 401, f"{r.status_code} (esperado 401)")
    except Exception as exc:
        rec("L2-HMAC", "assinatura inválida", False, f"erro: {exc}")
    return payload


async def check_l4(c: httpx.AsyncClient, payload: dict) -> None:
    print("\n── L4: idempotência ──")
    body, sig = _sign(payload)  # mesmo id da fase L2 → deve ser ignorado
    try:
        r = await c.post(BASE + "/v1/ingestao", content=body,
                         headers={"Content-Type": "application/json", "X-Escambos-Signature": sig},
                         timeout=10)
        txt = r.text.lower()
        rec("L4-IDEM", "payload repetido", "ignorado" in txt or "duplic" in txt, f"{r.status_code} · {r.text[:60]}")
    except Exception as exc:
        rec("L4-IDEM", "payload repetido", False, f"erro: {exc}")


async def check_l6(c: httpx.AsyncClient) -> None:
    print("\n── L6: heurística de payload (tarpit segura a conexão) ──")
    evil = '{"id":"x","tipo":"\' OR \'1\'=\'1","user_id":"x"}'
    t = time.perf_counter()
    try:
        await c.post(BASE + "/v1/ingestao", content=evil,
                     headers={"Content-Type": "application/json", "X-Escambos-Signature": "x"},
                     timeout=8)
        ms = (time.perf_counter() - t) * 1000
        # se respondeu rápido (<2s), o tarpit NÃO atuou → falha de segurança
        rec("L6-HEUR", "SQLi → tarpit", ms > 2000, f"resposta em {ms:.0f}ms (tarpit inativo)")
    except httpx.TimeoutException:
        rec("L6-HEUR", "SQLi → tarpit", True, "conexão segurada >8s (tarpit ATIVO)")
    except Exception as exc:
        rec("L6-HEUR", "SQLi → tarpit", False, f"erro: {exc}")


async def check_l7(c: httpx.AsyncClient) -> None:
    print("\n── L7: honeypot (decoy /.env) ──")
    t = time.perf_counter()
    try:
        await c.get(BASE + "/.env", timeout=8)
        ms = (time.perf_counter() - t) * 1000
        rec("L7-HONEY", "/.env → tarpit", ms > 2000, f"resposta em {ms:.0f}ms (honeypot inativo)")
    except httpx.TimeoutException:
        rec("L7-HONEY", "/.env → tarpit", True, "conexão segurada >8s (tarpit ATIVO)")
    except Exception as exc:
        rec("L7-HONEY", "/.env → tarpit", False, f"erro: {exc}")


async def check_l3(c: httpx.AsyncClient) -> None:
    print("\n── L3: rate-limit sob rajada ──")
    N, CONC = 150, 25
    sem = asyncio.Semaphore(CONC)
    lat: list[float] = []

    async def one():
        async with sem:
            t = time.perf_counter()
            try:
                await c.get(BASE + "/api/v2/health", timeout=12)
            except Exception:
                pass
            lat.append((time.perf_counter() - t) * 1000)

    await asyncio.gather(*[one() for _ in range(N)])
    fast = sum(1 for x in lat if x < 1000)
    throttled = sum(1 for x in lat if x >= 2000)
    rec("L3-RATE", f"rajada {N} req", throttled > 0,
        f"{fast} rápidas · {throttled} freadas (rate-limit {'ENGAJOU' if throttled else 'NÃO engajou'})")


def supabase_incidents() -> None:
    print("\n── Trilha de auditoria: cl_cerber_incidents (gerados por este teste) ──")
    try:
        from supabase import create_client
        sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])
        rows = sb.table("vw_cerber_report_24h").select("*").execute().data or []
        if not rows:
            print("  (nenhum incidente nas últimas 24h — pode haver atraso de inserção assíncrona)")
        for r in rows:
            print(f"  • {r.get('threat_type','?'):<22} L{r.get('layer_triggered','?')} "
                  f"{r.get('severity','?'):<8} total={r.get('total_eventos','?')} ips={r.get('ips_unicos','?')}")
    except Exception as exc:
        print(f"  consulta Supabase falhou: {exc}")


async def main() -> None:
    print("=" * 70)
    print("CerberOS — AUDITORIA DE ESTRESSE & SEGURANÇA")
    print(f"alvo: {BASE} · {datetime.now(timezone.utc).isoformat()} · HMAC={'set' if SECRET else 'AUSENTE'}")
    print("=" * 70)

    async with httpx.AsyncClient() as c:
        await check_health(c)
        payload = await check_l2(c)
        if payload:
            await check_l4(c, payload)
        await check_l6(c)
        await check_l7(c)
        await check_l3(c)   # por último: satura o bucket por ~60s

    # incidentes são gravados de forma assíncrona pelo CerberOS — dá um respiro
    await asyncio.sleep(3)
    supabase_incidents()

    total = len(_results)
    passed = sum(1 for r in _results if r["pass"])
    print("\n" + "=" * 70)
    print(f"RESULTADO: {passed}/{total} checks PASS")
    print("VEREDITO:", "✅ STACK SUBIU CORRETO E SEGURO" if passed == total
          else f"⚠️  {total - passed} check(s) precisam de atenção")
    print("=" * 70)
    print("JSON:", json.dumps({"passed": passed, "total": total, "checks": _results}, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(main())
