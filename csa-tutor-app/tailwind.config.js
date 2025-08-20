/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lark-blue': '#1e40af',
        'lark-green': '#059669',
        'lark-orange': '#ea580c'
      }
    },
  },
  plugins: [],
}