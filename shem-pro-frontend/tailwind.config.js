/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4B5563',
          DEFAULT: '#111827',
          dark: '#0e121d',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent)', // We can add separate hover vars if needed later
        },
        dashboard: {
          bg: 'var(--color-bg)',
          card: 'var(--color-card)',
          text: 'var(--color-text)',
          textSecondary: 'var(--color-text-secondary)',
          success: 'var(--color-success)',
          danger: 'var(--color-danger)',
        },
        neutralBg: {
          light: '#f9f9f9',
          lighter: '#f5f5f5',
          dark: '#1a1a1a',
        },
        gradient: {
          purple: { from: '#667eea', to: '#764ba2' },
          pink: { from: '#f093fb', to: '#f5576c' },
          blue: { from: '#e3f2fd', to: '#bbdefb' },
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
