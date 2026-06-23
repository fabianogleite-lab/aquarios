#!/usr/bin/env python3
"""
metactl — CLI operadora do Meta global (Pacote D · D2).

v0 dry-run/offline: NÃO envia nada à Meta e NÃO grava no banco. Serve para
desenvolver e provar o comportamento GLOBAL (multi-país / multi-idioma / multi-canal)
antes da verificação Meta Business e antes do deploy.

Rode de dentro de business-agent/:
  python metactl.py doctor
  python metactl.py ddi +2348012345678
  python metactl.py country [list|<ISO2>] [--live]
  python metactl.py simulate <payload.json> [--country XX]
  python metactl.py sign make [--user-id ID] | verify <signed_request> | hub <body>

Comandos AO VIVO (send / webhook subscribe / verify-status) entram depois,
atrás das credenciais Meta. Ver routing.py para a lógica global compartilhada.
"""
import argparse
import asyncio
import base64
import hashlib
import hmac
import json
import os
import sys

import routing

HERE = os.path.dirname(os.path.abspath(__file__))
ENV_META = ["META_APP_SECRET", "META_VERIFY_TOKEN", "META_TOKEN", "PHONE_ID"]
ENV_REQUIRED = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY"] + ENV_META


def load_env():
    """Carrega business-agent/.env se existir (sem dependência externa)."""
    path = os.path.join(HERE, ".env")
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.split("#", 1)[0].strip())


def _b64url_decode(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def _b64url_encode(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).decode().rstrip("=")


# ───────────────────────────── ddi ─────────────────────────────
def cmd_ddi(args):
    iso = routing.country_from_phone(args.phone)
    if not iso:
        print(f"❓ {args.phone} → país DESCONHECIDO (DDI fora dos 13 do MVP)")
        print(f"   idioma de resposta (fallback): {routing.DEFAULT_REPLY_LANG}")
        return
    info = routing.country_info(iso)
    print(f"📞 {args.phone} → {iso}  ({info['locale']})")
    print(f"   idioma resposta : {info['lang']}")
    print(f"   moeda / gateway : {info['currency']} / {info['gateway']}")
    print(f"   onda            : {info['wave']}    RTL: {'sim' if info['rtl'] else 'não'}")


# ─────────────────────────── country ───────────────────────────
def cmd_country(args):
    code = (args.code or "").upper()
    if code and code != "LIST":
        info = routing.country_info(code)
        if not info:
            print(f"❌ {code} fora dos 13 países do MVP")
            return
        print(f"{code}  {info['locale']}  onda {info['wave']}  "
              f"{info['currency']}/{info['gateway']}  RTL={info['rtl']}")
        if args.live:
            asyncio.run(_live_gate(code))
        return
    print(f"{'ISO':<5}{'locale':<8}{'onda':<6}{'moeda':<6}{'gateway':<10}RTL")
    print("─" * 40)
    for iso, info in sorted(routing.COUNTRIES.items(), key=lambda kv: (kv[1]["wave"], kv[0])):
        print(f"{iso:<5}{info['locale']:<8}{info['wave']:<6}{info['currency']:<6}"
              f"{info['gateway']:<10}{'RTL' if info['rtl'] else ''}")


async def _live_gate(iso):
    try:
        from compliance import check_country
    except Exception as e:  # noqa: BLE001
        print(f"   (gate live indisponível: {e})")
        return
    try:
        g = await check_country(iso)
        print(f"   gate live (DB): ativo={g.get('ativo')} motivo={g.get('motivo', '-')}")
    except Exception as e:  # noqa: BLE001
        print(f"   (falha no gate live: {e})")


# ─────────────────────────── simulate ──────────────────────────
def cmd_simulate(args):
    try:
        with open(args.payload, encoding="utf-8") as fh:
            payload = json.load(fh)
    except Exception as e:  # noqa: BLE001
        print(f"❌ não li {args.payload}: {e}")
        return

    channel = routing.detect_channel(payload)
    cid = routing.extract_id(payload, channel)
    print(f"canal       : {channel}")
    print(f"id remetente: {cid or '— (NÃO extraído)'}")
    if cid is None:
        print("  ⚠️ id não extraído — esta mensagem seria DESCARTADA")

    iso = (args.country or "").upper() or (
        routing.country_from_phone(cid) if (channel == "whatsapp" and cid) else None)
    if iso:
        info = routing.country_info(iso)
        suffix = "" if info else "  ❌ fora do MVP"
        print(f"país        : {iso} ({info['locale'] if info else '?'}){suffix}")
    else:
        print("país        : DESCONHECIDO (sem DDI / canal não-WA sem --country)")

    lang = routing.reply_language(iso) if iso else routing.DEFAULT_REPLY_LANG
    print(f"idioma resp : {lang}")
    print(f"resposta    : {routing.welcome_text(lang)}")

    info = routing.country_info(iso) if iso else None
    if info:
        w = info["wave"]
        estado = "MVP ATIVO" if w == 1 else "onda futura — gate bloquearia hoje"
        print(f"compliance  : onda {w} ({estado}) · gateway {info['gateway']}")
    elif iso:
        print("compliance  : país fora dos 13 → gate bloquearia")

    print("\n(dry-run — nada enviado à Meta, nada gravado no banco)")


# ───────────────────────────── sign ────────────────────────────
def cmd_sign(args):
    secret = os.getenv("META_APP_SECRET", "")
    if not secret:
        print("⚠️ META_APP_SECRET não setado (.env) — necessário para assinar/verificar.")
        return
    if args.action == "make":
        payload = {"user_id": args.user_id or "TESTUSER", "algorithm": "HMAC-SHA256"}
        pb = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode())
        sig = _b64url_encode(hmac.new(secret.encode(), pb.encode(), hashlib.sha256).digest())
        print(f"{sig}.{pb}")
    elif args.action == "verify":
        if not args.value:
            print("uso: metactl sign verify <signed_request>")
            return
        try:
            sig_b64, pb = args.value.split(".", 1)
        except ValueError:
            print("❌ formato inválido (esperado sig.payload)")
            return
        expected = hmac.new(secret.encode(), pb.encode(), hashlib.sha256).digest()
        if hmac.compare_digest(expected, _b64url_decode(sig_b64)):
            print(f"✅ assinatura válida · payload: {json.loads(_b64url_decode(pb))}")
        else:
            print("❌ assinatura INVÁLIDA")
    elif args.action == "hub":
        body = (args.value or "").encode()
        sig = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
        print(f"X-Hub-Signature-256: sha256={sig}")


# ──────────────────────────── doctor ───────────────────────────
def cmd_doctor(args):
    print("ENV (business-agent/.env):")
    for v in ENV_REQUIRED:
        print(f"  {'✅' if os.getenv(v) else '❌'} {v}")

    asyncio.run(_doctor_db())

    meta_missing = [v for v in ENV_META if not os.getenv(v)]
    print("\nGO-LIVE:")
    if meta_missing:
        print(f"  ⛔ credenciais Meta faltando: {', '.join(meta_missing)}")
        print("     → nascem da VERIFICAÇÃO META BUSINESS (ação do fundador, 3-7 dias)")
    else:
        print("  ✅ credenciais Meta presentes")
    ativas = [iso for iso, i in routing.COUNTRIES.items() if i["wave"] == 1]
    print(f"  ondas no MVP: Onda 1 = {', '.join(sorted(ativas))} (demais gated por localização)")


async def _doctor_db():
    url, key = os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY")
    if not (url and key):
        print("DB: ❌ SUPABASE_URL/SERVICE_KEY ausentes — check pulado")
        return
    try:
        import httpx
    except Exception:  # noqa: BLE001
        print("DB: ⚠️ httpx não instalado — check pulado (ok em dev local)")
        return
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.get(f"{url.rstrip('/')}/rest/v1/compliance_por_pais",
                            params={"select": "pais,ativo", "limit": "50"},
                            headers={"apikey": key, "Authorization": f"Bearer {key}"})
            r.raise_for_status()
            rows = r.json()
        ativos = [x["pais"] for x in rows if x.get("ativo")]
        print(f"DB: ✅ compliance_por_pais {len(rows)} linhas; ativos: {', '.join(ativos) or '—'}")
    except Exception as e:  # noqa: BLE001
        print(f"DB: ❌ {e}")


# ───────────────────────────── parser ──────────────────────────
def build_parser():
    p = argparse.ArgumentParser(prog="metactl", description="CLI operadora do Meta global (Pacote D · v0 dry-run)")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("doctor", help="prontidão: env, DB, bloqueios de go-live").set_defaults(fn=cmd_doctor)

    sp = sub.add_parser("ddi", help="resolve telefone E.164 -> país/idioma/gateway")
    sp.add_argument("phone")
    sp.set_defaults(fn=cmd_ddi)

    sp = sub.add_parser("country", help="lista/checa países e ondas")
    sp.add_argument("code", nargs="?", default="list", help="ISO2 (ex.: NG) ou 'list'")
    sp.add_argument("--live", action="store_true", help="também consulta o gate real no DB")
    sp.set_defaults(fn=cmd_country)

    sp = sub.add_parser("simulate", help="dry-run de um payload Meta pelo pipeline")
    sp.add_argument("payload", help="arquivo .json com o payload do webhook")
    sp.add_argument("--country", help="forçar país (ISO2) — útil p/ IG/Messenger")
    sp.set_defaults(fn=cmd_simulate)

    sp = sub.add_parser("sign", help="HMAC: signed_request (delete-data) e X-Hub-Signature")
    sp.add_argument("action", choices=["make", "verify", "hub"])
    sp.add_argument("value", nargs="?", help="signed_request (verify) ou body (hub)")
    sp.add_argument("--user-id", help="user_id para 'make'")
    sp.set_defaults(fn=cmd_sign)

    return p


def main(argv=None):
    try:  # Windows console é cp1252; garante UTF-8 para emoji/acentos
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:  # noqa: BLE001
        pass
    load_env()
    args = build_parser().parse_args(argv)
    args.fn(args)


if __name__ == "__main__":
    main()
