output "vm_public_ip" {
  description = "IP público (Static) da VM da fronteira."
  value       = azurerm_public_ip.pip.ip_address
}

output "ssh_command" {
  description = "Comando de acesso."
  value       = "ssh ${var.admin_username}@${azurerm_public_ip.pip.ip_address}"
}

output "storage_account" {
  description = "Storage account dos backups GaiOS (blob 5GB free)."
  value       = azurerm_storage_account.sa.name
}

output "data_disk" {
  description = "Disco P6 de dados (montar em /data — ver README)."
  value       = azurerm_managed_disk.data.name
}
