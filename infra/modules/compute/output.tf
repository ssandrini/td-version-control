output "instance_ip" {
  value = google_compute_instance.gitea_instance.network_interface[0].access_config[0].nat_ip
}

output "instance_self_link" {
  value = google_compute_instance.gitea_instance.self_link
}
