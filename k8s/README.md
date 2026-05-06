# Kubernetes Auto-Scaling Example

This folder contains the Kubernetes next-step implementation for auto-scaling `order-service`.

## What It Implements

- `Deployment` for `order-service`
- internal Kubernetes `Service` for `order-service`
- `HorizontalPodAutoscaler` named `order-service-hpa`
- CPU-based scaling from `2` to `6` replicas when average CPU utilization exceeds `70%`

## Requirements

- Kubernetes cluster
- `kubectl` configured
- `metrics-server` installed
- `postgres-order` and `product-service` available inside the cluster
- `comforthotel-order-service:local` image available to cluster nodes

## Apply

Create the database password secret from your local value:

```powershell
kubectl create namespace comforthotel
kubectl create secret generic comforthotel-db-secret --namespace comforthotel --from-literal=DB_PASSWORD="YOUR_DB_PASSWORD"
```

Apply the deployment, service, and HPA:

```powershell
kubectl apply -f k8s\order-service-hpa.yml
```

Check status:

```powershell
kubectl get deploy,svc,hpa,pods -n comforthotel
kubectl describe hpa order-service-hpa -n comforthotel
```

## Evidence Screenshot

Capture:

- `kubectl get hpa -n comforthotel`
- `kubectl describe hpa order-service-hpa -n comforthotel`
- `kubectl get pods -n comforthotel`

This proves that Kubernetes HPA is configured for automatic scaling.
