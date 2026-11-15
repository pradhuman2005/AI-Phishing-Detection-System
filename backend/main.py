from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import datetime
from pydantic import BaseModel, Field

app = FastAPI(
    title="AI-Powered Phishing Detection and Prevention API",
    description="Backend REST API for ingestion, threat analysis retrieval, risk scoring, and SOC reporting.",
    version="1.0.0"
)

# CORS configuration for React Dashboard & Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---

class EmailMetadata(BaseModel):
    message_id: str
    thread_id: Optional[str] = None
    sender: str
    recipient: Optional[str] = None
    subject: str
    date_received: Optional[str] = None
    snippet: Optional[str] = None

class ThreatIndicators(BaseModel):
    gemini_verdict: str  # Safe, Suspicious, Phishing
    gemini_reasons: List[str] = []
    suspicious_urls: List[str] = []
    virustotal_malicious_urls: int = 0
    virustotal_malicious_files: int = 0
    spf_status: Optional[str] = "Pass"
    dkim_status: Optional[str] = "Pass"
    dmarc_status: Optional[str] = "Pass"

class SecurityReport(BaseModel):
    report_id: str
    email_id: str
    subject: str
    sender: str
    classification: str  # Safe, Suspicious, Phishing
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str  # Low, Medium, High, Critical
    indicators: ThreatIndicators
    recommended_action: str
    scanned_at: str
    sandbox_analysis_status: Optional[str] = "Not Requested"

class DetonateRequest(BaseModel):
    report_id: str
    attachment_name: str
    analyst_notes: Optional[str] = None

# --- In-Memory Mock Store for Rapid Prototyping / Standalone Execution ---
REPORTS_DB: List[SecurityReport] = [
    SecurityReport(
        report_id="rep_001",
        email_id="1a123dae29b122f6",
        subject="Urgent: Your Account Verification Is Required",
        sender="security@secure-paypal-login-alert.com",
        classification="Phishing",
        risk_score=92,
        risk_level="Critical",
        indicators=ThreatIndicators(
            gemini_verdict="Phishing",
            gemini_reasons=[
                "High urgency language threatening account suspension within 24 hours.",
                "Mismatched sender domain impersonating PayPal.",
                "Direct request to click external login link."
            ],
            suspicious_urls=["https://secure-paypal-login-alert.com/verify-account"],
            virustotal_malicious_urls=7,
            virustotal_malicious_files=0,
            spf_status="SoftFail",
            dkim_status="Fail",
            dmarc_status="Fail"
        ),
        recommended_action="Quarantine email immediately and block sender domain on gateway firewall.",
        scanned_at=datetime.datetime.utcnow().isoformat() + "Z",
        sandbox_analysis_status="Not Applicable"
    ),
    SecurityReport(
        report_id="rep_002",
        email_id="1a123dae29b122f7",
        subject="Team Sprint Planning Meeting - Q4",
        sender="engineering-leads@skit.ac.in",
        classification="Safe",
        risk_score=5,
        risk_level="Low",
        indicators=ThreatIndicators(
            gemini_verdict="Safe",
            gemini_reasons=["Legitimate internal university domain", "Standard routine meeting agenda"],
            suspicious_urls=[],
            virustotal_malicious_urls=0,
            virustotal_malicious_files=0,
            spf_status="Pass",
            dkim_status="Pass",
            dmarc_status="Pass"
        ),
        recommended_action="Safe to read and respond.",
        scanned_at=datetime.datetime.utcnow().isoformat() + "Z",
        sandbox_analysis_status="Not Applicable"
    )
]

# --- Endpoints ---

@app.get("/", tags=["General"])
def root():
    return {
        "service": "AI-Powered Phishing Detection and Prevention System API",
        "status": "Online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/v1/reports", response_model=List[SecurityReport], tags=["Reports"])
def list_reports(
    classification: Optional[str] = Query(None, description="Filter by verdict: Safe, Suspicious, or Phishing"),
    risk_level: Optional[str] = Query(None, description="Filter by level: Low, Medium, High, Critical"),
    limit: int = Query(50, ge=1, le=100)
):
    results = REPORTS_DB
    if classification:
        results = [r for r in results if r.classification.lower() == classification.lower()]
    if risk_level:
        results = [r for r in results if r.risk_level.lower() == risk_level.lower()]
    return results[:limit]

@app.get("/api/v1/reports/{report_id}", response_model=SecurityReport, tags=["Reports"])
def get_report_by_id(report_id: str):
    for r in REPORTS_DB:
        if r.report_id == report_id or r.email_id == report_id:
            return r
    raise HTTPException(status_code=404, detail="Security report not found")

@app.post("/api/v1/scan-email", response_model=SecurityReport, tags=["Analysis"])
def scan_email_on_demand(metadata: EmailMetadata):
    """
    On-demand analysis endpoint called by the Chrome Extension or manual analyst triage.
    """
    new_report = SecurityReport(
        report_id=f"rep_{len(REPORTS_DB) + 1:03d}",
        email_id=metadata.message_id,
        subject=metadata.subject,
        sender=metadata.sender,
        classification="Suspicious",
        risk_score=50,
        risk_level="Medium",
        indicators=ThreatIndicators(
            gemini_verdict="Suspicious",
            gemini_reasons=["Analysis initiated via API on-demand."],
            suspicious_urls=[],
            virustotal_malicious_urls=0,
            virustotal_malicious_files=0
        ),
        recommended_action="Triage initiated; monitor for threat intel results.",
        scanned_at=datetime.datetime.utcnow().isoformat() + "Z",
        sandbox_analysis_status="Pending"
    )
    REPORTS_DB.append(new_report)
    return new_report

@app.post("/api/v1/sandbox/detonate", tags=["Advanced Analysis"])
def detonate_in_sandbox(request: DetonateRequest, background_tasks: BackgroundTasks):
    """
    Optional Analyst-triggered CAPE Sandbox detonation for high-risk attachments.
    """
    for r in REPORTS_DB:
        if r.report_id == request.report_id:
            r.sandbox_analysis_status = "In Progress"
            return {
                "status": "Queued",
                "message": f"Attachment '{request.attachment_name}' dispatched to CAPE Sandbox.",
                "report_id": request.report_id,
                "analyst_notes": request.analyst_notes
            }
    raise HTTPException(status_code=404, detail="Target report not found")

@app.get("/api/v1/stats", tags=["Dashboard Metrics"])
def get_system_stats():
    total = len(REPORTS_DB)
    phishing = sum(1 for r in REPORTS_DB if r.classification == "Phishing")
    suspicious = sum(1 for r in REPORTS_DB if r.classification == "Suspicious")
    safe = sum(1 for r in REPORTS_DB if r.classification == "Safe")
    avg_score = round(sum(r.risk_score for r in REPORTS_DB) / total, 1) if total > 0 else 0
    return {
        "total_scanned_emails": total,
        "phishing_count": phishing,
        "suspicious_count": suspicious,
        "safe_count": safe,
        "average_risk_score": avg_score
    }
