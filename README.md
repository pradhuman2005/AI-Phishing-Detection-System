# AI-Powered Phishing Detection and Prevention System

An end-to-end cybersecurity system designed to automatically detect phishing, social engineering, malicious attachments, and credential-harvesting emails using **n8n workflow automation**, **Google Gemini LLM**, **VirusTotal v3 Threat Intelligence**, a **FastAPI backend**, a **React security dashboard**, and a **Chrome Extension**.

---

## 📌 Features & Architecture

```text
Gmail (OAuth 2.0)
     │
     ▼
n8n Orchestration Layer (Port 5678)
     ├─► Part 1: Raw Ingestion (RFC 822 Headers & Body)
     ├─► Part 2: Google Gemini AI Semantic Threat Analysis
     ├─► Part 3: VirusTotal v3 URL Reputation Scanner
     ├─► Part 4: VirusTotal Attachment & Hash Detonation
     ├─► Part 5: Deterministic Risk Scoring Engine (0–100)
     ├─► Part 6: Persistence in Data Table & Automated Email Alerts
     └─► Part 7: Webhook REST API for Client Ingress
                 │
                 ├──► Chrome Extension (Live In-Inbox Risk Badges)
                 └──► FastAPI Backend ──► React SOC Analyst Dashboard
```

---

## 📂 Repository Structure & Modular Breakdown

This repository organizes all workflows, standalone scripts, frontend, backend, and documentation into dedicated, isolated directories:

```text
AI-Phishing-Detection-System/
├── .github/
│   └── workflows/
│       └── auto_weekly_report.yml        # Automated Form-3 weekly PDF reporting (cron)
│
├── backend/                              # FastAPI Backend REST API
│   ├── main.py                           # API endpoints, data models, and mock/DB store
│   ├── requirements.txt                  # Python dependencies
│   └── README.md                         # Backend setup and documentation
│
├── frontend/                             # React Security Operations Dashboard
│   ├── src/
│   │   ├── App.jsx                       # Threat feed, KPI metrics, and inspection modal
│   │   └── styles/dashboard.css          # SOC Dark theme styling
│   ├── package.json                      # NPM dependencies (React 18 + Vite)
│   └── README.md                         # Frontend setup and documentation
│
├── extension/                            # Chrome Extension (AI Mail Guardian v2)
│   ├── manifest.json                     # Manifest V3 extension configuration
│   ├── background.js                     # Background service worker
│   ├── content.js                        # In-page Gmail DOM observer & badge injector
│   ├── styles.css                        # Risk badge visual styles
│   ├── Options.html & Options.js         # Settings & endpoint configuration
│   └── icons/                            # Extension icon assets (16px, 48px, 128px)
│
├── code/                                 # Standalone Extracted Source Code Modules
│   ├── 04_normalize_gemini_email_analysis.js
│   ├── 05_extract_urls_from_email.js
│   ├── 07_normalize_virustotal_url_results.js
│   ├── 08_detect_email_attachments.js
│   ├── 11_process_virustotal_file_response.js
│   ├── 13_build_final_security_report.js
│   ├── 15_handle_no_urls_found.js
│   ├── 17_normalize_attachment_scan_results.js
│   ├── 24_handle_no_attachments_found.js
│   ├── 25_format_webhook_response.js
│   └── README.md                         # Code modules catalog
│
├── n8n/                                  # n8n Automation Workflows & JSON in Parts
│   ├── workflows.json                    # Full unified workflow (all 25 nodes)
│   ├── first_4_steps_workflow.json       # Dedicated 4-node core AI pipeline
│   ├── elements/                         # Individual node JSONs (Nodes 01 to 25)
│   │   ├── 01_gmail_trigger.json
│   │   ├── 02_message_a_model.json
│   │   ├── 03_get_a_message.json
│   │   └── ... (25 element JSON files)
│   ├── parts/                            # Pipeline stages / functional parts
│   │   ├── part1_email_ingestion.json
│   │   ├── part2_gemini_threat_analysis.json
│   │   ├── part3_virustotal_url_scanner.json
│   │   ├── part4_virustotal_file_scanner.json
│   │   ├── part5_risk_scoring_and_report.json
│   │   ├── part6_datatable_and_alerts.json
│   │   └── part7_webhook_extension_api.json
│   ├── by_type/                          # Breakdown by all node types
│   │   ├── trigger_nodes.json
│   │   ├── ai_models.json
│   │   ├── email_service_nodes.json
│   │   ├── code_nodes.json
│   │   ├── http_threat_intel_nodes.json
│   │   ├── logic_and_routing_nodes.json
│   │   ├── database_storage_nodes.json
│   │   └── webhook_api_nodes.json
│   ├── scripts/                          # Exported n8n JavaScript code nodes
│   └── README.md                         # n8n modular guide
│
├── docs/                                 # Technical Architecture & Guides
│   ├── screenshot_details.md             # Detailed breakdown of implementation screenshots
│   └── workflow_elements_and_types.md    # Complete reference for all 25 elements & 7 parts
│
├── reviews/                              # Comprehensive 3-Month Project Progress Reviews
│   ├── README.md
│   ├── project-overview.md
│   ├── three-month-progress-report.md
│   ├── architecture-and-design.md
│   ├── implementation-review.md
│   ├── setup-and-troubleshooting.md
│   ├── testing-and-validation.md
│   ├── roadmap.md
│   └── screenshots/                      # Preserved screenshots 01 to 05
│
├── weekly_reports/                       # Generated Form-3 progress evaluation PDFs
├── docker-compose.yml                    # Containerized n8n deployment config
└── generate_report.py                    # Academic PDF & chart report generator
```

---

## 🚀 Quick Start Guide

### 1. Launch n8n Workflow Orchestrator
```bash
docker compose up -d
```
Access the n8n canvas at [http://localhost:5678](http://localhost:5678). Import [`n8n/workflows.json`](n8n/workflows.json) or [`n8n/first_4_steps_workflow.json`](n8n/first_4_steps_workflow.json).

### 2. Launch FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Launch React Security Dashboard
```bash
cd frontend
npm install
npm run dev
```

### 4. Install Chrome Extension
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Toggle on **Developer mode** in the top right.
3. Click **Load unpacked** and select the [`extension/`](extension/) directory.

---

## 📊 Generating Progress Reports

To generate institutional Form-3 PDF reports:
```bash
python generate_report.py weekly      # Last 7 days
python generate_report.py monthly     # Last 30 days
python generate_report.py final       # Entire project lifecycle
```
PDF reports are stored automatically in [`weekly_reports/`](weekly_reports/).
