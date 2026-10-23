
(() => {
  if (window.aiMailGuardianLoaded) return;
  window.aiMailGuardianLoaded = true;

  const processedRows = new WeakSet();

  function makeElement(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  }

  function getEmailDetails(row) {
    const subjectEl = row.querySelector(".bog");
    const senderEl = row.querySelector(".yW span[email], .yW span, .gD");

    const threadId =
      row.getAttribute("data-thread-id") ||
      row.querySelector("[data-thread-id]")?.getAttribute("data-thread-id");

    return {
      subject: subjectEl?.innerText?.trim() || "Email",
      sender:
        senderEl?.getAttribute("email") ||
        senderEl?.innerText?.trim() ||
        "Unknown sender",
      email_id: threadId || null
    };
  }

  function requestReport(emailId) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "GET_SECURITY_REPORT",
          email_id: emailId
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (!response?.ok) {
            reject(new Error(response?.error || "Report request failed"));
            return;
          }

          resolve(response.data);
        }
      );
    });
  }

  function addSection(panel, heading, value) {
    const section = makeElement("section", undefined, "amg-section");
    section.appendChild(makeElement("h3", heading));

    const content = makeElement("div", undefined, "amg-section-content");

    if (Array.isArray(value)) {
      if (value.length === 0) {
        content.appendChild(makeElement("p", "No details available."));
      } else {
        const list = makeElement("ul");
        value.forEach((item) => {
          const text =
            typeof item === "string"
              ? item
              : JSON.stringify(item, null, 2);
          list.appendChild(makeElement("li", text));
        });
        content.appendChild(list);
      }
    } else if (value && typeof value === "object") {
      content.appendChild(
        makeElement("pre", JSON.stringify(value, null, 2))
      );
    } else {
      content.appendChild(
        makeElement("p", String(value ?? "Not available"))
      );
    }

    section.appendChild(content);
    panel.appendChild(section);
  }

  function renderReport(panel, response, requestedEmail) {
    let report = response;

    if (typeof response?.report_json === "string") {
      try {
        report = JSON.parse(response.report_json);
      } catch {
        throw new Error("Saved report JSON is invalid.");
      }
    }

    if (Array.isArray(response)) {
      report = response[0];
      if (typeof report?.report_json === "string") {
        report = JSON.parse(report.report_json);
      }
    }

    if (!report || typeof report !== "object") {
      throw new Error("No report data was returned.");
    }

    const scoreValue =
      report.risk_score ?? response?.risk_score ?? null;

    const score = Number(scoreValue);
    const level =
      report.risk_level ??
      response?.risk_level ??
      (Number.isFinite(score)
        ? score <= 25
          ? "Safe"
          : score <= 60
            ? "Suspicious"
            : "Dangerous"
        : "Needs Review");

    panel.replaceChildren();

    const header = makeElement("div", undefined, "amg-header");
    header.appendChild(makeElement("h2", "AI Mail Guardian"));
    const close = makeElement("button", "×", "amg-close");
    close.setAttribute("aria-label", "Close report");
    close.onclick = () => panel.remove();
    header.appendChild(close);
    panel.appendChild(header);

    panel.appendChild(makeElement("h3", "Security Report"));
    panel.appendChild(makeElement("p", `Risk level: ${level}`));
    panel.appendChild(
      makeElement(
        "p",
        Number.isFinite(score)
          ? `Risk score: ${score}/100`
          : "Risk score: Not available"
      )
    );

    const email = report.email || {};
    addSection(panel, "Email Details", {
      subject: email.subject ?? response?.subject ?? "Not available",
      sender: email.sender ?? "Not available",
      email_id: email.email_id ?? requestedEmail,
      received_at: email.received_at ?? "Not available"
    });

    const ai = report.ai_analysis || {};
    addSection(panel, "AI Explanation", ai.summary ?? "Not available");
    addSection(panel, "Reasons", ai.reasons ?? []);
    addSection(panel, "Recommendations", ai.recommendations ?? []);

    const urls = report.url_scan || {};
    addSection(panel, "URL Analysis", {
      status: urls.status ?? "Unknown",
      reason: urls.reason ?? "Not provided",
      url_count: urls.url_count ?? 0,
      results: urls.results ?? []
    });

    const attachments = report.attachment_scan || {};
    addSection(panel, "Attachment Analysis", {
      status: attachments.status ?? "Unknown",
      reason: attachments.reason ?? "Not provided",
      hash: attachments.hash ?? "Not available",
      stats: attachments.stats ?? {},
      total_engines: attachments.total_engines ?? 0,
      report_url: attachments.report_url ?? "Not available"
    });

    addSection(
      panel,
      "Important Note",
      report.note ||
        "An unavailable or skipped scan does not prove that an email is safe."
    );
  }

  function openPanel(details) {
    document.querySelector("#amg-report-panel")?.remove();

    const panel = makeElement("aside", undefined, "amg-panel");
    panel.id = "amg-report-panel";

    Object.assign(panel.style, {
      position: "fixed",
      top: "12px",
      right: "12px",
      bottom: "12px",
      width: "min(430px, calc(100vw - 24px))",
      overflowY: "auto",
      zIndex: "999999",
      background: "#ffffff",
      color: "#1f2937",
      border: "1px solid #d1d5db",
      borderRadius: "12px",
      boxShadow: "0 8px 32px rgba(0,0,0,.22)",
      padding: "18px",
      font: "14px/1.5 Arial, sans-serif"
    });

    const header = makeElement("div");
    Object.assign(header.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    });

    header.appendChild(makeElement("h2", "AI Mail Guardian"));
    const close = makeElement("button", "×");
    close.style.cssText = "font-size:24px;cursor:pointer;border:0;background:transparent";
    close.onclick = () => panel.remove();
    header.appendChild(close);
    panel.appendChild(header);

    panel.appendChild(makeElement("p", `Subject: ${details.subject}`));
    panel.appendChild(makeElement("p", `Sender: ${details.sender}`));

    const status = makeElement("p", "Loading saved security report…");
    status.id = "amg-report-status";
    panel.appendChild(status);

    document.body.appendChild(panel);

    if (!details.email_id) {
      status.textContent =
        "Gmail thread ID nahi mila. Email row ka identifier check karna hoga.";
      return;
    }

    requestReport(details.email_id)
      .then((data) => {
        if (!panel.isConnected) return;

        if (!data || (Array.isArray(data) && data.length === 0)) {
          status.textContent =
            "Is email ki saved report nahi mili. Message ID aur thread ID match nahi ho rahe ho sakte hain.";
          return;
        }

        renderReport(panel, data, details.email_id);
      })
      .catch((error) => {
        if (status.isConnected) {
          status.textContent = `Report load nahi hui: ${error.message}`;
        }
      });
  }

  function addBadge(row) {
    if (processedRows.has(row)) return;
    if (row.querySelector(".amg-open-report")) {
      processedRows.add(row);
      return;
    }

    const details = getEmailDetails(row);
    const button = makeElement("button", "Open security report", "amg-open-report");

    button.type = "button";
    button.style.cssText =
      "margin-left:8px;padding:4px 8px;border:1px solid #9ca3af;border-radius:6px;background:#f3f4f6;color:#111827;cursor:pointer;font-size:11px";

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openPanel(details);
    });

    const target =
      row.querySelector(".y6") ||
      row.querySelector(".bog")?.parentElement ||
      row.querySelector("td:last-child");

    if (target) {
      target.appendChild(button);
      processedRows.add(row);
    }
  }

  function scanInbox() {
    document.querySelectorAll('tr.zA').forEach(addBadge);
  }

  scanInbox();

  const observer = new MutationObserver(scanInbox);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  chrome.storage?.onChanged?.addListener((changes, area) => {
    if (area === "local" && changes.amgEnabled?.newValue === false) {
      document.querySelectorAll(".amg-open-report").forEach((el) => el.remove());
      document.querySelector("#amg-report-panel")?.remove();
    }
  });
})();
