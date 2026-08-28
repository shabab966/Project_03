const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\assha\\.gemini\\antigravity\\brain\\0c0019db-a7b2-4b71-9068-d444684ce711\\.system_generated\\logs\\transcript.jsonl';
const outDesktopMd = 'C:\\Users\\assha\\OneDrive\\Desktop\\CSE226_Chat_History.md';
const outDesktopHtml = 'C:\\Users\\assha\\OneDrive\\Desktop\\CSE226_Chat_History.html';
const outRepoMd = path.join(__dirname, '..', 'AI_PROMPT_RESPONSE_HISTORY.md');

if (!fs.existsSync(transcriptPath)) {
  console.error('Transcript not found at:', transcriptPath);
  process.exit(1);
}

const rawLines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
const messages = [];

rawLines.forEach((line) => {
  try {
    const data = JSON.parse(line);
    
    // User messages
    if (data.type === 'USER_INPUT' && data.content) {
      let content = data.content;
      // Clean up metadata tags if present
      content = content.replace(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/g, '$1');
      content = content.replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, '');
      content = content.replace(/<CONTEXT_SUMMARY>[\s\S]*?<\/CONTEXT_SUMMARY>/g, '');
      content = content.replace(/<SYSTEM_MESSAGE>[\s\S]*?<\/SYSTEM_MESSAGE>/g, '');
      content = content.trim();
      
      // Redact sensitive tokens/keys
      content = content.replace(/ghp_[a-zA-Z0-9]{30,}/g, '[REDACTED_GITHUB_TOKEN]');
      content = content.replace(/re_[a-zA-Z0-9_]{30,}/g, '[REDACTED_RESEND_KEY]');

      if (content) {
        messages.push({
          role: 'User',
          time: data.created_at || new Date().toISOString(),
          content: content
        });
      }
    }

    // Assistant responses
    if (data.type === 'PLANNER_RESPONSE' && data.content) {
      let content = data.content;
      content = content.replace(/ghp_[a-zA-Z0-9]{30,}/g, '[REDACTED_GITHUB_TOKEN]');
      content = content.replace(/re_[a-zA-Z0-9_]{30,}/g, '[REDACTED_RESEND_KEY]');
      content = content.trim();

      if (content) {
        // If previous message was also assistant, combine or push
        messages.push({
          role: 'Antigravity (AI Assistant)',
          time: data.created_at || new Date().toISOString(),
          content: content
        });
      }
    }
  } catch (e) {}
});

console.log(`Extracted ${messages.length} conversation turns.`);

// 1. Generate Markdown
let mdOutput = `# CSE226 - Foundations of Vibe Coding
## Project 03: Complete AI Prompt & Response History

- **Course**: CSE226: Foundations of Vibe Coding (North South University)
- **Project**: Inter-Office Memo Management System
- **Repository**: https://github.com/shabab966/Project_03
- **Live URL**: https://inter-office-memo-system.onrender.com
- **Generated**: ${new Date().toLocaleString()}

---

`;

messages.forEach((msg, idx) => {
  mdOutput += `### ${idx + 1}. [${msg.role}] &mdash; ${new Date(msg.time).toLocaleString()}\n\n`;
  mdOutput += `${msg.content}\n\n`;
  mdOutput += `---\n\n`;
});

fs.writeFileSync(outDesktopMd, mdOutput, 'utf8');
fs.writeFileSync(outRepoMd, mdOutput, 'utf8');
console.log('Saved Markdown to Desktop and Project Repository.');

// 2. Generate Beautiful HTML
const escapeHtml = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br/>');
};

let htmlOutput = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSE226 AI Chat History | Inter-Office Memo System</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      line-height: 1.6;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #0f172a;
    }
    .header p {
      margin: 4px 0;
      color: #64748b;
      font-size: 14px;
    }
    .print-btn {
      background: #0284c7;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 16px;
      display: inline-block;
    }
    .print-btn:hover {
      background: #0369a1;
    }
    .message-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }
    .message-card.user {
      border-left: 4px solid #0284c7;
      background: #f0f9ff;
    }
    .message-card.assistant {
      border-left: 4px solid #8b5cf6;
    }
    .role-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 12px;
    }
    .role-badge.user {
      background: #bae6fd;
      color: #0369a1;
    }
    .role-badge.assistant {
      background: #ede9fe;
      color: #6d28d9;
    }
    .timestamp {
      float: right;
      font-size: 12px;
      color: #94a3b8;
    }
    .content {
      font-size: 14px;
      color: #334155;
      white-space: pre-wrap;
      word-break: break-word;
    }
    @media print {
      body { background: white; padding: 0; }
      .print-btn { display: none; }
      .message-card { box-shadow: none; border: 1px solid #ccc; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CSE226 - Foundations of Vibe Coding</h1>
      <p><strong>Project:</strong> Inter-Office Memo Management System</p>
      <p><strong>Institution:</strong> North South University</p>
      <p><strong>Repository:</strong> <a href="https://github.com/shabab966/Project_03" target="_blank">https://github.com/shabab966/Project_03</a></p>
      <p><strong>Live App:</strong> <a href="https://inter-office-memo-system.onrender.com" target="_blank">https://inter-office-memo-system.onrender.com</a></p>
      <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>
`;

messages.forEach((msg, idx) => {
  const isUser = msg.role === 'User';
  htmlOutput += `
    <div class="message-card ${isUser ? 'user' : 'assistant'}">
      <div>
        <span class="role-badge ${isUser ? 'user' : 'assistant'}">${msg.role}</span>
        <span class="timestamp">${new Date(msg.time).toLocaleString()}</span>
      </div>
      <div class="content">${msg.content}</div>
    </div>
  `;
});

htmlOutput += `
  </div>
</body>
</html>
`;

fs.writeFileSync(outDesktopHtml, htmlOutput, 'utf8');
console.log('Saved styled HTML to Desktop.');
