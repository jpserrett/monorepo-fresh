# Deployment Guide

This guide covers deploying the application to production (OpenShift/Kubernetes).

## Prerequisites

- OpenShift cluster access
- `oc` CLI tool installed
- Container registry access
- Database provisioned (PostgreSQL 16+)
- AWS S3 bucket (for Turborepo cache)

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Users / Browsers                │
└──────────────┬──────────────────────────┘
               │ HTTPS
               ↓
┌─────────────────────────────────────────┐
│      OpenShift Route (TLS Edge)         │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│         Web App Service                 │
│         (3 replicas)                    │
└───┬────────────────────────────────┬────┘
    │                                │
    ↓                                ↓
┌──────────┐                   ┌───────────┐
│ Database │                   │  Python   │
│PostgreSQL│                   │  Service  │
└──────────┘                   └───────────┘
```

## Step-by-Step Deployment

### 1. Setup Infrastructure

#### 1.1 Create Namespace

```bash
# Create namespace for your application
oc new-project my-monorepo-prod

# Or if it exists:
oc project my-monorepo-prod
```

#### 1.2 Create Secrets

```bash
# Database connection string
# TODO: Get this from your DBA or AWS RDS
DATABASE_URL="postgresql://produser:CHANGEME@db.company.internal:5432/proddb"

# Session secret (generate random)
SESSION_SECRET=$(openssl rand -base64 32)

# Create application secrets
oc create secret generic app-secrets \
  --from-literal=database-url="$DATABASE_URL" \
  --from-literal=session-secret="$SESSION_SECRET"

# AWS credentials for Turborepo cache
# TODO: Get these from AWS IAM
oc create secret generic turbo-cache-secrets \
  --from-literal=aws-access-key-id="YOUR_AWS_ACCESS_KEY" \
  --from-literal=aws-secret-access-key="YOUR_AWS_SECRET_KEY" \
  --from-literal=turbo-token=$(openssl rand -base64 32)

# Verify secrets were created
oc get secrets
```

#### 1.3 Configure Container Registry

```bash
# Login to your container registry
# TODO: Update with your registry URL
podman login registry.company.com

# Create pull secret for OpenShift
oc create secret docker-registry registry-secret \
  --docker-server=registry.company.com \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_PASSWORD \
  --docker-email=your.email@company.com

# Link secret to default service account
oc secrets link default registry-secret --for=pull
```

### 2. Deploy Turborepo Cache Server

```bash
# Apply cache server manifests
oc apply -f deploy/cache-server/

# Wait for deployment
oc rollout status deployment/turborepo-cache-server

# Get the cache server URL
oc get route turborepo-cache-route
# Note this URL - you'll need it for CI/CD
```

### 3. Build and Push Container Images

```bash
# Build web app image
podman build \
  -t registry.company.com/my-monorepo/web:v1.0.0 \
  -f apps/web/Dockerfile \
  .

# Build Python service image
podman build \
  -t registry.company.com/my-monorepo/python-service:v1.0.0 \
  -f apps/python-service/Dockerfile \
  apps/python-service

# Push images
podman push registry.company.com/my-monorepo/web:v1.0.0
podman push registry.company.com/my-monorepo/python-service:v1.0.0
```

### 4. Update Deployment Manifests

Edit the deployment files to use your images:

```bash
# Update deploy/web-app/deployment.yaml
# Change: image: YOUR-REGISTRY/my-monorepo/web:latest
# To:     image: registry.company.com/my-monorepo/web:v1.0.0

# Update deploy/python-service/deployment.yaml
# Change: image: YOUR-REGISTRY/my-monorepo/python-service:latest
# To:     image: registry.company.com/my-monorepo/python-service:v1.0.0
```

### 5. Run Database Migrations

```bash
# Option 1: Run migrations from your local machine
export DATABASE_URL="postgresql://produser:CHANGEME@db.company.internal:5432/proddb"
pnpm db:migrate

# Option 2: Run migrations from a pod
oc run db-migrate \
  --image=registry.company.com/my-monorepo/web:v1.0.0 \
  --env="DATABASE_URL=$DATABASE_URL" \
  --restart=Never \
  --command -- pnpm db:migrate

# Wait for completion
oc wait --for=condition=complete job/db-migrate --timeout=300s

# Check logs
oc logs job/db-migrate

# Clean up
oc delete job/db-migrate
```

### 6. Deploy Application

```bash
# Deploy Python service first
oc apply -f deploy/python-service/

# Wait for it to be ready
oc rollout status deployment/python-service

# Deploy web application
oc apply -f deploy/web-app/

# Wait for it to be ready
oc rollout status deployment/web-app

# Verify all pods are running
oc get pods
```

### 7. Configure GitLab CI/CD

Add these variables to your GitLab project (Settings > CI/CD > Variables):

| Variable | Value | Masked | Protected |
|----------|-------|--------|-----------|
| `TURBO_API` | https://turbo-cache.company.internal | No | No |
| `TURBO_TOKEN` | (from turbo-cache-secrets) | Yes | Yes |
| `TURBO_TEAM` | your-team-name | No | No |
| `DATABASE_URL` | postgresql://... | Yes | Yes |
| `REGISTRY_URL` | registry.company.com | No | No |
| `REGISTRY_USER` | your-username | No | Yes |
| `REGISTRY_PASSWORD` | your-password | Yes | Yes |
| `OPENSHIFT_SERVER` | https://api.openshift.company.com | No | Yes |
| `OPENSHIFT_TOKEN` | (service account token) | Yes | Yes |

### 8. Verify Deployment

```bash
# Check all resources
oc get all

# Check routes
oc get routes

# Get application URL
APP_URL=$(oc get route web-app-route -o jsonpath='{.spec.host}')
echo "Application URL: https://$APP_URL"

# Test health endpoints
curl -I https://$APP_URL/
curl https://$APP_URL/api/health

# Check logs
oc logs -f deployment/web-app
oc logs -f deployment/python-service
```

## Monitoring and Troubleshooting

### View Logs

```bash
# Web app logs
oc logs -f deployment/web-app

# Python service logs
oc logs -f deployment/python-service

# Cache server logs
oc logs -f deployment/turborepo-cache-server

# All logs (follow)
oc logs -f -l app=web-app
```

### Check Pod Status

```bash
# List all pods
oc get pods

# Describe pod (for errors)
oc describe pod POD_NAME

# Get events
oc get events --sort-by='.lastTimestamp'
```

### Access Pod Shell

```bash
# Web app
oc rsh deployment/web-app

# Python service
oc rsh deployment/python-service

# Once inside:
# - Check environment variables: env | grep DATABASE
# - Test database connection: psql $DATABASE_URL
# - Check file system: ls -la
```

### Scale Application

```bash
# Scale web app
oc scale deployment/web-app --replicas=5

# Scale Python service
oc scale deployment/python-service --replicas=3

# Check status
oc get pods
```

### Update Deployment

```bash
# Update image
oc set image deployment/web-app web=registry.company.com/my-monorepo/web:v1.0.1

# Rollout new version
oc rollout status deployment/web-app

# Check history
oc rollout history deployment/web-app

# Rollback if needed
oc rollout undo deployment/web-app
```

## Performance Tuning

### Resource Limits

Edit deployment to adjust resources:

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

### Autoscaling

Horizontal Pod Autoscaler (HPA) is already configured. Adjust if needed:

```bash
# Edit HPA
oc edit hpa web-app-hpa

# Check autoscaling status
oc get hpa
```

## Security Checklist

- [ ] All secrets are created and never committed to Git
- [ ] Database uses strong passwords
- [ ] TLS is enabled on all routes
- [ ] Container images run as non-root user
- [ ] Network policies are configured (if needed)
- [ ] Resource limits are set
- [ ] Health checks are configured
- [ ] Secrets are rotated regularly

## Rollback Procedure

If something goes wrong:

```bash
# 1. Rollback deployment
oc rollout undo deployment/web-app
oc rollout undo deployment/python-service

# 2. Check status
oc rollout status deployment/web-app

# 3. Verify application works
curl https://app.company.com/health

# 4. If database migration was the issue, restore from backup
# (Contact DBA)
```

## Common Issues

### Issue: Pods are CrashLooping

```bash
# Check logs
oc logs POD_NAME

# Common causes:
# - Database connection failed (check DATABASE_URL)
# - Missing environment variables
# - Application error at startup
```

### Issue: Can't pull image

```bash
# Check image pull secret
oc get secrets

# Verify registry credentials
oc describe secret registry-secret

# Re-create if needed
oc delete secret registry-secret
oc create secret docker-registry registry-secret ...
```

### Issue: Database connection timeout

```bash
# Test database connection from pod
oc rsh deployment/web-app
psql $DATABASE_URL

# Check if database is accessible from OpenShift
# May need to configure network policies or firewall rules
```

## Maintenance

### Backup Database

```bash
# Run backup (example)
oc run pg-backup \
  --image=postgres:16 \
  --env="DATABASE_URL=$DATABASE_URL" \
  --restart=Never \
  --command -- pg_dump $DATABASE_URL > backup.sql

# Copy backup out
oc cp pg-backup:/backup.sql ./backup-$(date +%Y%m%d).sql
```

### Update Dependencies

```bash
# Update Node.js packages
pnpm update

# Update Python packages
pip list --outdated
pip install --upgrade -r requirements.txt

# Rebuild and deploy
```

## Next Steps

- Set up monitoring (Prometheus/Grafana)
- Configure log aggregation (ELK stack)
- Set up alerts
- Configure backup strategy
- Document runbooks for common issues

## Support

For deployment issues:
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Contact DevOps team
- Open ticket in #infrastructure Slack channel
