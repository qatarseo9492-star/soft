// Next.js on port 3000 (uses __dirname so no hard-coded paths)
const path = require("path");

const LOG_DIR = path.join(__dirname, "..", "..", "logs");

module.exports = {
  apps: [
    {
      name: "filespay-web",
      cwd: __dirname,
      // Call Next directly to avoid npm passing odd flags through
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 0.0.0.0", // explicit host + port
      instances: 1,
      exec_mode: "fork",
      watch: false,
      autorestart: true,
      max_memory_restart: "600M",
      time: true,
      merge_logs: true,
      out_file: path.join(LOG_DIR, "web-out.log"),
      error_file: path.join(LOG_DIR, "web-err.log"),
      env: {
        NODE_ENV: "production",
        HOSTNAME: "0.0.0.0",
        PORT: 3000,
        // Fallback; real value is also in .env.production
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://filespay.org",
      },
    },
  ],
};