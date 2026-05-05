project_id          = "project-13c4c153-d486-46fd-823"
region              = "us-central1"
zone                = "us-central1-a"
vm_name             = "comforthotel-vm"
machine_type        = "e2-medium"
boot_disk_type      = "pd-standard"
admin_username      = "gcpuser"
ssh_public_key_path = "~/.ssh/id_rsa.pub"

public_source_ranges = ["0.0.0.0/0"]

# Replace with your public admin IP before applying, for example ["203.0.113.10/32"].
admin_source_ranges = ["203.0.113.10/32"]
