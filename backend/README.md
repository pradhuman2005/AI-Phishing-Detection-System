# AI Phishing Detection System - FastAPI Backend

This service provides the backend REST API for threat report aggregation, statistics, and integration between the n8n orchestrator, the React dashboard, and the Chrome Extension.

---

## 🚀 Running the Backend

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the FastAPI Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Interactive API Documentation
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📌 Available Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check endpoint |
| `GET` | `/api/v1/stats` | High-level detection metrics (Total, Phishing, Suspicious, Safe, Avg Risk) |
| `GET` | `/api/v1/reports` | List all threat evaluation reports with optional filters |
| `GET` | `/api/v1/reports/{report_id}` | Retrieve full report details including AI reasoning and indicators |
| `POST` | `/api/v1/scan-email` | On-demand scanning trigger from the Chrome Extension |
| `POST` | `/api/v1/sandbox/detonate` | Analyst-triggered CAPE Sandbox deep behavioral analysis |
