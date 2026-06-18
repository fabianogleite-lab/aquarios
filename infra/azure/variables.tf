variable "location" {
  description = "Região. eastus = mais garantido p/ cotas free e perto dos servidores Meta (webhook). Brazil South costuma restringir contas free."
  type        = string
  default     = "eastus"
}

variable "vm_size" {
  description = "SKU free 12 meses: Standard_B1s (1 vCPU/1GB, mais garantido) ou Standard_B2ats_v2 / Standard_B2pts_v2 (2 vCPU/1GB; confirmar elegibilidade na região antes)."
  type        = string
  default     = "Standard_B1s"
}

variable "admin_username" {
  description = "Usuário admin da VM."
  type        = string
  default     = "azureuser"
}

variable "ssh_public_key" {
  description = "Conteúdo da chave SSH PÚBLICA (gerar no Windows: ssh-keygen -t ed25519 -f azure-fronteira; passar o conteúdo do .pub). NUNCA a privada."
  type        = string
}

variable "ssh_allowed_cidr" {
  description = "CIDR autorizado no SSH. Trocar * pelo IP fixo/range da sua conexão assim que possível (checklist §5: reduzir superfície)."
  type        = string
  default     = "*"
}
