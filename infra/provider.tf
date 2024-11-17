provider "google" {
  # credentials = file("<PATH_TO_SERVICE_ACCOUNT_JSON>") # TODO: Check if this should be implemented or is it preferable to have an account linked.
  project = var.project_id
  region  = var.region
  zone    = var.zone
}
