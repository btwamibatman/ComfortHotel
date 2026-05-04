project_id          = "project-13c4c153-d486-46fd-823"
region              = "us-central1"
zone                = "us-central1-a"
vm_name             = "comforthotel-vm"
machine_type        = "e2-micro"
boot_disk_type      = "pd-standard"
admin_username      = "gcpuser"
ssh_public_key_path = "~/.ssh/id_rsa.pub"

public_source_ranges = ["0.0.0.0/0"]

# Вы можете указать свой точный IP для безопасности, сейчас стоит доступ отовсюду (0.0.0.0/0)
admin_source_ranges = ["0.0.0.0/0"]
