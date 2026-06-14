# Azure Free Tier — VM da Fronteira (CerberOS gate + GaiOS)

**Decisão 12/Jun/2026:** o conjunto GaiOS (SO) + CerberOS ganha host próprio no
Azure Free (12 meses) com **2 discos P6 Premium 64 GB** (um SO, um dados). A VM
Oracle SP fica desafogada para o HygeiOS.

> ⚠️ **Nada deste diretório foi aplicado.** Terraform redigido e revisado;
> `apply` só depois da conta criada e do `plan` conferido.

## Passo a passo (ações manuais — fundador)

1. **Criar a conta free** — ✅ **FEITO 12/Jun/2026**
   - Conta criada no nome da **empresa (CEL)**, não pessoa física — infra como
     ativo da CEL (mesma entidade do D-U-N-S corporativo) = bom para
     governança/fiscal (GaiOS). *(login, tenant e D-U-N-S: ver credenciais
     locais — fora do repo público.)*
   - ⏰ **Free de 12 meses expira ~12/Jun/2027** — lembrete em maio/2027
     (migrar ou aceitar custo).
   - 🔐 **MFA (1º desafio, 12/Jun):** configurar em `aka.ms/mfasetup` com
     **Microsoft Authenticator/TOTP — NUNCA SMS** (vetor SIM swap, checklist
     §5). Guardar códigos de recuperação OFFLINE (junto do QR do eSIM). Na
     tela "Autenticação multifator (Fase 2)": NÃO precisa "Aplicar" nada —
     a data de imposição default fica; só fechar após configurar o método.
2. **Instalar CLIs** (uma vez): `winget install Microsoft.AzureCLI Hashicorp.Terraform`
3. **Gerar chave SSH dedicada** (não reusar a da Oracle):
   `ssh-keygen -t ed25519 -f azure-fronteira` → guardar a privada com a chave
   Oracle (`C:\Users\DWOS\Desktop\AquariOS\`), passar o **.pub** ao Terraform.
4. **Provisionar:**
   ```
   az login
   cd infra/azure
   terraform init
   terraform plan  -var "ssh_public_key=ssh-ed25519 AAAA... "   # REVISAR
   terraform apply -var "ssh_public_key=ssh-ed25519 AAAA... "
   ```
5. **Logo após o apply — rede de segurança do cartão:**
   Portal → Cost Management → Budgets → criar budget de **US$ 1** com alerta
   por e-mail. O free tier **não** tem trava automática de cobrança.
6. **Montar o disco de dados** (uma vez, via SSH):
   ```bash
   lsblk                                   # identificar o disco 64G sem partição (ex.: sdc)
   sudo mkfs.ext4 /dev/sdc
   sudo mkdir -p /data
   sudo blkid /dev/sdc                     # copiar o UUID
   echo 'UUID=<uuid> /data ext4 defaults,nofail 0 2' | sudo tee -a /etc/fstab
   sudo mount -a && df -h /data
   ```
7. **Restringir o SSH** assim que tiver IP estável: reaplicar com
   `-var "ssh_allowed_cidr=<seu-ip>/32"`.

## O que entra nesta VM (gated — junto ao deploy D2/D3)

- nginx + certbot (TLS, igual ao padrão da VM Oracle)
- `business-agent/` (FastAPI): webhook Meta + **gate CerberOS** (entrega B)
- **HygeiOS Agent v1** (build em sessão própria — decisão 12/Jun: roda aqui,
  junto do gate; risco aceito de dado de saúde na mesma VM do endpoint
  público → mitigar com usuário systemd próprio por serviço e `/data`
  com permissão restrita por diretório)
- **Idempotência** por `meta_message_id` (entrega D)
- Rate limiting nginx (`limit_req zone=webhook burst=20 nodelay`) (entrega E)
- Buffer/artefatos GaiOS em `/data` (disco P6 dedicado) — o **trail WORM
  oficial mora no Supabase** (migration 31); backups frios no blob
  `gaios-backups` (5 GB free)
- Secrets **só** em `/opt/<servico>/.env` (handoff §4 — nunca no repo)

### Swap (obrigatório — 3 serviços Python em 1 GiB de RAM)

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Delta vs. o Terraform sugerido no outro chat

| Item | Outro chat | Aqui | Motivo |
|---|---|---|---|
| Discos | `StandardSSD_LRS` (E6) | `Premium_LRS` (P6) | A cota free cobre **P6**; E6 **cobraria** |
| Public IP | Basic Dynamic | Standard Static | Basic foi aposentado (set/2025) — criação falha |
| VPN Gateway | VpnGw1 | **removido** | Exigia GatewaySubnet (apply falhava); fora da cota = ~US$140/mês; sem uso na fronteira |
| Load Balancer | Standard | **removido** | Inútil com 1 VM |
| MySQL/Cosmos/ACR/Service Bus | criados | **removidos** | Sem consumidor; Postgres do sistema = Supabase; superfície/custo à toa |
| `random_string` | HCL inválido (`;`) | corrigido | `terraform init` quebrava |
| NSG | ausente | SSH restringível + 443/80 | Checklist §5 — borda mínima |

Cota disponível ≠ obrigação de uso: cada recurso a mais é superfície de
ataque, complexidade e risco de custo quando o free expirar.
