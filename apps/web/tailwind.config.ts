import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0A0E1A',
          card: '#12172B',
          surface: '#1A2040',
          border: '#2A3154',
          primary: '#6C5CE7',
          'primary-hover': '#7C6FF7',
          secondary: '#00D2FF',
          accent: '#00D2FF',
          tertiary: '#FF6B9D',
          'score-emerald': '#00E676',
          'score-yellow': '#FFD600',
          'score-red': '#FF5252',
          text: '#EAEDF3',
          muted: '#8892B0',
          subtle: '#4A5568',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px -5px rgba(108, 92, 231, 0.4)',
        'glow-secondary': '0 0 20px -5px rgba(0, 210, 255, 0.4)',
        'glow-accent': '0 0 20px -5px rgba(0, 210, 255, 0.45)',
        'glow-tertiary': '0 0 20px -5px rgba(255, 107, 157, 0.4)',
        'glow-score': '0 0 20px -5px rgba(0, 230, 118, 0.4)',
        'card-hover': '0 12px 35px -8px rgba(0, 210, 255, 0.15)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        modalPop: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(12px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        popBounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.32)' },
          '60%': { transform: 'scale(0.92)' },
          '80%': { transform: 'scale(1.06)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'modal-pop': 'modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        shimmer: 'shimmer 2s infinite',
        'pop-bounce': 'popBounce 0.45s ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
