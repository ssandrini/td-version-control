output "network_self_link" {
  value = google_compute_network.gitea_network.self_link
}

output "network_id" {
    value = google_compute_network.gitea_network.id
}
