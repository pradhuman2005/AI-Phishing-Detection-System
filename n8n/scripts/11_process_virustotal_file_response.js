/**
 * n8n JavaScript Code Node: Process VirusTotal File Response
 * Element Index: 11
 * Node Type: n8n-nodes-base.code
 * Description: Standalone exported JavaScript code executed in this workflow step.
 */

const response = $input.first().json;
const data = response.data ?? response;
const attributes = data.attributes ?? {};
const stats = attributes.stats ?? {};

return [{
  json: {
    analysis_id: data.id ?? null,
    scan_status: attributes.status ?? "unknown",
    scan_date: attributes.date
      ? new Date(attributes.date * 1000).toISOString()
      : null,
    malicious: stats.malicious ?? 0,
    suspicious: stats.suspicious ?? 0,
    harmless: stats.harmless ?? 0,
    undetected: stats.undetected ?? 0,
    total_engines: Object.keys(attributes.results ?? {}).length,
    file_analysis: attributes.results ?? {},
    virus_total_report_url: data.links?.item
      ? `https://www.virustotal.com/gui/file/${data.id}`
      : null
  }
}];
