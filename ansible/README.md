# ComfortHotel Ansible

These playbooks automate a Terraform-created Ubuntu VM:

- install Docker Engine and the Docker Compose plugin;
- install base packages used for deployment and troubleshooting;
- copy or clone the ComfortHotel deployment files;
- render `.env`;
- run `docker compose up --build -d`.

## Inventory

Copy the Terraform output IP into the inventory:

```bash
cp ansible/inventory.example.ini ansible/inventory.ini
```

Edit `ansible/inventory.ini`:

```ini
[comforthotel]
comforthotel-vm ansible_host=<terraform public_ip_address> ansible_user=gcpuser
```

## Variables

Edit `ansible/group_vars/all.yml` before running in a real environment. Replace all `change_me_*` values and notification placeholders.

By default, `deploy-compose.yml` copies the local project files needed by `docker-compose.yml` to `/opt/comforthotel`.

If you prefer deployment from Git, set:

```yaml
repo_url: "https://github.com/YOUR_ORG/YOUR_REPO.git"
repo_version: main
```

If you only need to override the compose file from a raw URL, set:

```yaml
compose_file_url: "https://raw.githubusercontent.com/YOUR_ORG/YOUR_REPO/main/docker-compose.yml"
```

## Run

From the repository root:

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbooks/site.yml
```

Run only Docker setup:

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbooks/install-docker.yml
```

Run only deployment:

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbooks/deploy-compose.yml
```
