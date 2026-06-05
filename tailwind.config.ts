import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#070A13',
        night: '#0E1022',
        jade: '#4BA3FF',
        cinnabar: '#FF5A6A',
        imperial: '#D6B76A',
      },
      boxShadow: {
        glow: '0 0 28px rgba(214, 183, 106, 0.24)',
      },
    },
  },
  plugins: [],
} satisfies Config;
