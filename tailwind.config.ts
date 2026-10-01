import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0A0A',
          secondary: '#101014',
          card: '#16161C',
        },
        border: {
          DEFAULT: '#26262E',
        },
        brand: {
          purple: '#7C3AED',
          purpleLight: '#A855F7',
          pink: '#EC4899',
          cyan: '#22D3EE',
          yellow: '#F59E0B',
          yellowHover: '#FBBF24',
          success: '#10B981',
          danger: '#F87171',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B4B4BE',
          muted: '#75757F',
        },
        light: {
          bg: '#F5F5F8',
          card: '#FFFFFF',
          border: '#E6E6EE',
          text: '#101016',
          text2: '#4B4B58',
          muted: '#7A7A88',
        },
      },
      fontFamily: {
        display: ['var(--font-manrope)', 'sans-serif'],
        body: ['var(--font-manrope)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        orbFloat: {
          '0%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(40px,-30px) scale(1.12)' },
          '100%': { transform: 'translate(-25px,25px) scale(0.95)' },
        },
        pulseDot: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(3)', opacity: '0' },
        },
        // El flujo que recorre los conectores del mapa de Software 1K.
        dashFlow: {
          to: { strokeDashoffset: '-40' },
        },
        nodoFlota: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-7px)' },
        },
        halo: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.06)' },
        },
      },
      animation: {
        orb: 'orbFloat 16s ease-in-out infinite alternate',
        pulseDot: 'pulseDot 1.8s ease-out infinite',
        dashFlow: 'dashFlow 1.4s linear infinite',
        nodoFlota: 'nodoFlota 6s ease-in-out infinite',
        halo: 'halo 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
