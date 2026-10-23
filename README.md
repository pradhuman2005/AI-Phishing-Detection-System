# AI-Powered Phishing Detection and Prevention System

An AI-powered cybersecurity system designed to automatically detect phishing, social engineering, and malicious emails using n8n workflow automation, Google Gemini LLMs, threat intelligence, and a Chrome extension.

---

## 📌 Features

- **Automated Gmail Monitoring**: Event-driven email ingestion via OAuth 2.0.
- **Deep Email Extraction**: Extracts headers, text/HTML body, and attachments without truncation.
- **AI Phishing Detection**: Contextual security analysis powered by Google Gemini (Flash) & Groq.
- **Threat Intelligence**: URL extraction, RFC 4648 encoding, and VirusTotal v3 reputation lookups.
- **Deterministic Risk Scoring**: Normalized 0–100 threat assessment with clear verdicts (`Safe`, `Suspicious`, `Phishing`).
- **Chrome Extension (AI Mail Guardian)**: In-inbox visual risk badges and on-demand email scanning.
- **Automated Academic Progress Reports**: Automated Form-3 weekly PDF reporting via GitHub Actions.

---

## 🏗️ Proposed Architecture

```text
Gmail (Ingestion) ──► n8n Orchestrator ──► Gemini AI Analysis ──► VirusTotal Threat Intel ──► Risk Scoring Engine ──► PostgreSQL / Data Table ──► FastAPI & React Dashboard / Chrome Extension
```

---

## 🚀 First 4 Steps (Core AI Pipeline)

The foundation of the detection engine is implemented in [`n8n/first_4_steps_workflow.json`](n8n/first_4_steps_workflow.json):

1. **Step 1: Gmail Trigger** (`n8n-nodes-base.gmailTrigger`)
   - Polls inbox every minute for new emails (`mode: everyMinute`, `simple: false`).
2. **Step 2: Get a Message** (`n8n-nodes-base.gmail`)
   - Retrieves full raw RFC 822 email payload (headers, textPlain, textHtml, snippet).
3. **Step 3: Message a Model** (`@n8n/n8n-nodes-langchain.googleGemini`)
   - Executes specialized cybersecurity prompt with `models/gemini-2.5-flash` to evaluate sender reputation, urgency, social engineering, and authentication indicators.
4. **Step 4: Normalize Gemini Email Analysis** (`n8n-nodes-base.code` - JavaScript)
   - Parses LLM JSON output, strips code fences, validates verdict, clamps risk score (0–100), and outputs clean structured telemetry.

For a detailed visual and architectural walkthrough of these steps and corresponding screenshots, see [`docs/screenshot_details.md`](docs/screenshot_details.md).

---

## 📂 Project Structure

```text
AI-Phishing-Detection-System/
├── .github/
│   └── workflows/
│       └── auto_weekly_report.yml     # Automated Thursday 11:59 PM IST Form-3 report runner
├── backend/                           # FastAPI backend (planned)
├── docs/
│   └── screenshot_details.md          # Technical documentation of implementation screenshots
├── extension/                         # Chrome Extension (AI Mail Guardian v2)
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── styles.css
│   ├── Options.html
│   ├── Options.js
│   └── icons/
├── n8n/
│   ├── first_4_steps_workflow.json    # Verified first 4 steps pipeline
│   ├── workflows.json                 # Complete n8n production workflow
│   └── scripts/                       # Modular JavaScript code nodes
│       ├── normalize_gemini_analysis.js
│       └── extract_urls_from_email.js
├── reviews/                           # 3-Month comprehensive project progress reviews
│   ├── README.md
│   ├── project-overview.md
│   ├── three-month-progress-report.md
│   ├── architecture-and-design.md
│   ├── implementation-review.md
│   ├── setup-and-troubleshooting.md
│   ├── testing-and-validation.md
│   ├── roadmap.md
│   └── screenshots/                   # Preserved workflow & Docker screenshots
├── weekly_reports/                    # Generated Form-3 progress evaluation PDFs
├── docker-compose.yml                 # Containerized n8n deployment
└── generate_report.py                 # PDF & visual graph report generator
```

---

## 📊 Generating Weekly / Monthly Reports

To generate the academic Form-3 PDF report locally:

```bash
pip install reportlab matplotlib
python generate_report.py weekly      # Last 7 days
python generate_report.py monthly     # Last 30 days
python generate_report.py final       # Entire project lifecycle
```
Generated reports are archived in `weekly_reports/`.
