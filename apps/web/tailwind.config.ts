import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // primary
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95'
        },
        accent: {
          400: '#22d3ee', // cyan glow
          500: '#06b6d4',
          600: '#0891b2'
        },
        success: '#10b981',
        danger:  '#ef4444',
        warn:    '#f59e0b',
      },
      boxShadow: {
        'glow': '0 0 0.75rem rgba(34, 211, 238, 0.4)',
        'brand': '0 0 1.25rem rgba(139, 92, 246, 0.45)',
      },
      backgroundImage: {
        'brand-gradient':
          'radial-gradient(60rem 60rem at 80% -10%, rgba(34,211,238,.25), transparent 60%), radial-gradient(60rem 60rem at -10% 20%, rgba(139,92,246,.25), transparent 60%)',
      }
    }
  },
  plugins: [
    require('tailwindcss-animate')
  ]
}
export default config
