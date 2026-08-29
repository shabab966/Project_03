const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
        continue;
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

  // Code blocks & Mermaid diagrams
  html = html.replace(/```mermaid([\s\S]*?)```/gim, '<pre class="code-block mermaid"><code>$1</code></pre>');
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

function convertMdToPdf(mdPath, outPdfPath, title) {
  if (!fs.existsSync(mdPath)) {
    console.error(`File not found: ${mdPath}`);
    return;
  }

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const parsedBody = parseMarkdown(mdContent);

  const tempHtmlPath = path.join(__dirname, '..', `TEMP_${path.basename(mdPath, '.md')}.html`);

  const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 10.5pt;
      margin: 0;
      padding: 0;
    }
    .header-box {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    h1 {
      color: #0f172a;
      font-size: 18pt;
      margin: 0 0 4px 0;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    h2 {
      color: #0284c7;
      font-size: 13pt;
      margin: 14px 0 8px 0;
      font-weight: 700;
      page-break-after: avoid;
    }
    h3 {
      color: #334155;
      font-size: 11pt;
      margin: 12px 0 6px 0;
      font-weight: 700;
      page-break-after: avoid;
    }
    p {
      margin: 5px 0;
    }
    ul, ol {
      margin: 5px 0;
      padding-left: 20px;
    }
    li {
      margin: 2.5px 0;
    }
    li.numbered {
      list-style-type: none;
      margin-left: -20px;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    th {
      background-color: #f1f5f9;
      color: #475569;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.5px;
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      text-align: left;
    }
    td {
      padding: 6px 8px;
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
      padding: 1.5px 4px;
      border-radius: 4px;
      font-size: 8.5pt;
      border: 1px solid #e2e8f0;
    }
    pre.code-block {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 10px;
      border-radius: 6px;
      font-size: 8.5pt;
      overflow-x: auto;
      margin: 6px 0;
      page-break-inside: avoid;
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
      margin: 14px 0;
    }
    .footer {
      margin-top: 20px;
      padding-top: 6px;
      border-top: 1px solid #cbd5e1;
      font-size: 7.5pt;
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
    Inter-Office Memo Management System &bull; CSE226 North South University &bull; Official Document
  </div>
</body>
</html>`;

  fs.writeFileSync(tempHtmlPath, htmlTemplate, 'utf8');

  const edgePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];

  let browserPath = edgePaths.find(p => fs.existsSync(p));

  if (browserPath) {
    const cmd = `"${browserPath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${outPdfPath}" "${tempHtmlPath}"`;
    try {
      execSync(cmd);
      console.log(`✅ Generated PDF: ${outPdfPath}`);
    } catch (err) {
      console.error(`Failed generating ${outPdfPath}:`, err);
    }
  }

  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
}

// 1. Generate SUBMISSION.pdf
convertMdToPdf(
  path.join(__dirname, '..', 'SUBMISSION.md'),
  'C:\\Users\\assha\\OneDrive\\Desktop\\CSE226_SUBMISSION_PACKAGE.pdf',
  'Project Submission Package'
);
convertMdToPdf(
  path.join(__dirname, '..', 'SUBMISSION.md'),
  path.join(__dirname, '..', 'SUBMISSION.pdf'),
  'Project Submission Package'
);

// 2. Generate PRD.pdf
convertMdToPdf(
  path.join(__dirname, '..', 'PRODUCT_REQUIREMENTS_DOCUMENT.md'),
  'C:\\Users\\assha\\OneDrive\\Desktop\\CSE226_PRD.pdf',
  'Product Requirements Document (PRD)'
);
convertMdToPdf(
  path.join(__dirname, '..', 'PRODUCT_REQUIREMENTS_DOCUMENT.md'),
  path.join(__dirname, '..', 'PRODUCT_REQUIREMENTS_DOCUMENT.pdf'),
  'Product Requirements Document (PRD)'
);
