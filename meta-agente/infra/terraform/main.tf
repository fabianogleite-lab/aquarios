terraform {
  required_providers { azurerm = { source = "hashicorp/azurerm" version = "~>3.0" } }
}
provider "azurerm" { features {} }

resource "azurerm_resource_group" "rg" {
  name = "rg-aquarios-free"
  location = var.location
}

resource "azurerm_container_registry" "acr" {
  name = "acraquarios${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location = azurerm_resource_group.rg.location
  sku = "Standard" # 100GB gratuito 12 meses
  admin_enabled = true
}

resource "azurerm_storage_account" "sa" {
  name = "staquarios${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location = azurerm_resource_group.rg.location
  account_tier = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_share" "files" {
  name = "files-free-100gb"
  storage_account_name = azurerm_storage_account.sa.name
  quota = 100
}

resource "azurerm_postgresql_flexible_server" "pg" {
  name = "pg-aquarios-b1ms"
  resource_group_name = azurerm_resource_group.rg.name
  location = azurerm_resource_group.rg.location
  version = "14"
  administrator_login = "pgadmin"
  administrator_password = var.db_password
  sku_name = "B_Standard_B1ms" # 750h/mês grátis
  storage_mb = 32768
}

resource "random_string" "suffix" { length = 6 special = false upper = false }
