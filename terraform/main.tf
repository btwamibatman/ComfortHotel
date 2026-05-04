terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

locals {
  instance_tags = ["comforthotel-vm"]
}

resource "google_compute_address" "static_ip" {
  name   = "${var.vm_name}-ip"
  region = var.region
}

resource "google_compute_network" "network" {
  name                    = "${var.vm_name}-network"
  auto_create_subnetworks = true
}

resource "google_compute_firewall" "allow_public_web" {
  name          = "${var.vm_name}-allow-public-web"
  network       = google_compute_network.network.name
  direction     = "INGRESS"
  source_ranges = var.public_source_ranges
  target_tags   = local.instance_tags

  allow {
    protocol = "tcp"
    ports    = ["80", "3001"]
  }
}

resource "google_compute_firewall" "allow_admin_access" {
  name          = "${var.vm_name}-allow-admin-access"
  network       = google_compute_network.network.name
  direction     = "INGRESS"
  source_ranges = var.admin_source_ranges
  target_tags   = local.instance_tags

  allow {
    protocol = "tcp"
    ports    = ["22", "9090"]
  }
}

resource "google_compute_instance" "vm" {
  name         = var.vm_name
  machine_type = var.machine_type
  zone         = var.zone
  tags         = local.instance_tags

  boot_disk {
    auto_delete = false

    initialize_params {
      image = var.image
      size  = var.boot_disk_size_gb
      type  = var.boot_disk_type
    }
  }

  network_interface {
    network = google_compute_network.network.self_link

    access_config {
      nat_ip = google_compute_address.static_ip.address
    }
  }

  metadata = {
    ssh-keys       = "${var.admin_username}:${file(pathexpand(var.ssh_public_key_path))}"
    startup-script = templatefile("${path.module}/startup.sh", { admin_username = var.admin_username })
  }
}
