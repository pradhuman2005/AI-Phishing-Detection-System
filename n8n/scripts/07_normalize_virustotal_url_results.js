/**
 * n8n JavaScript Code Node: Normalize VirusTotal URL Results
 * Element Index: 7
 * Node Type: n8n-nodes-base.code
 * Description: Standalone exported JavaScript code executed in this workflow step.
 */

const items = $input.all();
const results = items.map(item => {
  const data = item.json;
  const respData = data.data || {};
  const attributes = respData.attributes || {};
  const stats = attributes.last_analysis_stats || {};
  const origUrl = item.json.original_url || attributes.url || "Unknown URL";

  return {
    original_url: origUrl,
    url_id: respData.id || item.json.url_id || null,
    reputation: attributes.reputation ?? 0,
    analysis_stats: {
      malicious: stats.malicious ?? 0,
      suspicious: stats.suspicious ?? 0,
      harmless: stats.harmless ?? 0,
      undetected: stats.undetected ?? 0
    },
    last_analysis_date: attributes.last_analysis_date
      ? new Date(attributes.last_analysis_date * 1000).toISOString()
      : null,
    report_url: respData.id ? `https://www.virustotal.com/gui/url/${respData.id}` : null
  };
});

const totalMalicious = results.reduce((sum, r) => sum + r.analysis_stats.malicious, 0);
const totalSuspicious = results.reduce((sum, r) => sum + r.analysis_stats.suspicious, 0);

return [{
  json: {
    url_scan_status: totalMalicious > 0 ? "Malicious" : (totalSuspicious > 0 ? "Suspicious" : "Clean"),
    url_scan_reason: `${results.length} URL(s) scanned via VirusTotal`,
    url_scan_count: results.length,
    url_results: results,
    total_malicious_urls: totalMalicious,
    total_suspicious_urls: totalSuspicious
  }
}];
