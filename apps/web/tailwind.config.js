/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Indigo/blue “mykd” vibe with neon accents
        brand: {
          50:  '#f3f4ff',
          100: '#e8eaff',
          200: '#c8ccff',
          300: '#a8adff',
          400: '#7b82ff',
          500: '#5c62ff',
          600: '#4b4fe0',
          700: '#3b3db3',
          800: '#2d2f87',
          900: '#232469',
          950: '#151646',
        },
        danger:  '#ef4444',
        success: '#22c55e',
        border:  'hsl(240 7% 20%)',
      },
      boxShadow: {
        brand: '0 0 0.5rem rgba(92,98,255,.45)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
