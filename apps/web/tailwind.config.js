/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f7ff",
          100: "#e0efff",
          200: "#bdddff",
          300: "#8ec5ff",
          400: "#5ea8ff",
          500: "#2b86ff",
          600: "#1569e6",
          700: "#0f52b3",
          800: "#0c3c80",
          900: "#092a59",
        },
      },
      boxShadow: {
        soft: "0 6px 24px -6px rgba(0,0,0,.15)",
      },
    },
  },
  plugins: [],
};
