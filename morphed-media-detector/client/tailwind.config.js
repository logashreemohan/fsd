/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a', // slate-900
          primary: '#3b82f6', // blue-500
          accent: '#06b6d4', // cyan-500
          danger: '#ef4444', // red-500
          success: '#22c55e', // green-500
        }
      }
    },
  },
  plugins: [],
}
