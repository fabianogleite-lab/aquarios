#!/usr/bin/env python3
"""Meta OAuth flow - generates tokens for API access"""
import json, os, sys, webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlencode, parse_qs, urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(HERE, ".env")

def _secret_from_env_or_dotenv(key: str) -> str:
    val = os.environ.get(key, "")
    if not val and os.path.exists(ENV_FILE):
        with open(ENV_FILE) as f:
            for line in f:
                if line.startswith(f"{key}="):
                    val = line.split("=", 1)[1].strip()
                    break
    if not val:
        sys.exit(f"Faltando {key} — defina no ambiente ou em {ENV_FILE}. Nunca hardcode (repo público).")
    return val

META_APP_ID = "1891936851469173"
META_APP_SECRET = _secret_from_env_or_dotenv("META_APP_SECRET")  # rotate at Meta dashboard; never hardcode
META_BUSINESS_ID = "2274467833382298"
REDIRECT_URI = "http://localhost:8765/callback"

class OAuthHandler(BaseHTTPRequestHandler):
    auth_code = None
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/callback":
            params = parse_qs(parsed.query)
            OAuthHandler.auth_code = params.get("code", [None])[0]
            if OAuthHandler.auth_code:
                self.send_response(200)
                self.send_header("Content-type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(b"<html><body><h1>OK - Authorization received</h1></body></html>")
            else:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Error: no code received")
    def log_message(self, format, *args): pass

def get_oauth_url():
    params = {
        "client_id": META_APP_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": "business_management,instagram_basic",
        "response_type": "code",
        "state": "aquarios_oauth",
    }
    return f"https://www.facebook.com/v18.0/dialog/oauth?{urlencode(params)}"

def exchange_code_for_token(code):
    import httpx
    url = "https://graph.facebook.com/v18.0/oauth/access_token"
    params = {
        "client_id": META_APP_ID,
        "client_secret": META_APP_SECRET,
        "redirect_uri": REDIRECT_URI,
        "code": code,
    }
    try:
        r = httpx.post(url, params=params, timeout=10)
        return r.json()
    except Exception as e:
        print(f"Error: {e}")
        return None

def get_business_info(access_token):
    import httpx
    try:
        r = httpx.get(
            f"https://graph.facebook.com/v18.0/{META_BUSINESS_ID}/pages",
            params={"access_token": access_token},
            timeout=10,
        )
        pages = r.json().get("data", [])
        if pages:
            page = pages[0]
            page_id = page["id"]
            page_access_token = page.get("access_token")
            print(f"Page found: {page['name']} (ID: {page_id})")
            return {
                "page_id": page_id,
                "page_access_token": page_access_token,
                "phone_id": "PENDING",
            }
        else:
            print("No pages found")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def save_env(tokens):
    content = f"""BUSINESS_ACCOUNT_ID={META_BUSINESS_ID}
PAGE_ID={tokens['page_id']}
PAGE_ACCESS_TOKEN={tokens['page_access_token']}
PHONE_ID={tokens['phone_id']}
META_APP_SECRET={META_APP_SECRET}
META_VERIFY_TOKEN=aquarios_webhook_verify_{os.urandom(8).hex()}
META_TOKEN={tokens.get('access_token', 'PENDING')}

SUPABASE_URL=https://agebsmjsjrmazbozphnh.supabase.co
SUPABASE_SERVICE_KEY=[seu_service_key]
"""
    with open(ENV_FILE, "w") as f:
        f.write(content)
    if sys.platform != "win32":
        os.chmod(ENV_FILE, 0o600)
    print(f"Tokens saved to {ENV_FILE}")

def main():
    print("AquariOS - Meta Business OAuth Setup")
    print(f"Business ID: {META_BUSINESS_ID}")
    print()

    if not META_APP_SECRET:
        print("ERROR: META_APP_SECRET not set in environment.")
        print("Rotate it first (developers.facebook.com -> App -> Settings -> Basic -> Reset),")
        print("then set it before running:")
        print("  PowerShell:  $env:META_APP_SECRET='<new_secret>'")
        print("  bash:        export META_APP_SECRET=<new_secret>")
        sys.exit(1)

    server = HTTPServer(("localhost", 8765), OAuthHandler)
    print("Server running (localhost:8765)")

    oauth_url = get_oauth_url()
    print("Opening browser...")
    webbrowser.open(oauth_url)
    print("Click 'Authorize'...")

    while OAuthHandler.auth_code is None:
        server.handle_request()

    print(f"Code received: {OAuthHandler.auth_code[:20]}...")

    token_data = exchange_code_for_token(OAuthHandler.auth_code)
    if not token_data or "error" in token_data:
        print(f"Error: {token_data}")
        sys.exit(1)

    access_token = token_data["access_token"]
    print(f"Access Token: {access_token[:20]}...")

    business_info = get_business_info(access_token)
    if not business_info:
        print("Failed to get business info")
        sys.exit(1)

    business_info["access_token"] = access_token
    save_env(business_info)

    print()
    print("DONE!")
    print(f"PAGE_ID: {business_info['page_id']}")
    print()
    print("Next: python metactl.py doctor")

if __name__ == "__main__":
    main()
