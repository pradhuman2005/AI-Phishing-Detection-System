# Standalone Source Code Modules

This directory contains standalone, modular source code files extracted directly from the system components, including all n8n JavaScript code nodes, Chrome Extension client scripts, and automation engines.

---

## 📂 JavaScript Execution Modules (n8n Pipeline)

Each file represents a critical stage of the data extraction, AI post-processing, and threat aggregation engine:

| Script File | Pipeline Stage | Purpose & Logic |
|---|---|---|
| [`04_normalize_gemini_email_analysis.js`](04_normalize_gemini_email_analysis.js) | Gemini AI Analysis Post-Processing | Strips Markdown code blocks, parses JSON, enforces categorical verdicts (`Safe`, `Suspicious`, `Phishing`), and clamps risk scores (0–100). |
| [`05_extract_urls_from_email.js`](05_extract_urls_from_email.js) | URL Discovery & Encoding | Scans plain text and HTML bodies for URLs, deduplicates candidates, and encodes them into RFC 4648 Base64URL for VirusTotal API v3. |
| [`07_normalize_virustotal_url_results.js`](07_normalize_virustotal_url_results.js) | URL Threat Intelligence Parsing | Normalizes VirusTotal v3 analysis attributes, malicious engine counts, and reputation verdicts. |
| [`08_detect_email_attachments.js`](08_detect_email_attachments.js) | Attachment Detection & Hashing | Inspects incoming MIME attachments, extracts filenames, MIME types, and computes SHA-256 hashes. |
| [`11_process_virustotal_file_response.js`](11_process_virustotal_file_response.js) | File Upload Telemetry Handling | Extracts analysis IDs and submission status for uploaded suspicious attachments. |
| [`13_build_final_security_report.js`](13_build_final_security_report.js) | **Deterministic Risk Scoring Engine** | Fuses AI semantic scores with VirusTotal malicious detections into an immutable unified security report. |
| [`15_handle_no_urls_found.js`](15_handle_no_urls_found.js) | Clean Execution Fallback | Emits a neutral bypass object when an email has no external URLs, preventing pipeline stalls. |
| [`17_normalize_attachment_scan_results.js`](17_normalize_attachment_scan_results.js) | Attachment Threat Parsing | Normalizes VirusTotal engine scores for scanned email attachments. |
| [`24_handle_no_attachments_found.js`](24_handle_no_attachments_found.js) | Clean Execution Fallback | Emits a neutral bypass object when an email contains no file attachments. |
| [`25_format_webhook_response.js`](25_format_webhook_response.js) | Webhook API Formatter | Formats live scan data into lightweight JSON payloads for the Chrome Extension. |

---

## 🌐 Chrome Extension Code Modules (`extension/`)

- [`extension/manifest.json`](../extension/manifest.json) — Manifest V3 configuration with storage and host permissions.
- [`extension/background.js`](../extension/background.js) — Service worker handling cross-origin API requests to n8n/FastAPI.
- [`extension/content.js`](../extension/content.js) — In-page Gmail DOM observer that dynamically injects color-coded threat badges next to email subject lines.
- [`extension/Options.js`](../extension/Options.js) — Configuration manager for endpoint URLs and scanning preferences.

---

## 🐍 Python Reporting & Backend Modules

- [`generate_report.py`](../generate_report.py) — Weekly, monthly, and final academic progress evaluation report generator (ReportLab + Matplotlib).
- [`backend/main.py`](../backend/main.py) — FastAPI backend REST API exposing threat logs, risk metrics, and sandbox detonation endpoints.
