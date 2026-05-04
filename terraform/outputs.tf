output "public_ip_address" {
  description = "Static public IP address assigned to the Compute Engine VM"
  value       = google_compute_address.static_ip.address
}

output "ssh_command" {
  description = "SSH command for connecting to the VM"
  value       = "ssh ${var.admin_username}@${google_compute_address.static_ip.address}"
}

output "application_url" {
  description = "ComfortHotel web application URL"
  value       = "http://${google_compute_address.static_ip.address}"
}

output "grafana_url" {
  description = "Grafana URL"
  value       = "http://${google_compute_address.static_ip.address}:3001"
}

output "prometheus_url" {
  description = "Prometheus URL"
  value       = "http://${google_compute_address.static_ip.address}:9090"
}
