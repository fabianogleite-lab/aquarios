# ============================================================================
# AquariOS · Fronteira F1→F2 — VM Azure Free Tier p/ CerberOS (gate) + GaiOS
# ============================================================================
# Decisão do fundador (12/Jun/2026): conjunto GaiOS (SO) + CerberOS ganha
# host próprio no Azure Free (12 meses). Decisão complementar (mesmo dia):
# o HygeiOS Agent v1 TAMBÉM roda nesta VM (risco aceito: dado de saúde na
# mesma máquina do endpoint público — mitigar no deploy com usuários systemd
# separados e /data restrito). 3 serviços Python em 1 GiB RAM -> swap
# obrigatório (ver README §6).
# 2 discos P6 Premium SSD 64 GB (cota free): um SO, um dados.
# Trail GaiOS (migration 31) mora no SUPABASE — o disco de dados é
# buffer/artefatos, não banco (decisão 12/Jun).
#
# ⚠️ NADA FOI APLICADO. Pré-requisitos manuais (fora do Terraform):
#   1. Criar conta free em https://azure.microsoft.com/free
#      (login fabianogleite.dev — cartão só verificação; US$200/30d + 12 meses)
#   2. az login
#   3. terraform init && terraform plan   <- REVISAR o plan antes do apply
#   4. Logo após o apply: criar BUDGET ALERT de US$1 no portal
#      (Cost Management > Budgets) — o free tier NÃO tem trava automática
#      de cobrança; o alerta é a rede de segurança do cartão.
#
# Por que este arquivo é MENOR que a sugestão do outro chat:
#   • SKUs corrigidos para ficar DE FATO dentro da cota free:
#       - Discos: Premium_LRS 64 GB (= P6, o que a cota cobre).
#         O original usava StandardSSD_LRS (= E6) -> NÃO é free, cobraria.
#       - Public IP: Standard/Static. Basic foi APOSENTADO (set/2025) —
#         o original (Basic Dynamic) falha na criação.
#   • Removidos (cota disponível ≠ obrigação de uso; cada recurso extra é
#     superfície de ataque + risco de custo):
#       - VPN Gateway: exigiria GatewaySubnet dedicado (o original apontava
#         pro subnet da VM -> apply falha); fora da cota = ~US$140/mês;
#         nada na fronteira precisa de VPN.
#       - Load Balancer Standard: inútil com 1 VM.
#       - MySQL, Cosmos DB, Container Registry, Service Bus: sem consumidor
#         nesta trilha. O Postgres do sistema continua sendo o Supabase.
#   • Secrets continuam em .env na VM (handoff §4) — sem Key Vault por ora.
# ============================================================================

terraform {
  required_version = ">= 1.5"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.116"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-aquarios-fronteira"
  location = var.location
  tags     = local.tags
}

locals {
  tags = {
    projeto   = "aquarios-fronteira-f1f2"
    modulos   = "cerberos-gate_gaios_hygeios-agent-v1"
    free_tier = "12meses"
  }
}

# ---------------------------------------------------------------- rede

resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-fronteira"
  address_space       = ["10.10.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = local.tags
}

resource "azurerm_subnet" "subnet" {
  name                 = "snet-vm"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.10.1.0/24"]
}

# NSG = primeira camada do perímetro (EteriOS §4: TLS obrigatório; o gate
# CerberOS valida HMAC atrás do nginx, como na VM Oracle)
resource "azurerm_network_security_group" "nsg" {
  name                = "nsg-fronteira"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = local.tags

  security_rule {
    name                       = "ssh-restrito"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = var.ssh_allowed_cidr
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "https"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
  }

  # 80 só para o desafio ACME do certbot (Let's Encrypt); nginx redireciona
  security_rule {
    name                       = "http-acme"
    priority                   = 120
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "nsg_assoc" {
  subnet_id                 = azurerm_subnet.subnet.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

# Basic IP foi aposentado -> Standard + Static (free tier cobre 1 IP em uso)
resource "azurerm_public_ip" "pip" {
  name                = "pip-fronteira"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = local.tags
}

resource "azurerm_network_interface" "nic" {
  name                = "nic-fronteira"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = local.tags

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.pip.id
  }
}

# ---------------------------------------------------------------- VM

# Free 12 meses: 750h/mês de B1s (clássico) ou B2ats_v2/B2pts_v2 (novos).
# 750h > 744h (mês máximo) -> 1 VM ligada 24x7 cabe inteira na cota.
resource "azurerm_linux_virtual_machine" "vm" {
  name                = "vm-fronteira"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = var.vm_size
  admin_username      = var.admin_username
  network_interface_ids = [
    azurerm_network_interface.nic.id,
  ]
  tags = local.tags

  admin_ssh_key {
    username   = var.admin_username
    public_key = var.ssh_public_key
  }

  # Disco P6 nº 1 — sistema operacional (GaiOS "SO" na decisão do fundador)
  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS" # P6 64GB = o que a cota free cobre
    disk_size_gb         = 64
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "ubuntu-24_04-lts"
    sku       = "server"
    version   = "latest"
  }
}

# Disco P6 nº 2 — dados (trilha/artefatos GaiOS; ver README p/ mount)
resource "azurerm_managed_disk" "data" {
  name                 = "disk-gaios-dados-p6"
  location             = azurerm_resource_group.rg.location
  resource_group_name  = azurerm_resource_group.rg.name
  storage_account_type = "Premium_LRS" # P6 64GB
  create_option        = "Empty"
  disk_size_gb         = 64
  tags                 = local.tags
}

resource "azurerm_virtual_machine_data_disk_attachment" "data_attach" {
  managed_disk_id    = azurerm_managed_disk.data.id
  virtual_machine_id = azurerm_linux_virtual_machine.vm.id
  lun                = 0
  # "None": trail GaiOS é append-only/write-heavy — host caching em writes
  # arrisca corrupção em queda; throughput do P6 (240 IOPS) é suficiente.
  caching = "None"
}

# ---------------------------------------------------------------- storage

# Blob 5 GB (free 12 meses) — backups do trail + logs frios.
resource "azurerm_storage_account" "sa" {
  name                            = "staquarios${random_string.suffix.result}"
  resource_group_name             = azurerm_resource_group.rg.name
  location                        = azurerm_resource_group.rg.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
  tags                            = local.tags
}

resource "azurerm_storage_container" "backups" {
  name                  = "gaios-backups"
  storage_account_name  = azurerm_storage_account.sa.name
  container_access_type = "private"
}
