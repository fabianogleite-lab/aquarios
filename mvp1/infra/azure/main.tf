terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "location" {
  default = "brazilsouth"
}

resource "azurerm_resource_group" "aquarios" {
  name     = "rg-aquarios-hygeios"
  location = var.location
}

# PostgreSQL Flexible Server
# DB: Supabase (não Azure PostgreSQL — pgvector não habilitado no Azure)
# Connection: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (env vars no Container App)

# Container App Environment
resource "azurerm_container_app_environment" "hygeios" {
  name                       = "aquarios-env"
  location                   = var.location
  resource_group_name        = azurerm_resource_group.aquarios.name
}

# Container App (FastAPI)
resource "azurerm_container_app" "hygeios_api" {
  name                         = "aquarios-hygeios-api"
  container_app_environment_id = azurerm_container_app_environment.hygeios.id
  resource_group_name          = azurerm_resource_group.aquarios.name
  revision_mode                = "Single"

  template {
    container {
      name   = "hygeios-api"
      image  = "ghcr.io/fabianogleite-lab/aquarios:latest"  # TODO: build and push
      cpu    = 1.0
      memory = "2Gi"

      env {
        name  = "SUPABASE_URL"
        value = "https://agebsmjsjrmazbozphnh.supabase.co"
      }
      env {
        name  = "SUPABASE_SERVICE_ROLE_KEY"
        value = "TODO_SET_THIS_IN_PORTAL"  # Set via Azure Portal
      }
      env {
        name  = "PORT"
        value = "8000"
      }
    }
  }

  ingress {
    allow_insecure_connections = false
    external_enabled           = true
    target_port                = 8000
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }
}

output "db_info" {
  value = "Usar Supabase (agebsmjsjrmazbozphnh) — vars no Container App env"
}

output "app_url" {
  value = azurerm_container_app.hygeios_api.ingress[0].fqdn
}
