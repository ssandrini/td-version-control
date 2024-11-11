terraform {
  required_version = ">= 1.9.8"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.23.0"
    }
  }
}
