#!/usr/bin/env bash
# Filespay deploy (colon filename version)

set +H
set -Eeuo pipefail

export PATH="/home/master/.npm-global/bin:$PATH"
unalias pm2 2>/dev/null || true
PM2="/home/master/.npm-global/bin/pm2"
APP="filespay-web"
PORT="${PORT:-3000}"

echo "[1] Clean caches"
rm -rf .next .turbo node_modules/.cache || true

echo "[2] Build"
npm run build

echo "[3] Patch Next manifest (guard clientModules)"
node <<'NODE'
const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), '.next', 'server', 'app-client-reference-manifest.json');
fs.mkdirSync(path.dirname(file), { recursive: true });
let obj = {};
try {
  if (fs.existsSync(file)) obj = JSON.parse(fs.readFileSync(file, 'utf8') || '{}');
} catch { obj = {}; }
for (const k of ['clientModules','ssrModuleMapping','edgeSSRModuleMapping','entryCSSFiles','cssImports']) {
  if (!obj[k] || typeof obj[k] !== 'object') obj[k] = {};
}
fs.writeFileSync(file, JSON.stringify(obj));
console.log('[patched]', file);
NODE

echo "[4] Restart PM2 & wait for health"
"$PM2" restart "$APP"
for i in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:$PORT/health.txt" >/dev/null; then
    echo "✓ Up after ${i}s"
    break
  fi
  sleep 1
done

echo -n "[health] "; curl -fsS "http://127.0.0.1:$PORT/health.txt" | head -c 120; echo
echo -n "[admin counts] "; curl -fsS -u "user:pass" "http://127.0.0.1:$PORT/web-api/admin/stats/counts" | head -c 200; echo
