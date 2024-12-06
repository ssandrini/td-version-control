output "load_balancer_ip" {
  value = google_compute_global_forwarding_rule.gitea_forwarding_rule.ip_address
}
