import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050814',
        night: '#0b1020',
        jade: '#64dcc8',
        cinnabar: '#c0392b',
        imperial: '#d6b15e',
      },
      boxShadow: {
        glow: '0 0 28px rgba(214, 177, 94, 0.24)',
      },
    },
  },
  plugins: [],
} satisfies Config;
