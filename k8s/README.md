# ComfortHotel Kubernetes Deployment

This folder demonstrates a Kubernetes deployment for the ComfortHotel system.
It complements the Docker Compose and Docker Swarm deployment files.

## Manifests

- `00-namespace.yml` - `comforthotel` namespace.
- `01-configmaps.yml` - shared application config and database init SQL.
- `02-secrets.yml` - placeholder secrets. Replace values before real use.
- `03-postgres.yml` - PostgreSQL StatefulSets and Services for app, product, order, and chat databases.
- `04-microservices.yml` - Deployments and Services for `app`, `auth-service`, `product-service`, `order-service`, `payment-service`, and `chat-service`.
- `05-gateway.yml` - Nginx gateway Deployment and NodePort Service.
- `06-ingress.yml` - Public ingress route for `hotel.y-not-devs.com`.
- `order-service-hpa.yml` - CPU-based HPA for `order-service`.

The requirement explicitly mentions Nginx, Auth, Product, Order, and PostgreSQL.
This folder also includes the main EJS app and chat service because the gateway and public pages depend on them.

## Images

The manifests use local image tags:

- `comforthotel-app:local`
- `comforthotel-auth-service:local`
- `comforthotel-product-service:local`
- `comforthotel-order-service:local`
- `comforthotel-payment-service:local`
- `comforthotel-chat-service:local`
- `comforthotel-gateway:local`

For Minikube, build images inside the Minikube Docker daemon:

```bash
eval $(minikube docker-env)
docker build -t comforthotel-app:local services/main-app
docker build -t comforthotel-auth-service:local services/auth-service
docker build -t comforthotel-product-service:local services/product-service
docker build -t comforthotel-order-service:local services/order-service
docker build -t comforthotel-payment-service:local services/payment-service
docker build -t comforthotel-chat-service:local services/chat-service
docker build -t comforthotel-gateway:local -f Dockerfile.frontend .
```

On Windows PowerShell with Minikube:

```powershell
minikube docker-env | Invoke-Expression
docker build -t comforthotel-app:local services/main-app
docker build -t comforthotel-auth-service:local services/auth-service
docker build -t comforthotel-product-service:local services/product-service
docker build -t comforthotel-order-service:local services/order-service
docker build -t comforthotel-payment-service:local services/payment-service
docker build -t comforthotel-chat-service:local services/chat-service
docker build -t comforthotel-gateway:local -f Dockerfile.frontend .
```

## Configure Secrets

Before applying to a real cluster, edit `02-secrets.yml` and replace all `change_me_*` values.
Do not commit production secrets.

## Requirements

- Kubernetes cluster with `kubectl` configured.
- Default storage class for PostgreSQL PVCs.
- `metrics-server` installed if you want `order-service-hpa.yml` to scale from CPU metrics.

## Apply

```bash
kubectl apply -f k8s/00-namespace.yml
kubectl apply -f k8s/01-configmaps.yml
kubectl apply -f k8s/02-secrets.yml
kubectl apply -f k8s/03-postgres.yml
kubectl apply -f k8s/04-microservices.yml
kubectl apply -f k8s/05-gateway.yml
kubectl apply -f k8s/06-ingress.yml
kubectl apply -f k8s/order-service-hpa.yml
```

Check status:

```bash
kubectl get deploy,statefulset,svc,hpa,pods -n comforthotel
kubectl describe hpa order-service-hpa -n comforthotel
```

For Minikube, open the gateway:

```bash
minikube service gateway -n comforthotel
```

Or use the configured NodePort:

```bash
kubectl get nodes -o wide
kubectl get svc gateway -n comforthotel
```

The gateway service exposes HTTP on node port `30080`.
