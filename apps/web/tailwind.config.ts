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
        'glow-score': '0 0 20px -5px rgba(0, 230, 118, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
