/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a1628',
          light: '#1a3a6b',
          dark: '#050b15',
        },
        gold: {
          DEFAULT: '#c9a227',
          light: '#f0c740',
          dark: '#9a7b1e',
        },
        pearl: '#f8fafc',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
