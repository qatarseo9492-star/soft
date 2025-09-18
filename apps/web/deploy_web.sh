#!/usr/bin/env bash
# Filespay web deploy: clean caches, build, patch manifest, restart PM2, smoke-test.

set +H
set -Eeuo pipefail

export PATH="/home/master/.npm-global/bin:$PATH"
unalias pm2 2>/dev/null || true
PM2_BIN="/home/master/.npm-global/bin/pm2"
APP_NAME="filespay-web"
PORT="${PORT:-3000}"

echo "[1/4] Clean caches"
rm -rf .next .turbo node_modules/.cache || true

echo "[2/4] Build"
npm run build

echo "[3/4] Patch Next manifest (guard clientModules)"
node <<'NODE'
const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), '.next', 'server', 'app-client-reference-manifest.json');
fs.mkdirSync(path.dirname(file), { recursive: true });
let obj = {};
try {
  if (fs.existsSync(file)) {
    const txt = fs.readFileSync(file, 'utf8') || '{}';
    obj = JSON.parse(txt);
  }
} catch { obj = {}; }
for (const k of ['clientModules','ssrModuleMapping','edgeSSRModuleMapping','entryCSSFiles','cssImports']) {
  if (!obj[k] || typeof obj[k] !== 'object') obj[k] = {};
}
fs.writeFileSync(file, JSON.stringify(obj));
console.log('[patched]', file);
NODE

echo "[4/4] Restart PM2 & smoke-test"
"$PM2_BIN" restart "$APP_NAME"

# wait for health to come up
for i in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:$PORT/health.txt" >/dev/null; then
    echo "✓ Up after ${i}s"
    break
  fi
  sleep 1
done

echo -n "[health] "; curl -fsS "http://127.0.0.1:$PORT/health.txt" | head -c 120; echo
