"""
Pacote D · D5 — smoke tests LOCAIS (rodam SEM verificação Meta Business).
Cobrem a NOSSA lógica: assinatura de webhook, signed_request de exclusão,
brand_guardian (EcumenicOS) e o gate RTL. O teste LIVE +55/+351 está em
E2E_CHECKLIST.md — BLOQUEADO pela verificação Meta Business (ação do fundador).

Rodar:  cd business-agent && pip install -r requirements.txt && pytest -q
"""
import os, hmac, hashlib, base64, json

os.environ.setdefault("META_APP_SECRET", "test_secret")
os.environ.setdefault("META_VERIFY_TOKEN", "verify_me")

from brand_guardian import brand_guardian   # noqa: E402
import main                                  # noqa: E402


# ----- D3 brand_guardian -----
def test_nao_bane_espiritual():
    # EcumenicOS: 'espiritual' é dimensão do iVi — JAMAIS banida (corrige o .zip).
    r = brand_guardian("Cuide do seu equilíbrio espiritual e social", "CH")
    assert r["approved"] is True
    assert r["score"] == 100


def test_bane_claim_de_saude():
    r = brand_guardian("Resultado garantido: cura garantida para ansiedade", "BR")
    assert r["approved"] is False and r["score"] == 0


def test_rtl_gate_bloqueia():
    r = brand_guardian("conteúdo", "IL")
    assert r["rtl_gate_pendente"] is True and r["approved"] is False


def test_sensibilidade_cultural_tailandia():
    r = brand_guardian("Encontre paz como Buda", "TH")
    assert any("cultural" in i.lower() for i in r["issues"])


# ----- D2 segurança -----
def test_assinatura_webhook():
    raw = b'{"hello":"world"}'
    sig = hmac.new(b"test_secret", raw, hashlib.sha256).hexdigest()
    assert main.verify_meta_signature(raw, "sha256=" + sig) is True
    assert main.verify_meta_signature(raw, "sha256=deadbeef") is False


def test_signed_request_exclusao():
    payload = {"user_id": "5511999999999", "algorithm": "HMAC-SHA256"}
    pj = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    sig = hmac.new(b"test_secret", pj.encode(), hashlib.sha256).digest()
    sj = base64.urlsafe_b64encode(sig).decode().rstrip("=")
    assert main.verify_signed_request(sj + "." + pj)["user_id"] == "5511999999999"
    assert main.verify_signed_request("bad." + pj) is None   # adulteração → rejeita
