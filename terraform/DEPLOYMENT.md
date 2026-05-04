# ComfortHotel GCP Infrastructure Deployment

This document describes how to provision the required Google Cloud infrastructure for the ComfortHotel application using Terraform.

## Prerequisites

- Terraform CLI installed.
- Google Cloud CLI installed.
- A Google Cloud project with billing enabled.
- Compute Engine API enabled.
- SSH key pair generated, for example `~/.ssh/id_rsa` and `~/.ssh/id_rsa.pub`.
- Authenticated Google Cloud session:
  ```bash
  gcloud auth application-default login
  ```

## Infrastructure Architecture

Terraform provisions:

1. Compute Engine VM running Ubuntu 22.04 LTS.
2. VPC network using `google_compute_network`.
3. Firewall rules using `google_compute_firewall`.
4. Static public IP using `google_compute_address`.
5. Startup script that installs Docker and the Docker Compose plugin.

Open inbound TCP ports:

- `80` - ComfortHotel web entrypoint through Nginx gateway, public.
- `3001` - Grafana, public. This matches `docker-compose.yml` where Grafana is mapped as `3001:3000`.
- `22` - SSH access, restricted by `admin_source_ranges`.
- `9090` - Prometheus, restricted by `admin_source_ranges`.

## Configuration

Update `terraform.tfvars` before applying:

```hcl
project_id          = "your-gcp-project-id"
region              = "us-central1"
zone                = "us-central1-a"
vm_name             = "comforthotel-vm"
machine_type        = "e2-micro"
boot_disk_type      = "pd-standard"
admin_username      = "gcpuser"
ssh_public_key_path = "~/.ssh/id_rsa.pub"
public_source_ranges = ["0.0.0.0/0"]
admin_source_ranges  = ["203.0.113.10/32"]
```

The defaults are intentionally conservative for GCP Always Free eligibility:

- `machine_type = "e2-micro"`
- `boot_disk_type = "pd-standard"`
- `boot_disk_size_gb = 30`
- `region = "us-central1"` and `zone = "us-central1-a"`

Always Free eligibility depends on current Google Cloud billing rules and region availability. Check your billing page before applying.

Replace `admin_source_ranges` with your public admin IP range before applying. Avoid leaving SSH and Prometheus open to the internet.

You can get your current public IP with:

```bash
curl ifconfig.me
```

## Deployment Steps

1. Initialize Terraform:
   ```bash
   terraform init
   ```

2. Validate configuration:
   ```bash
   terraform validate
   ```

3. Review the deployment plan:
   ```bash
   terraform plan
   ```

4. Apply the configuration:
   ```bash
   terraform apply
   ```

5. Use the outputs:
   ```bash
   terraform output
   ```

## Post-Deployment

Connect to the server:

```bash
ssh gcpuser@<public_ip_address>
```

The startup script installs Docker. After connecting, clone the repository, configure `.env`, and run:

```bash
docker compose up --build -d
```
