/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0f0f1a',
        'navy-light': '#1a1a2e',
        'navy-card': '#22223a',
        team: {
          red: '#e63946',
          'red-dark': '#a31621',
          blue: '#4361ee',
          'blue-dark': '#22308a',
        },
        neutral: {
          tan: '#c9b88a',
          'tan-dark': '#8a7a52',
        },
        assassin: '#0a0a0a',
      },
      fontFamily: {
        serif: ['"Noto Serif JP"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 1.2s linear infinite',
        'fade-in': 'fade-in 0.35s ease-out',
        'pop-in': 'pop-in 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
