const urlInput = document.getElementById("url");
const tokenInput = document.getElementById("token");
const msg = document.getElementById("msg");

chrome.storage.sync.get(["webhookUrl", "token"]).then(({ webhookUrl, token }) => {
  urlInput.value = webhookUrl || "";
  tokenInput.value = token || "";
});

document.getElementById("save").addEventListener("click", async () => {
  msg.textContent = "";
  let parsed;
  try {
    parsed = new URL(urlInput.value.trim());
    if (!/^https?:$/.test(parsed.protocol)) throw new Error("bad protocol");
  } catch {
    msg.textContent = "Please enter a valid http(s) URL.";
    return;
  }

  // Ask Chrome for permission to call only this one host
  const granted = await chrome.permissions.request({ origins: [parsed.origin + "/*"] });
  if (!granted) {
    msg.textContent = "Permission denied. The extension needs access to your n8n host.";
    return;
  }

  await chrome.storage.sync.set({
    webhookUrl: parsed.toString(),
    token: tokenInput.value.trim()
  });
  msg.textContent = "Saved. Reload Gmail and open an email.";
});