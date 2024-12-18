module "network" {
  source       = "./modules/network"
  network_name = var.network_name
  subnet_name  = var.subnet_name
  region       = var.region
}

module "artifact_registry" {
  source = "./modules/artifact_registry"

  registry_region = var.region
  repository_id   = var.repository_id
  description     = var.description
  format          = var.format
}

module "compute" {
  source             = "./modules/compute"
  instance_name      = var.instance_name
  machine_type       = var.machine_type
  disk_size          = var.disk_size
  gitea_port         = var.gitea_port
  network            = module.network.network_self_link
  region             = var.region
  project_id         = var.project_id
  ar_repository_name = module.artifact_registry.ar_repository_name
  gitea_db_password  = var.gitea_db_password
}

module "load_balancer" {
  source          = "./modules/load_balancer"
  backend_service = module.compute.instance_self_link
  gitea_port      = var.gitea_port
}
