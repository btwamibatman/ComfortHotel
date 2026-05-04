project_id          = "your-gcp-project-id"
region              = "us-central1"
zone                = "us-central1-a"
vm_name             = "comforthotel-vm"
machine_type        = "e2-micro"
boot_disk_type      = "pd-standard"
admin_username      = "gcpuser"
ssh_public_key_path = "~/.ssh/id_rsa.pub"

public_source_ranges = ["0.0.0.0/0"]

# Replace with your public admin IP before applying, for example ["203.0.113.10/32"].
admin_source_ranges = ["203.0.113.10/32"]
