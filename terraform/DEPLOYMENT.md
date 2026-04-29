# ComfortHotel Infrastructure Deployment

This document describes how to provision the required infrastructure for the ComfortHotel application using Terraform. The deployment configures an Azure Ubuntu Virtual Machine with necessary networking and security groups.

## Prerequisites

- **Terraform** CLI installed (v1.0+)
- **Azure CLI** installed (`az login` completed)
- **SSH Key Pair** generated (`~/.ssh/id_rsa` and `~/.ssh/id_rsa.pub`)

## Infrastructure Architecture

The Terraform configuration provisions:
1. Virtual Machine (Ubuntu 22.04 LTS).
2. Dynamic Public IP.
3. Network Security Group (NSG) with the following open ports:
   - `80` (HTTP) - Main web entrypoint (Nginx Gateway)
   - `3000` (Grafana) - Metrics visualization
   - `9090` (Prometheus) - Metrics scraping and alerting
   - `22` (SSH) - Administrator access

> **Note on Grafana Port:** 
> In `docker-compose.yml`, Grafana might currently be mapped to the host on port `3001` (`3001:3000`). If you wish to access Grafana remotely directly via port `3000`, ensure that `docker-compose.yml` maps Grafana to `3000:3000`. 

## Deployment Steps

1. **Initialize Terraform:**
   Initializes the working directory containing Terraform configuration files.
   ```bash
   terraform init
   ```

2. **Review Deployment Plan:**
   Creates an execution plan, letting you preview the changes that Terraform plans to make to your infrastructure.
   ```bash
   terraform plan
   ```

3. **Apply Configuration:**
   Executes the actions proposed in a Terraform plan.
   ```bash
   terraform apply
   ```
   *Type `yes` when prompted to confirm.*

4. **Verify Outputs:**
   After a successful apply, Terraform will print the public IP of the newly created server. 
   ```bash
   Outputs:
   public_ip_address = "203.0.113.50"
   ```

## Post-Deployment 

Once the infrastructure is up, connect to the server via SSH using the outputted IP address:
```bash
ssh azureuser@<public_ip_address>
```

You can then clone your GitHub repository and run `docker compose up -d` to launch the ComfortHotel application.