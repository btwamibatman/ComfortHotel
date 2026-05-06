# ComfortHotel Commands: GCP Terraform + Ubuntu Server + Docker Compose

Этот файл - пошаговая шпаргалка команд для запуска проекта с нуля через Google Cloud VM, созданную Terraform.

## 0. Где выполнять команды

Команды ниже разделены по месту выполнения:

- **Local console** - твой компьютер, где лежит проект и установлен Terraform/GCloud.
- **Ubuntu server** - VM в Google Cloud, куда заходишь по SSH.

## 1. Local Console: проверить инструменты

terraform version
gcloud version
ssh -V
git --version

Если SSH key еще не создан:


ssh-keygen -t rsa -b 4096 -C "gcpuser@comforthotel"


По умолчанию Terraform берет публичный ключ отсюда:
~/.ssh/id_rsa.pub


## 2. Local Console: авторизация в Google Cloud

gcloud auth login
gcloud auth application-default login

Выбрать нужный проект:
gcloud config set project project-13c4c153-d486-46fd-823


Проверить активный проект:

gcloud config get-value project


Включить Compute Engine API:

gcloud services enable compute.googleapis.com

## 3. Local Console: узнать свой публичный IP

Этот IP нужен для `admin_source_ranges`, чтобы SSH и Prometheus не были открыты всему интернету.

curl ifconfig.me

Пример результата:

203.0.113.10


В `terraform/terraform.tfvars` нужно поставить:

admin_source_ranges = ["203.0.113.10/32"]

## 4. Local Console: настроить Terraform variables

Открыть файл:
notepad terraform\terraform.tfvars


Проверить основные значения:

```hcl
project_id          = "project-13c4c153-d486-46fd-823"
region              = "us-central1"
zone                = "us-central1-a"
vm_name             = "comforthotel-vm"
machine_type        = "e2-medium"
admin_username      = "gcpuser"
ssh_public_key_path = "~/.ssh/id_rsa.pub"
public_source_ranges = ["0.0.0.0/0"]
admin_source_ranges  = ["YOUR_PUBLIC_IP/32"]
```

## 5. Local Console: создать VM через Terraform

Перейти в Terraform folder:

cd terraform

Инициализировать Terraform:

terraform init

Проверить конфигурацию:
terraform validate

Посмотреть план:
terraform plan

Создать инфраструктуру:

terraform apply


Показать outputs:

terraform output


Отдельно получить public IP:

terraform output -raw public_ip_address

Отдельно получить SSH command:

terraform output -raw ssh_command

Вернуться в root проекта:


cd ..


## 6. Local Console: зайти на Ubuntu server

Вариант 1 - через Terraform output:

```powershell
cd terraform
terraform output -raw ssh_command
```

Скопировать команду, например:

```powershell
ssh gcpuser@34.123.45.67
```

Вариант 2 - вручную:

```powershell
ssh gcpuser@<PUBLIC_IP>
```

Если SSH спрашивает `Are you sure you want to continue connecting`, написать:

```text
yes
```

После входа ты уже находишься внутри Ubuntu server.

## 7. Ubuntu Server: проверить, что Docker установлен startup script

Terraform запускает `terraform/startup.sh`, он устанавливает Docker и Docker Compose plugin.

```bash
docker --version
docker compose version
sudo systemctl status docker --no-pager
```

Если Docker пишет permission denied, перелогиниться:

```bash
exit
```

Потом снова зайти:

```powershell
ssh gcpuser@<PUBLIC_IP>
```

И проверить:

```bash
docker ps
```

## 8. Ubuntu Server: загрузить проект на сервер

Если проект есть в GitHub:

```bash
git clone <YOUR_REPOSITORY_URL> ComfortHotel
cd ComfortHotel
```

Если проекта нет в GitHub, загрузи его с local console через `scp`.

С local console:

```powershell
scp -r "C:\Users\Hamza\OneDrive\Desktop\Notes of Hamza\Programming\Projects\ComfortHotel\ComfortHotel" gcpuser@<PUBLIC_IP>:~/ComfortHotel
```

Потом зайти на сервер:

```powershell
ssh gcpuser@<PUBLIC_IP>
```

И перейти в проект:

```bash
cd ~/ComfortHotel
```

## 9. Ubuntu Server: создать и заполнить `.env`

```bash
cp .env.template .env
nano .env
```

Минимально нужно заполнить:

```env
DB_PASSWORD=your_strong_password
SESSION_SECRET=your_long_random_secret

ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
ADMIN_EMAIL=admin@example.com
ADMIN_FULL_NAME=Administrator

MANAGER_USERNAME=manager
MANAGER_PASSWORD=your_manager_password
MANAGER_EMAIL=manager@example.com
MANAGER_FULL_NAME=Hotel Manager

SLACK_WEBHOOK_URL=your_slack_webhook
SLACK_CHANNEL="#alerts"
SMTP_SMARTHOST=smtp.example.com:587
SMTP_FROM=alerts@example.com
SMTP_AUTH_USERNAME=alerts@example.com
SMTP_AUTH_PASSWORD=your_smtp_password
ALERT_EMAIL_TO=admin@example.com
```

Важно: в текущем `docker-compose.yml` `alertmanager` требует Slack и SMTP variables. Если они пустые, compose не поднимет `alertmanager`.

Сохранить в nano:

```text
Ctrl+O
Enter
Ctrl+X
```

## 10. Ubuntu Server: запустить весь проект

```bash
docker compose up --build -d
```

Посмотреть containers:

```bash
docker compose ps
```

Посмотреть logs всех сервисов:

```bash
docker compose logs --tail=100
```

Посмотреть logs конкретного сервиса:

```bash
docker logs comforthotel-order-service --tail 100
docker logs comforthotel-product-service --tail 100
docker logs comforthotel-auth-service --tail 100
docker logs comforthotel-chat-service --tail 100
docker logs comforthotel-gateway --tail 100
```

## 11. Local Browser: открыть сервисы

Получить URLs:

cd terraform
terraform output


Открыть:

http://<PUBLIC_IP>
http://<PUBLIC_IP>:3001
http://<PUBLIC_IP>:9090


Назначение:

- `http://<PUBLIC_IP>` - ComfortHotel web app.
- `http://<PUBLIC_IP>:3001` - Grafana.
- `http://<PUBLIC_IP>:9090` - Prometheus.

## 12. Ubuntu Server: проверить health endpoints

Через gateway:

```bash
curl -i http://localhost/nginx-health
curl -i http://localhost/
curl -i http://localhost/api/rooms
```

Внутри Docker network:

```bash
docker compose exec app node -e "fetch('http://product-service:3000/health').then(r=>r.text()).then(console.log)"
docker compose exec app node -e "fetch('http://order-service:3000/health').then(r=>r.text()).then(console.log)"
docker compose exec app node -e "fetch('http://chat-service:3000/health').then(r=>r.text()).then(console.log)"
docker compose exec app node -e "fetch('http://auth-service:3000/health').then(r=>r.text()).then(console.log)"
```

## 13. Ubuntu Server: проверить Prometheus metrics

Application metrics:

```bash
curl http://localhost:9090/api/v1/targets
```

Service metrics внутри Docker network:

```bash
docker compose exec app node -e "fetch('http://product-service:3000/metrics').then(r=>r.text()).then(t=>console.log(t.slice(0,500)))"
docker compose exec app node -e "fetch('http://order-service:3000/metrics').then(r=>r.text()).then(t=>console.log(t.slice(0,500)))"
```

Docker restart metrics:

```bash
docker compose exec app node -e "fetch('http://docker-metrics-exporter:9100/metrics').then(r=>r.text()).then(console.log)"
```

## 14. Ubuntu Server: monitoring stack commands

Prometheus:

```bash
docker logs comforthotel-prometheus --tail 100
```

Grafana:

```bash
docker logs comforthotel-grafana --tail 100
```

Alertmanager:

```bash
docker logs comforthotel-alertmanager --tail 100
```

cAdvisor:

```bash
docker logs comforthotel-cadvisor --tail 100
```

Docker metrics exporter:

```bash
docker logs comforthotel-docker-metrics-exporter --tail 100
```

## 15. Local Console: запустить pre-deploy check

Этот скрипт проверяет `.env` перед deploy.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\pre-deploy.ps1
```

## 16. Local Console: запустить smoke test

После запуска приложения:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\smoke-test.ps1 -BaseUrl http://<PUBLIC_IP> -PrometheusUrl http://<PUBLIC_IP>:9090 -GrafanaUrl http://<PUBLIC_IP>:3001
```

Если запускаешь локально через `localhost`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\smoke-test.ps1
```

## 17. Local Console: нагрузочный тест

Для генерации RPS и CPU нагрузки:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\load-simulation.ps1 -BaseUrl http://<PUBLIC_IP> -ConcurrentUsers 10 -RequestsPerUser 20
```

Без CPU stress:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\load-simulation.ps1 -BaseUrl http://<PUBLIC_IP> -ConcurrentUsers 5 -RequestsPerUser 10 -SkipCpuStress
```

## 18. Local Console: автоматическая проверка Docker logs

Если Docker containers запущены на local машине:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\inspect-container-logs.ps1
```

Если нужно проверить logs на Ubuntu server, проще выполнить аналогичные Docker commands прямо на сервере:

```bash
docker compose ps
docker compose logs --tail=300
docker inspect --format '{{.State.Status}} {{.State.Health.Status}} {{.RestartCount}}' comforthotel-order-service
```

## 19. Ubuntu Server: incident simulation для order-service

Этот override ломает `DATABASE_URL` у `order-service`, чтобы проверить failure detection.

Запустить incident:

```bash
docker compose -f docker-compose.yml -f docker-compose.incident.yml up -d order-service
```

Проверить, что `order-service` падает:

```bash
docker compose ps order-service
docker logs comforthotel-order-service --tail 100
```

Проверить alert в Prometheus:

```text
http://<PUBLIC_IP>:9090/alerts
```

Восстановить нормальный `order-service`:

```bash
docker compose up -d order-service
```

Проверить восстановление:

```bash
docker compose ps order-service
curl -i http://localhost/api/rooms
```

## 20. Ubuntu Server: restart и rebuild отдельных сервисов

Перезапустить один сервис:

```bash
docker compose restart order-service
```

Пересобрать и поднять один сервис:

```bash
docker compose up --build -d order-service
```

Остановить один сервис:

```bash
docker compose stop order-service
```

Поднять один сервис:

```bash
docker compose up -d order-service
```

## 21. Ubuntu Server: остановить весь проект

Остановить containers:

```bash
docker compose down
```

Остановить containers и удалить volumes с базами данных:

```bash
docker compose down -v
```

Важно: `docker compose down -v` удаляет PostgreSQL data volumes.

## 22. Local Console: удалить Google Cloud инфраструктуру

Когда сервер больше не нужен:

```powershell
cd terraform
terraform destroy
```

Проверить, что ресурсов больше нет:

```powershell
gcloud compute instances list
gcloud compute addresses list
```

