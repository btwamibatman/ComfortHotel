variable "project_id" {
  description = "Google Cloud project ID where resources will be created"
  type        = string
}

variable "region" {
  description = "Google Cloud region for regional provider settings"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Google Cloud zone for the VM instance"
  type        = string
  default     = "us-central1-a"
}

variable "vm_name" {
  description = "Name of the Compute Engine VM"
  type        = string
  default     = "comforthotel-vm"
}

variable "machine_type" {
  description = "Compute Engine machine type. e2-micro is used to stay within the GCP Always Free VM shape in eligible regions."
  type        = string
  default     = "e2-micro"
}

variable "image" {
  description = "Boot disk image for the VM"
  type        = string
  default     = "projects/ubuntu-os-cloud/global/images/family/ubuntu-2204-lts"
}

variable "boot_disk_size_gb" {
  description = "Boot disk size in GB"
  type        = number
  default     = 30
}

variable "boot_disk_type" {
  description = "Boot disk type. pd-standard is used for the GCP Always Free persistent disk class."
  type        = string
  default     = "pd-standard"
}

variable "admin_username" {
  description = "Admin username for SSH access to the VM"
  type        = string
  default     = "gcpuser"
}

variable "ssh_public_key_path" {
  description = "Path to the SSH public key for VM authentication"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "public_source_ranges" {
  description = "CIDR ranges allowed to reach public web ports 80 and 3001. Port 3001 is used because docker-compose.yml maps Grafana as 3001:3000."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "admin_source_ranges" {
  description = "CIDR ranges allowed to reach SSH and Prometheus. Replace this with your admin IP range before applying."
  type        = list(string)
}
