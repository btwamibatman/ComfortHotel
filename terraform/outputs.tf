output "public_ip_address" {
  description = "The public IP address of the deployed virtual machine. Use this to access the application via HTTP and SSH."
  value       = azurerm_linux_virtual_machine.vm.public_ip_address
}