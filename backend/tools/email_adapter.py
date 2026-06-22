"""Tool: Email (via Brevo SMTP). API oficial, sem token no app."""
import smtplib
from email.mime.text import MIMEText
import os


def send_email(to: str, subject: str, body: str) -> dict:
    """Envia email via Brevo (já configurado em produção)."""
    smtp_host = os.environ.get("SMTP_HOST", "smtp-relay.brevo.com")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASS")
    from_addr = os.environ.get("FROM_EMAIL", "contato@podiumtec.com.br")

    if not smtp_user or not smtp_pass:
        return {"ok": False, "error": "SMTP não configurado"}

    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = from_addr
        msg["To"] = to

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(from_addr, [to], msg.as_string())

        return {"ok": True, "to": to, "subject": subject}
    except Exception as e:
        return {"ok": False, "error": str(e)}
