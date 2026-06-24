#!/bin/bash
# Deploy H3 + Item 3 → VM Oracle

set -e

VM_USER="opc"
VM_HOST="137.131.158.242"
VM_PATH="/opt/aquarios"

echo "📦 Copiando backend..."
scp -r backend/ $VM_USER@$VM_HOST:$VM_PATH/

echo "⚙️  Setando variáveis de ambiente..."
ssh $VM_USER@$VM_HOST << 'SSHEOF'
cat >> /etc/hygeios-v2-sprint2.env <<'ENVEOF'

# F1/F2 SandeirOS
SUPABASE_URL=https://agebsmjsjrmazbozphnh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=COLOCAR_AQUI

# Email (Brevo)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=ad7e74001@smtp-brevo.com
SMTP_PASS=COLOCAR_AQUI
FROM_EMAIL=contato@podiumtec.com.br

# Shopify webhook
SHOPIFY_API_SECRET=COLOCAR_AQUI

ENVEOF

systemctl restart hygeios-v2
echo "✅ Serviço reiniciado"

SSHEOF

echo "✅ Deploy concluído"
