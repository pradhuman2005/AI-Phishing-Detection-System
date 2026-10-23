// Fetches the report from your n8n webhook.
// Done here (not in content.js) so Gmail's page CORS rules don't apply.

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "GET_REPORT") {
    fetchReport(msg.emailId).then(sendResponse);
    return true; // keep the channel open for the async response
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") chrome.runtime.openOptionsPage();
});

async function fetchReport(emailId) {
  const { webhookUrl, token } = await chrome.storage.sync.get(["webhookUrl", "token"]);
  if (!webhookUrl) return { status: "not_configured" };

  try {
    const url = new URL(webhookUrl);
    url.searchParams.set("email_id", emailId);

    const headers = {};
    if (token) headers["x-api-token"] = token;

    const res = await fetch(url.toString(), { headers });

    // n8n answers 404/5xx when no row exists yet (email not scanned yet)
    if (res.status === 404 || res.status >= 500) return { status: "pending" };
    if (!res.ok) return { status: "error", message: "Server returned " + res.status };

    const text = await res.text();
    if (!text.trim()) return { status: "pending" };

    const data = JSON.parse(text);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || !row.report_json) return { status: "pending" };

    const report =
      typeof row.report_json === "string" ? JSON.parse(row.report_json) : row.report_json;

    return { status: "ready", report };
  } catch (e) {
    return { status: "error", message: String((e && e.message) || e) };
  }
}