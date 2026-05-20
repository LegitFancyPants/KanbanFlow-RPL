/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'sans-serif'],
      },
      colors: {
        brand: {
          teal: '#2ecfb4',
          tealHover: '#25b59d',
          bg: '#eef2f6',
          text: '#333333',
          border: '#d1d5db',
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
