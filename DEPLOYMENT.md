# Deployment Guide — Google Cloud Run

## Prerequisites
- Google Cloud account with billing enabled
- gcloud CLI installed: https://cloud.google.com/sdk/docs/install
- Docker Desktop installed

---

## 1. Initial GCP Setup

```bash
# Login and set your project
gcloud auth login
gcloud config set project hybrid-task-473204-g4

# Enable required APIs
gcloud services enable \
  spanner.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

---

## 2. Existing Cloud Spanner Instance & Database

The existing database is `hybrid-task-473204-g4/analytics-instance/global_analytics`
in `asia-south1` using GoogleSQL. Its inspected schema is recorded in
[`schema.sql`](./schema.sql). Do not create a replacement database or apply reference
DDL to the existing database.

Before deploying this version of the backend, apply the additive cancellation/status
history migration once from the repository root:

```bash
gcloud spanner databases ddl update global_analytics \
  --instance=analytics-instance \
  --project=hybrid-task-473204-g4 \
  --ddl-file=schema-cancellations.sql
```

The dashboard refreshes analytics every seven seconds while the browser tab is visible.
An optional `cancellation_reason` can be appended as the ninth column in an orders CSV.
Status changes made through the orders table require a reason when setting an order to
`CANCELLED`; they are recorded in `OrderStatusHistory`.

---

## 3. Backend Authentication

```bash
# Local development: authenticate with Application Default Credentials.
gcloud auth application-default login
```

Grant the ADC user `roles/spanner.databaseUser` on the project or database. Do not
create or download service-account keys. On Cloud Run, attach a service account with
the same role; Cloud Run uses its workload identity.

---

## 4. Create Artifact Registry Repository

```bash
gcloud artifacts repositories create analytics-repo \
  --repository-format=docker \
  --location=asia-south1 \
  --description="Analytics Docker images"

# Authenticate Docker to push images
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

---

## 5. Build & Deploy the Backend

```bash
cd backend

# Build and push Docker image
docker build -t asia-south1-docker.pkg.dev/hybrid-task-473204-g4/analytics-repo/backend:latest .
docker push asia-south1-docker.pkg.dev/hybrid-task-473204-g4/analytics-repo/backend:latest

# Deploy to Cloud Run
gcloud run deploy analytics-backend \
  --image=asia-south1-docker.pkg.dev/hybrid-task-473204-g4/analytics-repo/backend:latest \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --service-account=YOUR_RUNTIME_SERVICE_ACCOUNT \
  --set-env-vars="SPANNER_PROJECT_ID=hybrid-task-473204-g4,SPANNER_INSTANCE_ID=analytics-instance,SPANNER_DATABASE=global_analytics,CORS_ORIGINS=https://YOUR_FRONTEND_URL"

# Note the backend URL printed after deployment, e.g.:
# https://analytics-backend-xxxx-uc.a.run.app
```

---

## 6. Build & Deploy the Frontend

```bash
cd frontend

# Build image — pass the backend URL as a Vite build argument
docker build \
  --build-arg VITE_API_URL=https://analytics-backend-xxxx-uc.a.run.app \
  -t asia-south1-docker.pkg.dev/hybrid-task-473204-g4/analytics-repo/frontend:latest .

docker push asia-south1-docker.pkg.dev/hybrid-task-473204-g4/analytics-repo/frontend:latest

# Deploy to Cloud Run
gcloud run deploy analytics-frontend \
  --image=asia-south1-docker.pkg.dev/hybrid-task-473204-g4/analytics-repo/frontend:latest \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080
```

---

## 7. Local Development (without Docker)

### Backend
```bash
# Install the Google Cloud CLI if needed, then from Windows PowerShell authenticate
# with the Google account that has access to the Spanner database.
gcloud auth application-default login

# The Spanner project, instance, and database default to the supplied values.
$env:CORS_ORIGINS="http://localhost:3000,http://localhost:3001"

# Run Spring Boot from the backend directory
Set-Location C:\gcp\backend
mvn spring-boot:run
# Backend starts at http://localhost:8080
```

The Google account used for ADC must have permission to access the Spanner database
(for example, the `roles/spanner.databaseUser` role). No service-account key file is needed.

### Frontend
```bash
cd frontend
npm install
# Vite's dev-server proxy forwards /api calls to localhost:8080.
npm start
# Frontend starts at http://localhost:3000 (or 3001 if 3000 is occupied)
```

---

## 8. Test the APIs

```bash
# Health check
curl http://localhost:8080/api/analytics/kpi

# Upload customers CSV
curl -X POST http://localhost:8080/api/upload/customers \
  -F "file=@../sample-data/customers.csv"

# Upload products
curl -X POST http://localhost:8080/api/upload/products \
  -F "file=@../sample-data/products.csv"

# Upload orders
curl -X POST http://localhost:8080/api/upload/orders \
  -F "file=@../sample-data/orders.csv"

# Query with filters
curl "http://localhost:8080/api/analytics/kpi?startDate=2024-01-01&endDate=2024-12-31&status=COMPLETED"
curl "http://localhost:8080/api/analytics/monthly-sales?country=USA"
curl "http://localhost:8080/api/analytics/top-products"
curl "http://localhost:8080/api/analytics/country-sales"
curl "http://localhost:8080/api/analytics/orders?status=COMPLETED"
curl "http://localhost:8080/api/analytics/cancellations/monthly"
curl "http://localhost:8080/api/analytics/cancellations/reasons"
curl "http://localhost:8080/api/analytics/orders/1/status-history"
```

---

## Architecture Summary

```
Browser (React + Tailwind)
        |
        | HTTPS
        v
Cloud Run — Frontend (Nginx serving React build)
        |
        | REST API calls (/api/*)
        v
Cloud Run — Backend (Spring Boot JAR)
        |
        | Google Cloud Spanner client library
        v
Cloud Spanner (analytics-instance/analytics database)
        |
        | Tables: customers, products, orders (interleaved)
```
