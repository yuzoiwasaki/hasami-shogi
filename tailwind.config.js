/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        japanese: ['Noto Sans JP', 'sans-serif'],
      },
      animation: {
        'bounce-once': 'bounce 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
}

