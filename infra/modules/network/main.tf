resource "google_compute_network" "gitea_network" {
  name = var.network_name
}

resource "google_compute_subnetwork" "gitea_subnet" {
  name          = var.subnet_name
  region        = var.region
  network       = google_compute_network.gitea_network.self_link
  ip_cidr_range = "10.0.0.0/16"
}

resource "google_compute_firewall" "allow_http_https" {
  name        = "allow-http-https"
  network     = google_compute_network.gitea_network.name
  source_tags = ["masabra"]

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_firewall" "allow_ssh" {
  name    = "allow-ssh"
  network = google_compute_network.gitea_network.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"] # TODO: Clean this up.
  target_tags   = ["masabra"]
}
