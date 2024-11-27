resource "google_compute_health_check" "gitea_health_check" {
    name = "gitea-health-check"
    http_health_check {
        port = "80"
    }
}

resource "google_compute_managed_ssl_certificate" "gitea_ssl" {
    name = "gitea-ssl-certificate"
    managed {
        domains = ["mariana-api.com.ar"]
    }
}

resource "google_compute_backend_service" "gitea_backend" {
    name          = "gitea-backend"
    health_checks = [google_compute_health_check.gitea_health_check.self_link]

    backend {
        group = google_compute_instance_group.gitea_instance_group.self_link
    }
}


resource "google_compute_instance_group" "gitea_instance_group" {
    name        = "gitea-instance-group"
    zone        = var.zone
    instances   = [var.backend_service]
    named_port {
        name = "http"
        port = 80
    }
    network = var.network_id
}

resource "google_compute_url_map" "gitea_url_map" {
    name            = "gitea-url-map"
    default_service = google_compute_backend_service.gitea_backend.self_link
}

resource "google_compute_target_https_proxy" "gitea_https_proxy" {
    name             = "gitea-https-proxy"
    url_map          = google_compute_url_map.gitea_url_map.self_link
    ssl_certificates = [google_compute_managed_ssl_certificate.gitea_ssl.self_link]
}

resource "google_compute_global_address" "L7LB_IP_ADDRESS" {
    name                  = "l7lb-external-ip-address"
}

resource "google_compute_global_forwarding_rule" "gitea_forwarding_rule" {
    name       = "gitea-forwarding-rule"
    port_range = "443"
    target     = google_compute_target_https_proxy.gitea_https_proxy.self_link
    network = var.network_id
}

resource "google_compute_global_forwarding_rule" "external_fwd_rules_https" {
    name                  = "frontend-443"
    ip_address            = google_compute_global_address.L7LB_IP_ADDRESS.address
    port_range            = "443"
    target                = google_compute_target_https_proxy.gitea_https_proxy.self_link
    network = var.network_id
}
