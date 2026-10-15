/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#080c14',
          panel: '#0d1322',
          card: '#121a30',
          border: '#1e293b',
          glow: '#00f0ff',
          neonGreen: '#10b981',
          neonAmber: '#f59e0b',
          neonRed: '#ef4444',
          textMuted: '#94a3b8',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'red-flash': 'redFlash 1s ease-in-out',
      },
      keyframes: {
        redFlash: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(239, 68, 68, 0.25)' },
        }
      }
    },
  },
  plugins: [],
}
