# AI Phishing Detection System - React Security Dashboard

A modern web dashboard for Security Operations Center (SOC) analysts to monitor incoming email threats, view AI explanations, inspect malicious URLs, and initiate response actions.

---

## 🚀 Running the Frontend

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Vite Dev Server
```bash
npm run dev
```
The dashboard runs at [http://localhost:5173](http://localhost:5173) and connects to the FastAPI backend at `http://localhost:8000`.

---

## 📌 Dashboard Capabilities
- **Real-Time Threat Feed**: Visual badges for `Phishing`, `Suspicious`, and `Safe`.
- **KPI Metrics**: Total emails scanned, high-risk detection rate, and average threat score.
- **Detailed Threat Inspection Modal**: View extracted Gemini rationale, flagged URLs, and firewall mitigation recommendations.
