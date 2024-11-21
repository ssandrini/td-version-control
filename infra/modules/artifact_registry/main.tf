resource "google_artifact_registry_repository" "masabra_ar_repository" {
  location      = var.registry_region
  repository_id = var.repository_id
  description   = var.description
  format        = var.format

  docker_config {
    immutable_tags = false
  }
}

# Images will be stored in "${var.registry_region}-docker.pkg.dev/${var.project_id}/${output.ar_repository_name}/hidden-layer"
