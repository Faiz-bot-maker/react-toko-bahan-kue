/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jade: {
          50: '#e6f7f2',
          100: '#b8e9db',
          200: '#8adbc4',
          300: '#5ccdad',
          400: '#2ebf96',
          500: '#20a87e', // Milenium Jade utama
          600: '#1a8663',
          700: '#146448',
          800: '#0e422d',
          900: '#082013',
        },
      },
    },
  },
  plugins: [],
}