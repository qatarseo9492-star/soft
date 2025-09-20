// apps/web/ecosystem.config.js
const path = require("path");

// Keep logs outside of .next for easier rotation/backups
const LOG_DIR = path.join(__dirname, "..", "..", "logs");

module.exports = {
  apps: [
    {
      name: "filespay-web",
      cwd: __dirname,
      // Call Next directly (avoids npm/yarn wrapper quirks)
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 0.0.0.0",
      instances: 1,             // use "max" for cluster if you want multi-core
      exec_mode: "fork",        // "cluster" if you use instances > 1
      watch: false,
      autorestart: true,
      max_memory_restart: "600M",
      time: true,
      merge_logs: true,
      out_file: path.join(LOG_DIR, "web-out.log"),
      error_file: path.join(LOG_DIR, "web-err.log"),
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        TZ: "Asia/Karachi",
        NEXT_TELEMETRY_DISABLED: "1",

        // IMPORTANT: keep this empty so browser hits this app’s /web-api/* (no double prefixes)
        NEXT_PUBLIC_API_BASE: "",

        // Safe public default (overridden by .env.production if present)
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://filespay.org",

        // If you prefer env-only (instead of .env.production), uncomment and set here:
        // ADMIN_USER: "admin",
        // ADMIN_PASS: "change-me",
        // ADMIN_JWT_SECRET: "very-long-random-string-change-me-now",
        // DATABASE_URL: "mysql://user:pass@127.0.0.1:3306/db",
        // WEB_REVALIDATE_TOKEN: "your-token",
      },
    },
  ],
};
