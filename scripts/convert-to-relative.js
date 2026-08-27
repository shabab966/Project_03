const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');

let convertedCount = 0;

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const fileDir = path.dirname(fullPath);

      const newContent = content.replace(/(from\s+['"])(@\/[^'"]+)(['"])/g, (match, p1, p2, p3) => {
        const targetFromSrc = p2.slice(2); // e.g. "lib/utils" or "context/AuthContext"
        const targetFullPath = path.join(srcDir, targetFromSrc);
        let relPath = path.relative(fileDir, targetFullPath).replace(/\\/g, '/');
        if (!relPath.startsWith('.')) {
          relPath = './' + relPath;
        }
        convertedCount++;
        return `${p1}${relPath}${p3}`;
      });

      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Converted imports in: ${path.relative(rootDir, fullPath)}`);
      }
    }
  }
}

processDir(srcDir);
console.log(`Done! Total ${convertedCount} alias imports converted to guaranteed relative paths.`);
