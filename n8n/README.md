# n8n Workflow Automation Architecture & Modular Breakdown

This directory contains the complete workflow automation architecture for the **AI-Powered Phishing Detection and Prevention System**, provided both as a full unified workflow and decomposed into modular elements, pipeline stages, and node types.

---

## 📑 Directory Structure

```text
n8n/
├── workflows.json                   # Full production workflow (all 25 nodes connected)
├── ai_mail_guardian_workflow.json   # Full workflow backup
├── first_4_steps_workflow.json      # Dedicated 4-node core AI pipeline
│
├── elements/                        # Element-by-Element JSON (Nodes 1 to 25)
│   ├── 01_gmail_trigger.json
│   ├── 02_message_a_model.json
│   ├── 03_get_a_message.json
│   ├── 04_normalize_gemini_email_analysis.json
│   ├── 05_extract_urls_from_email.json
│   ├── 06_virustotal_url_lookup.json
│   ├── 07_normalize_virustotal_url_results.json
│   ├── 08_detect_email_attachments.json
│   ├── 09_upload_attachment_to_virustotal.json
│   ├── 10_check_virustotal_file_analysis.json
│   ├── 11_process_virustotal_file_response.json
│   ├── 12_merge_url_and_attachment_scans.json
│   ├── 13_build_final_security_report.json
│   ├── 14_check_if_urls_found.json
│   ├── 15_handle_no_urls_found.json
│   ├── 16_fetch_virustotal_file_report.json
│   ├── 17_normalize_attachment_scan_results.json
│   ├── 18_send_security_alert_email.json
│   ├── 19_webhook.json
│   ├── 20_save_report_to_data_table.json
│   ├── 21_get_report_from_data_table.json
│   ├── 22_respond_to_webhook.json
│   ├── 23_check_if_attachments_found.json
│   ├── 24_handle_no_attachments_found.json
│   └── 25_format_webhook_response.json
│
├── parts/                           # Pipeline Stages / Functional Parts
│   ├── part1_email_ingestion.json
│   ├── part2_gemini_threat_analysis.json
│   ├── part3_virustotal_url_scanner.json
│   ├── part4_virustotal_file_scanner.json
│   ├── part5_risk_scoring_and_report.json
│   ├── part6_datatable_and_alerts.json
│   └── part7_webhook_extension_api.json
│
├── by_type/                         # Node Categorization by Type
│   ├── trigger_nodes.json
│   ├── ai_models.json
│   ├── email_service_nodes.json
│   ├── code_nodes.json
│   ├── http_threat_intel_nodes.json
│   ├── logic_and_routing_nodes.json
│   ├── database_storage_nodes.json
│   └── webhook_api_nodes.json
│
└── scripts/                         # Standalone JavaScript Code Files
    ├── 04_normalize_gemini_email_analysis.js
    ├── 05_extract_urls_from_email.js
    ├── 07_normalize_virustotal_url_results.js
    ├── 08_detect_email_attachments.js
    ├── 11_process_virustotal_file_response.js
    ├── 13_build_final_security_report.js
    ├── 15_handle_no_urls_found.js
    ├── 17_normalize_attachment_scan_results.js
    ├── 24_handle_no_attachments_found.js
    └── 25_format_webhook_response.js
```

---

## 🧩 1. The 7 Pipeline Stages (Parts)

1. **[Part 1: Email Ingestion](parts/part1_email_ingestion.json)**
   - Triggered every minute via Gmail OAuth 2.0; fetches raw RFC 822 email payload including headers, plain text, and HTML body.
2. **[Part 2: Google Gemini AI Analysis](parts/part2_gemini_threat_analysis.json)**
   - Passes email metadata into Google Gemini 2.5 Flash with cybersecurity analyst prompt; normalizes verdict into JSON schema.
3. **[Part 3: URL Threat Intelligence](parts/part3_virustotal_url_scanner.json)**
   - Extracts all URLs, validates formatting, computes Base64URL IDs, queries VirusTotal v3 API, and handles fallback for URL-free emails.
4. **[Part 4: Attachment Threat Intelligence](parts/part4_virustotal_file_scanner.json)**
   - Detects MIME attachments, calculates SHA-256 hashes, uploads unknown files to VirusTotal, polls analysis queue, and normalizes file scan scores.
5. **[Part 5: Multi-Vector Scan Merging & Scoring](parts/part5_risk_scoring_and_report.json)**
   - Merges AI sentiment, URL reputation, and attachment scan results. Computes a deterministic 0–100 threat score.
6. **[Part 6: Storage & Alerting](parts/part6_datatable_and_alerts.json)**
   - Persists final report into n8n Data Table; automatically dispatches an alert email to the recipient for High/Critical phishing threats.
7. **[Part 7: Chrome Extension Webhook API](parts/part7_webhook_extension_api.json)**
   - Serves cached reports or initiates on-demand scans via HTTP webhook requests from the Chrome Extension.

---

## 🏷️ 2. Categorization By All Node Types

- **`trigger_nodes.json`**: Scheduled polling triggers (`gmailTrigger`).
- **`ai_models.json`**: LLM language chain models (`googleGemini`).
- **`email_service_nodes.json`**: Gmail messaging nodes (Get message, Send alert).
- **`code_nodes.json`**: JavaScript transformation nodes.
- **`http_threat_intel_nodes.json`**: REST API connectors to VirusTotal v3.
- **`logic_and_routing_nodes.json`**: Conditional routing (`if`) and synchronization (`merge`).
- **`database_storage_nodes.json`**: Table storage (`dataTable`).
- **`webhook_api_nodes.json`**: Real-time HTTP ingress (`webhook`, `respondToWebhook`).

---

## 💻 3. How to Import Into n8n

- **Import Complete Pipeline**: Open n8n -> Workflows -> Import from File -> select [`workflows.json`](workflows.json).
- **Import First 4 Steps**: Select [`first_4_steps_workflow.json`](first_4_steps_workflow.json).
- **Import Specific Stage**: Navigate to `parts/` and choose any modular stage JSON file.
