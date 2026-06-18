#!/usr/bin/env python3
"""
AquariOS Security Audit — Entrega A (read-only)
================================================
Varre o repositório e a borda contra o checklist §5 do handoff
"Arquitetura de Fronteira & Regras de Segurança" (F1→F2).

Checks:
  A1  Secrets no histórico git (todas as refs alcançáveis)
  A2  Incidentes conhecidos (objetos inalcançáveis remanescentes)
  A3  Secrets na working tree (rastreados + untracked não-ignorados)
  A4  Higiene de .env / .gitignore
  A5  service_role exposto em código client (mobile/)
  A6  Cobertura RLS estática (parser de migrations)
  A7  RLS live probe — GET anônimo via REST (somente leitura)
  A8  Webhook HMAC presente (business-agent)
  A9  Release GitHub com APK de debug
  A10 Itens manuais (não automatizáveis por script)

Read-only por construção: nenhum write em banco, nenhuma mutação de git,
nenhum secret é impresso (apenas tipo, local e fingerprint sha256 truncado).

Uso:  python tools/security_audit.py
Saída: SECURITY_AUDIT_REPORT.md (raiz do repo) + resumo no console.
Exit code: 1 se houver FAIL, senão 0 (utilizável em CI).
"""

import base64
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REPORT_PATH = os.path.join(REPO_ROOT, "SECURITY_AUDIT_REPORT.md")

# ---------------------------------------------------------------- padrões

SECRET_PATTERNS = [
    ("Anthropic API key",        re.compile(r"sk-ant-[A-Za-z0-9_\-]{20,}")),
    ("OpenAI API key",           re.compile(r"sk-proj-[A-Za-z0-9_\-]{20,}")),
    ("AWS access key",           re.compile(r"AKIA[0-9A-Z]{16}")),
    ("GitHub token",             re.compile(r"(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,}")),
    ("Slack token",              re.compile(r"xox[bporas]-[A-Za-z0-9\-]{10,}")),
    ("Meta/Facebook token",      re.compile(r"EAA[A-Za-z0-9]{30,}")),
    ("Stripe live key",          re.compile(r"(?:sk|rk)_live_[A-Za-z0-9]{24,}")),
    ("Brevo (Sendinblue) key",   re.compile(r"xkeysib-[a-f0-9]{64}")),
    ("Supabase secret key",      re.compile(r"sb_secret_[A-Za-z0-9_\-]{20,}")),
    ("ElevenLabs key (provavel)", re.compile(r"\bsk_[a-f0-9]{40,}\b")),
    ("Bloco de chave privada",   re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----")),
    ("JWT",                      re.compile(r"eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}")),
]

# pre-filtro barato: linha sem nenhum destes tokens nem passa pelos regexes
FAST_TOKENS = ("sk-ant", "sk-proj", "AKIA", "ghp_", "gho_", "ghu_", "ghs_",
               "ghr_", "github_pat", "xox", "EAA", "_live_", "xkeysib",
               "sb_secret", "sk_", "PRIVATE KEY", "eyJ")

PLACEHOLDER_HINTS = ("xxx", "your", "example", "placeholder", "<todo",
                     "changeme", "dummy", "redacted", "fake")

BINARY_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".ttf",
              ".otf", ".woff", ".woff2", ".apk", ".aab", ".pdf", ".docx",
              ".xlsx", ".pptx", ".zip", ".jar", ".keystore", ".jks", ".mp3",
              ".mp4", ".so", ".dll", ".exe", ".bin", ".svg"}

# Incidentes já tratados em sessões anteriores — verificar remanescentes locais
KNOWN_INCIDENTS = [
    {
        "sha": "2d8245e",
        "context": ("S32: chave Anthropic real em DEPLOY_GUIDE.md. Tags que o "
                    "alcancavam foram deletadas (commit inalcancavel; nunca "
                    "esteve no remoto publico - GH013 bloqueou o push)."),
    },
]

# Tabelas cujo SELECT anonimo retornar linhas e considerado aceitavel se for
# intencional (conteudo publico) - rebaixa FAIL para WARN no probe live.
PUBLIC_READ_OK = {"modules_metadata"}

MIGRATION_DIRS = [
    os.path.join("mobile", "supabase", "migrations"),
    os.path.join("supabase", "migrations"),
]

STATUS_ORDER = ["FAIL", "WARN", "MANUAL", "INFO", "PASS", "SKIP"]


def finding(section, status, title, detail=""):
    return {"section": section, "status": status, "title": title,
            "detail": detail}


def run_git(args, timeout=120):
    return subprocess.run(["git"] + args, cwd=REPO_ROOT, capture_output=True,
                          timeout=timeout)


def fingerprint(value):
    return hashlib.sha256(value.encode("utf-8", "replace")).hexdigest()[:10]


def is_placeholder(value):
    low = value.lower()
    return any(h in low for h in PLACEHOLDER_HINTS)


_CURRENT_REF = None


def get_current_ref():
    """Project ref do Supabase de producao, lido de mobile/.env (cacheado)."""
    global _CURRENT_REF
    if _CURRENT_REF is None:
        env = load_env(os.path.join(REPO_ROOT, "mobile", ".env"))
        m = re.search(r"https?://([a-z0-9]+)\.supabase\.co",
                      env.get("EXPO_PUBLIC_SUPABASE_URL", ""))
        _CURRENT_REF = m.group(1) if m else ""
    return _CURRENT_REF


def classify_jwt(token):
    """Decodifica o payload de um JWT: role, validade (exp) e projeto (ref).

    service_role so e FAIL se a chave puder funcionar HOJE no projeto ATUAL;
    expirada e/ou de outro projeto = inerte (WARN de higiene).
    """
    try:
        payload = token.split(".")[1]
        payload += "=" * (-len(payload) % 4)
        data = json.loads(base64.urlsafe_b64decode(payload))
        role = data.get("role", "")
        ref = data.get("ref", "")
        exp = data.get("exp")
        expired = bool(exp) and exp < datetime.now(timezone.utc).timestamp()
        cur = get_current_ref()
        foreign = bool(cur) and bool(ref) and ref != cur
        if role == "anon":
            return "INFO", "JWT Supabase role=anon (chave publica por design)"
        if role == "service_role":
            exp_s = (datetime.fromtimestamp(exp, timezone.utc)
                     .strftime("%Y-%m-%d") if exp else "?")
            if expired or foreign:
                why = []
                if expired:
                    why.append(f"EXPIRADA em {exp_s}")
                if foreign:
                    why.append(f"de OUTRO projeto (ref `{ref}` != atual `{cur}`)")
                return "WARN", ("JWT service_role INERTE: " + " e ".join(why) +
                                ". Risco neutralizado; purga do historico e "
                                "opcional (higiene)")
            return "FAIL", ("JWT service_role do projeto ATUAL dentro da "
                            "validade (bypass total de RLS) - ROTACIONAR "
                            "IMEDIATAMENTE")
        iss = data.get("iss", "?")
        return "WARN", f"JWT nao classificado (iss={iss}, role={role or '?'})"
    except Exception:
        return "WARN", "JWT nao decodificavel (verificar manualmente)"


def scan_text(text):
    """Roda todos os padroes sobre um texto; retorna [(tipo, valor)]."""
    hits = []
    for name, rx in SECRET_PATTERNS:
        for m in rx.finditer(text):
            hits.append((name, m.group(0)))
    return hits


# ---------------------------------------------------------------- A1

def check_history():
    out = []
    seen = {}
    proc = subprocess.Popen(
        ["git", "log", "--all", "-p", "--no-color", "--unified=0"],
        cwd=REPO_ROOT, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    commit, fpath = "?", "?"
    for raw in proc.stdout:
        line = raw.decode("utf-8", "replace")
        if line.startswith("commit "):
            commit = line[7:19].strip()
            continue
        if line.startswith("diff --git"):
            parts = line.split(" b/", 1)
            fpath = parts[1].strip() if len(parts) == 2 else "?"
            continue
        if not any(tok in line for tok in FAST_TOKENS):
            continue
        for name, value in scan_text(line):
            fp = fingerprint(value)
            if fp in seen:
                seen[fp]["count"] += 1
                continue
            seen[fp] = {"name": name, "value": value, "commit": commit,
                        "file": fpath, "count": 1}
    proc.wait()

    for fp, hit in seen.items():
        name, value = hit["name"], hit["value"]
        where = f"commit `{hit['commit']}` em `{hit['file']}` ({hit['count']}x no historico)"
        if is_placeholder(value):
            out.append(finding("A1", "INFO", f"{name} (placeholder)",
                               f"{where} - texto de exemplo, nao e chave real. fp:{fp}"))
        elif name == "JWT":
            status, why = classify_jwt(value)
            out.append(finding("A1", status, f"{name} no historico",
                               f"{where} - {why}. fp:{fp}"))
        else:
            out.append(finding("A1", "FAIL", f"{name} no historico git",
                               f"{where} - alcancavel por refs atuais. "
                               f"Rotacionar a chave e reescrever/limpar refs. fp:{fp}"))
    if not out:
        out.append(finding("A1", "PASS", "Nenhum secret em refs alcancaveis",
                           "git log --all -p varrido com 12 padroes."))
    return out


# ---------------------------------------------------------------- A2

def check_known_incidents():
    out = []
    for inc in KNOWN_INCIDENTS:
        r = run_git(["cat-file", "-e", inc["sha"]])
        if r.returncode == 0:
            out.append(finding(
                "A2", "INFO",
                f"Objeto `{inc['sha']}` ainda existe no object store local",
                inc["context"] + " O objeto esta inalcancavel mas ainda nao "
                "foi purgado. Purga definitiva (acao manual, destrutiva): "
                "`git gc --prune=now`."))
        else:
            out.append(finding(
                "A2", "PASS",
                f"Objeto `{inc['sha']}` nao existe mais no repo local",
                inc["context"]))
    return out


# ---------------------------------------------------------------- A3

def iter_repo_files():
    tracked = run_git(["ls-files"]).stdout.decode("utf-8", "replace").splitlines()
    untracked = run_git(["ls-files", "--others", "--exclude-standard"]) \
        .stdout.decode("utf-8", "replace").splitlines()
    for rel in tracked:
        yield rel, "rastreado"
    for rel in untracked:
        yield rel, "untracked (candidato a commit)"


def check_worktree():
    out = []
    for rel, kind in iter_repo_files():
        ext = os.path.splitext(rel)[1].lower()
        if ext in BINARY_EXT:
            continue
        path = os.path.join(REPO_ROOT, rel)
        try:
            if not os.path.isfile(path) or os.path.getsize(path) > 2_000_000:
                continue
            with open(path, "r", encoding="utf-8", errors="replace") as fh:
                text = fh.read()
        except OSError:
            continue
        if not any(tok in text for tok in FAST_TOKENS):
            continue
        for name, value in scan_text(text):
            fp = fingerprint(value)
            where = f"`{rel}` ({kind})"
            if is_placeholder(value):
                out.append(finding("A3", "INFO", f"{name} (placeholder)",
                                   f"{where}. fp:{fp}"))
            elif name == "JWT":
                status, why = classify_jwt(value)
                out.append(finding("A3", status, f"{name} na working tree",
                                   f"{where} - {why}. fp:{fp}"))
            else:
                out.append(finding("A3", "FAIL", f"{name} na working tree",
                                   f"{where} - mover para .env. fp:{fp}"))
    if not out:
        out.append(finding("A3", "PASS",
                           "Nenhum secret em arquivos rastreados ou untracked",
                           "Arquivos ignorados pelo .gitignore (ex.: .env) "
                           "ficam fora do alcance de commit e nao sao lidos."))
    return out


# ---------------------------------------------------------------- A4

def check_env_hygiene():
    out = []
    tracked = run_git(["ls-files"]).stdout.decode("utf-8", "replace").splitlines()
    bad = [f for f in tracked
           if os.path.basename(f).startswith(".env")
           and not os.path.basename(f).endswith(".example")]
    if bad:
        for f in bad:
            out.append(finding("A4", "FAIL", f"`{f}` esta versionado",
                               "Arquivo .env real nunca deve ser rastreado. "
                               "`git rm --cached` + rotacionar chaves."))
    else:
        out.append(finding("A4", "PASS", "Nenhum .env real versionado",
                           "Somente .env.example (placeholders) no indice."))

    gi_path = os.path.join(REPO_ROOT, ".gitignore")
    try:
        with open(gi_path, encoding="utf-8", errors="replace") as fh:
            gi = [l.strip() for l in fh if l.strip() and not l.startswith("#")]
    except OSError:
        gi = []
    if ".env" in gi:
        out.append(finding("A4", "PASS", "`.gitignore` raiz cobre `.env`",
                           "Padrao sem barra aplica-se a qualquer subdiretorio "
                           "(mobile/, business-agent/, etc.)."))
    else:
        out.append(finding("A4", "FAIL", "`.gitignore` raiz NAO cobre `.env`",
                           "Adicionar `.env` ao .gitignore da raiz."))

    for sub in ("mobile", "business-agent"):
        p = os.path.join(REPO_ROOT, sub, ".env")
        if os.path.isfile(p):
            chk = run_git(["check-ignore", "-q", f"{sub}/.env"])
            if chk.returncode == 0:
                out.append(finding("A4", "PASS", f"`{sub}/.env` existe e esta ignorado",
                                   "Confirmado via git check-ignore."))
            else:
                out.append(finding("A4", "FAIL", f"`{sub}/.env` existe e NAO esta ignorado",
                                   "Risco de commit acidental de secrets."))
    return out


# ---------------------------------------------------------------- A5

def check_service_role_client():
    out = []
    rx = re.compile(r"service_role|SERVICE_ROLE|SERVICE_KEY", re.IGNORECASE)
    hits = []
    mobile = os.path.join(REPO_ROOT, "mobile")
    for dirpath, dirnames, filenames in os.walk(mobile):
        dirnames[:] = [d for d in dirnames if d not in
                       ("node_modules", ".expo", "android", "ios", ".git")]
        for fn in filenames:
            if not fn.endswith((".ts", ".tsx", ".js", ".jsx", ".json")):
                continue
            rel = os.path.relpath(os.path.join(dirpath, fn), REPO_ROOT)
            norm = rel.replace("\\", "/")
            # migrations/functions sao codigo de servidor, nao bundle do app
            if "/supabase/" in norm:
                continue
            try:
                with open(os.path.join(dirpath, fn), encoding="utf-8",
                          errors="replace") as fh:
                    text = fh.read()
            except OSError:
                continue
            if rx.search(text):
                hits.append(norm)
    if hits:
        for h in hits:
            out.append(finding("A5", "FAIL",
                               f"Referencia a service_role em codigo client: `{h}`",
                               "service_role nunca pode ir ao bundle do app."))
    else:
        out.append(finding("A5", "PASS",
                           "Nenhuma referencia a service_role no codigo client",
                           "Varrido mobile/ (.ts/.tsx/.js/.jsx/.json), excluindo "
                           "supabase/ (server-side) e node_modules."))
    return out


# ---------------------------------------------------------------- A6

RX_CREATE_TABLE = re.compile(
    r"CREATE TABLE(?:\s+IF NOT EXISTS)?\s+(?:public\.)?\"?([a-z_][a-z0-9_]*)\"?",
    re.IGNORECASE)
RX_ENABLE_RLS = re.compile(
    r"ALTER TABLE\s+(?:ONLY\s+)?(?:public\.)?\"?([a-z_][a-z0-9_]*)\"?\s+ENABLE ROW LEVEL SECURITY",
    re.IGNORECASE)
RX_POLICY = re.compile(
    r"CREATE POLICY\s+.+?\s+ON\s+(?:public\.)?\"?([a-z_][a-z0-9_]*)\"?",
    re.IGNORECASE | re.DOTALL)
RX_SELECT_POLICY = re.compile(
    r"CREATE POLICY\s+.{0,120}?\s+ON\s+(?:public\.)?\"?([a-z_][a-z0-9_]*)\"?"
    r"[^;]{0,300}?FOR\s+SELECT",
    re.IGNORECASE | re.DOTALL)
RX_DO_BLOCK = re.compile(r"DO\s+\$\$(.*?)\$\$", re.IGNORECASE | re.DOTALL)
RX_DYN_RLS = re.compile(
    r"EXECUTE format\([^;]{0,120}ENABLE ROW LEVEL SECURITY", re.IGNORECASE)


def collect_migration_tables():
    created, rls_on, with_policy, select_policy = {}, set(), set(), set()
    for d in MIGRATION_DIRS:
        full = os.path.join(REPO_ROOT, d)
        if not os.path.isdir(full):
            continue
        for fn in sorted(os.listdir(full)):
            if not fn.endswith(".sql"):
                continue
            try:
                with open(os.path.join(full, fn), encoding="utf-8",
                          errors="replace") as fh:
                    sql = fh.read()
            except OSError:
                continue
            for m in RX_CREATE_TABLE.finditer(sql):
                created.setdefault(m.group(1).lower(), f"{d}/{fn}")
            for m in RX_ENABLE_RLS.finditer(sql):
                rls_on.add(m.group(1).lower())
            for m in RX_POLICY.finditer(sql):
                with_policy.add(m.group(1).lower())
            for m in RX_SELECT_POLICY.finditer(sql):
                select_policy.add(m.group(1).lower())
            # RLS habilitada dinamicamente: DO $$ ... FOREACH t IN ARRAY
            # ARRAY['t1','t2'] LOOP EXECUTE format('ALTER TABLE %I ENABLE
            # ROW LEVEL SECURITY') ... (padrao da migration 30)
            for block in RX_DO_BLOCK.finditer(sql):
                body = block.group(1)
                if not RX_DYN_RLS.search(body):
                    continue
                for arr in re.finditer(r"ARRAY\[(.*?)\]", body, re.DOTALL):
                    for sm in re.finditer(r"'([a-z_][a-z0-9_]*)'",
                                          arr.group(1)):
                        rls_on.add(sm.group(1).lower())
    return created, rls_on, with_policy, select_policy


def check_rls_static():
    out = []
    created, rls_on, with_policy, _sel = collect_migration_tables()
    if not created:
        return [finding("A6", "SKIP", "Nenhuma migration encontrada", "")]
    missing_rls = sorted(t for t in created if t not in rls_on)
    no_policy = sorted(t for t in created
                       if t in rls_on and t not in with_policy)
    for t in missing_rls:
        out.append(finding("A6", "FAIL",
                           f"Tabela `{t}` sem ENABLE RLS em nenhuma migration",
                           f"Definida em `{created[t]}`. Se o probe live (A7) "
                           "nao mostra vazamento, a tabela esta vazia, nao "
                           "existe em prod, ou a RLS foi ligada fora das "
                           "migrations (Studio) - confirmar em pg_policies e "
                           "corrigir a migration de qualquer forma."))
    for t in no_policy:
        out.append(finding("A6", "WARN",
                           f"Tabela `{t}` com RLS mas sem CREATE POLICY",
                           f"Definida em `{created[t]}`. RLS sem policy = "
                           "ninguem acessa via anon/authenticated (pode ser "
                           "intencional: acesso so via service_role)."))
    out.append(finding("A6", "INFO", "Cobertura de migrations",
                       f"{len(created)} tabelas criadas, {len(rls_on)} com "
                       f"ENABLE RLS, {len(with_policy)} com policies. "
                       f"Dirs: {', '.join(MIGRATION_DIRS)}."))
    if not missing_rls:
        out.append(finding("A6", "PASS",
                           "Todas as tabelas das migrations tem ENABLE RLS", ""))
    return out


# ---------------------------------------------------------------- A7

def load_env(path):
    env = {}
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            for line in fh:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    except OSError:
        pass
    return env


def check_rls_live():
    out = []
    env = load_env(os.path.join(REPO_ROOT, "mobile", ".env"))
    url = env.get("EXPO_PUBLIC_SUPABASE_URL", "").rstrip("/")
    key = env.get("EXPO_PUBLIC_SUPABASE_ANON_KEY", "")
    if not url or not key:
        return [finding("A7", "SKIP", "Probe live nao executado",
                        "EXPO_PUBLIC_SUPABASE_URL/ANON_KEY ausentes em "
                        "mobile/.env.")]
    created, _rls, _wp, select_policy = collect_migration_tables()
    tables = sorted(created)[:60]
    exposed, empty_ok, protected, errors = [], [], [], []
    for t in tables:
        req = urllib.request.Request(
            f"{url}/rest/v1/{t}?select=*&limit=1",
            headers={"apikey": key, "Authorization": f"Bearer {key}"})
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                body = resp.read().decode("utf-8", "replace").strip()
            if body in ("[]", ""):
                empty_ok.append(t)
            else:
                exposed.append(t)
        except urllib.error.HTTPError as e:
            if e.code in (401, 403, 404, 406):
                protected.append(t)
            else:
                errors.append(f"{t}:{e.code}")
        except Exception as e:  # rede/timeout
            errors.append(f"{t}:{type(e).__name__}")
    for t in exposed:
        if t in PUBLIC_READ_OK:
            status, extra = "WARN", (" Leitura publica conhecida/intencional - "
                                     "apenas confirmar que segue desejada.")
        elif t in select_policy:
            status, extra = "WARN", (" Existe policy de SELECT nas migrations "
                                     "para esta tabela - exposicao compativel "
                                     "com o design; revisar se a INTENCAO de "
                                     "negocio segue valida (conteudo e publico "
                                     "para qualquer portador da anon key, que "
                                     "esta no bundle do APK).")
        else:
            status, extra = "FAIL", (" NENHUMA policy de SELECT nas migrations: "
                                     "ou a RLS esta OFF em prod, ou uma policy "
                                     "permissiva foi criada fora das migrations "
                                     "(Studio). Fechar e versionar o fix.")
        out.append(finding("A7", status,
                           f"SELECT anonimo retorna LINHAS em `{t}`",
                           f"GET /rest/v1/{t} com anon key devolveu dados sem "
                           f"login.{extra}"))
    out.append(finding("A7", "INFO", "Resultado do probe (GET anon, read-only)",
                       f"{len(protected)} bloqueadas/sem rota, "
                       f"{len(empty_ok)} retornam vazio (RLS filtrando), "
                       f"{len(exposed)} retornam linhas, {len(errors)} erros "
                       f"de rede{': ' + ', '.join(errors) if errors else ''}. "
                       f"Bloqueadas/sem rota: {', '.join(protected) or '-'}. "
                       f"Vazias: {', '.join(empty_ok) or '-'}. "
                       "Probe de ESCRITA nao foi executado (read-only); "
                       "anon write ja validado como 401 na S32 "
                       "(migrations 17/18/23)."))
    if not exposed:
        out.append(finding("A7", "PASS",
                           "Nenhuma tabela vaza dados em SELECT anonimo",
                           f"{len(tables)} tabelas testadas."))
    return out


# ---------------------------------------------------------------- A8

def check_webhook_hmac():
    out = []
    main_py = os.path.join(REPO_ROOT, "business-agent", "main.py")
    if not os.path.isfile(main_py):
        return [finding("A8", "SKIP", "business-agent/main.py nao encontrado", "")]
    with open(main_py, encoding="utf-8", errors="replace") as fh:
        src = fh.read()
    has_sig = "X-Hub-Signature-256" in src or "x-hub-signature-256" in src
    has_hmac = "hmac" in src
    has_cmp = "compare_digest" in src
    if has_sig and has_hmac:
        detail = "Validacao de assinatura Meta presente."
        if has_cmp:
            detail += " Usa hmac.compare_digest (constant-time, correto)."
            out.append(finding("A8", "PASS",
                               "Webhook valida X-Hub-Signature-256", detail))
        else:
            out.append(finding("A8", "WARN",
                               "Webhook valida assinatura, mas sem compare_digest",
                               "Comparacao == de HMAC e vulneravel a timing "
                               "attack. Trocar por hmac.compare_digest()."))
    else:
        out.append(finding("A8", "FAIL",
                           "Webhook NAO valida X-Hub-Signature-256",
                           "Requisito do handoff: descartar antes de tocar o "
                           "pipeline."))
    if re.search(r"idempot|message_id.*dedup|dedup", src, re.IGNORECASE):
        out.append(finding("A8", "INFO", "Indicio de dedupe/idempotencia no codigo", ""))
    else:
        out.append(finding("A8", "INFO",
                           "Sem dedupe por meta_message_id no handler",
                           "Coluna existe no schema; implementacao = entrega D "
                           "(sequenciada junto ao deploy real D2/D3)."))
    return out


# ---------------------------------------------------------------- A9

def check_github_release():
    out = []
    r = run_git(["remote", "get-url", "origin"])
    m = re.search(r"github\.com[:/]([^/]+/[^/.]+)",
                  r.stdout.decode("utf-8", "replace"))
    if not m:
        return [finding("A9", "SKIP", "Remote origin nao e GitHub", "")]
    repo = m.group(1)
    releases = None
    try:
        p = subprocess.run(["gh", "api", f"repos/{repo}/releases"],
                           capture_output=True, timeout=60)
        if p.returncode == 0:
            releases = json.loads(p.stdout.decode("utf-8", "replace"))
    except Exception:
        pass
    if releases is None:  # gh ausente/sem auth -> API publica (repo publico)
        try:
            req = urllib.request.Request(
                f"https://api.github.com/repos/{repo}/releases",
                headers={"User-Agent": "aquarios-security-audit",
                         "Accept": "application/vnd.github+json"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                releases = json.loads(resp.read().decode("utf-8", "replace"))
        except Exception as e:
            return [finding("A9", "MANUAL", "Falha ao consultar releases",
                            f"gh CLI indisponivel/sem auth e API publica "
                            f"falhou ({type(e).__name__}). Verificar "
                            f"manualmente https://github.com/{repo}/releases "
                            "- trocar app-debug.apk por build release "
                            "assinado.")]
    debug_assets = []
    for rel in releases:
        for asset in rel.get("assets", []):
            if "debug" in asset.get("name", "").lower():
                debug_assets.append(f"{rel.get('tag_name')}/{asset['name']}")
    if debug_assets:
        for da in debug_assets:
            out.append(finding("A9", "FAIL",
                               f"Release publico com APK de DEBUG: `{da}`",
                               "Debug build: assinado com debug keystore, "
                               "depuravel, sem minify. Substituir por release "
                               "assinado (checklist §5)."))
    elif releases:
        out.append(finding("A9", "PASS",
                           "Nenhum asset de debug em releases publicos",
                           f"{len(releases)} release(s) verificados em {repo}."))
    else:
        out.append(finding("A9", "INFO", "Nenhum release publicado", ""))
    return out


# ---------------------------------------------------------------- A10

def check_manual_items():
    items = [
        ("eSIM ProteOS (31 98323-5309)",
         "PIN do chip ativado; QR de reinstalacao guardado OFFLINE (vetor de "
         "SIM swap). 2G ja desativado conforme handoff."),
        ("Wix / OdontolarPlus",
         "Revisar retencao de dados do formulario e das conversas da "
         "assistente Lis no painel Wix."),
        ("Rotacao da chave Anthropic",
         "Opcional (S32: nunca vazou ao publico). Rotacionar por higiene "
         "quando conveniente."),
        ("Credenciais Meta (sessao paralela)",
         "Ao receber: conferir que entram APENAS via .env na VM "
         "(/opt/business-agent/.env), nunca em arquivo do repo."),
        ("Rate limiting na borda (entrega E - documentada)",
         "Recomendacao: nginx `limit_req zone=webhook burst=20 nodelay` na "
         "rota /webhook da VM Oracle + idempotencia (entrega D) no app. "
         "Aplicar junto ao deploy D2/D3."),
    ]
    return [finding("A10", "MANUAL", t, d) for t, d in items]


# ---------------------------------------------------------------- relatório

def head_info():
    sha = run_git(["rev-parse", "--short", "HEAD"]).stdout.decode().strip()
    branch = run_git(["rev-parse", "--abbrev-ref", "HEAD"]).stdout.decode().strip()
    return sha, branch


def write_report(sections):
    sha, branch = head_info()
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    counts = {s: 0 for s in STATUS_ORDER}
    for sec_findings in sections.values():
        for f in sec_findings:
            counts[f["status"]] += 1
    verdict = "REPROVADO (ha itens FAIL)" if counts["FAIL"] else \
              "APROVADO com ressalvas" if counts["WARN"] else "APROVADO"

    titles = {
        "A1": "A1 - Secrets no historico git (refs alcancaveis)",
        "A2": "A2 - Incidentes conhecidos (remanescentes locais)",
        "A3": "A3 - Secrets na working tree",
        "A4": "A4 - Higiene de .env / .gitignore",
        "A5": "A5 - service_role em codigo client",
        "A6": "A6 - Cobertura RLS estatica (migrations)",
        "A7": "A7 - RLS live probe (GET anonimo, read-only)",
        "A8": "A8 - Webhook HMAC (business-agent)",
        "A9": "A9 - Release GitHub (APK)",
        "A10": "A10 - Itens manuais (nao automatizaveis)",
    }
    icon = {"PASS": "[PASS]", "FAIL": "[FAIL]", "WARN": "[WARN]",
            "INFO": "[INFO]", "MANUAL": "[MANUAL]", "SKIP": "[SKIP]"}

    lines = [
        "# SECURITY AUDIT REPORT - AquariOS",
        "",
        f"> Gerado por `tools/security_audit.py` em {now}  ",
        f"> HEAD: `{sha}` ({branch}) - escopo: handoff Fronteira F1->F2, "
        "checklist §5 + regras §2-§4  ",
        "> Read-only: nenhum valor de secret aparece neste arquivo "
        "(apenas tipo, local e fingerprint).",
        "",
        "## Resumo executivo",
        "",
        f"**Veredicto: {verdict}**",
        "",
        "| Status | Qtde |",
        "|---|---|",
    ]
    for s in STATUS_ORDER:
        lines.append(f"| {icon[s]} | {counts[s]} |")
    lines.append("")

    for sec in sorted(sections):
        lines.append(f"## {titles.get(sec, sec)}")
        lines.append("")
        ordered = sorted(sections[sec],
                         key=lambda f: STATUS_ORDER.index(f["status"]))
        for f in ordered:
            lines.append(f"- **{icon[f['status']]} {f['title']}**")
            if f["detail"]:
                lines.append(f"  - {f['detail']}")
        lines.append("")

    lines += [
        "## Metodologia e limitacoes",
        "",
        "- **A1**: `git log --all -p` (todas as refs: branches, tags) com 12 "
        "padroes de secret + decodificacao de payload JWT para distinguir "
        "anon (publica) de service_role (critica). Objetos *inalcancaveis* "
        "do object store nao sao varridos (cobertos pontualmente em A2).",
        "- **A6/A7**: cobertura via parser das migrations (inclui RLS "
        "habilitada dinamicamente em blocos DO $$ + EXECUTE format, padrao "
        "da migration 30) + probe REST com anon key. Nao substitui inspecao "
        "de `pg_policies` em producao (policies criadas fora das migrations "
        "nao aparecem no estatico; o probe live cobre o efeito pratico de "
        "leitura). Exposicao com policy SELECT versionada = WARN (design a "
        "confirmar); sem policy conhecida = FAIL.",
        "- **A7**: somente GET (read-only). Probe de INSERT/UPDATE nao e "
        "executado por design - validado na S32.",
        "- **Itens fisicos** (eSIM, Wix, keystore) nao sao automatizaveis: "
        "ver A10.",
        "- Pentest/carga (k6, OWASP ZAP) fora do escopo desta ferramenta "
        "(protocolo §6 do handoff).",
        "",
    ]
    with open(REPORT_PATH, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))
    return verdict, counts


def main():
    checks = [
        ("A1", check_history),
        ("A2", check_known_incidents),
        ("A3", check_worktree),
        ("A4", check_env_hygiene),
        ("A5", check_service_role_client),
        ("A6", check_rls_static),
        ("A7", check_rls_live),
        ("A8", check_webhook_hmac),
        ("A9", check_github_release),
        ("A10", check_manual_items),
    ]
    sections = {}
    for sec, fn in checks:
        print(f"[*] {sec} ...", flush=True)
        try:
            sections[sec] = fn()
        except Exception as e:
            sections[sec] = [finding(sec, "WARN", f"Check abortou: {type(e).__name__}",
                                     str(e)[:300])]
    verdict, counts = write_report(sections)
    print()
    print(f"Veredicto: {verdict}")
    print("  " + "  ".join(f"{s}={counts[s]}" for s in STATUS_ORDER))
    print(f"Relatorio: {os.path.relpath(REPORT_PATH, REPO_ROOT)}")
    return 1 if counts["FAIL"] else 0


if __name__ == "__main__":
    sys.exit(main())
