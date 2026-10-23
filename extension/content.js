// Runs inside Gmail. Finds the open email, asks background.js for its report,
// shows a badge next to the subject, and a simple report panel on click.
// All text is inserted with textContent (never innerHTML) because email data is untrusted.

(() => {
  const POLL_MS = 5000;
  const MAX_TRIES = 24; // ~2 minutes
  const cache = new Map();

  let currentId = null;
  let state = { status: "pending" };
  let pollTimer = null;
  let badge = null;
  let panel = null;

  // ---------- tiny DOM helper ----------
  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  // ---------- find the open email ----------
  function findMessageId() {
    if (!document.querySelector("h2.hP")) return null; // no email subject => list view
    const nodes = document.querySelectorAll("[data-legacy-message-id]");
    if (!nodes.length) return null;
    return nodes[nodes.length - 1].getAttribute("data-legacy-message-id");
  }

  // ---------- verdict helpers ----------
  function verdictInfo(report) {
    const level = report && report.risk_level;
    if (level === "Safe")
      return { cls: "esc-safe", label: "Safe", title: "This email looks safe", sub: "We found no strong warning signs." };
    if (level === "Suspicious")
      return { cls: "esc-suspicious", label: "Suspicious", title: "Be careful with this email", sub: "Some things look unusual. Check before you click or reply." };
    if (level === "Dangerous")
      return { cls: "esc-dangerous", label: "Dangerous", title: "This email looks dangerous", sub: "Do not click links, open files, or reply." };
    return { cls: "esc-neutral", label: "Needs review", title: "We could not decide", sub: "Please review this email carefully yourself." };
  }

  function badgeInfo() {
    switch (state.status) {
      case "ready": {
        const v = verdictInfo(state.report);
        return { cls: v.cls, text: "🛡 " + v.label };
      }
      case "pending":
        return { cls: "esc-neutral", text: "🛡 Checking…" };
      case "notfound":
        return { cls: "esc-neutral", text: "🛡 Not scanned" };
      case "not_configured":
        return { cls: "esc-neutral", text: "🛡 Setup needed" };
      default:
        return { cls: "esc-neutral", text: "🛡 Check failed" };
    }
  }

  // ---------- badge ----------
  function ensureBadge() {
    const subject = document.querySelector("h2.hP");
    if (!subject) return;
    if (!badge || !badge.isConnected) {
      badge = el("span", "esc-badge");
      badge.addEventListener("click", togglePanel);
      subject.parentElement.appendChild(badge);
    }
    const info = badgeInfo();
    badge.className = "esc-badge " + info.cls;
    badge.textContent = info.text;
  }

  function removeBadge() {
    if (badge) badge.remove();
    badge = null;
    closePanel();
  }

  // ---------- panel ----------
  function togglePanel() {
    if (panel) closePanel();
    else {
      panel = el("div", "esc-panel");
      document.body.appendChild(panel);
      renderPanel();
    }
  }

  function closePanel() {
    if (panel) panel.remove();
    panel = null;
  }

  function row(label, value, cls) {
    const r = el("div", "esc-row");
    r.appendChild(el("span", "", label));
    r.appendChild(el("span", cls || "", value));
    return r;
  }

  function section(body, title) {
    body.appendChild(el("h3", "", title));
  }

  function renderPanel() {
    if (!panel) return;
    panel.textContent = "";

    // Non-report states
    if (state.status !== "ready") {
      const v = { cls: "esc-neutral" };
      const head = el("div", "esc-head " + v.cls);
      const close = el("button", "esc-close", "×");
      close.addEventListener("click", closePanel);
      head.appendChild(close);

      const messages = {
        pending: ["Checking this email…", "Our scanners are working. This usually takes about a minute."],
        notfound: ["No report yet", "This email has not been scanned. It may be older than the extension setup, or the scan is still running."],
        not_configured: ["Setup needed", "Open the extension settings and add your n8n webhook URL."],
        error: ["Could not load the report", state.message || "Please try again in a moment."]
      };
      const m = messages[state.status] || messages.error;
      head.appendChild(el("h2", "", m[0]));
      head.appendChild(el("p", "", m[1]));
      panel.appendChild(head);
      return;
    }

    const report = state.report || {};
    const v = verdictInfo(report);

    // Header
    const head = el("div", "esc-head " + v.cls);
    const close = el("button", "esc-close", "×");
    close.addEventListener("click", closePanel);
    head.appendChild(close);
    head.appendChild(el("h2", "", v.title));
    head.appendChild(el("p", "", v.sub));
    if (typeof report.risk_score === "number") {
      head.appendChild(el("p", "", "Risk score: " + report.risk_score + " / 100"));
      const bar = el("div", "esc-bar");
      const fill = document.createElement("div");
      fill.style.width = Math.max(0, Math.min(100, report.risk_score)) + "%";
      bar.appendChild(fill);
      head.appendChild(bar);
    }
    panel.appendChild(head);

    const body = el("div", "esc-body");
    panel.appendChild(body);

    // Why
    const ai = report.ai_analysis || {};
    const reasons = Array.isArray(ai.reasons) ? ai.reasons : [];
    section(body, "Why we think so");
    if (reasons.length) {
      const ul = el("ul");
      reasons.forEach((r) => ul.appendChild(el("li", "", r)));
      body.appendChild(ul);
    } else {
      body.appendChild(el("p", "esc-muted", ai.summary || "No explanation available."));
    }

    // What we checked
    section(body, "What we checked");

    body.appendChild(row("AI email analysis", "Done", "esc-ok"));

    const us = report.url_scan || {};
    const urlResults = Array.isArray(us.results) ? us.results : [];
    const badLinks = urlResults.filter((r) => (r.analysis_stats?.malicious ?? 0) > 0).length;
    const susLinks = urlResults.filter((r) => (r.analysis_stats?.suspicious ?? 0) > 0).length;
    if (us.status === "Completed") {
      if (badLinks) body.appendChild(row("Links (VirusTotal)", badLinks + " dangerous of " + urlResults.length, "esc-bad"));
      else if (susLinks) body.appendChild(row("Links (VirusTotal)", susLinks + " suspicious of " + urlResults.length, "esc-warn"));
      else body.appendChild(row("Links (VirusTotal)", urlResults.length + " checked, none flagged", "esc-ok"));
    } else {
      body.appendChild(row("Links (VirusTotal)", "No links to check", "esc-muted"));
    }

    const as = report.attachment_scan || {};
    const st = as.stats || {};
    if (as.status === "Skipped") {
      body.appendChild(row("Attachments (VirusTotal)", "No attachments", "esc-muted"));
    } else if ((st.malicious ?? 0) > 0) {
      body.appendChild(row("Attachments (VirusTotal)", st.malicious + " engines say it is a virus", "esc-bad"));
    } else if ((st.suspicious ?? 0) > 0) {
      body.appendChild(row("Attachments (VirusTotal)", st.suspicious + " engines say suspicious", "esc-warn"));
    } else if (as.status === "completed") {
      body.appendChild(row("Attachments (VirusTotal)", "Scanned, nothing found", "esc-ok"));
    } else {
      body.appendChild(row("Attachments (VirusTotal)", "Scan not finished (" + (as.status || "unknown") + ")", "esc-warn"));
    }

    // Sender verification (filled in once the DNS step is added to n8n)
    const sa = report.sender_auth;
    if (sa) {
      ["spf", "dkim", "dmarc"].forEach((k) => {
        const val = String(sa[k] || "unknown");
        body.appendChild(row("Sender check: " + k.toUpperCase(), val, val === "pass" ? "esc-ok" : val === "fail" ? "esc-bad" : "esc-warn"));
      });
    } else {
      body.appendChild(row("Sender verification", "Coming soon", "esc-muted"));
    }

    // Link details
    if (urlResults.length) {
      section(body, "Links found");
      urlResults.forEach((r) => {
        const s = r.analysis_stats || {};
        let tag = "no warnings";
        let cls = "esc-ok";
        if (!r.found_in_virustotal) { tag = "not known to VirusTotal yet"; cls = "esc-muted"; }
        if ((s.suspicious ?? 0) > 0) { tag = "suspicious"; cls = "esc-warn"; }
        if ((s.malicious ?? 0) > 0) { tag = "dangerous"; cls = "esc-bad"; }
        const box = el("div", "esc-url");
        const u = String(r.original_url || "");
        box.appendChild(el("div", "", u.length > 90 ? u.slice(0, 90) + "…" : u));
        box.appendChild(el("div", cls, tag));
        body.appendChild(box);
      });
    }

    // File report link (only VirusTotal links)
    if (as.report_url && String(as.report_url).startsWith("https://www.virustotal.com/")) {
      const p = el("p");
      const a = document.createElement("a");
      a.href = as.report_url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "View attachment report on VirusTotal";
      p.appendChild(a);
      body.appendChild(p);
    }

    // What to do
    const recs = Array.isArray(ai.recommendations)
      ? ai.recommendations
      : ai.recommendations ? [ai.recommendations] : [];
    if (recs.length) {
      section(body, "What you should do");
      const ul = el("ul");
      recs.forEach((r) => ul.appendChild(el("li", "", r)));
      body.appendChild(ul);
    }

    body.appendChild(el("p", "esc-note", report.note || "Risk scores are estimates, not guarantees."));
  }

  // ---------- fetch + polling ----------
  function startCheck(id) {
    clearTimeout(pollTimer);
    if (cache.has(id)) {
      state = cache.get(id);
      refresh();
      return;
    }
    state = { status: "pending" };
    refresh();
    poll(id, 0);
  }

  function poll(id, tries) {
    chrome.runtime.sendMessage({ type: "GET_REPORT", emailId: id }, (res) => {
      if (id !== currentId) return; // user moved to another email
      if (chrome.runtime.lastError || !res) {
        state = { status: "error", message: "Extension could not reach its background worker." };
        return refresh();
      }
      if (res.status === "ready") {
        cache.set(id, res);
        state = res;
      } else if (res.status === "pending") {
        if (tries < MAX_TRIES) {
          state = res;
          pollTimer = setTimeout(() => poll(id, tries + 1), POLL_MS);
        } else {
          state = { status: "notfound" };
        }
      } else {
        state = res;
      }
      refresh();
    });
  }

  function refresh() {
    ensureBadge();
    renderPanel();
  }

  // ---------- watch Gmail for navigation ----------
  function tick() {
    const id = findMessageId();
    if (!id) {
      if (currentId !== null) {
        currentId = null;
        clearTimeout(pollTimer);
        removeBadge();
      }
      return;
    }
    if (id !== currentId) {
      currentId = id;
      closePanel();
      startCheck(id);
    } else {
      ensureBadge(); // Gmail may re-render and drop our badge
    }
  }

  let debounce = null;
  new MutationObserver(() => {
    clearTimeout(debounce);
    debounce = setTimeout(tick, 400);
  }).observe(document.body, { childList: true, subtree: true });

  tick();
})();