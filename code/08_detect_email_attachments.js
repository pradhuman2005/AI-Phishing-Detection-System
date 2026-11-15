/**
 * n8n JavaScript Code Node: Detect Email Attachments
 * Element Index: 8
 * Node Type: n8n-nodes-base.code
 * Description: Standalone exported JavaScript code executed in this workflow step.
 */

const items = $input.all();

return items.map(item => {
  const binary = item.binary ?? {};
  const keys = Object.keys(binary);

  const attachments = keys.map(key => ({
    binary_key: key,
    file_name: binary[key].fileName ?? key,
    mime_type: binary[key].mimeType ?? "application/octet-stream",
    file_size: binary[key].fileSize ?? null
  }));

  return {
    json: {
      email_id: item.json.id ?? null,
      attachment_count: attachments.length,
      attachments,
      attachment_status: attachments.length
        ? "Ready to scan"
        : "No attachments"
    },
    binary
  };
});
