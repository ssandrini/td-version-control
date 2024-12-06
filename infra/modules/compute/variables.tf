variable "instance_name" {}
variable "machine_type" {}
variable "disk_size" {}
variable "gitea_port" {}
variable "network" {}
variable "region" {}
variable "project_id" {}
variable "ar_repository_name" {}

variable "gitea_db_password" {
  description = "Password for the Gitea PostgreSQL database"
}
