variable "project_id" {}
variable "region" {
  default = "us-central1"
}
variable "zone" {
  default = "us-central1-a"
}

variable "machine_type" {
  default = "e2-micro"
}
variable "instance_name" {
  default = "gitea-instance"
}
variable "disk_size" {
  default = 10
}
variable "network_name" {
  default = "gitea-network"
}
variable "subnet_name" {
  default = "gitea-subnet"
}
variable "gitea_port" {
  default = 3000
}
variable "gitea_admin_username" {}
variable "gitea_admin_password" {}

variable "gitea_db_password" {
  description = "Password for the Gitea PostgreSQL database"
}
