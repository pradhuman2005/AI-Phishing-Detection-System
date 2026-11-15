/**
 * n8n JavaScript Code Node: Format Webhook Response
 * Element Index: 25
 * Node Type: n8n-nodes-base.code
 * Description: Standalone exported JavaScript code executed in this workflow step.
 */

const items = $input.all();
const query = $("Webhook").first()?.json?.query || {};
const requestedId = query.email_id || query.id || query.thread_id || null;

const row = items[0]?.json || {};
const hasReport = Boolean(row.report_json || row.email_id || (row.risk_score !== undefined && row.risk_score !== null));

if (!hasReport || !row.email_id) {
  return [{
    json: {
      ok: false,
      found: false,
      error: "REPORT_NOT_FOUND",
      message: "No saved security report was found for this email.",
      requested_id: requestedId
    }
  }];
}

let parsedReport = null;
if (typeof row.report_json === "string") {
  try {
    parsedReport = JSON.parse(row.report_json);
  } catch (e) {
    parsedReport = { raw: row.report_json, error: "Report JSON parsing failed: " + e.message };
  }
} else if (typeof row.report_json === "object" && row.report_json !== null) {
  parsedReport = row.report_json;
}

return [{
  json: {
    ok: true,
    found: true,
    email_id: row.email_id,
    subject: row.subject || parsedReport?.email?.subject || "No Subject",
    risk_score: row.risk_score !== undefined ? Number(row.risk_score) : (parsedReport?.risk_score ?? null),
    risk_level: row.risk_level || parsedReport?.risk_level || "Needs Review",
    scanned_at: row.scanned_at || parsedReport?.report_generated_at || null,
    report: parsedReport
  }
}];
