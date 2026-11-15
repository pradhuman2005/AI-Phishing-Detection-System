/**
 * n8n JavaScript Code Node: Build Final Security Report
 * Element Index: 13
 * Node Type: n8n-nodes-base.code
 * Description: Standalone exported JavaScript code executed in this workflow step.
 */

const merged = $input.first()?.json ?? {};
const ai = $("Normalize Gemini Email Analysis").first()?.json ?? {};
const email = $("Get a message").first()?.json ?? {};

// 1. Gemini Risk Assessment
let geminiScore = Number(ai.risk_score);
const hasGeminiScore = Number.isFinite(geminiScore);
if (hasGeminiScore) {
  geminiScore = Math.max(0, Math.min(100, Math.round(geminiScore)));
}

// 2. URL Scan Results
const urlResults = Array.isArray(merged.url_results) ? merged.url_results : [];
const urlMalicious = urlResults.reduce((sum, r) => sum + (r.analysis_stats?.malicious || 0), 0);
const urlSuspicious = urlResults.reduce((sum, r) => sum + (r.analysis_stats?.suspicious || 0), 0);
const urlStatus = merged.url_scan_status || (urlResults.length > 0 ? "Completed" : "Skipped");

// 3. Attachment Scan Results
const attachStats = merged.attachment_stats || {
  malicious: merged.malicious ?? 0,
  suspicious: merged.suspicious ?? 0,
  harmless: merged.harmless ?? 0,
  undetected: merged.undetected ?? 0
};
const attachMalicious = attachStats.malicious || 0;
const attachSuspicious = attachStats.suspicious || 0;
const attachStatus = merged.attachment_scan_status || merged.scan_status || "Unknown";

// 4. Authentication Signals (SPF/DKIM/DMARC)
const authResults = String(
  email.headers?.["authentication-results"] ||
  email["authentication-results"] ||
  ""
).toLowerCase();

const dkimPass = authResults.includes("dkim=pass");
const spfPass = authResults.includes("spf=pass");
const dmarcPass = authResults.includes("dmarc=pass");
const authFail =
  authResults.includes("dkim=fail") ||
  authResults.includes("spf=fail") ||
  authResults.includes("dmarc=fail");

// 5. Multi-factor Explainable Risk Scoring (0 - 100)
let score = 0;
const scoreBreakdown = [];

// A. AI Content Analysis (up to 50 pts)
if (hasGeminiScore) {
  const aiContribution = Math.round(geminiScore * 0.5);
  score += aiContribution;
  scoreBreakdown.push(`Gemini AI content risk analysis (${geminiScore}/100): +${aiContribution} pts`);
} else {
  score += 30;
  scoreBreakdown.push("Gemini AI content analysis unavailable: default +30 pts baseline");
}

// B. VirusTotal Attachment Threat Intel (up to 45 pts)
if (attachMalicious > 0) {
  const attachPoints = Math.min(45, attachMalicious * 20);
  score += attachPoints;
  scoreBreakdown.push(`Malicious attachment flagged by ${attachMalicious} engine(s): +${attachPoints} pts`);
} else if (attachSuspicious > 0) {
  const suspPoints = Math.min(20, attachSuspicious * 10);
  score += suspPoints;
  scoreBreakdown.push(`Suspicious attachment flagged by ${attachSuspicious} engine(s): +${suspPoints} pts`);
}

// C. VirusTotal URL Threat Intel (up to 40 pts)
if (urlMalicious > 0) {
  const urlPoints = Math.min(40, urlMalicious * 15);
  score += urlPoints;
  scoreBreakdown.push(`Malicious URL(s) flagged by ${urlMalicious} engine(s): +${urlPoints} pts`);
} else if (urlSuspicious > 0) {
  const suspUrlPoints = Math.min(20, urlSuspicious * 8);
  score += suspUrlPoints;
  scoreBreakdown.push(`Suspicious URL(s) flagged by ${urlSuspicious} engine(s): +${suspUrlPoints} pts`);
}

// D. Authentication Verification Signal
if (authFail) {
  score += 15;
  scoreBreakdown.push("Email authentication check failed (SPF/DKIM/DMARC fail): +15 pts");
} else if (dkimPass && spfPass && score > 10 && attachMalicious === 0 && urlMalicious === 0) {
  score = Math.max(0, score - 10);
  scoreBreakdown.push("Verified sender domain (SPF and DKIM pass): -10 pts credit");
}

// Clamp final score to 0..100
score = Math.max(0, Math.min(100, Math.round(score)));

// E. Classification based on user's exact specification
let level = "Needs Review";
if (!hasGeminiScore && urlStatus === "Skipped" && attachStatus === "Skipped") {
  level = "Scan Incomplete";
} else if (score <= 25) {
  level = "Low Risk";
} else if (score <= 50) {
  level = "Moderate Risk";
} else if (score <= 75) {
  level = "High Risk";
} else {
  level = "Critical";
}

// 6. Summary and Recommendations
const summary =
  ai.summary ??
  ai.analysis ??
  (Array.isArray(ai.reasons) && ai.reasons.length > 0 ? ai.reasons.join(". ") : (ai.raw_response || "Analysis complete."));

const recommendations =
  Array.isArray(ai.recommendations) && ai.recommendations.length > 0
    ? ai.recommendations
    : score >= 51
      ? ["Do not click any links or download attachments from this email.", "Report this email as phishing.", "Delete or quarantine the message immediately."]
      : score >= 26
        ? ["Verify sender address before replying or acting on requests.", "Check links carefully before clicking."]
        : ["No immediate threats detected. Remain cautious with unsolicited requests."];

// 7. Output Final Report
return [{
  json: {
    report_generated_at: new Date().toISOString(),

    email: {
      email_id: email.id ?? null,
      thread_id: email.threadId ?? null,
      sender: email.from?.text ?? email.from ?? email.headers?.from ?? "Unknown sender",
      subject: email.subject ?? email.headers?.subject ?? "No Subject",
      received_at: email.date ?? email.headers?.date ?? new Date().toISOString()
    },

    risk_score: score,
    risk_level: level,
    score_breakdown: scoreBreakdown,

    ai_analysis: {
      classification: ai.classification ?? level,
      summary,
      reasons: Array.isArray(ai.reasons) ? ai.reasons : [],
      recommendations,
      raw_response: ai.raw_response ?? ""
    },

    url_scan: {
      status: urlStatus,
      reason: merged.url_scan_reason ?? (urlResults.length > 0 ? "Scanned via VirusTotal" : "No URLs eligible for scan"),
      url_count: urlResults.length,
      results: urlResults
    },

    attachment_scan: {
      status: attachStatus,
      reason: merged.attachment_scan_reason ?? (attachStatus === "Skipped" ? "No attachments found" : "Analyzed via VirusTotal"),
      hash: merged.attachment_hash ?? null,
      stats: attachStats,
      total_engines: merged.attachment_total_engines ?? merged.total_engines ?? 0,
      report_url: merged.attachment_report_url ?? merged.virus_total_report_url ?? null
    },

    note: "AI risk scores are estimates. Skipped or incomplete scans do not establish that an email is safe. Percentage values represent system risk scores, not a statistical probability of phishing."
  }
}];
