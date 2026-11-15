/**
 * n8n JavaScript Code Node: Handle No Attachments Found
 * Element Index: 24
 * Node Type: n8n-nodes-base.code
 * Description: Standalone exported JavaScript code executed in this workflow step.
 */

return [{
  json: {
    attachment_scan_status: "Skipped",
    attachment_scan_reason: "No attachments found in this email",
    attachment_hash: null,
    attachment_stats: {
      malicious: 0,
      suspicious: 0,
      harmless: 0,
      undetected: 0
    },
    attachment_total_engines: 0,
    attachment_report_url: null
  }
}];
