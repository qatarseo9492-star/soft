// public_html/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "filespay-api",
      cwd: "apps/api",
      script: "npm",
      args: "run start:prod",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3011,
      },
      time: true,
      max_restarts: 10,
      restart_delay: 2000,
    },
    {
      name: "filespay-web",
      cwd: "apps/web",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: process.env.WEB_PORT || 3000,
        HOST: "0.0.0.0",
      },
      time: true,
      max_restarts: 10,
      restart_delay: 2000,
    },
  ],
};