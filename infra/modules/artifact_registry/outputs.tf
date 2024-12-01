output "ar_repository_name" {
  value = google_artifact_registry_repository.masabra_ar_repository.repository_id
  description = "The repository name"
}
