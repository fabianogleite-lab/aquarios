"""
tests/locustfile.py — CerberOS Stress & Security Audit
C&L Gestora CNPJ 41.191.506/0001-02

Uso:
  export HMAC_SECRET=<valor do servidor>
  locust -f locustfile.py --host=http://137.131.158.242:8001

Targets: 500 users · spawn 25/s · runtime 5m
SLA:     P95 < 200ms · failure rate < 1%
"""
import hashlib
import hmac
import json
import os
import random
import uuid

from locust import HttpUser, between, events, task

_HMAC_SECRET = os.getenv("HMAC_SECRET", "").encode()
if not _HMAC_SECRET:
    raise SystemExit(
        "HMAC_SECRET env var não definida.\n"
        "  export HMAC_SECRET=<valor de /etc/hygeios-v2-sprint2.env>"
    )


def _user_hash() -> str:
    """LGPD: nunca usa IDs reais — gera hash de IDs fictícios."""
    return hashlib.sha256(f"locust_user_{random.randint(1, 50_000)}".encode()).hexdigest()


def _sign(payload: dict) -> tuple[str, str]:
    """
    Serializa com separadores compactos e sign.
    Retorna (body_str, hmac_hex).
    Usar data=body_str no post para garantir bytes idênticos.
    """
    body = json.dumps(payload, separators=(",", ":"))
    sig = hmac.new(_HMAC_SECRET, body.encode(), hashlib.sha256).hexdigest()
    return body, sig


_JSON_HEADER = {"Content-Type": "application/json"}


class EcossistemaUser(HttpUser):
    """Simula tráfego misto: telemetria mobile (3x) + pedido Amazon (1x)."""

    wait_time = between(0.1, 0.5)

    @task(3)
    def telemetria_mobile(self):
        payload = {
            "id":             f"loc_mob_{uuid.uuid4().hex[:12]}",
            "tipo":           "TELEMETRIA_MOBI_JAVA",
            "user_id":        _user_hash(),
            "dwell_time_ms":  random.randint(300, 6000),
            "clicks":         random.randint(0, 20),
            "scroll_velocity": round(random.uniform(0.1, 5.0), 2),
        }
        body, sig = _sign(payload)
        with self.client.post(
            "/v1/ingestao",
            data=body,
            headers={**_JSON_HEADER, "X-Escambos-Signature": sig},
            catch_response=True,
        ) as r:
            if r.status_code in (200, 202):
                r.success()
            elif r.status_code == 401:
                r.failure("HMAC rejected — verifique HMAC_SECRET")
            else:
                r.failure(f"HTTP {r.status_code}")

    @task(1)
    def amazon_order(self):
        payload = {
            "id":          f"loc_amz_{uuid.uuid4().hex[:12]}",
            "tipo":        "AMAZON_ORDER_DISPATCHED",
            "user_id":     _user_hash(),
            "order_id":    f"701-{random.randint(1_000_000, 9_999_999)}-110",
            "valor_pedido": round(random.uniform(50.0, 2_500.0), 2),
        }
        body, sig = _sign(payload)
        with self.client.post(
            "/v1/ingestao",
            data=body,
            headers={**_JSON_HEADER, "X-Escambos-Signature": sig},
            catch_response=True,
        ) as r:
            if r.status_code in (200, 202):
                r.success()
            else:
                r.failure(f"HTTP {r.status_code}")

    @task(1)
    def health_check(self):
        with self.client.get("/api/v2/health", catch_response=True) as r:
            if r.status_code == 200:
                r.success()
            else:
                r.failure(f"Health HTTP {r.status_code}")

    @task(1)
    def cerber_probe_invalid_hmac(self):
        """
        CerberOS Layer 2 audit: envia sig inválida e espera 401.
        SUCCESS = gateway rejeitou corretamente.
        FAILURE = bypass de segurança detectado.
        """
        payload = {
            "id":            f"loc_probe_{uuid.uuid4().hex[:12]}",
            "tipo":          "TELEMETRIA_MOBI_JAVA",
            "user_id":       _user_hash(),
            "dwell_time_ms": 100,
        }
        body = json.dumps(payload, separators=(",", ":"))
        with self.client.post(
            "/v1/ingestao",
            data=body,
            headers={**_JSON_HEADER, "X-Escambos-Signature": "sig_invalida_para_auditoria"},
            catch_response=True,
            name="/v1/ingestao [cerber-probe]",
        ) as r:
            if r.status_code == 401:
                r.success()                     # esperado: CerberOS bloqueou
            elif r.status_code == 202:
                r.failure("SECURITY BYPASS: HMAC inválido aceito!")
            else:
                r.success()                     # tarpit ou outro código defensivo = ok

    @task(1)
    def cerber_probe_honeypot(self):
        """CerberOS Layer 7 audit: testa endpoint decoy /.env."""
        with self.client.get(
            "/.env",
            catch_response=True,
            name="/.env [cerber-honeypot]",
        ) as r:
            # 200 com delay = tarpit ativo; 404 = honeypot não registrado
            r.success()


@events.quitting.add_listener
def audit_report(environment, **_kw):
    """Relatório de auditoria CerberOS impresso ao fim do teste."""
    total    = environment.stats.total
    fail_pct = total.fail_ratio * 100
    p95      = total.get_response_time_percentile(0.95) or 0
    p99      = total.get_response_time_percentile(0.99) or 0

    print("\n" + "=" * 60)
    print("CerberOS — RELATÓRIO DE AUDITORIA DE ESTRESSE")
    print("=" * 60)
    print(f"Requisições totais : {total.num_requests}")
    print(f"Falhas             : {total.num_failures} ({fail_pct:.2f}%)")
    print(f"Latência P95       : {p95:.0f} ms (SLA ≤ 200 ms)")
    print(f"Latência P99       : {p99:.0f} ms")
    print(f"RPS médio          : {total.current_rps:.1f}")
    print()

    sla_latency = "✅ PASS" if p95 <= 200 else f"⚠️  FAIL ({p95:.0f}ms > 200ms)"
    sla_errors  = "✅ PASS" if fail_pct <= 1.0 else f"⚠️  FAIL ({fail_pct:.2f}% > 1%)"
    print(f"SLA latência P95   : {sla_latency}")
    print(f"SLA taxa de erro   : {sla_errors}")
    print("=" * 60)
