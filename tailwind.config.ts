import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        field: {
          grass: '#1B6B3A',
          line: '#FFFFFF',
        },
        position: {
          gk: '#FF8C42',
          def: '#A0E0A0',
          mid: '#60AAFF',
          att: '#FFD700',
        },
      },
    },
  },
  plugins: [],
};

export default config;
