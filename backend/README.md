# CertiBid AI - Enterprise Java Spring Boot Microservices Backend

CertiBid AI is an AI-powered public procurement and anti-collusion monitoring platform. This repository contains the complete Spring Boot microservices backend.

---

## 🏗 System Architecture

```
React Frontend (Port 3000)
       │
       │ HTTP REST Calls
       ▼
Spring Cloud Gateway (Port 8080)
       ├── /api/v1/auth/** ───────► Auth Service (Port 8081)
       ├── /api/v1/users/** ──────► Auth Service (Port 8081)
       ├── /api/v1/tenders/** ────► Procurement Service (Port 8082)
       ├── /api/v1/bids/** ───────► Procurement Service (Port 8082)
       ├── /api/v1/vendors/** ────► Procurement Service (Port 8082)
       ├── /api/v1/documents/** ──► Procurement Service (Port 8082)
       ├── /api/v1/transactions/**► Procurement Service (Port 8082)
       ├── /api/v1/payments/** ───► Procurement Service (Port 8082)
       ├── /api/v1/audit-logs/** ─► Procurement Service (Port 8082)
       ├── /api/v1/notifications/*► Procurement Service (Port 8082)
       └── /api/v1/risk-analysis/*► AI Risk Service (Port 8083)
```

---

## 🛠 Prerequisites

- **Java JDK**: 17+
- **Apache Maven**: 3.8+
- **MySQL Server**: 8.0+
- **Node.js**: 18+ (for frontend)

---

## 📊 Database Setup

1. Start your local MySQL server on `localhost:3306`.
2. Run the database setup scripts located in `backend/database/`:

```bash
mysql -u root -p < backend/database/01_create_auth_db.sql
mysql -u root -p < backend/database/02_create_procurement_db.sql
mysql -u root -p < backend/database/03_create_risk_db.sql
mysql -u root -p < backend/database/04_seed_data.sql
```

---

## 🔑 Development Seed Users

| Role | Email | Default Password | Access Level |
|---|---|---|---|
| **ADMIN** | `admin@certibid.com` | `password123` | Full system access |
| **OFFICER** | `officer@certibid.com` | `password123` | Manage tenders, evaluate bids, contract awards |
| **AUDITOR** | `auditor@certibid.com` | `password123` | Read-only access to tenders, risk analyses, audit logs |
| **VENDOR** | `vendor@certibid.com` | `password123` | Submit bids, upload compliance docs, pay EMD |

---

## ⚡ Environment Variables

Set the following environment variables or use the default values defined in `application.yml`:

```bash
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=your_database_password_here
export JWT_SECRET=your_jwt_secret_here
export GEMINI_API_KEY=your_google_gemini_api_key
```

---

## 🚀 Startup Order

To run the complete system, start the services in the following order:

### 1. Start MySQL Server
Ensure MySQL is active and databases are seeded.

### 2. Start Auth Service (Port 8081)
```bash
cd backend/auth-service
mvn spring-boot:run
```

### 3. Start Procurement Service (Port 8082)
```bash
cd backend/procurement-service
mvn spring-boot:run
```

### 4. Start AI Risk Service (Port 8083)
```bash
cd backend/ai-risk-service
mvn spring-boot:run
```

### 5. Start API Gateway (Port 8080)
```bash
cd backend/api-gateway
mvn spring-boot:run
```

### 6. Start React Frontend (Port 3000)
```bash
npm run dev
```

---

## 🧪 Testing API Endpoints

### 1. Authenticate (Login)
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "officer@certibid.com",
    "password": "password123"
  }'
```

### 2. Get All Tenders (Protected)
```bash
curl -X GET http://localhost:8080/api/v1/tenders \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 3. Evaluate Bid AI Risk (Protected)
```bash
curl -X POST http://localhost:8080/api/v1/risk-analysis/evaluate \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "bidId": "BID-9901",
    "tenderId": "TND-2026-8901",
    "vendorId": "VND-10029"
  }'
```

---

## ⚙️ AI Risk Analysis with Google Gemini API

The `ai-risk-service` uses Google Gemini API (`gemini-2.5-flash`) to perform intelligent anomaly detection on submitted bid proposals. If `GEMINI_API_KEY` is not set or unavailable, the service automatically falls back to deterministic rule-based heuristic risk evaluation.
