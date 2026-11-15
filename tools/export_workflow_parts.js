const fs = require('fs');
const path = require('path');

const repoDir = 'C:\\Users\\hp\\OneDrive\\Desktop\\AI-Phishing-Detection-System';
const workflowPath = path.join(repoDir, 'n8n', 'workflows.json');

const raw = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
const workflow = Array.isArray(raw) ? raw[0] : raw;

console.log('Workflow Name:', workflow.name);
console.log('Total Nodes:', workflow.nodes.length);

// Ensure directories exist
const elementsDir = path.join(repoDir, 'n8n', 'elements');
const partsDir = path.join(repoDir, 'n8n', 'parts');
const byTypeDir = path.join(repoDir, 'n8n', 'by_type');
const scriptsDir = path.join(repoDir, 'n8n', 'scripts');
const codeDir = path.join(repoDir, 'code');

[elementsDir, partsDir, byTypeDir, scriptsDir, codeDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Helper to sanitize filenames
function sanitize(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// 1. Export Element-by-Element JSON and Extract JavaScript Code
console.log('\n--- Exporting Elements & JS Code ---');
const elementsIndex = [];

workflow.nodes.forEach((node, idx) => {
  const num = String(idx + 1).padStart(2, '0');
  const safeName = sanitize(node.name);
  const elemFileName = `${num}_${safeName}.json`;
  
  // Find connections related to this node
  const outgoing = workflow.connections[node.name] || {};
  const incoming = {};
  Object.entries(workflow.connections).forEach(([sourceNode, connMap]) => {
    Object.entries(connMap).forEach(([connType, targetGroups]) => {
      targetGroups.forEach((group, gIdx) => {
        group.forEach(target => {
          if (target.node === node.name) {
            if (!incoming[sourceNode]) incoming[sourceNode] = [];
            incoming[sourceNode].push({ type: connType, groupIndex: gIdx, targetIndex: target.index });
          }
        });
      });
    });
  });

  const elementObject = {
    element_index: idx + 1,
    name: node.name,
    type: node.type,
    typeVersion: node.typeVersion,
    position: node.position,
    parameters: node.parameters,
    credentials: node.credentials || {},
    incoming_connections: incoming,
    outgoing_connections: outgoing
  };

  fs.writeFileSync(path.join(elementsDir, elemFileName), JSON.stringify(elementObject, null, 2), 'utf8');

  // If node has JS code, export separately as .js
  let jsScriptPath = null;
  if (node.parameters && node.parameters.jsCode) {
    const jsFileName = `${num}_${safeName}.js`;
    const fullJsPath = path.join(scriptsDir, jsFileName);
    const header = `/**\n * n8n JavaScript Code Node: ${node.name}\n * Element Index: ${idx + 1}\n * Node Type: ${node.type}\n * Description: Standalone exported JavaScript code executed in this workflow step.\n */\n\n`;
    fs.writeFileSync(fullJsPath, header + node.parameters.jsCode.trim() + '\n', 'utf8');
    // Also copy to root code directory for top-level visibility
    fs.writeFileSync(path.join(codeDir, jsFileName), header + node.parameters.jsCode.trim() + '\n', 'utf8');
    jsScriptPath = `n8n/scripts/${jsFileName}`;
    console.log(`Saved JS Code: ${jsFileName}`);
  }

  elementsIndex.push({
    index: idx + 1,
    name: node.name,
    type: node.type,
    json_file: `n8n/elements/${elemFileName}`,
    js_file: jsScriptPath
  });
});

console.log(`Exported ${workflow.nodes.length} element JSON files to n8n/elements/`);

// 2. Export Pipeline Parts (Functional Stages)
console.log('\n--- Exporting Pipeline Parts ---');
const partsConfig = [
  {
    part: 1,
    slug: 'part1_email_ingestion',
    title: 'Part 1: Email Ingestion & Message Fetching',
    nodeNames: ['Gmail Trigger', 'Get a message']
  },
  {
    part: 2,
    slug: 'part2_gemini_threat_analysis',
    title: 'Part 2: Google Gemini AI Email Analysis & Normalization',
    nodeNames: ['Message a model', 'Normalize Gemini Email Analysis']
  },
  {
    part: 3,
    slug: 'part3_virustotal_url_scanner',
    title: 'Part 3: URL Extraction & VirusTotal Threat Intelligence',
    nodeNames: [
      'Extract URLs From Email',
      'Check If URLs Found',
      'VirusTotal URL Lookup',
      'Normalize VirusTotal URL Results',
      'Handle No URLs Found'
    ]
  },
  {
    part: 4,
    slug: 'part4_virustotal_file_scanner',
    title: 'Part 4: Attachment Detection & VirusTotal Malware Analysis',
    nodeNames: [
      'Detect Email Attachments',
      'Check If Attachments Found',
      'Upload Attachment to VirusTotal',
      'Check VirusTotal File Analysis',
      'Fetch VirusTotal File Report',
      'Process VirusTotal File Response',
      'Normalize Attachment Scan Results',
      'Handle No Attachments Found'
    ]
  },
  {
    part: 5,
    slug: 'part5_risk_scoring_and_report',
    title: 'Part 5: Multi-Vector Scan Merging & Deterministic Risk Scoring',
    nodeNames: ['Merge URL and Attachment Scans', 'Build Final Security Report']
  },
  {
    part: 6,
    slug: 'part6_datatable_and_alerts',
    title: 'Part 6: Storage Persistence & Security Email Alerts',
    nodeNames: ['Save Report to Data Table', 'Send Security Alert Email']
  },
  {
    part: 7,
    slug: 'part7_webhook_extension_api',
    title: 'Part 7: Webhook Ingress & Chrome Extension API',
    nodeNames: [
      'Webhook',
      'Get Report from Data Table',
      'Format Webhook Response',
      'Respond to Webhook'
    ]
  }
];

partsConfig.forEach(p => {
  const partNodes = workflow.nodes.filter(n => p.nodeNames.includes(n.name));
  const partConnections = {};
  p.nodeNames.forEach(name => {
    if (workflow.connections[name]) {
      partConnections[name] = workflow.connections[name];
    }
  });

  const partWorkflow = {
    name: p.title,
    part_number: p.part,
    total_nodes: partNodes.length,
    node_names: p.nodeNames,
    nodes: partNodes,
    connections: partConnections
  };

  const partFilePath = path.join(partsDir, `${p.slug}.json`);
  fs.writeFileSync(partFilePath, JSON.stringify(partWorkflow, null, 2), 'utf8');
  console.log(`Saved Part ${p.part}: ${p.slug}.json (${partNodes.length} nodes)`);
});

// 3. Export By All Node Types
console.log('\n--- Exporting By All Node Types ---');
const typeCategories = {
  'trigger_nodes': {
    title: 'Event Trigger Nodes',
    types: ['n8n-nodes-base.gmailTrigger']
  },
  'ai_models': {
    title: 'AI LangChain & Gemini Nodes',
    types: ['@n8n/n8n-nodes-langchain.googleGemini']
  },
  'email_service_nodes': {
    title: 'Gmail Email Service Nodes',
    types: ['n8n-nodes-base.gmail']
  },
  'code_nodes': {
    title: 'JavaScript Data Processing Code Nodes',
    types: ['n8n-nodes-base.code']
  },
  'http_threat_intel_nodes': {
    title: 'VirusTotal HTTP Request Nodes',
    types: ['n8n-nodes-base.httpRequest']
  },
  'logic_and_routing_nodes': {
    title: 'Routing, Filtering & Merge Logic Nodes',
    types: ['n8n-nodes-base.if', 'n8n-nodes-base.merge']
  },
  'database_storage_nodes': {
    title: 'Data Table Persistence Nodes',
    types: ['n8n-nodes-base.dataTable']
  },
  'webhook_api_nodes': {
    title: 'Webhook & Extension Ingress/Response Nodes',
    types: ['n8n-nodes-base.webhook', 'n8n-nodes-base.respondToWebhook']
  }
};

Object.entries(typeCategories).forEach(([key, cat]) => {
  const matchedNodes = workflow.nodes.filter(n => cat.types.includes(n.type));
  const outObj = {
    category: cat.title,
    matched_types: cat.types,
    count: matchedNodes.length,
    nodes: matchedNodes
  };
  fs.writeFileSync(path.join(byTypeDir, `${key}.json`), JSON.stringify(outObj, null, 2), 'utf8');
  console.log(`Saved Type Category: ${key}.json (${matchedNodes.length} nodes)`);
});

console.log('\nWorkflow breakdown successfully completed!');
