#!/usr/bin/env bash
set -euo pipefail

# ---------- Paths (stay inside public_html) ----------
ROOT="${ROOT:-$PWD}"
API_DIR="${API_DIR:-apps/api}"
WEB_DIR="${WEB_DIR:-apps/web}"
API_NAME="${API_NAME:-filespay-api}"
WEB_NAME="${WEB_NAME:-filespay-web}"
API_PORT="${API_PORT:-3011}"
WEB_PORT="${WEB_PORT:-3000}"

API_ENV="$ROOT/$API_DIR/.env"
WEB_ENV="$ROOT/$WEB_DIR/.env.production"

API_BASE="http://127.0.0.1:${API_PORT}"
WEB_BASE="http://127.0.0.1:${WEB_PORT}"

# ---------- Helpers ----------
ok(){ printf "\033[1;32m[OK]\033[0m %s\n" "$*"; }
fail(){ printf "\033[1;31m[FAIL]\033[0m %s\n" "$*\n" >&2; exit 1; }
step(){ printf "\n\033[1;34m[STEP]\033[0m %s\n" "$*"; }
need(){ command -v "$1" >/dev/null || fail "Missing command: $1"; }

# ---------- Sanity ----------
need node; need npm; need pm2; need curl
test -d "$API_DIR" || fail "Missing $API_DIR"
test -d "$WEB_DIR" || fail "Missing $WEB_DIR"
test -f "$API_ENV" || fail "Missing $API_ENV"
test -f "$WEB_ENV" || fail "Missing $WEB_ENV"

# ---------- Ensure uploads dir exists ----------
UPLOAD_DIR=$(grep -E '^UPLOAD_DIR=' "$API_ENV" | sed 's/UPLOAD_DIR=//')
if [ -n "${UPLOAD_DIR:-}" ]; then
  step "Ensuring uploads dir: $UPLOAD_DIR"
  mkdir -p "$UPLOAD_DIR" || true
  chmod 775 "$UPLOAD_DIR" || true
  ok "Uploads dir ready"
fi

# ---------- API: install, prisma, build ----------
step "API deps"
cd "$ROOT/$API_DIR"
npm ci || npm i
npx prisma generate

step "Prisma migrate deploy (API)"
npx prisma migrate deploy

# ---------- Ensure download counter trigger ----------
if command -v mysql >/dev/null 2>&1; then
  step "Ensuring MySQL trigger exists"
  DB_URL=$(grep -E '^DATABASE_URL=' "$API_ENV" | sed 's/DATABASE_URL=//')
  if [ -n "$DB_URL" ]; then
    # parse mysql://user:pass@host:port/db
    DB_USER=$(echo "$DB_URL" | sed -E 's#^mysql://([^:]+):.*#\1#')
    DB_PASS=$(echo "$DB_URL" | sed -E 's#^mysql://[^:]+:([^@]+)@.*#\1#')
    DB_HOST=$(echo "$DB_URL" | sed -E 's#^mysql://[^@]+@([^:/]+).*#\1#')
    DB_PORT=$(echo "$DB_URL" | sed -E 's#^mysql://[^@]+@[^:/]+:([0-9]+).*#\1#')
    DB_NAME=$(echo "$DB_URL" | sed -E 's#^.*/([^/?]+)(\?.*)?$#\1#')
    DB_PORT=${DB_PORT:-3306}

    # create trigger if missing
    if mysql -u"$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -P "$DB_PORT" -D "$DB_NAME" -N \
      -e "SHOW TRIGGERS WHERE \`Table\`='DownloadLog' AND \`Trigger\`='trg_downloadlog_ai';" | grep -q trg_downloadlog_ai; then
      ok "Trigger exists"
    else
      mysql -u"$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -P "$DB_PORT" -D "$DB_NAME" <<'SQL'
DROP TRIGGER IF EXISTS trg_downloadlog_ai;
DELIMITER $$
CREATE TRIGGER trg_downloadlog_ai
AFTER INSERT ON DownloadLog
FOR EACH ROW
BEGIN
  INSERT INTO DownloadCounter (softwareId, total) VALUES (NEW.softwareId, 1)
  ON DUPLICATE KEY UPDATE total = total + 1;
END$$
DELIMITER ;
SQL
      ok "Trigger created"
    fi
  else
    echo "[WARN] DATABASE_URL missing in $API_ENV; skipped trigger check"
  fi
else
  echo "[WARN] mysql client missing; skipping trigger check"
fi

step "API build"
npm run build

# ---------- WEB: install & build ----------
step "WEB deps"
cd "$ROOT/$WEB_DIR"
npm ci || npm i

step "WEB build"
npm run build

# ---------- PM2 start/reload ----------
step "PM2 start/reload"
cd "$ROOT"
if [ -f ecosystem.config.js ]; then
  pm2 startOrReload ecosystem.config.js --update-env
else
  pm2 describe "$API_NAME" >/dev/null 2>&1 && pm2 restart "$API_NAME" --update-env || (cd "$API_DIR" && pm2 start npm --name "$API_NAME" -- run start:prod)
  pm2 describe "$WEB_NAME" >/dev/null 2>&1 && pm2 restart "$WEB_NAME" --update-env || (cd "$WEB_DIR" && pm2 start npm --name "$WEB_NAME" -- run start)
fi
sleep 2
pm2 save || true

# ---------- Smoke tests ----------
step "SMOKE: API health"
curl -fsS "${API_BASE}/v1/health" >/dev/null && ok "API health OK" || fail "API health FAIL"

step "SMOKE: Web list"
LIST=$(curl -fsS "${WEB_BASE}/web-api/software?limit=1" || true)
[ -n "$LIST" ] && ok "List OK" || fail "List FAIL"

SLUG=$(echo "$LIST" | sed -n 's/.*"slug":"\([^"]\+\)".*/\1/p' | head -n1 || true)
if [ -n "$SLUG" ]; then
  step "SMOKE: SSR detail /software/$SLUG"
  curl -fsSI "${WEB_BASE}/software/${SLUG}" | head -n 5 || echo "[WARN] SSR HEAD check"

  step "SMOKE: Download HEAD /download/$SLUG"
  curl -fsSI "${WEB_BASE}/download/${SLUG}" | sed -n '1,10p' || echo "[WARN] Download HEAD check"

  step "SMOKE: Log download (API)"
  curl -fsS -X POST "${API_BASE}/v1/software/${SLUG}/downloads" -H 'Content-Type: application/json' -d '{}' || echo "[WARN] Log download"
else
  echo "[WARN] No slug found (DB may be empty)"
fi

step "SMOKE: SSE headers"
curl -sI "${WEB_BASE}/api/events-proxy" | grep -i "content-type: text/event-stream" >/dev/null && ok "SSE OK" || echo "[WARN] SSE header not detected"

ok "DONE."
