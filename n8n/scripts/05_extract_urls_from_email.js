/**
 * n8n JavaScript Code Node: Extract URLs From Email
 * Element Index: 5
 * Node Type: n8n-nodes-base.code
 * Description: Standalone exported JavaScript code executed in this workflow step.
 */

const gemini = $input.first()?.json || {};
const email = $("Get a message").first()?.json || {};

// Combine plain text, html body, and snippet
const textSources = [
  email.textPlain || "",
  email.textHtml || "",
  email.snippet || ""
].join("\n");

// URL Regex to extract all http/https URLs
const urlRegex = /https?:\/\/[^\s<>"'()\[\]{}|\\^`]+/gi;
const matchedUrls = textSources.match(urlRegex) || [];

// Add any suspicious URLs flagged directly by Gemini
const geminiUrls = Array.isArray(gemini.suspicious_urls) ? gemini.suspicious_urls : [];

// Normalize and deduplicate URLs
const allCandidates = [...matchedUrls, ...geminiUrls];
const validUrls = [...new Set(
  allCandidates
    .filter(u => typeof u === "string")
    .map(u => u.trim().replace(/[.,;:]+$/, ""))
    .filter(u => {
      try {
        const p = new URL(u);
        return p.protocol === "http:" || p.protocol === "https:";
      } catch {
        return false;
      }
    })
)];

if (validUrls.length === 0) {
  return [{
    json: {
      has_urls: false,
      url_count: 0,
      urls: [],
      virustotal_lookup_url: null,
      status: "No eligible URLs found"
    }
  }];
}

// For VirusTotal API v3 URL lookup: RFC 4648 base64url encoded without padding
return validUrls.slice(0, 5).map((url, index) => {
  const urlId = Buffer.from(url, "utf8")
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return {
    json: {
      has_urls: true,
      original_url: url,
      url_id: urlId,
      url_index: index,
      total_urls: validUrls.length,
      virustotal_lookup_url: `https://www.virustotal.com/api/v3/urls/${urlId}`
    }
  };
});
