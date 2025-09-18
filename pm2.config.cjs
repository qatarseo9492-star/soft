// pm2.config.cjs
module.exports = {
  apps: [
    {
      name: "filespay-api",
      cwd: "./apps/api",
      script: "node",
      args: "dist/main.js",
      env_file: "./apps/api/.env",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
    },
    {
      name: "filespay-web",
      cwd: "./apps/web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env_file: "./apps/web/.env.production",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
    },
  ],
};