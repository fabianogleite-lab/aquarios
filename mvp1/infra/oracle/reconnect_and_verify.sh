#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Rotina de reconexão + verificação — HygeiOS v2 (Oracle VM, porta 8001)
# Reconecta em segundo plano e garante os endpoints vivos. Idempotente.
#
# Uso (Git Bash):   bash infra/oracle/reconnect_and_verify.sh
# Em segundo plano: nohup bash infra/oracle/reconnect_and_verify.sh > /tmp/reconnect.log 2>&1 &
# Parâmetros:       $1 = nº máx de tentativas (default 40) · $2 = delay s (default 30)
# Override env:     ORACLE_KEY, ORACLE_HOST
# ─────────────────────────────────────────────────────────────────────────────
set -u
KEY="${ORACLE_KEY:-C:/Users/DWOS/Desktop/AquariOS/ssh-key-2026-05-28.key}"
HOST="${ORACLE_HOST:-opc@137.131.158.242}"
SVC="hygeios-v2-sprint2"
MAX="${1:-40}"
DELAY="${2:-30}"

ssh_do() { ssh -i "$KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=15 "$HOST" "$@" 2>/dev/null; }

echo "[reconnect] iniciado $(date) — alvo $HOST:8001"
for i in $(seq 1 "$MAX"); do
  if ssh_do "echo OK" | grep -q OK; then
    echo "[reconnect] VM alcançável na tentativa $i ($(date))"
    health=$(ssh_do "curl -s --max-time 6 http://localhost:8001/wa/status")
    if echo "$health" | grep -q 'supabase_ok'; then
      echo "[reconnect] endpoints OK: $health"
    else
      echo "[reconnect] endpoints mudos — reiniciando $SVC"
      ssh_do "sudo systemctl restart $SVC; sleep 6; systemctl is-active $SVC"
    fi
    exit 0
  fi
  echo "[reconnect] tentativa $i/$MAX falhou; aguardando ${DELAY}s"
  sleep "$DELAY"
done
echo "[reconnect] VM INALCANÇÁVEL após $MAX tentativas (~$((MAX*DELAY/60))min)"
exit 1
