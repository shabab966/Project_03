const fs = require('fs');
const path = require('path');

// Simple native .env parser without external dependencies
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.substring(0, eqIdx).trim();
      let val = trimmed.substring(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  });
  return env;
}

const envLocal = loadEnvFile(path.join(__dirname, '..', '.env.local'));
const envDefault = loadEnvFile(path.join(__dirname, '..', '.env'));

const dbUrl = process.env.DATABASE_URL || envLocal.DATABASE_URL || envDefault.DATABASE_URL || 'file:./dev.db';
const targetProvider = (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) ? 'postgresql' : 'sqlite';

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

const currentProviderMatch = schemaContent.match(/provider\s*=\s*"([^"]+)"/);
const currentProvider = currentProviderMatch ? currentProviderMatch[1] : null;

if (currentProvider !== targetProvider) {
  console.log(`[prepare-db] Switching Prisma datasource provider from "${currentProvider}" to "${targetProvider}"`);
  schemaContent = schemaContent.replace(/provider\s*=\s*"[^"]+"/, `provider = "${targetProvider}"`);
  fs.writeFileSync(schemaPath, schemaContent, 'utf8');
} else {
  console.log(`[prepare-db] Prisma datasource provider is already "${targetProvider}".`);
}
