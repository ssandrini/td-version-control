resource "google_compute_instance" "gitea_instance" {
  name         = var.instance_name
  machine_type = var.machine_type
  tags         = ["masabra"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = var.network
    access_config {}
  }

  metadata_startup_script = <<-EOT
    #!/bin/bash
    sudo apt-get update
    sudo apt-get install -y docker.io
    gcloud auth configure-docker
    gcloud auth print-access-token | sudo docker login -u oauth2accesstoken --password-stdin https://${var.region}-docker.pkg.dev

    # Start a PostgreSQL container
    sudo docker run -d \
      --name gitea-db \
      -p 5432:5432 \
      -e POSTGRES_USER=gitea \
      -e POSTGRES_PASSWORD=${var.gitea_db_password} \
      -e POSTGRES_DB=gitea \
      -v /mnt/disks/gitea-db:/var/lib/postgresql/data \
      postgres:14

    # Wait for the database to initialize (BOCA)
    sleep 20

    # Start Gitea container and link it to the PostgreSQL database
    sudo docker run -d --name gitea \
      -p 80:${var.gitea_port} \
      -v /mnt/disks/gitea-data:/data \
      --link gitea-db:db \
      ${var.region}-docker.pkg.dev/${var.project_id}/${var.ar_repository_name}/mariana-gitea:latest
  EOT
}
