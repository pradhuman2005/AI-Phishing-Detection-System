/**
 * n8n JavaScript Code Node: Normalize Attachment Scan Results
 * Element Index: 17
 * Node Type: n8n-nodes-base.code
 * Description: Standalone exported JavaScript code executed in this workflow step.
 */

const response = $input.first().json;
const data = response.data ?? response;
const attributes = data.attributes ?? {};
const stats = attributes.stats ?? {};

const fileHash = data.links?.item?.split("/files/")[1] ?? null;

return [{
  json: {
    attachment_scan_status: attributes.status ?? "unknown",
    attachment_hash: fileHash,
    attachment_scan_date: attributes.date
      ? new Date(attributes.date * 1000).toISOString()
      : null,
    attachment_stats: {
      malicious: stats.malicious ?? 0,
      suspicious: stats.suspicious ?? 0,
      harmless: stats.harmless ?? 0,
      undetected: stats.undetected ?? 0
    },
    attachment_total_engines: Object.values(
      attributes.stats ?? {}
    ).reduce((sum, count) => sum + count, 0),
    attachment_report_url: fileHash
      ? `https://www.virustotal.com/gui/file/${fileHash}`
      : null
  }
}];
