
const WEBHOOK_URL = "http://localhost:5678/webhook/mail-security-report";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "GET_SECURITY_REPORT") return;

  (async () => {
    try {
      const url = new URL(WEBHOOK_URL);
      url.searchParams.set("email_id", message.email_id);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error(`n8n returned HTTP ${response.status}`);
      }

      const data = await response.json();
      sendResponse({ ok: true, data });
    } catch (error) {
      sendResponse({ ok: false, error: error.message });
    }
  })();

  return true;
});
