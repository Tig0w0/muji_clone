/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-muji': '#7f0019',
        'neutral-100': '#f5f5f5',
        'neutral-200': '#ebebec',
        'neutral-300': '#d8d8d9',
        'neutral-400': '#c4c4c6',
        'neutral-500': '#9d9da0',
        'neutral-600': '#76767b',
        'neutral-700': '#6d6d72',
        'neutral-800': '#3c3c43',
        'neutral-900': '#1d1d1f',
        'neutral-white': '#fff',
        'neutral-black': '#000',
      },
      screens: {
        'max-lg': {'max': '1023px'},
        'lg': '1024px',
        'xl': '1280px',
        '3xl': '1920px',
      }
    },
  },
  plugins: [],
}