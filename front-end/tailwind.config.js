/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background, #fff)',
        foreground: 'var(--foreground, #222)',
        muted: 'var(--muted, #f5f5f5)',
        'muted-foreground': 'var(--muted-foreground, #888)',
        border: 'var(--border, #e5e7eb)',
        // Add more tokens as needed
      },
    },
  },
  plugins: [],
}