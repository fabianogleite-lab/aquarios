output "acr_name" { value = azurerm_container_registry.acr.name }
output "storage_account" { value = azurerm_storage_account.sa.name }
output "postgres_fqdn" { value = azurerm_postgresql_flexible_server.pg.fqdn }
