const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const subMdPath = path.join(__dirname, '..', 'SUBMISSION.md');
const subHtmlPath = path.join(__dirname, '..', 'SUBMISSION_PREVIEW.html');
const outPdfDesktop = 'C:\\Users\\assha\\OneDrive\\Desktop\\CSE226_SUBMISSION_PACKAGE.pdf';
const outPdfRepo = path.join(__dirname, '..', 'SUBMISSION.pdf');

if (!fs.existsSync(subMdPath)) {
  console.error('SUBMISSION.md not found');
  process.exit(1);
}

// Convert markdown to clean HTML
const mdContent = fs.readFileSync(subMdPath, 'utf8');

// Simple Markdown parser for our structured document
function parseMarkdown(md) {
  let html = md;

  // Headers
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

  // Tables
  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (line.includes('---')) {
        continue; // skip separator
      }
      const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
      if (!inTable) {
        inTable = true;
        tableHtml = '<table><thead><tr>' + cells.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
      } else {
        tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
      }
    } else {
      if (inTable) {
        inTable = false;
        tableHtml += '</tbody></table>';
        newLines.push(tableHtml);
        tableHtml = '';
      }
      newLines.push(line);
    }
  }
  if (inTable) {
    tableHtml += '</tbody></table>';
    newLines.push(tableHtml);
  }

  html = newLines.join('\n');

  // Code blocks
  html = html.replace(/```bash([\s\S]*?)```/gim, '<pre class="code-block"><code>$1</code></pre>');
  html = html.replace(/```([\s\S]*?)```/gim, '<pre class="code-block"><code>$1</code></pre>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr/>');

  // Lists
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\s*([0-9]+)\.\s+(.*$)/gim, '<li class="numbered"><strong>$1.</strong> $2</li>');

  return html;
}

const parsedBody = parseMarkdown(mdContent);

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Project Submission Package - CSE226</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 15mm 18mm 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 11pt;
      margin: 0;
      padding: 0;
    }
    .header-box {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    h1 {
      color: #0f172a;
      font-size: 20pt;
      margin: 0 0 4px 0;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    h2 {
      color: #0284c7;
      font-size: 14pt;
      margin: 2px 0 10px 0;
      font-weight: 700;
    }
    h3 {
      color: #334155;
      font-size: 11.5pt;
      margin: 14px 0 6px 0;
      font-weight: 700;
    }
    p {
      margin: 6px 0;
    }
    ul, ol {
      margin: 6px 0;
      padding-left: 20px;
    }
    li {
      margin: 3px 0;
    }
    li.numbered {
      list-style-type: none;
      margin-left: -20px;
      margin-top: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 16px 0;
      font-size: 9.5pt;
    }
    th {
      background-color: #f1f5f9;
      color: #475569;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      text-align: left;
    }
    td {
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    code {
      font-family: "Consolas", "Courier New", monospace;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 9pt;
      border: 1px solid #e2e8f0;
    }
    pre.code-block {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      font-size: 9pt;
      overflow-x: auto;
      margin: 8px 0;
    }
    pre.code-block code {
      background: none;
      color: #f8fafc;
      border: none;
      padding: 0;
    }
    a {
      color: #0284c7;
      text-decoration: none;
      font-weight: 600;
    }
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 16px 0;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 700;
      background: #e0f2fe;
      color: #0369a1;
    }
    .footer {
      margin-top: 24px;
      padding-top: 8px;
      border-top: 1px solid #cbd5e1;
      font-size: 8pt;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header-box">
    ${parsedBody}
  </div>
  <div class="footer">
    Inter-Office Memo Management System &bull; CSE226 North South University &bull; Official Submission Document
  </div>
</body>
</html>`;

fs.writeFileSync(subHtmlPath, htmlTemplate, 'utf8');
console.log('Generated SUBMISSION_PREVIEW.html');

// Try finding Edge or Chrome to print PDF
const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

let browserPath = edgePaths.find(p => fs.existsSync(p));

if (browserPath) {
  console.log(`Using browser at: ${browserPath}`);
  const commandDesktop = `"${browserPath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${outPdfDesktop}" "${subHtmlPath}"`;
  const commandRepo = `"${browserPath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${outPdfRepo}" "${subHtmlPath}"`;
  
  try {
    execSync(commandDesktop);
    execSync(commandRepo);
    console.log(`✅ PDF successfully generated at: ${outPdfDesktop}`);
    console.log(`✅ PDF successfully generated at: ${outPdfRepo}`);
  } catch (err) {
    console.error('Failed to run headless PDF generation:', err);
  }
} else {
  console.log('No headless browser found. HTML file is ready for manual print.');
}
