output "gitea_instance_ip" {
  value = module.compute.instance_ip
}

output "load_balancer_ip" {
  value = module.load_balancer.load_balancer_ip
}
