# Complete Guide to Workflow Elements, Parts, and Node Types

This document provides a comprehensive technical reference for all **25 individual elements**, the **7 pipeline parts**, and the **8 node types** comprising the automated **AI-Powered Phishing Detection and Prevention System**.

---

## 📑 Quick Navigation

- [1. Element-by-Element Reference (Nodes 01 to 25)](#1-element-by-element-reference)
- [2. The 7 Pipeline Stages (Parts)](#2-the-7-pipeline-stages-parts)
- [3. Node Classification by Type](#3-node-classification-by-type)
- [4. Standalone JavaScript Code Modules](#4-standalone-javascript-code-modules)

---

## 1. Element-by-Element Reference

| # | Element Name | n8n Node Type | JSON File | Standalone Code |
|---|---|---|---|---|
| **01** | **Gmail Trigger** | `n8n-nodes-base.gmailTrigger` | [`01_gmail_trigger.json`](../n8n/elements/01_gmail_trigger.json) | — |
| **02** | **Message a model (Gemini)** | `@n8n/n8n-nodes-langchain.googleGemini` | [`02_message_a_model.json`](../n8n/elements/02_message_a_model.json) | — |
| **03** | **Get a message** | `n8n-nodes-base.gmail` | [`03_get_a_message.json`](../n8n/elements/03_get_a_message.json) | — |
| **04** | **Normalize Gemini Email Analysis** | `n8n-nodes-base.code` | [`04_normalize_gemini_email_analysis.json`](../n8n/elements/04_normalize_gemini_email_analysis.json) | [`04_normalize_gemini_email_analysis.js`](../code/04_normalize_gemini_email_analysis.js) |
| **05** | **Extract URLs From Email** | `n8n-nodes-base.code` | [`05_extract_urls_from_email.json`](../n8n/elements/05_extract_urls_from_email.json) | [`05_extract_urls_from_email.js`](../code/05_extract_urls_from_email.js) |
| **06** | **VirusTotal URL Lookup** | `n8n-nodes-base.httpRequest` | [`06_virustotal_url_lookup.json`](../n8n/elements/06_virustotal_url_lookup.json) | — |
| **07** | **Normalize VirusTotal URL Results** | `n8n-nodes-base.code` | [`07_normalize_virustotal_url_results.json`](../n8n/elements/07_normalize_virustotal_url_results.json) | [`07_normalize_virustotal_url_results.js`](../code/07_normalize_virustotal_url_results.js) |
| **08** | **Detect Email Attachments** | `n8n-nodes-base.code` | [`08_detect_email_attachments.json`](../n8n/elements/08_detect_email_attachments.json) | [`08_detect_email_attachments.js`](../code/08_detect_email_attachments.js) |
| **09** | **Upload Attachment to VirusTotal** | `n8n-nodes-base.httpRequest` | [`09_upload_attachment_to_virustotal.json`](../n8n/elements/09_upload_attachment_to_virustotal.json) | — |
| **10** | **Check VirusTotal File Analysis** | `n8n-nodes-base.httpRequest` | [`10_check_virustotal_file_analysis.json`](../n8n/elements/10_check_virustotal_file_analysis.json) | — |
| **11** | **Process VirusTotal File Response** | `n8n-nodes-base.code` | [`11_process_virustotal_file_response.json`](../n8n/elements/11_process_virustotal_file_response.json) | [`11_process_virustotal_file_response.js`](../code/11_process_virustotal_file_response.js) |
| **12** | **Merge URL and Attachment Scans** | `n8n-nodes-base.merge` | [`12_merge_url_and_attachment_scans.json`](../n8n/elements/12_merge_url_and_attachment_scans.json) | — |
| **13** | **Build Final Security Report** | `n8n-nodes-base.code` | [`13_build_final_security_report.json`](../n8n/elements/13_build_final_security_report.json) | [`13_build_final_security_report.js`](../code/13_build_final_security_report.js) |
| **14** | **Check If URLs Found** | `n8n-nodes-base.if` | [`14_check_if_urls_found.json`](../n8n/elements/14_check_if_urls_found.json) | — |
| **15** | **Handle No URLs Found** | `n8n-nodes-base.code` | [`15_handle_no_urls_found.json`](../n8n/elements/15_handle_no_urls_found.json) | [`15_handle_no_urls_found.js`](../code/15_handle_no_urls_found.js) |
| **16** | **Fetch VirusTotal File Report** | `n8n-nodes-base.httpRequest` | [`16_fetch_virustotal_file_report.json`](../n8n/elements/16_fetch_virustotal_file_report.json) | — |
| **17** | **Normalize Attachment Scan Results** | `n8n-nodes-base.code` | [`17_normalize_attachment_scan_results.json`](../n8n/elements/17_normalize_attachment_scan_results.json) | [`17_normalize_attachment_scan_results.js`](../code/17_normalize_attachment_scan_results.js) |
| **18** | **Send Security Alert Email** | `n8n-nodes-base.gmail` | [`18_send_security_alert_email.json`](../n8n/elements/18_send_security_alert_email.json) | — |
| **19** | **Webhook** | `n8n-nodes-base.webhook` | [`19_webhook.json`](../n8n/elements/19_webhook.json) | — |
| **20** | **Save Report to Data Table** | `n8n-nodes-base.dataTable` | [`20_save_report_to_data_table.json`](../n8n/elements/20_save_report_to_data_table.json) | — |
| **21** | **Get Report from Data Table** | `n8n-nodes-base.dataTable` | [`21_get_report_from_data_table.json`](../n8n/elements/21_get_report_from_data_table.json) | — |
| **22** | **Respond to Webhook** | `n8n-nodes-base.respondToWebhook` | [`22_respond_to_webhook.json`](../n8n/elements/22_respond_to_webhook.json) | — |
| **23** | **Check If Attachments Found** | `n8n-nodes-base.if` | [`23_check_if_attachments_found.json`](../n8n/elements/23_check_if_attachments_found.json) | — |
| **24** | **Handle No Attachments Found** | `n8n-nodes-base.code` | [`24_handle_no_attachments_found.json`](../n8n/elements/24_handle_no_attachments_found.json) | [`24_handle_no_attachments_found.js`](../code/24_handle_no_attachments_found.js) |
| **25** | **Format Webhook Response** | `n8n-nodes-base.code` | [`25_format_webhook_response.json`](../n8n/elements/25_format_webhook_response.json) | [`25_format_webhook_response.js`](../code/25_format_webhook_response.js) |

---

## 2. The 7 Pipeline Stages (Parts)

### Part 1: Email Ingestion & Message Fetching
- **File**: [`part1_email_ingestion.json`](../n8n/parts/part1_email_ingestion.json)
- **Nodes**: `Gmail Trigger`, `Get a message`
- **Function**: Polls Gmail every 60 seconds. When an email is received, it downloads the complete RFC 822 MIME payload including headers (`From`, `Subject`, `authentication-results`), plain text body, HTML body, and attachment metadata.

### Part 2: Google Gemini AI Threat Analysis & Normalization
- **File**: [`part2_gemini_threat_analysis.json`](../n8n/parts/part2_gemini_threat_analysis.json)
- **Nodes**: `Message a model (Gemini)`, `Normalize Gemini Email Analysis`
- **Function**: Passes parsed headers and body to `models/gemini-2.5-flash` with a strict cybersecurity prompt. Cleans markdown code fences, validates verdicts (`Safe`, `Suspicious`, `Phishing`), and bounds risk scores between 0 and 100.

### Part 3: URL Extraction & VirusTotal Threat Intelligence
- **File**: [`part3_virustotal_url_scanner.json`](../n8n/parts/part3_virustotal_url_scanner.json)
- **Nodes**: `Extract URLs From Email`, `Check If URLs Found`, `VirusTotal URL Lookup`, `Normalize VirusTotal URL Results`, `Handle No URLs Found`
- **Function**: Extracts URLs using regex, deduplicates candidates, converts each URL into RFC 4648 Base64URL encoding, queries the VirusTotal v3 API, and normalizes reputation statistics.

### Part 4: Attachment Detection & VirusTotal Malware Analysis
- **File**: [`part4_virustotal_file_scanner.json`](../n8n/parts/part4_virustotal_file_scanner.json)
- **Nodes**: `Detect Email Attachments`, `Check If Attachments Found`, `Upload Attachment to VirusTotal`, `Check VirusTotal File Analysis`, `Fetch VirusTotal File Report`, `Process VirusTotal File Response`, `Normalize Attachment Scan Results`, `Handle No Attachments Found`
- **Function**: Checks binary attachment attachments, hashes files with SHA-256, submits unverified files to VirusTotal, monitors analysis completion, and extracts antivirus engine verdicts.

### Part 5: Multi-Vector Scan Merging & Deterministic Risk Scoring
- **File**: [`part5_risk_scoring_and_report.json`](../n8n/parts/part5_risk_scoring_and_report.json)
- **Nodes**: `Merge URL and Attachment Scans`, `Build Final Security Report`
- **Function**: The central decision engine. Synthesizes AI semantic analysis, URL reputation scores, and attachment scan results into an immutable composite threat report.

### Part 6: Storage Persistence & Security Email Alerts
- **File**: [`part6_datatable_and_alerts.json`](../n8n/parts/part6_datatable_and_alerts.json)
- **Nodes**: `Save Report to Data Table`, `Send Security Alert Email`
- **Function**: Archives every completed security report in the internal n8n Data Table. If the threat level is determined to be High or Critical Phishing, an automated warning email is instantly dispatched to the recipient.

### Part 7: Webhook Ingress & Chrome Extension API
- **File**: [`part7_webhook_extension_api.json`](../n8n/parts/part7_webhook_extension_api.json)
- **Nodes**: `Webhook`, `Get Report from Data Table`, `Format Webhook Response`, `Respond to Webhook`
- **Function**: Ingress webhook endpoint that the Chrome Extension calls with `message_id` to query existing threat classifications or initiate instant on-demand email evaluations.

---

## 3. Node Classification by Type

- **Trigger Nodes** ([`trigger_nodes.json`](../n8n/by_type/trigger_nodes.json)):
  `n8n-nodes-base.gmailTrigger`
- **AI & LLM Nodes** ([`ai_models.json`](../n8n/by_type/ai_models.json)):
  `@n8n/n8n-nodes-langchain.googleGemini`
- **Email Service Nodes** ([`email_service_nodes.json`](../n8n/by_type/email_service_nodes.json)):
  `n8n-nodes-base.gmail` (Get message, Send alert)
- **JavaScript Code Nodes** ([`code_nodes.json`](../n8n/by_type/code_nodes.json)):
  `n8n-nodes-base.code` (10 active transformation and scoring nodes)
- **HTTP Threat Intel Connectors** ([`http_threat_intel_nodes.json`](../n8n/by_type/http_threat_intel_nodes.json)):
  `n8n-nodes-base.httpRequest` (VirusTotal v3 REST API lookups)
- **Logic & Flow Control** ([`logic_and_routing_nodes.json`](../n8n/by_type/logic_and_routing_nodes.json)):
  `n8n-nodes-base.if`, `n8n-nodes-base.merge`
- **Database Storage Nodes** ([`database_storage_nodes.json`](../n8n/by_type/database_storage_nodes.json)):
  `n8n-nodes-base.dataTable`
- **Webhook API Nodes** ([`webhook_api_nodes.json`](../n8n/by_type/webhook_api_nodes.json)):
  `n8n-nodes-base.webhook`, `n8n-nodes-base.respondToWebhook`

---

## 4. Standalone JavaScript Code Modules

All 10 JavaScript processing scripts have been extracted into individual standalone files in [`code/`](../code/) and [`n8n/scripts/`](../n8n/scripts/):

1. **`04_normalize_gemini_email_analysis.js`**: Sanitizes Gemini AI output, strips code fences, validates JSON structure.
2. **`05_extract_urls_from_email.js`**: Discovers URLs in plain text & HTML, deduplicates, and creates RFC 4648 Base64URL hashes.
3. **`07_normalize_virustotal_url_results.js`**: Extracts VirusTotal malicious engine counters and threat categories.
4. **`08_detect_email_attachments.js`**: Detects binary attachments and logs MIME types.
5. **`11_process_virustotal_file_response.js`**: Tracks file analysis IDs from VirusTotal API responses.
6. **`13_build_final_security_report.js`**: Fuses AI + URL + Attachment indicators into deterministic risk scores.
7. **`15_handle_no_urls_found.js`**: Emits safe bypass object when no external links are present.
8. **`17_normalize_attachment_scan_results.js`**: Normalizes file scan attributes and detection counters.
9. **`24_handle_no_attachments_found.js`**: Emits safe bypass object when no attachments are present.
10. **`25_format_webhook_response.js`**: Serializes security report into lightweight response for browser extensions.
