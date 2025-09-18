module.exports = {
  apps: [
    {
      name: 'filespay-web',
      cwd: '/home/master/applications/kpvbrsfqas/public_html/apps/web',
      script: 'npm',
      args: 'start',                 // <— keep this
      env: {
        NODE_ENV: 'production',
        PORT: 3010,                  // <— web on 3010
        API_BASE_SERVER: 'http://127.0.0.1:3000',
        NEXT_PUBLIC_API_BASE: 'https://filespay.org/web-api',
        NEXT_PUBLIC_SITE_URL: 'https://filespay.org',
        WEB_REVALIDATE_TOKEN: 'change-me-to-another-long-random-token',
        NEXT_PUBLIC_FORCE_ADMIN: '1',
        NEXT_TELEMETRY_DISABLED: '1'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_memory_restart: '600M',
      time: true,
    }
  ]
}
