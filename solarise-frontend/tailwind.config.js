/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // We'll define our brand colors here
        'solarise-green': '#4CAF50',
        'solarise-blue': '#2196F3',
        'solarise-yellow': '#FFEB3B',
      },
    },
  },
  plugins: [],
}