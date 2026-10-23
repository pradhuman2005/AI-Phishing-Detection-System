// Step 4: Normalize Gemini Email Analysis
// This script runs inside an n8n Code Node (JavaScript)
// Purpose: Parses, cleans, and validates the raw output from Google Gemini LLM
// Ensures output conforms to strict cybersecurity classification schema.

const items = $input.all();

return items.map((item) => {
  const data = item.json;

  // Extract raw text from different potential response structures from Gemini
  const rawText =
    data.candidates?.[0]?.content?.parts?.[0]?.text ??
    data.content?.parts?.[0]?.text ??
    data.text ??
    "";

  if (!rawText) {
    return {
      json: {
        classification: "Needs Review",
        risk_score: null,
        reasons: ["Gemini response text empty or unavailable."],
        suspicious_urls: [],
        recommended_action: "Review the email manually.",
        missing_information: ["Gemini model output missing"],
        raw_response: "",
        analyzed_at: new Date().toISOString()
      }
    };
  }

  // Remove Markdown code fences (e.g. ```json ... ```) if returned by the LLM
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let report = {};
  try {
    report = JSON.parse(cleaned);
  } catch (err) {
    report = {
      classification: "Needs Review",
      risk_score: null,
      reasons: [rawText],
      suspicious_urls: [],
      recommended_action: "Review email manually; raw AI response was non-JSON.",
      missing_information: ["Structured AI parsing failed"]
    };
  }

  // Validate and normalize classification verdict
  const allowed = ["Safe", "Suspicious", "Phishing"];
  const classification = allowed.includes(report.classification)
    ? report.classification
    : "Suspicious";

  // Validate and clamp risk score between 0 and 100
  const score = Number(report.risk_score);
  const risk_score = Number.isFinite(score)
    ? Math.max(0, Math.min(100, Math.round(score)))
    : null;

  return {
    json: {
      classification,
      risk_score,
      reasons: Array.isArray(report.reasons) ? report.reasons : [],
      suspicious_urls: Array.isArray(report.suspicious_urls) ? report.suspicious_urls : [],
      recommended_action: report.recommended_action ?? "Review the email manually.",
      missing_information: Array.isArray(report.missing_information) ? report.missing_information : [],
      raw_response: rawText,
      analyzed_at: new Date().toISOString()
    }
  };
});
