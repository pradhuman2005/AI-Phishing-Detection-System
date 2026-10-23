# Screenshot Details & Implementation Mapping (Steps 1–4)

This document provides a detailed technical breakdown of the project screenshots, explaining what each visual artifact represents, how it maps to the **First 4 Steps** of the **AI-Powered Phishing Detection and Prevention System**, what each screenshot technically proves, and how it connects to the system's runtime architecture.

---

## Screenshot Mapping Overview

| Screenshot File | Node / Component | Pipeline Step | Primary Verification |
|---|---|---|---|
| `01-gmail-trigger.png` | `Gmail Trigger` Node | **Step 1: Event Ingestion** | Confirms OAuth 2.0 connectivity and live ingestion of email headers & metadata. |
| `02-gemini-email-analysis.png` | `Message a model` (Gemini) | **Step 3: AI Threat Analysis** | Validates Google Gemini 2.5 Flash prompt design and cybersecurity analyst persona. |
| `03-n8n-workflow-overview.png` | n8n Workflow Canvas | **Steps 1–4 Overview** | Visualizes node orchestration and active pipeline design on n8n canvas. |
| `04-docker-n8n-logs.png` | Docker Desktop Terminal | **Runtime Environment** | Confirms internal SQLite database migrations and n8n backend ready on port 5678. |
| `05-docker-container-status.png` | Docker Stack Status | **Container Stability** | Confirms healthy container lifecycle, persistent volume mounting, and low resource overhead. |

---

## Detailed Screenshot Analysis

### 1. Step 1: Gmail Trigger Ingestion (`01-gmail-trigger.png`)
![01-gmail-trigger](../reviews/screenshots/01-gmail-trigger.png)

- **Visible Parameters**:
  - **Credential**: `Gmail account` (configured with Google Cloud OAuth 2.0 Client credentials).
  - **Poll Frequency**: `Every Minute` polling interval to detect newly incoming messages near real-time.
  - **Event**: `Message Received` (listens to incoming emails).
  - **Data Mode**: `Simplify: OFF` — Intentionally toggled off so n8n fetches the complete raw RFC 822 payload including full headers, MIME parts, and attachments rather than a truncated summary.
  - **Max Emails per Poll**: `10` emails per trigger cycle.
- **Visible Output Data**:
  - Live test event successfully retrieved from Google's servers:
    - Message ID: `1a123dae29b122f6`
    - Thread ID: `1a123dae29b122f6`
    - Label IDs: `["UNREAD", "CATEGORY_UPDATES", "INBOX"]`
    - Estimated Message Size: `70333` bytes
    - Received Headers: `from 180-164-smtp-out-us.ncmail01.com ... Delivered-To: sharmapradhuman390@gmail.com`
    - Authentication headers: `ARC-Seal`, `x-received`, TLS cipher details (`TLS_AES_256_GCM_SHA384`).
- **Technical Significance**:
  - Proves that the n8n application has authenticated successfully against Google's Gmail API.
  - Demonstrates that raw email telemetry is successfully fetched into the workflow execution context without truncation.

---

### 2. Step 2 & 3: AI Threat Analysis with Gemini (`02-gemini-email-analysis.png`)
![02-gemini-email-analysis](../reviews/screenshots/02-gemini-email-analysis.png)

- **Visible Parameters**:
  - **Node**: `@n8n/n8n-nodes-langchain.googleGemini` ("Message a model").
  - **Credential**: `Google Gemini(PaLM) Api account`.
  - **Target Model**: `models/gemini-2.5-flash` (Google's latest lightweight, high-speed reasoning model).
  - **Configured System Prompt**:
    ```text
    You are a cybersecurity email threat analyst. Analyze the following email and determine whether it is Safe, Suspicious, or Phishing...
    ```
- **Visible Input Stream**:
  - The left panel displays the incoming message object passed directly from the upstream Gmail trigger/message node.
  - Payload attributes (`headers`, `snippet`, `sizeEstimate`, and `labelIds`) are bound dynamically into the Gemini prompt template.
- **Technical Significance**:
  - Establishes a specialized cybersecurity analyst persona.
  - Constrains the AI to output structured categorical verdicts (`Safe`, `Suspicious`, or `Phishing`) along with numeric risk scores (0–100) and indicators.

---

### 3. Workflow Canvas & Pipeline Topology (`03-n8n-workflow-overview.png`)
![03-n8n-workflow-overview](../reviews/screenshots/03-n8n-workflow-overview.png)

- **Visible Nodes & Flow**:
  - `Gmail Trigger` (Step 1) is directly linked to `Message a model` (Step 3).
  - An experimental parallel/secondary branch is visible containing `Basic LLM Chain` connected to `Groq Chat Model`.
  - The Groq Chat Model shows a configuration alert icon (badge 9), indicating missing credentials or required field inputs during active drafting.
- **Technical Significance**:
  - Demonstrates active development and testing of multiple AI model backends (comparing Google Gemini with Groq LLaMA models).
  - Leads directly to our cleaned 4-step pipeline: `Gmail Trigger` -> `Get a message` -> `Message a model` -> `Normalize Gemini Email Analysis`.

---

### 4. Docker Backend Initialization Logs (`04-docker-n8n-logs.png`)
![04-docker-n8n-logs](../reviews/screenshots/04-docker-n8n-logs.png)

- **Visible Log Messages**:
  - `No encryption key found - Auto-generating and saving to: /home/node/.n8n/config`
  - `Initializing n8n process`
  - `n8n ready on ::, port 5678`
  - Sequential internal database schema migrations executing cleanly:
    - `Starting migration InitialMigration1588102412422` ... `Finished`
    - `Starting migration WebhookModel1592445003908` ... `Finished`
    - `Starting migration CreateIndexStoppedAt1594825041918` ... `Finished`
    - `Starting migration CreateUserManagement1646992772331` ... `Finished`
    - `Starting migration CommunityNodes1652254514001` ... `Finished`
- **Technical Significance**:
  - Proves that the Docker volume reset solved previous JSON corruption issues.
  - Confirms n8n's internal database migrations completed with zero schema errors.

---

### 5. Docker Container Lifecycle & Resource Status (`05-docker-container-status.png`)
![05-docker-container-status](../reviews/screenshots/05-docker-container-status.png)

- **Visible Container Metrics**:
  - Stack: `ai-phishing-detection-system`.
  - Service: `n8n` (`n8nio/n8n:latest`).
  - Port binding: `5678:5678` (host-to-container port mapping).
  - Health: Container status is running with green indicator.
  - Host Resource Usage: RAM ~1.24 GB, CPU 0.06% (extremely efficient idle footprint).
- **Technical Significance**:
  - Confirms that the host environment provides a stable, persistent execution platform for the automated phishing detection pipeline.
