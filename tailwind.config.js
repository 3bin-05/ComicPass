/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        bangers: ['Bangers', 'cursive'],
        mono: ['"Space Mono"', 'monospace'],
        marker: ['"Permanent Marker"', 'cursive'],
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'comic': '6px 6px 0px var(--shadow)',
        'comic-hover': '9px 9px 0px var(--shadow)',
        'comic-btn': '4px 4px 0px var(--shadow)',
      },
    },
  },
  plugins: [],
}

