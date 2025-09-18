// apps/api/ecosystem.config.js
// PM2 process file for the Nest API.
// - No secrets hardcoded here; everything comes from apps/api/.env
// - API listens on :3011 (set in .env)

const path = require('path');

module.exports = {
  apps: [
    {
      name: 'filespay-api',
      cwd: __dirname,                 // /apps/api
      script: 'dist/main.js',         // built Nest entry
      exec_mode: 'fork',
      instances: 1,
      watch: false,

      // Load runtime env from the API's .env file
      env_file: path.join(__dirname, '.env'),

      // Minimal fixed vars; PORT comes from .env (keep it 3011 there)
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        // Do NOT set PORT here so .env wins (should be PORT=3011)
        // LOG_LEVEL can also live in .env; if you want a default:
        // LOG_LEVEL: process.env.LOG_LEVEL || 'log',
      },

      // Niceties
      kill_timeout: 5000,
      max_restarts: 10,
      autorestart: true,
    },
  ],
};
