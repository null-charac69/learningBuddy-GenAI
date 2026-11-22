/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#1a202c',
        secondary: '#2d3748',
        accent: '#4a5568',
        highlight: '#2b6cb0',
        text: '#e2e8f0',
        "text-secondary": '#a0aec0',
        success: '#38a169',
        danger: '#e53e3e',
        warning: '#d69e2e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
