import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0F172A',
          amber: '#D97706',
          blue: '#2563EB',
          teal: '#0D9488',
        },
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
