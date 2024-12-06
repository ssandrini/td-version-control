resource "google_compute_health_check" "gitea_health_check" {
  name = "gitea-health-check"
  http_health_check {
    port = "80"
  }
}

resource "google_compute_backend_service" "gitea_backend" {
  name          = "gitea-backend"
  health_checks = [google_compute_health_check.gitea_health_check.self_link]
}

resource "google_compute_url_map" "gitea_url_map" {
  name            = "gitea-url-map"
  default_service = google_compute_backend_service.gitea_backend.self_link
}

resource "google_compute_target_http_proxy" "gitea_http_proxy" {
  name    = "gitea-http-proxy"
  url_map = google_compute_url_map.gitea_url_map.self_link
}

resource "google_compute_global_forwarding_rule" "gitea_forwarding_rule" {
  name       = "gitea-forwarding-rule"
  port_range = "80"
  target     = google_compute_target_http_proxy.gitea_http_proxy.self_link
}
