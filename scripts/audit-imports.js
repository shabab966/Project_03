const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
let errors = [];

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      checkDir(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const match = line.match(/from\s+['"]([^'"]+)['"]/);
        if (match) {
          const importPath = match[1];
          if (importPath.startsWith('@/')) {
            const rel = importPath.slice(2);
            const targetNoExt = path.join(srcDir, rel);
            const exists =
              fs.existsSync(targetNoExt) ||
              fs.existsSync(targetNoExt + '.ts') ||
              fs.existsSync(targetNoExt + '.tsx') ||
              fs.existsSync(path.join(targetNoExt, 'index.ts')) ||
              fs.existsSync(path.join(targetNoExt, 'index.tsx'));
            if (!exists) {
              errors.push({ file: fullPath.replace(rootDir, ''), line: idx + 1, importPath });
            }
          } else if (importPath.startsWith('.')) {
            const targetNoExt = path.resolve(path.dirname(fullPath), importPath);
            const exists =
              fs.existsSync(targetNoExt) ||
              fs.existsSync(targetNoExt + '.ts') ||
              fs.existsSync(targetNoExt + '.tsx') ||
              fs.existsSync(targetNoExt + '.css') ||
              fs.existsSync(path.join(targetNoExt, 'index.ts')) ||
              fs.existsSync(path.join(targetNoExt, 'index.tsx'));
            if (!exists) {
              errors.push({ file: fullPath.replace(rootDir, ''), line: idx + 1, importPath });
            }
          }
        }
      });
    }
  }
}

checkDir(srcDir);
console.log('Total import errors found:', errors.length);
if (errors.length > 0) {
  console.log(JSON.stringify(errors, null, 2));
}
